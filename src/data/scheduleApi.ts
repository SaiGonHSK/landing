import type { ScheduleSlot } from "./schema";

export type ApiScheduleItem = {
  id: string;
  groupLabel: string;
  code: string;
  name: string;
  mode: string;
  target: string;
  openDate: string;
  durationLabel: string;
  cadenceNote: string;
  slots: ScheduleSlot[];
};

export type ApiSchedule = {
  title: string;
  note: string;
  items: ApiScheduleItem[];
};

// Dev (Vite HMR) có thể nạp lại module này thành bản mới trong khi middleware vẫn giữ
// bản cũ — để trên globalThis thì mọi bản cùng đọc một lịch, không bị rỗng sau khi sửa file.
const store = ((globalThis as { __hskSchedule?: { current: ApiSchedule } }).__hskSchedule ??= {
  current: { title: "", note: "", items: [] },
});

export function applySchedule(incoming: ApiSchedule | null | undefined): number {
  store.current = {
    title: incoming?.title?.trim() ?? "",
    note: incoming?.note?.trim() ?? "",
    items: (incoming?.items ?? []).filter((row) => row.code?.trim()),
  };
  return store.current.items.length;
}

export const publishedSchedule = (): ApiSchedule => store.current;
