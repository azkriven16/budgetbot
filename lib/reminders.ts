import '@/lib/env'
import { Cron } from 'croner'
import { prisma } from './prisma'
import { assertOwnership } from './validators'

const PATTERNS = [
  { match: /1st of every month|monthly/i, cron: '0 9 1 * *' },
  { match: /every week|weekly/i, cron: '0 9 * * 1' },
  { match: /every day|daily/i, cron: '0 9 * * *' },
  { match: /every friday/i, cron: '0 9 * * 5' },
  { match: /every monday/i, cron: '0 9 * * 1' },
  { match: /every tuesday/i, cron: '0 9 * * 2' },
  { match: /every wednesday/i, cron: '0 9 * * 3' },
  { match: /every thursday/i, cron: '0 9 * * 4' },
  { match: /every saturday/i, cron: '0 9 * * 6' },
  { match: /every sunday/i, cron: '0 9 * * 0' },
]

export function parseRecurrence(description: string): {
  nextDueAt: Date
  recurrenceCron: string
  isDefault: boolean
} {
  let cronString = '0 9 1 * *'
  let isDefault = true

  for (const p of PATTERNS) {
    if (p.match.test(description)) {
      cronString = p.cron
      isDefault = false
      break
    }
  }

  const nextDueAt = getNextOccurrence(cronString, new Date())
  return { nextDueAt, recurrenceCron: cronString, isDefault }
}

export function getNextOccurrence(cronString: string, from: Date): Date {
  return new Cron(cronString, { timezone: 'UTC' }).nextRun(from)!
}

export async function getUserReminders(userId: string) {
  return prisma.reminder.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function deactivateReminder(reminderId: string, userId: string) {
  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } })
  if (!reminder) return null
  assertOwnership(reminder.userId, userId)
  return prisma.reminder.update({
    where: { id: reminderId },
    data: { isActive: false },
  })
}
