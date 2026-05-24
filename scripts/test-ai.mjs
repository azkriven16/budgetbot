// Run: node --env-file=.env.local scripts/test-ai.mjs
// Tests the exact generateObject call used in trigger/parse-message.ts

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { z } from 'zod'

const key = process.env.ANTHROPIC_API_KEY
console.log('ANTHROPIC_API_KEY present:', !!key)
console.log('ANTHROPIC_API_KEY prefix:', key?.slice(0, 8) + '...')

const anthropic = createAnthropic({ apiKey: key })

const schema = z.object({
  intent: z.enum(['transaction', 'unknown']),
  replyMessage: z.string(),
  transaction: z.object({
    amount: z.number(),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string(),
    description: z.string(),
  }).optional(),
})

console.log('\nCalling generateObject with model: claude-haiku-4-5-20251001...')
const start = Date.now()

try {
  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema,
    prompt: '<user_input>spent $45 on groceries</user_input>',
  })
  console.log(`\n✅ SUCCESS (${Date.now() - start}ms)`)
  console.log('Output:', JSON.stringify(result.object, null, 2))
} catch (e) {
  console.error(`\n❌ FAILED (${Date.now() - start}ms)`)
  console.error('Error class:', e.constructor?.name)
  console.error('Error message:', e.message)
  console.error('Status code:', e.statusCode ?? e.status ?? 'n/a')
  if (e.responseBody) console.error('Response body:', e.responseBody)
}
