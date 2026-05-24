import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })
  const user = await getOrCreateUser(clerkId)
  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
  return Response.json({ data: sessions })
}

export async function POST() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })
  const user = await getOrCreateUser(clerkId)
  const session = await prisma.chatSession.create({
    data: { userId: user.id },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
  return Response.json({ data: session }, { status: 201 })
}
