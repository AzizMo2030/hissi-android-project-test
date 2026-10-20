import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DAYS, loadLessons, newId, saveLessons, sortLessons, validateLesson, toMinutes, type Lesson } from "@/lib/lessons";
import { requestReminderPermission, syncReminders } from "@/lib/reminders";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حصصي — جدول حصص المعلم" },
      { name: "description", content: "تطبيق حصصي لتنظيم جدول الحصص الأسبوعي للمعلم مع تذكير ببداية ونهاية الحصة." },
      { property: "og:title", content: "حصصي — جدول حصص المعلم" },
      { property: "og:description", content: "نظّم حصصك الأسبوعية واحصل على تذكير ببداية ونهاية كل حصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const empty = (day: number): Lesson => ({ id: "", day, subject: "", className: "", room: "", start: "07:30", end: "08:15", remind: true });

function Index() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [ready, setReady] = useState(false);
  const [day, setDay] = useState(0);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setLessons(loadLessons());
    const d = new Date().getDay();
    setDay(d);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLessons(lessons);
    syncReminders(lessons).catch(() => {});
  }, [lessons, ready]);

  const dayLessons = useMemo(() => sortLessons(lessons.filter((l) => l.day === day)), [lessons, day]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const isToday = ready && day === new Date().getDay();

  function save() {
    if (!editing) return;
    const l = { ...editing, id: editing.id || newId() };
    const err = validateLesson(l, lessons);
    if (err) return setError(err);
    setLessons((ls) => (editing.id ? ls.map((x) => (x.id === l.id ? l : x)) : [...ls, l]));
    setEditing(null);
    setError(null);
  }

  function remove(id: string) {
    if (confirm("حذف هذه الحصة؟")) setLessons((ls) => ls.filter((x) => x.id !== id));
  }

  async function enableReminders() {
    const ok = await requestReminderPermission();
    setNotice(ok ? "تم تفعيل التذكيرات" : "لم يُسمح بالإشعارات من إعدادات الجهاز");
    if (ok) syncReminders(lessons);
  }

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-background font-arabic text-foreground">
      <header className="bg-hero px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-primary-foreground">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">حصصي</h1>
            <p className="text-sm opacity-85">جدولك الأسبوعي في مكان واحد</p>
          </div>
          <button onClick={enableReminders} className="rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-bold hover:bg-primary-foreground/25 focus-visible:outline-2 focus-visible:outline-primary-foreground">
            التذكيرات
          </button>
        </div>
      </header>

      <main className="mx-auto -mt-5 max-w-2xl px-4 pb-28">
        <nav aria-label="أيام الأسبوع" className="flex gap-2 overflow-x-auto rounded-2xl bg-card p-2 shadow-soft">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setDay(i)}
              aria-pressed={day === i}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${day === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {d}
              <span className="ms-1 text-xs opacity-70">({lessons.filter((l) => l.day === i).length})</span>
            </button>
          ))}
        </nav>

        {notice && <p role="status" className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm text-accent-foreground">{notice}</p>}

        <section aria-label={`حصص يوم ${DAYS[day]}`} className="mt-5 space-y-3">
          {dayLessons.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
              لا توجد حصص يوم {DAYS[day]}. أضف أول حصة!
            </div>
          )}
          {dayLessons.map((l, idx) => {
            const live = isToday && nowMin >= toMinutes(l.start) && nowMin < toMinutes(l.end);
            return (
              <article key={l.id} className={`flex items-stretch gap-4 rounded-2xl bg-card p-4 shadow-soft ${live ? "ring-2 ring-secondary" : ""}`}>
                <div className="flex w-16 flex-col items-center justify-center rounded-xl bg-muted py-2 text-center">
                  <span className="text-xs text-muted-foreground">الحصة</span>
                  <span className="text-2xl font-extrabold text-primary">{idx + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-bold">{l.subject}</h2>
                    {live && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">الآن</span>}
                  </div>
                  <p className="text-sm text-muted-foreground"><bdi dir="ltr">{l.start} – {l.end}</bdi></p>
                  <p className="text-sm text-muted-foreground">{[l.className && `الفصل: ${l.className}`, l.room && `القاعة: ${l.room}`].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <button onClick={() => { setEditing(l); setError(null); }} className="rounded-lg px-3 py-1 text-sm font-bold text-primary hover:bg-muted" aria-label={`تعديل ${l.subject}`}>تعديل</button>
                  <button onClick={() => remove(l.id)} className="rounded-lg px-3 py-1 text-sm font-bold text-destructive hover:bg-muted" aria-label={`حذف ${l.subject}`}>حذف</button>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <button
        onClick={() => { setEditing(empty(day)); setError(null); }}
        className="fixed inset-x-0 mx-auto w-fit bottom-[max(1.5rem,env(safe-area-inset-bottom))] rounded-full bg-secondary px-8 py-4 text-lg font-extrabold text-secondary-foreground shadow-lift"
      >
        + إضافة حصة
      </button>

      {editing && (
        <div role="dialog" aria-modal="true" aria-labelledby="form-title" className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={() => setEditing(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="w-full max-w-md space-y-3 rounded-t-3xl bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-3xl"
          >
            <h2 id="form-title" className="text-xl font-extrabold">{editing.id ? "تعديل الحصة" : "حصة جديدة"}</h2>
            <Field label="المادة"><input autoFocus required value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الفصل"><input value={editing.className} onChange={(e) => setEditing({ ...editing, className: e.target.value })} className="input" /></Field>
              <Field label="القاعة"><input value={editing.room} onChange={(e) => setEditing({ ...editing, room: e.target.value })} className="input" /></Field>
            </div>
            <Field label="اليوم">
              <select value={editing.day} onChange={(e) => setEditing({ ...editing, day: Number(e.target.value) })} className="input">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="البداية"><input type="time" required value={editing.start} onChange={(e) => setEditing({ ...editing, start: e.target.value })} className="input" /></Field>
              <Field label="النهاية"><input type="time" required value={editing.end} onChange={(e) => setEditing({ ...editing, end: e.target.value })} className="input" /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={editing.remind} onChange={(e) => setEditing({ ...editing, remind: e.target.checked })} className="size-5 accent-primary" />
              تذكيري ببداية ونهاية الحصة
            </label>
            {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">حفظ</button>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-muted px-5 py-3 font-bold">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
