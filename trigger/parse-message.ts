import '@/lib/env'
import { schemaTask } from '@trigger.dev/sdk'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createTransaction } from '@/lib/transactions'
import { validateAmount, assertOwnership } from '@/lib/validators'
import { getBudgetStatus } from '@/lib/budgets'
import { contributeToGoal } from '@/lib/goals'
import { createInvestment, ValidationError } from '@/lib/investments'
import { parseRecurrence } from '@/lib/reminders'
import { parseMessage as callAIParser } from '@/lib/ai/parse'

export const parseMessage = schemaTask({
  id: 'parse-message',
  schema: z.object({
    userId: z.string(),
    clerkId: z.string(),
    message: z.string().min(1).max(2000),
  }),
  run: async (payload) => {
    await prisma.chatMessage.create({
      data: { userId: payload.userId, role: 'USER', content: payload.message },
    })

    const parsed = await (async () => {
      try {
        return await callAIParser(payload.message)
      } catch (e) {
        console.error('[parse-message] AI call failed:', e)
        return null
      }
    })()

    if (!parsed) {
      const reply = "Sorry, I'm having trouble reaching my AI service right now. Please try again in a moment."
      await prisma.chatMessage.create({
        data: { userId: payload.userId, role: 'ASSISTANT', content: reply },
      })
      return { intent: 'unknown' as const, reply, record: null }
    }
    let reply = parsed.replyMessage
    let record: unknown = null
    let recordId: string | undefined

    if (parsed.intent === 'transaction' && parsed.transaction) {
      try {
        validateAmount(parsed.transaction.amount)
        const result = await createTransaction(payload.userId, {
          amount: parsed.transaction.amount,
          type: parsed.transaction.type,
          category: parsed.transaction.category,
          description: parsed.transaction.description,
          date: parsed.transaction.date ? new Date(parsed.transaction.date) : undefined,
        })
        record = result
        recordId = result.transaction.id

        // Warn the user if this expense pushes their category budget to ≥80%
        if (parsed.transaction.type === 'EXPENSE') {
          const expenseCategory = parsed.transaction.category
          try {
            const budgets = await getBudgetStatus(payload.userId)
            const affected = budgets.find((b) => b.category === expenseCategory)
            if (affected && affected.percentage >= 80) {
              const over = affected.percentage >= 100
              reply += `\n\n⚠️ Heads up — you're at ${affected.percentage}% of your ${affected.category} budget this month${over ? ' (over limit!)' : ''}.`
            }
          } catch (budgetErr) {
            console.error('[parse-message] budget check failed:', budgetErr)
          }
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith('Amount must be')) {
          reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
        } else {
          throw e
        }
      }
    } else if (parsed.intent === 'savings_contribution' && parsed.savingsContribution) {
      try {
        validateAmount(parsed.savingsContribution.amount)
        const result = await contributeToGoal(
          payload.userId,
          parsed.savingsContribution.goalName,
          parsed.savingsContribution.amount,
        )
        if (!result) {
          reply = `I couldn't find a savings goal named "${parsed.savingsContribution.goalName}". Create one in the Goals page first!`
        } else {
          record = result
          recordId = result.goalId
          if (result.justCompleted) {
            reply += `\n\n🎉 You've reached your ${result.goalName} goal!`
          }
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith('Amount must be')) {
          reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
        } else {
          throw e
        }
      }
    } else if (parsed.intent === 'investment' && parsed.investment) {
      try {
        const inv = parsed.investment
        const investment = await createInvestment(payload.userId, {
          ticker: inv.ticker,
          companyName: inv.companyName,
          action: inv.action,
          shares: inv.shares,
          pricePerShare: inv.pricePerShare,
        })
        record = investment
        recordId = investment.id
        const totalCost = inv.shares * inv.pricePerShare
        reply = `📈 Logged: ${inv.action} ${inv.shares} ${inv.ticker.toUpperCase()} @ $${inv.pricePerShare.toFixed(2)}. Total cost: $${totalCost.toFixed(2)}.`
      } catch (e) {
        if (e instanceof ValidationError) {
          reply = e.message
        } else if (e instanceof Error && e.message.startsWith('Amount must be')) {
          reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
        } else {
          throw e
        }
      }
    } else if (parsed.intent === 'reminder' && parsed.reminder) {
      const activeCount = await prisma.reminder.count({
        where: { userId: payload.userId, isActive: true },
      })
      if (activeCount >= 10) {
        reply =
          "You've reached the maximum of 10 active reminders. Delete some before adding new ones."
      } else {
        const { recurrenceCron, nextDueAt, isDefault } = parseRecurrence(parsed.reminder.recurrence)
        const reminder = await prisma.reminder.create({
          data: {
            userId: payload.userId,
            message: parsed.reminder.message,
            recurrence: recurrenceCron,
            nextDueAt,
          },
        })
        record = reminder
        recordId = reminder.id
        const formattedDate = nextDueAt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        })
        reply = `⏰ Got it! I'll remind you to ${parsed.reminder.message} — next reminder: ${formattedDate}.`
        if (isDefault) {
          reply +=
            " I'll remind you monthly — you can create a new reminder with more specific timing if needed."
        }
      }
    } else if (parsed.intent === 'correction' && parsed.correction) {
      // Scan recent ASSISTANT messages to find the last one with a transactionId
      const recentMsgs = await prisma.chatMessage.findMany({
        where: { userId: payload.userId, role: 'ASSISTANT' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      const recentMsg = recentMsgs.find((m) => {
        const meta = m.metadata as { transactionId?: string } | null
        return !!meta?.transactionId
      })

      const transactionId = (recentMsg?.metadata as { transactionId?: string } | null)
        ?.transactionId

      if (!transactionId) {
        reply = "I couldn't find a recent transaction to correct."
      } else {
        const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
        if (!transaction) {
          reply = "I couldn't find that transaction."
        } else {
          try {
            assertOwnership(transaction.userId, payload.userId)
            const updateData: Record<string, unknown> = {}
            if (parsed.correction.field === 'amount') {
              const newAmount = parseFloat(parsed.correction.newValue)
              // validateAmount now rejects NaN, but guard explicitly for clarity
              if (isNaN(newAmount)) {
                reply = "That doesn't look like a valid amount."
              } else {
                validateAmount(newAmount)
                updateData.amount = newAmount
              }
            } else if (parsed.correction.field === 'category') {
              updateData.category = parsed.correction.newValue
            } else {
              updateData.description = parsed.correction.newValue
            }
            if (Object.keys(updateData).length > 0) {
              await prisma.transaction.update({ where: { id: transactionId }, data: updateData })
              record = { transactionId, field: parsed.correction.field }
              recordId = transactionId
            }
          } catch (e) {
            if (e instanceof Error && e.message === 'Forbidden') {
              reply = "You can't modify that transaction."
            } else if (e instanceof Error && e.message.startsWith('Amount must be')) {
              reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
            } else {
              throw e
            }
          }
        }
      }
    }

    await prisma.chatMessage.create({
      data: {
        userId: payload.userId,
        role: 'ASSISTANT',
        content: reply,
        metadata: recordId ? { transactionId: recordId } : {},
      },
    })

    return { intent: parsed.intent, reply, record }
  },
})
