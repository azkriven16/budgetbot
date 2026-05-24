// Run: node --env-file=.env.local scripts/backfill-sessions.mjs
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client.js'

const connectionString = (process.env.DATABASE_URL ?? '').replace('sslmode=require', 'sslmode=verify-full')
const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: true } })
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany({
    where: { chatMessages: { some: { sessionId: null } } },
    select: { id: true },
  })
  console.log(`Backfilling ${users.length} user(s)...`)
  for (const user of users) {
    const firstMsg = await prisma.chatMessage.findFirst({
      where: { userId: user.id, sessionId: null, role: 'USER' },
      orderBy: { createdAt: 'asc' },
    })
    const title = firstMsg ? firstMsg.content.slice(0, 60).trim() : 'Previous conversation'
    const session = await prisma.chatSession.create({ data: { userId: user.id, title } })
    const { count } = await prisma.chatMessage.updateMany({
      where: { userId: user.id, sessionId: null },
      data: { sessionId: session.id },
    })
    console.log(`  User ${user.id}: session "${title}" — ${count} messages`)
  }
  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
