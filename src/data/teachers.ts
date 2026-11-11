import { staticContent, type SiteContent } from "./content";

export type Teacher = SiteContent["teachers"][number];

export const teachers: Teacher[] = staticContent.teachers;
