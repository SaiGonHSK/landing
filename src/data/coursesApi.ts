import { onlineOfflineCourses, type CatalogItem } from "./catalog";
import { coursePathMap } from "./pages";

export type CurriculumBlock = {
  title: string;
  items: string[];
};

export type ApiCourse = {
  id: string;
  catalogKey: string;
  code: string;
  title: string;
  summary: string;
  intro: string;
  goal: string;
  entry: string;
  icon: string;
  tags: string[];
  isFeatured: boolean;
  contactOnly: boolean;
  note: string;
  priceDisplay: string;
  curriculum: CurriculumBlock[];
};

export type VisibleCourse = CatalogItem & {
  href: string;
  id: string;
  isFeatured: boolean;
  goal: string;
  tags: string[];
};

let apiCourses: ApiCourse[] = [];

export function applyCourses(incoming: ApiCourse[]): number {
  apiCourses = incoming.filter((course) => course.id?.trim());
  return apiCourses.length;
}

export function visibleCourses(): VisibleCourse[] {
  const paths = coursePathMap();
  const hrefByID = new Map<string, string>();
  for (const [href, courseID] of paths) hrefByID.set(String(courseID), href);

  return apiCourses.flatMap((course) => {
    const href = hrefByID.get(course.id);
    return href ? [toVisible(course, href)] : [];
  });
}

export const apiCourseByID = (id: string): ApiCourse | undefined =>
  apiCourses.find((course) => course.id === id);

export function findVisibleCourse(path: string): VisibleCourse | undefined {
  const courseID = coursePathMap().get(path);
  if (courseID == null) return undefined;

  const course = apiCourses.find((entry) => entry.id === String(courseID));
  return course ? toVisible(course, path) : undefined;
}

export function featuredApiCourses(): VisibleCourse[] {
  return visibleCourses().filter((course) => course.isFeatured);
}

const toVisible = (course: ApiCourse, href: string): VisibleCourse => ({
  ...merge(course),
  href,
  id: course.id,
  isFeatured: course.isFeatured,
  goal: course.goal ?? "",
  tags: course.tags ?? [],
});

function merge(course: ApiCourse): CatalogItem {
  const base = onlineOfflineCourses.find((entry) => entry.slug === course.catalogKey);

  const merged: CatalogItem = {
    ...(base ?? {
      slug: course.catalogKey || course.code,
      title: course.title,
      summary: "",
      intro: "",
      facts: [],
      content: [],
      outcomes: [],
    }),
    title: course.title || base?.title || course.code,
    summary: course.summary || base?.summary || "",
    intro: course.intro || base?.intro || "",
  };

  if (course.entry?.trim()) {
    merged.facts = upsertFact(merged.facts, "Đầu vào", course.entry);
  }

  return merged;
}

function upsertFact(
  facts: CatalogItem["facts"],
  label: string,
  value: string,
): CatalogItem["facts"] {
  const index = facts.findIndex((fact) => fact.label.startsWith(label));
  if (index === -1) return [...facts, { label, value }];

  const next = [...facts];
  next[index] = { ...next[index], value };
  return next;
}

export function curriculumOf(courseID: string): CurriculumBlock[] {
  return apiCourses.find((entry) => entry.id === courseID)?.curriculum ?? [];
}
