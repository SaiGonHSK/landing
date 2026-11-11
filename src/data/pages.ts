
import doc from "../../content/pages.json";

export type MenuChild = {
  label: string;
  slug: string;

  group?: string;

  groupSlug?: string;

  courseId?: number;
};

export type MenuEntry = {
  label: string;
  slug: string;

  cta?: boolean;

  hidden?: boolean;
  children?: MenuChild[];
};

export type PageContent = {
  slug: string;
  title: string;
  summary: string;
  intro: string;

  body: string;
  coverImage?: string;
  publishedAt?: string | null;
  updatedAt?: string;
};

export type PageTreeNode = MenuEntry & { children: MenuChild[] };

const normaliseMenu = (entries: MenuEntry[]): PageTreeNode[] =>
  entries.map((entry) => ({
    ...entry,
    children: (entry.children ?? []).map((child) => ({
      ...child,
      group: child.group?.trim() || undefined,
      groupSlug: child.groupSlug?.trim() || undefined,
    })),
  }));

export let menu: PageTreeNode[] = normaliseMenu(doc.menu as MenuEntry[]);

export function applyMenu(incoming: MenuEntry[]): number {
  if (!Array.isArray(incoming) || incoming.length === 0) return 0;

  menu = normaliseMenu(incoming);
  return menu.length;
}

export function findParent(slug: string): PageTreeNode | null {
  return menu.find((entry) => entry.children.some((c) => c.slug === slug)) ?? null;
}

export function coursePathMap(): Map<string, number> {
  const out = new Map<string, number>();
  for (const entry of menu) {
    for (const child of entry.children) {
      if (child.courseId != null) out.set(child.slug, child.courseId);
    }
  }
  return out;
}

let pages: PageContent[] = [];

export async function getPageContents(): Promise<PageContent[]> {
  return pages;
}

export function applyPageContents(incoming: PageContent[]): number {
  pages = incoming.filter((page) => page.body?.trim());
  return pages.length;
}

export function groupChildren(children: MenuChild[] = []) {
  const groups: { title: string; slug?: string; items: MenuChild[] }[] = [];
  for (const child of children) {
    const title = child.group?.trim();
    if (!title) continue;
    const existing = groups.find((g) => g.title === title);
    if (existing) {
      existing.items.push(child);
      existing.slug ??= child.groupSlug;
    } else {
      groups.push({ title, slug: child.groupSlug, items: [child] });
    }
  }
  return groups;
}

export const plainChildren = (children: MenuChild[] = []) =>
  children.filter((child) => !child.group?.trim());
