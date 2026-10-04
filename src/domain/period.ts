export type Period = "day" | "week" | "month" | "year";

export const PERIOD_LABELS: Record<Period, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date) {
  const day = startOfDay(d);
  const offset = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - offset);
  return day;
}

export function periodRange(
  period: Period,
  anchor: Date,
): { start: number; end: number } {
  let start: Date;
  let end: Date;
  switch (period) {
    case "day":
      start = startOfDay(anchor);
      end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 1,
      );
      break;
    case "week":
      start = startOfWeek(anchor);
      end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 7,
      );
      break;
    case "month":
      start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
      break;
    case "year":
      start = new Date(anchor.getFullYear(), 0, 1);
      end = new Date(anchor.getFullYear() + 1, 0, 1);
      break;
  }
  return { start: start.getTime(), end: end.getTime() };
}

export function shiftAnchor(
  period: Period,
  anchor: Date,
  direction: 1 | -1,
): Date {
  const d = new Date(anchor);
  switch (period) {
    case "day":
      d.setDate(d.getDate() + direction);
      break;
    case "week":
      d.setDate(d.getDate() + 7 * direction);
      break;
    case "month":
      d.setDate(1);
      d.setMonth(d.getMonth() + direction);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + direction);
      break;
  }
  return d;
}

export function formatPeriodLabel(period: Period, anchor: Date): string {
  const { start, end } = periodRange(period, anchor);
  const s = new Date(start);
  const e = new Date(end - 1);
  switch (period) {
    case "day":
      return s.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "week": {
      const sameMonth = s.getMonth() === e.getMonth();
      const left = s.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const right = sameMonth
        ? String(e.getDate())
        : e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return `${left} – ${right}, ${e.getFullYear()}`;
    }
    case "month":
      return s.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    case "year":
      return String(s.getFullYear());
  }
}

export function formatDay(ts: number): string {
  const d = new Date(ts);
  const today = startOfDay(new Date()).getTime();
  const day = startOfDay(d).getTime();
  if (day === today) return "Today";
  if (day === today - 86_400_000) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function toDateInput(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function parseDateInput(text: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d, 12);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return null;
  return date.getTime();
}
