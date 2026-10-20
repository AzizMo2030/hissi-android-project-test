import { toMinutes, type Lesson } from "./lessons";

/**
 * Reminders: on Android (Capacitor) we schedule weekly native local notifications
 * for lesson start and end. On the web we fall back to browser notifications that
 * only fire while the page is open.
 */
let webTimers: number[] = [];

async function isNative() {
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform();
}

export async function requestReminderPermission(): Promise<boolean> {
  if (await isNative()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const res = await LocalNotifications.requestPermissions();
    return res.display === "granted";
  }
  if (typeof Notification === "undefined") return false;
  return (await Notification.requestPermission()) === "granted";
}

function hashId(s: string, offset: number) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (Math.abs(h) % 1_000_000) * 2 + offset;
}

export async function syncReminders(lessons: Lesson[]) {
  const active = lessons.filter((l) => l.remind);
  if (await isNative()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length)
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    const notifications = active.flatMap((l) => {
      const sh = Math.floor(toMinutes(l.start) / 60), sm = toMinutes(l.start) % 60;
      const eh = Math.floor(toMinutes(l.end) / 60), em = toMinutes(l.end) % 60;
      const weekday = l.day + 1; // Capacitor: 1 = Sunday
      return [
        { id: hashId(l.id, 0), title: `بدأت حصة ${l.subject}`, body: [l.className, l.room].filter(Boolean).join(" · "), schedule: { on: { weekday, hour: sh, minute: sm }, allowWhileIdle: true } },
        { id: hashId(l.id, 1), title: `انتهت حصة ${l.subject}`, body: "وقت الاستراحة", schedule: { on: { weekday, hour: eh, minute: em }, allowWhileIdle: true } },
      ];
    });
    if (notifications.length) await LocalNotifications.schedule({ notifications });
    return;
  }
  // Web fallback: today's remaining lessons, while the tab is open.
  webTimers.forEach(clearTimeout);
  webTimers = [];
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const l of active.filter((x) => x.day === now.getDay())) {
    for (const [t, title] of [[l.start, `بدأت حصة ${l.subject}`], [l.end, `انتهت حصة ${l.subject}`]] as const) {
      const diff = toMinutes(t) - nowMin;
      if (diff > 0) webTimers.push(window.setTimeout(() => new Notification(title), diff * 60_000));
    }
  }
}
