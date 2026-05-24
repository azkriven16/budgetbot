import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import { SessionLayout } from '@/components/chat/session-layout'

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')
  const user = await getOrCreateUser(clerkId)
  const { sessionId } = await params
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId: user.id },
    select: { id: true },
  })
  if (!session) redirect('/chat')
  return <SessionLayout sessionId={sessionId} />
}
