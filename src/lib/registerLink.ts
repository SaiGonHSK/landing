
import { onlineOfflineCourses } from "@/data/catalog";
import { courses } from "@/data/courses";

export const COURSE_UNSURE = "Chưa biết, cần tư vấn";

export const courseOptions: string[] = [
  ...onlineOfflineCourses.map((c) => c.title),
  ...courses.map((c) => c.title),
  COURSE_UNSURE,
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();

const byKey = new Map<string, string>(
  [...onlineOfflineCourses, ...courses].map((item) => [item.slug, item.title]),
);

const byLabel = new Map<string, string>(
  courseOptions.map((title) => [normalize(title), title]),
);

export function resolveCourseOption(input?: string | null): string | undefined {
  const raw = (input ?? "").trim();
  if (!raw) return undefined;
  return byKey.get(raw) ?? byLabel.get(normalize(raw));
}

const CLASS_CODE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/;

export const cleanClassCode = (value?: string | null): string | undefined => {
  const code = (value ?? "").trim();
  return CLASS_CODE.test(code) ? code : undefined;
};

const ITEM_ID = /^[0-9]{1,20}$/;

export const cleanItemId = (value?: string | null): string | undefined => {
  const id = (value ?? "").trim();
  return ITEM_ID.test(id) ? id : undefined;
};

export type RegisterContext = {
  course?: string;
  classCode?: string;
  itemId?: string;
  trial?: boolean;
};

export function registerHref(context: RegisterContext = {}): string {
  const params = new URLSearchParams();

  const course = (context.course ?? "").trim();
  if (course) params.set("course", course);

  const code = cleanClassCode(context.classCode);
  if (code) params.set("class", code);

  const id = cleanItemId(context.itemId);
  if (id) params.set("item", id);

  if (context.trial) params.set("trial", "1");

  const query = params.toString();
  return query ? `/register?${query}` : "/register";
}

export function registerNote(context: RegisterContext = {}): string {
  const code = cleanClassCode(context.classCode);

  return [
    code ? `Đăng ký lớp ${code}.` : "",
    context.trial ? "Muốn học thử một buổi trước khi đăng ký." : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function contextFromUrl(url: URL): RegisterContext {
  return {
    course: url.searchParams.get("course") ?? undefined,
    classCode: cleanClassCode(url.searchParams.get("class")),
    itemId: cleanItemId(url.searchParams.get("item")),
    trial: url.searchParams.get("trial") === "1",
  };
}
