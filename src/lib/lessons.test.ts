import { describe, expect, it } from "vitest";
import { validateLesson, type Lesson } from "./lessons";

const base: Lesson = { id: "a", day: 0, subject: "رياضيات", className: "", room: "", start: "08:00", end: "08:45", remind: true };

describe("validateLesson", () => {
  it("rejects end before start", () => {
    expect(validateLesson({ ...base, end: "07:30" }, [])).toBe("وقت النهاية يجب أن يكون بعد البداية");
  });
  it("rejects overlapping lesson on same day", () => {
    expect(validateLesson({ ...base, id: "b", start: "08:30", end: "09:15" }, [base])).not.toBeNull();
  });
  it("allows back-to-back and other-day lessons", () => {
    expect(validateLesson({ ...base, id: "b", start: "08:45", end: "09:30" }, [base])).toBeNull();
    expect(validateLesson({ ...base, id: "c", day: 1 }, [base])).toBeNull();
  });
});
