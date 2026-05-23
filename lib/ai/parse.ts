import '@/lib/env'
import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { CATEGORY_IDS } from '@/lib/categories'
import { PARSE_MESSAGE_SYSTEM_PROMPT } from '@/lib/prompts/parse-message.v1'
import { validateAmount } from '@/lib/validators'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
      field: z.enum(['amount', 'category', 'description', 'undo']),
      newValue: z.string(),
    })
    .optional(),
  replyMessage: z.string(),
})

export type ParseResult = z.infer<typeof outputSchema>

export async function parseMessage(message: string): Promise<ParseResult> {
  const userContent = `<user_input>${message}</user_input>`
  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: outputSchema,
    system: PARSE_MESSAGE_SYSTEM_PROMPT,
    prompt: userContent,
  })

  if (object.transaction) validateAmount(object.transaction.amount)
  if (object.investment) {
    validateAmount(object.investment.pricePerShare)
    validateAmount(object.investment.shares)
  }

  return object
}
