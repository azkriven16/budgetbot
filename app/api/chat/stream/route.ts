import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { chatRateLimit } from '@/lib/rate-limit'
import { streamParseMessage } from '@/lib/ai/parse'
import { createTransaction } from '@/lib/transactions'
import { parseRecurrence } from '@/lib/reminders'
import { applyCorrection, undoLastTransaction } from '@/lib/corrections'
import { getBudgetStatus } from '@/lib/budgets'
import { validateAmount } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import type { ParseResult } from '@/lib/ai/parse'

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string(),
})

type SseEvent =
  | { type: 'status'; text: string }
  | { type: 'chunk'; text: string }
  | { type: 'reply'; content: string; intent: string; transaction?: object }
  | { type: 'error'; message: string }

function encode(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

async function runIntentActions(
  userId: string,
  parsed: ParseResult,
  onStatus: (text: string) => void,
): Promise<{ reply: string; transaction?: object }> {
  let reply = parsed.replyMessage
  let transaction: object | undefined

  if (parsed.intent === 'transaction' && parsed.transaction) {
    onStatus('Saving transaction…')
    try {
      validateAmount(parsed.transaction.amount)
      const result = await createTransaction(userId, {
        amount: parsed.transaction.amount,
        type: parsed.transaction.type,
        category: parsed.transaction.category,
        description: parsed.transaction.description,
        date: parsed.transaction.date ? new Date(parsed.transaction.date) : undefined,
      })
      transaction = {
        transactionId: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        category: result.transaction.category,
        description: result.transaction.description ?? '',
        newBalance: result.newBalance,
      }
      if (parsed.transaction.type === 'EXPENSE') {
        try {
          const budgets = await getBudgetStatus(userId)
          const affected = budgets.find((b) => b.category === parsed.transaction!.category)
          if (affected && affected.percentage >= 80) {
            const over = affected.percentage >= 100
            reply += `\n\n⚠️ Heads up — you're at ${affected.percentage}% of your ${affected.category} budget this month${over ? ' (over limit!)' : ''}.`
          }
        } catch { /* non-fatal */ }
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Amount must be')) {
        reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
        transaction = undefined
      } else throw e
    }
  } else if (parsed.intent === 'reminder' && parsed.reminder) {
    onStatus('Setting reminder…')
    const activeCount = await prisma.reminder.count({ where: { userId, isActive: true } })
    if (activeCount >= 10) {
      reply = "You've reached the maximum of 10 active reminders. Delete some before adding new ones."
    } else {
      const { recurrenceCron, nextDueAt, isDefault } = parseRecurrence(parsed.reminder.recurrence)
      await prisma.reminder.create({ data: { userId, message: parsed.reminder.message, recurrence: recurrenceCron, nextDueAt } })
      const formattedDate = nextDueAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
      reply = `⏰ Got it! I'll remind you to ${parsed.reminder.message} — next reminder: ${formattedDate}.`
      if (isDefault) reply += " I'll remind you monthly — you can create a new reminder with more specific timing if needed."
    }
  } else if (parsed.intent === 'correction' && parsed.correction) {
    onStatus('Applying correction…')
    try {
      if (parsed.correction.field === 'undo') {
        const result = await undoLastTransaction(userId)
        reply = result
          ? `Removed: ${result.description ?? result.category} · $${result.amount.toFixed(2)}. Your balance has been adjusted.`
          : "I couldn't find a recent transaction to undo."
      } else {
        const result = await applyCorrection(userId, parsed.correction.field, parsed.correction.newValue)
        reply = result
          ? `Updated: ${result.category} · $${result.amount.toFixed(2)} (was $${result.oldAmount.toFixed(2)}).`
          : "I couldn't find a recent transaction to correct."
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'Forbidden') reply = "You can't modify that transaction."
      else if (e instanceof Error && e.message.startsWith('Amount must be')) reply = `That amount doesn't look right — ${e.message.toLowerCase()}.`
      else if (e instanceof Error && e.message.startsWith('Invalid category')) reply = `That doesn't look like a valid category. Try: Food, Transport, Shopping, Entertainment, Health, Salary, Subscriptions, Investments, Savings, or Other.`
      else throw e
    }
  }

  return { reply, transaction }
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return new Response('Invalid input', { status: 400 })

  const user = await getOrCreateUser(clerkId)

  const session = await prisma.chatSession.findFirst({
    where: { id: parsed.data.sessionId, userId: user.id },
  })
  if (!session) return new Response('Session not found', { status: 404 })

  try {
    const { success } = await chatRateLimit.limit(user.id)
    if (!success) {
      return new Response(
        encode({ type: 'error', message: 'Too many requests. Try again in a moment.' }),
        { status: 429, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } },
      )
    }
  } catch { /* fail open */ }

  const message = parsed.data.message
  const sessionId = session.id
  const enc = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function push(event: SseEvent) {
        controller.enqueue(enc.encode(encode(event)))
      }

      try {
        const existingCount = await prisma.chatMessage.count({ where: { sessionId } })
        await prisma.chatMessage.create({
          data: { userId: user.id, sessionId, role: 'USER', content: message },
        })

        // Auto-title on first message
        if (existingCount === 0 && session.title === 'New Chat') {
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { title: message.slice(0, 60).trim() },
          })
        } else {
          await prisma.chatSession.update({ where: { id: sessionId }, data: {} })
        }

        push({ type: 'status', text: 'Thinking…' })

        let parsedResult: ParseResult | null = null

        try {
          for await (const chunk of streamParseMessage(message)) {
            if (chunk.kind === 'text') {
              push({ type: 'chunk', text: chunk.text })
            } else {
              parsedResult = chunk.result
            }
          }
        } catch (e) {
          console.error('[stream] AI call failed:', e)
        }

        if (!parsedResult) {
          const reply = "Sorry, I'm having trouble reaching my AI service right now. Please try again in a moment."
          await prisma.chatMessage.create({ data: { userId: user.id, sessionId, role: 'ASSISTANT', content: reply } })
          push({ type: 'reply', content: reply, intent: 'unknown' })
          controller.close()
          return
        }

        const { reply, transaction } = await runIntentActions(
          user.id,
          parsedResult,
          (text) => push({ type: 'status', text }),
        )

        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            sessionId,
            role: 'ASSISTANT',
            content: reply,
            metadata: transaction && 'transactionId' in transaction
              ? { transactionId: (transaction as { transactionId: string }).transactionId }
              : {},
          },
        })

        push({ type: 'reply', content: reply, intent: parsedResult.intent, transaction })
      } catch (e) {
        console.error('[stream] unhandled error:', e)
        push({ type: 'error', message: 'Something went wrong. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
