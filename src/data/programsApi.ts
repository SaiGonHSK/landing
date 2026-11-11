import { courses as bundled, type Course } from "./courses";

export type ApiProgram = {
  slug: string;
  title: string;
  summary: string;
  goal: string;
  entry: string;
  tags: string[];
  courseKeys: string[];
  isFeatured: boolean;
  contactOnly: boolean;
};

export type VisibleProgram = Course & { isFeatured: boolean };

let apiPrograms: ApiProgram[] = [];

export function applyPrograms(incoming: ApiProgram[]): number {
  if (!Array.isArray(incoming) || incoming.length === 0) return 0;

  apiPrograms = incoming.filter((program) => program?.slug?.trim());
  return apiPrograms.length;
}

const merge = (program: ApiProgram): VisibleProgram | null => {
  const base = bundled.find((entry) => entry.slug === program.slug);
  if (!base) return null;

  return {
    ...base,
    title: program.title || base.title,
    summary: program.summary || base.summary,
    goal: program.goal || base.goal,
    entry: program.entry || base.entry,
    tags: program.tags.length > 0 ? program.tags : base.tags,
    courseKeys: program.courseKeys.length > 0 ? program.courseKeys : base.courseKeys,
    contactOnly: program.contactOnly,
    isFeatured: program.isFeatured,
  };
};

export function visiblePrograms(): VisibleProgram[] {
  if (apiPrograms.length === 0) {
    return bundled.map((entry) => ({ ...entry, isFeatured: entry.featured ?? false }));
  }
  return apiPrograms.map(merge).filter((entry): entry is VisibleProgram => entry !== null);
}

export const featuredPrograms = (): VisibleProgram[] =>
  visiblePrograms().filter((program) => program.isFeatured);

export const findProgram = (slug: string): VisibleProgram | undefined =>
  visiblePrograms().find((program) => program.slug === slug);

export const programOfCourseKey = (catalogKey: string): string | undefined => {
  if (!catalogKey) return undefined;
  return visiblePrograms().find((program) => program.courseKeys.includes(catalogKey))?.slug;
};
