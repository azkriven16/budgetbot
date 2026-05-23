import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getOrCreateUser(clerkId)
  await prisma.chatMessage.deleteMany({ where: { userId: user.id } })

  return NextResponse.json({ data: { success: true } })
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getOrCreateUser(clerkId)

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  messages.reverse()

  return NextResponse.json({
    data: messages.map((m) => ({
      id: m.id,
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
      createdAt: m.createdAt,
    })),
  })
}
