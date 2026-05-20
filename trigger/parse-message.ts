import '@/lib/env'
import { schemaTask } from '@trigger.dev/sdk'
import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createTransaction } from '@/lib/transactions'
import { validateAmount, assertOwnership } from '@/lib/validators'
import { CATEGORY_IDS } from '@/lib/categories'
import { PARSE_MESSAGE_SYSTEM_PROMPT } from '@/lib/prompts/parse-message.v1'

const googleAI = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY! })

const outputSchema = z.object({
  intent: z.enum([
    'transaction',
    'savings_contribution',
    'investment',
    'reminder',
    'correction',
    'question',
    'unknown',
  ]),
  transaction: z
    .object({
      amount: z.number(),
      type: z.enum(['INCOME', 'EXPENSE']),
      category: z.enum(CATEGORY_IDS),
      description: z.string(),
      date: z.string().optional(),
    })
    .optional(),
  savingsContribution: z
    .object({
      goalName: z.string(),
      amount: z.number(),
    })
    .optional(),
  investment: z
    .object({
      ticker: z.string(),
      companyName: z.string().optional(),
      action: z.enum(['BUY', 'SELL']),
      shares: z.number(),
      pricePerShare: z.number(),
    })
    .optional(),
  reminder: z
    .object({
      message: z.string(),
      recurrence: z.string(),
      nextDueAt: z.string(),
    })
    .optional(),
  correction: z
    .object({
      field: z.enum(['amount', 'category', 'description']),
      newValue: z.string(),
    })
    .optional(),
  replyMessage: z.string(),
})

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

    // Injection hardening: user content is always wrapped in XML tags
    const userContent = `<user_input>${payload.message}</user_input>`

    const aiResult = await (async () => {
      try {
        return await generateObject({
          model: googleAI('gemini-2.0-flash'),
          schema: outputSchema,
          system: PARSE_MESSAGE_SYSTEM_PROMPT,
          prompt: userContent,
        })
      } catch (e) {
        console.error('[parse-message] generateObject failed:', e)
        return null
      }
    })()

    if (!aiResult) {
      const reply = "Sorry, I'm having trouble reaching my AI service right now. Please try again in a moment."
      await prisma.chatMessage.create({
        data: { userId: payload.userId, role: 'ASSISTANT', content: reply },
      })
      return { intent: 'unknown' as const, reply, record: null }
    }

    const { object: parsed, usage } = aiResult
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
        const goal = await prisma.savingsGoal.findFirst({
          where: { userId: payload.userId, name: parsed.savingsContribution.goalName },
        })
        if (!goal) {
          reply = `I couldn't find a savings goal named "${parsed.savingsContribution.goalName}". Create one first!`
        } else {
          const contrib = parsed.savingsContribution
          const contribution = await prisma.$transaction(async (tx) => {
            const c = await tx.savingsContribution.create({
              data: { goalId: goal.id, amount: contrib.amount },
            })
            await tx.savingsGoal.update({
              where: { id: goal.id },
              data: { currentAmount: { increment: contrib.amount } },
            })
            return c
          })
          record = contribution
          recordId = contribution.id
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
        validateAmount(parsed.investment.pricePerShare)
        validateAmount(parsed.investment.shares)
        const investment = await prisma.investment.create({
          data: {
            userId: payload.userId,
            ticker: parsed.investment.ticker,
            companyName: parsed.investment.companyName,
            action: parsed.investment.action,
            shares: parsed.investment.shares,
            pricePerShare: parsed.investment.pricePerShare,
            date: new Date(),
          },
        })
        record = investment
        recordId = investment.id
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
        reply =
          "You've reached the maximum of 10 active reminders. Delete some before adding new ones."
      } else {
        const nextDueAt = new Date(parsed.reminder.nextDueAt)
        if (isNaN(nextDueAt.getTime())) {
          reply = "I couldn't set the reminder — the date format wasn't recognized."
        } else {
          const reminder = await prisma.reminder.create({
            data: {
              userId: payload.userId,
              message: parsed.reminder.message,
              recurrence: parsed.reminder.recurrence,
              nextDueAt,
            },
          })
          record = reminder
          recordId = reminder.id
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
        metadata: {
          ...(recordId ? { transactionId: recordId } : {}),
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
        },
      },
    })

    return { intent: parsed.intent, reply, record }
  },
})
