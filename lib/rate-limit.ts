import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const chatRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'budgbot:chat',
})
