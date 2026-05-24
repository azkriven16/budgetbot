import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })
  const user = await getOrCreateUser(clerkId)
  const { id } = await params
  const session = await prisma.chatSession.findFirst({ where: { id, userId: user.id } })
  if (!session) return new Response('Not found', { status: 404 })
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, role: true, content: true, metadata: true, createdAt: true },
  })
  return Response.json({
    data: messages.map((m) => ({
      id: m.id,
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
      metadata: m.metadata,
      createdAt: m.createdAt,
    })),
  })
}
