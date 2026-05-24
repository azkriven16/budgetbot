import '@/lib/env'
import { generateObject, streamObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { CATEGORY_IDS } from '@/lib/categories'
import { PARSE_MESSAGE_SYSTEM_PROMPT } from '@/lib/prompts/parse-message.v1'
import { validateAmount } from '@/lib/validators'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// replyMessage is first so the model streams it immediately before other fields
const outputSchema = z.object({
  replyMessage: z.string(),
  intent: z.enum([
    'transaction',
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

  return object
}

export type StreamChunk =
  | { kind: 'text'; text: string }
  | { kind: 'done'; result: ParseResult }

export async function* streamParseMessage(message: string): AsyncGenerator<StreamChunk> {
  const userContent = `<user_input>${message}</user_input>`

  const { partialObjectStream, object } = streamObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: outputSchema,
    system: PARSE_MESSAGE_SYSTEM_PROMPT,
    prompt: userContent,
  })

  let lastText = ''

  for await (const partial of partialObjectStream) {
    const current = partial.replyMessage ?? ''
    if (current.length > lastText.length) {
      lastText = current
      yield { kind: 'text', text: current }
    }
  }

  const result = await object
  if (result.transaction) validateAmount(result.transaction.amount)

  yield { kind: 'done', result }
}
