import '@/lib/env'
import { schedules } from '@trigger.dev/sdk'
import { prisma } from '@/lib/prisma'
import { getNextOccurrence } from '@/lib/reminders'

export const reminderCheck = schedules.task({
  id: 'reminder-check',
  cron: '0 * * * *',
  queue: { concurrencyLimit: 1 },
  run: async () => {
    const now = new Date()
    const dueReminders = await prisma.reminder.findMany({
      where: { nextDueAt: { lte: now }, isActive: true },
    })

    for (const reminder of dueReminders) {
      try {
        const nextDueAt = getNextOccurrence(reminder.recurrence, now)
        await prisma.$transaction(async (tx) => {
          await tx.chatMessage.create({
            data: {
              userId: reminder.userId,
              role: 'ASSISTANT',
              content: `⏰ Reminder: ${reminder.message}`,
            },
          })
          await tx.reminder.update({
            where: { id: reminder.id },
            data: { nextDueAt },
          })
        })
      } catch (e) {
        console.error(`[reminder-check] failed for reminder ${reminder.id}:`, e)
      }
    }
  },
})
