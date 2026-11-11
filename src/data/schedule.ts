import { publishedSchedule, type ApiScheduleItem } from "./scheduleApi";
import type { ScheduleSlot } from "./schema";

export const WEEKDAY_LABELS = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const displayRank = (weekday: number) => (weekday === 0 ? 7 : weekday);

export function formatCadence(slots: readonly ScheduleSlot[]): string {
  if (slots.length === 0) return "";

  const byTime = new Map<string, number[]>();
  for (const slot of slots) {
    const time = `${slot.startTime}–${slot.endTime}`;
    byTime.set(time, [...(byTime.get(time) ?? []), slot.weekday]);
  }

  return [...byTime.entries()]
    .map(([time, weekdays]) => {
      const sorted = [...weekdays].sort((a, b) => displayRank(a) - displayRank(b));
      const hasSunday = sorted.includes(0);
      const weekdaysOnly = sorted.filter((day) => day !== 0);

      const numbers = weekdaysOnly.map((day) => day + 1).join("-");
      const label = hasSunday
        ? weekdaysOnly.length > 0
          ? `Thứ ${numbers} & Chủ nhật`
          : "Chủ nhật"
        : `Thứ ${numbers}`;

      return `${label} · ${time}`;
    })
    .join(" · ");
}

const daypartOf = (startTime: string): string => {
  const hour = Number(startTime.slice(0, 2));
  if (hour < 12) return "Sáng";
  if (hour < 17) return "Chiều";
  return "Tối";
};

export function sessionLines(slots: readonly ScheduleSlot[]): string[] {
  return [...slots]
    .sort(
      (a, b) =>
        displayRank(a.weekday) - displayRank(b.weekday) ||
        a.startTime.localeCompare(b.startTime),
    )
    .map((slot) => {
      const day = WEEKDAY_LABELS[slot.weekday].replace("Thứ", "thứ");
      return `${daypartOf(slot.startTime)} ${day}: ${slot.startTime} – ${slot.endTime}`;
    });
}

export type ScheduleRow = {
  id: string;
  code: string;
  name: string;
  group: string;
  mode: string;
  target: string;
  openDate: string;
  openDateISO: string;
  duration: string;
  slots: ScheduleSlot[];
  cadenceNote: string;
  cadence: string;
};

const toVietnameseDate = (iso: string): string => {
  const [year, month, day] = iso.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
};

const toScheduleRow = (row: ApiScheduleItem): ScheduleRow => {
  return {
    id: row.id,
    code: row.code,
    name: row.name?.trim() || row.code,
    group: row.groupLabel?.trim() ?? "",
    mode: row.mode,
    target: row.target,
    openDate: toVietnameseDate(row.openDate),
    openDateISO: row.openDate,
    duration: row.durationLabel,
    slots: row.slots ?? [],
    cadenceNote: row.cadenceNote,
    cadence: (row.slots ?? []).length > 0 ? formatCadence(row.slots) : row.cadenceNote,
  };
};

export let schedule: ScheduleRow[] = [];

export let scheduleTitle = "";
export let scheduleNote = "";

export const findRowById = (id?: string | null): ScheduleRow | undefined =>
  id ? schedule.find((row) => row.id === id) : undefined;

export function syncFromSchedule(): void {
  const published = publishedSchedule();
  schedule = published.items.map(toScheduleRow);
  scheduleTitle = published.title;
  scheduleNote = published.note;
}

syncFromSchedule();
