import { cache } from 'react'
import { prisma } from './prisma'

// cache() memoises per-request in RSC — layout + page both call this,
// but only the first call hits the DB.
export const getOrCreateUser = cache(async function getOrCreateUser(clerkId: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
  }).catch((e: unknown) => {
    // Concurrent requests can race past the upsert check — P2002 means the row
    // was created by another request in the same instant; just read it back.
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return prisma.user.findUniqueOrThrow({ where: { clerkId } })
    }
    throw e
  })
})
