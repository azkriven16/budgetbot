import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/user'
import { deactivateReminder } from '@/lib/reminders'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await getOrCreateUser(clerkId)

  try {
    const reminder = await deactivateReminder(id, user.id)
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
