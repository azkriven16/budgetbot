import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import { assertOwnership } from '@/lib/validators'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await getOrCreateUser(clerkId)

  const budget = await prisma.budget.findUnique({ where: { id } })
  if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    assertOwnership(budget.userId, user.id)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.budget.delete({ where: { id } })

  return NextResponse.json({ data: { success: true } })
}
