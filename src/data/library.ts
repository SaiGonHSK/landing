import doc from "../../content/pages.json";

import { getPageContents, type MenuEntry, type PageContent } from "./pages";

const PREFIX = "/library/";

export type LibraryCategory = {
  key: string;
  slug: string;
  label: string;
};

export type LibraryArticle = PageContent & {
  key: string;
  category: LibraryCategory;
};

export type ApiLibraryCategory = { key: string; label: string };

const toCategory = (input: ApiLibraryCategory): LibraryCategory => ({
  key: input.key,
  slug: `${PREFIX}${input.key}`,
  label: input.label,
});

const bundled = (): LibraryCategory[] =>
  ((doc.menu as MenuEntry[]).find((entry) => entry.slug === PREFIX.slice(0, -1))?.children ?? [])
    .filter((child) => child.slug.startsWith(PREFIX))
    .map((child) => toCategory({ key: child.slug.slice(PREFIX.length), label: child.label }));

export let libraryCategories: LibraryCategory[] = bundled();

export function applyLibraryCategories(incoming: ApiLibraryCategory[]): number {
  if (!Array.isArray(incoming) || incoming.length === 0) return 0;

  libraryCategories = incoming
    .filter((category) => category?.key?.trim())
    .map(toCategory);
  return libraryCategories.length;
}

export const findLibraryCategory = (key: string): LibraryCategory | undefined =>
  libraryCategories.find((category) => category.key === key);

export async function getLibrary(): Promise<LibraryArticle[]> {
  const pages = await getPageContents();

  return pages.flatMap((page) => {
    if (!page.slug.startsWith(PREFIX)) return [];

    const rest = page.slug.slice(PREFIX.length);
    const cut = rest.indexOf("/");
    if (cut <= 0) return [];

    const category = findLibraryCategory(rest.slice(0, cut));
    const key = rest.slice(cut + 1);
    if (!category || !key) return [];

    return [{ ...page, key, category }];
  });
}

export async function articlesInCategory(categoryKey: string): Promise<LibraryArticle[]> {
  return (await getLibrary()).filter((item) => item.category.key === categoryKey);
}

const MONTHS = [
  "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
  "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12",
];

export function formatArticleDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

export async function findLibraryArticle(categoryKey: string, key: string) {
  return (await getLibrary()).find(
    (item) => item.category.key === categoryKey && item.key === key,
  );
}
