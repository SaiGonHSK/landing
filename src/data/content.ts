import bundled from "../../content/site.json";

export type SiteContent = typeof bundled;

const DYNAMIC_KEYS = ["testimonials", "faqs"] as const;

let current: SiteContent = bundled;

export const staticContent = bundled;

export const getContent = (): SiteContent => current;

export let contentUpdatedAt: string = bundled.updatedAt;

export function applyContent(next: unknown): void {
  if (!isPlainObject(next)) return;

  const patch: Record<string, unknown> = {};
  for (const key of DYNAMIC_KEYS) {
    if (key in next) patch[key] = next[key];
  }

  current = mergeContent(bundled, patch) as SiteContent;
  const updatedAt = (next as { updatedAt?: unknown }).updatedAt;
  contentUpdatedAt = typeof updatedAt === "string" && updatedAt ? updatedAt : bundled.updatedAt;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function mergeContent(base: unknown, next: unknown): unknown {
  if (next === undefined || next === null) return base;
  if (Array.isArray(next)) return next;

  if (isPlainObject(base) && isPlainObject(next)) {
    const merged: Record<string, unknown> = { ...base };
    for (const key of Object.keys(next)) {
      merged[key] = key in base ? mergeContent(base[key], next[key]) : next[key];
    }
    return merged;
  }

  return next;
}
