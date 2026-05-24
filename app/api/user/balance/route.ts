import '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/user'
import { validateAmount } from '@/lib/validators'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  balance: z.number(),
})

export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    validateAmount(parsed.data.balance)
  } catch (e) {
    if (e instanceof Error) return NextResponse.json({ error: e.message }, { status: 400 })
    throw e
  }

  const user = await getOrCreateUser(clerkId)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { balance: parsed.data.balance },
  })

  return NextResponse.json({ data: { balance: Number(updated.balance) } })
}
