import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/user'
import { deleteTransaction } from '@/lib/transactions'
import { assertOwnership } from '@/lib/validators'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await getOrCreateUser(clerkId)

  const transaction = await prisma.transaction.findUnique({ where: { id } })
  if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    assertOwnership(transaction.userId, user.id)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await deleteTransaction(user.id, transaction)

  return NextResponse.json({ data: { success: true } })
}
