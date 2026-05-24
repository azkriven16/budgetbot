import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'

export default async function ChatPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')
  const user = await getOrCreateUser(clerkId)

  const latest = await prisma.chatSession.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  })

  if (latest) redirect(`/chat/${latest.id}`)

  const session = await prisma.chatSession.create({
    data: { userId: user.id },
    select: { id: true },
  })
  redirect(`/chat/${session.id}`)
}
