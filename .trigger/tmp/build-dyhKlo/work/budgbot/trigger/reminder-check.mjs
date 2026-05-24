import {
  getNextOccurrence,
  prisma
} from "../../../chunk-S2D5CTLY.mjs";
import {
  schedules_exports
} from "../../../chunk-4W63UDYJ.mjs";
import "../../../chunk-7JDNMTFL.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-FUV6SSYK.mjs";

// trigger/reminder-check.ts
init_esm();
var reminderCheck = schedules_exports.task({
  id: "reminder-check",
  cron: "0 * * * *",
  queue: { concurrencyLimit: 1 },
  run: /* @__PURE__ */ __name(async () => {
    const now = /* @__PURE__ */ new Date();
    const dueReminders = await prisma.reminder.findMany({
      where: { nextDueAt: { lte: now }, isActive: true }
    });
    for (const reminder of dueReminders) {
      try {
        const nextDueAt = getNextOccurrence(reminder.recurrence, now);
        await prisma.$transaction(async (tx) => {
          await tx.chatMessage.create({
            data: {
              userId: reminder.userId,
              role: "ASSISTANT",
              content: `⏰ Reminder: ${reminder.message}`
            }
          });
          await tx.reminder.update({
            where: { id: reminder.id },
            data: { nextDueAt }
          });
        });
      } catch (e) {
        console.error(`[reminder-check] failed for reminder ${reminder.id}:`, e);
      }
    }
  }, "run")
});
export {
  reminderCheck
};
//# sourceMappingURL=reminder-check.mjs.map
