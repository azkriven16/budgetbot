import '@/lib/env'
import { schemaTask } from '@trigger.dev/sdk'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createTransaction } from '@/lib/transactions'
import { validateAmount } from '@/lib/validators'
import { getBudgetStatus } from '@/lib/budgets'
import { parseRecurrence } from '@/lib/reminders'
import { parseMessage as callAIParser } from '@/lib/ai/parse'
import { applyCorrection, undoLastTransaction } from '@/lib/corrections'

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

        if (parsed.transaction.type === 'EXPENSE') {
          try {
            const budgets = await getBudgetStatus(payload.userId)
            const affected = budgets.find((b) => b.category === parsed.transaction!.category)
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
    } else if (parsed.intent === 'reminder' && parsed.reminder) {
      const activeCount = await prisma.reminder.count({
        where: { userId: payload.userId, isActive: true },
      })
      if (activeCount >= 10) {
        reply = "You've reached the maximum of 10 active reminders. Delete some before adding new ones."
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
          reply += " I'll remind you monthly — you can create a new reminder with more specific timing if needed."
        }
      }
    } else if (parsed.intent === 'correction' && parsed.correction) {
      try {
        if (parsed.correction.field === 'undo') {
          const result = await undoLastTransaction(payload.userId)
          if (!result) {
            reply = "I couldn't find a recent transaction to undo."
          } else {
            record = result
            reply = `Removed: ${result.description ?? result.category} · $${result.amount.toFixed(2)}. Your balance has been adjusted.`
          }
        } else {
          const result = await applyCorrection(
            payload.userId,
            parsed.correction.field,
            parsed.correction.newValue,
          )
          if (!result) {
            reply = "I couldn't find a recent transaction to correct."
          } else {
            record = result
            recordId = result.id
            reply = `Updated: ${result.category} · $${result.amount.toFixed(2)} (was $${result.oldAmount.toFixed(2)}).`
          }
        }
      } catch (e) {
        if (e instanceof Error && e.message === 'Forbidden') {
          reply = "You can't modify that transaction."
        } else if (e instanceof Error && e.message.startsWith('Amount must be')) {
          reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
        } else if (e instanceof Error && e.message.startsWith('Invalid category')) {
          reply = `That doesn't look like a valid category. Try: Food, Transport, Shopping, Entertainment, Health, Salary, Subscriptions, Investments, Savings, or Other.`
        } else {
          throw e
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
