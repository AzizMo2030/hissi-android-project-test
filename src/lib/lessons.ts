export type Lesson = {
  id: string;
  day: number; // 0 = الأحد ... 4 = الخميس, 5 = الجمعة, 6 = السبت
  subject: string;
  className: string;
  room: string;
  start: string; // "HH:MM"
  end: string;
  remind: boolean;
};

export const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const KEY = "hissi.lessons.v1";

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Returns an Arabic error message, or null when valid. */
export function validateLesson(l: Lesson, all: Lesson[]): string | null {
  if (!l.subject.trim()) return "اكتب اسم المادة";
  if (!l.start || !l.end) return "حدد وقت البداية والنهاية";
  if (toMinutes(l.end) <= toMinutes(l.start)) return "وقت النهاية يجب أن يكون بعد البداية";
  const clash = all.find(
    (o) =>
      o.id !== l.id &&
      o.day === l.day &&
      toMinutes(l.start) < toMinutes(o.end) &&
      toMinutes(o.start) < toMinutes(l.end),
  );
  if (clash) return `يتعارض مع حصة ${clash.subject} (${clash.start}–${clash.end})`;
  return null;
}

export function sortLessons(ls: Lesson[]): Lesson[] {
  return [...ls].sort((a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start));
}

export function loadLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Lesson[]) : [];
  } catch {
    return [];
  }
}

export function saveLessons(ls: Lesson[]) {
  localStorage.setItem(KEY, JSON.stringify(ls));
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
