import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'

async function resolveSession(clerkId: string, id: string) {
  const user = await getOrCreateUser(clerkId)
  const session = await prisma.chatSession.findFirst({ where: { id, userId: user.id } })
  return { user, session }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })
  const { id } = await params
  const { session } = await resolveSession(clerkId, id)
  if (!session) return new Response('Not found', { status: 404 })
  await prisma.chatSession.delete({ where: { id: session.id } })
  return new Response(null, { status: 204 })
}

const patchSchema = z.object({ title: z.string().min(1).max(100) })

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response('Unauthorized', { status: 401 })
  const { id } = await params
  const { session } = await resolveSession(clerkId, id)
  if (!session) return new Response('Not found', { status: 404 })
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return new Response('Invalid input', { status: 400 })
  const updated = await prisma.chatSession.update({
    where: { id: session.id },
    data: { title: parsed.data.title },
    select: { id: true, title: true, updatedAt: true },
  })
  return Response.json({ data: updated })
}
