import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  TRIGGER_SECRET_KEY: z.string().min(1),
  // Optional — rate limiting is disabled (fail-open) when not configured
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
})

export const env = schema.parse(process.env)
