
import { HSK_LEVELS } from "@/data/catalog";
import { visibleCourses } from "@/data/coursesApi";
import type { Teacher } from "@/data/teachers";
import { imageAsset } from "@/data/imageAssets";
import { toIsoDuration } from "@/lib/seo";

type Node = Record<string, unknown>;

const stripContext = ({ "@context": _drop, ...rest }: Node) => rest;

export const graph = (nodes: (Node | null | undefined)[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes.filter((n): n is Node => Boolean(n)).map(stripContext),
});

export const canonicalUrl = (pathname: string, site: URL | undefined) =>
  new URL(pathname.replace(/\/$/, "") || "/", site);

export const webPageId = (pathname: string, site: URL | undefined) =>
  `${canonicalUrl(pathname, site).href}#webpage`;

export type Crumb = { label: string; href?: string };

export function breadcrumbNodes(
  crumbs: Crumb[],
  pathname: string,
  site: URL | undefined,
): Node[] {
  const origin = site?.origin ?? "";
  const id = `${canonicalUrl(pathname, site).href}#breadcrumb`;

  return [
    {
      "@type": "BreadcrumbList",
      "@id": id,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: `${origin}/` },
        ...crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: c.label,
          ...(c.href ? { item: `${origin}${c.href}` } : {}),
        })),
      ],
    },
    { "@type": "WebPage", "@id": webPageId(pathname, site), breadcrumb: { "@id": id } },
  ];
}

export const breadcrumbGraph = (
  crumbs: Crumb[],
  pathname: string,
  site: URL | undefined,
) => graph(breadcrumbNodes(crumbs, pathname, site));

export const speakable = {
  "@type": "SpeakableSpecification",
  cssSelector: ["h1", "[data-speakable]"],
};

const splitTitle = (title: string) => {
  const [degree, school] = title.split(/\s*—\s*/, 2);
  return { degree: degree?.trim() ?? "", school: school?.trim() ?? "" };
};

export function personSchema(teacher: Teacher, origin: string): Node {
  const { degree, school } = splitTitle(teacher.title ?? "");
  const role = (teacher as { role?: string }).role;

  return {
    "@type": "Person",
    "@id": `${origin}/about/teachers#${slugifyName(teacher.name)}`,
    name: teacher.name,
    jobTitle: role || `Giảng viên tiếng Trung${degree ? ` — ${degree}` : ""}`,
    description: teacher.points?.length
      ? `${teacher.points.join(". ").replace(/\.\.$/, ".")}.`
      : undefined,
    ...(imageAsset(teacher.image)
      ? { image: `${origin}${imageAsset(teacher.image)!.src}` }
      : {}),
    ...(degree
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: degree,
            credentialCategory: "degree",
          },
        }
      : {}),
    ...(school
      ? { alumniOf: { "@type": "CollegeOrUniversity", name: school } }
      : {}),
    worksFor: { "@id": `${origin}/#organization` },
    knowsLanguage: ["vi", "zh-Hans"],
    knowsAbout: ["Tiếng Trung Quốc", "Kỳ thi HSK", "Giảng dạy Hán ngữ quốc tế"],
  };
}

const slugifyName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const teacherListSchema = (teachers: Teacher[], origin: string): Node => ({
  "@type": "ItemList",
  name: "Đội ngũ giảng viên Trung tâm Hoa văn SaigonHSK",
  numberOfItems: teachers.length,
  itemListElement: teachers.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: personSchema(t, origin),
  })),
});

export function hskTermSetSchema(origin: string): Node {
  return {
    "@type": "DefinedTermSet",
    "@id": `${origin}/#hsk-levels`,
    name: "Thang trình độ HSK (chuẩn HSK 3.0)",
    description:
      "Sáu cấp của kỳ thi năng lực Hán ngữ HSK theo chuẩn HSK 3.0, kèm số từ vựng, số chữ Hán, số điểm ngữ pháp và thời lượng đào tạo tại Trung tâm Hoa văn SaigonHSK.",
    inLanguage: "vi-VN",
    hasDefinedTerm: HSK_LEVELS.map((l) => {
      const href = hskCourseHref(l.level);
      return {
        "@type": "DefinedTerm",
        "@id": `${origin}/#hsk${l.level}`,
        name: `HSK${l.level}`,
        termCode: `HSK${l.level}`,
        ...(href ? { url: `${origin}${href}` } : {}),
        inDefinedTermSet: { "@id": `${origin}/#hsk-levels` },
        description: `HSK${l.level} theo chuẩn HSK 3.0 yêu cầu ${l.words} và ${l.chars}, gồm ${l.grammarCount} điểm ngữ pháp. Học viên đạt cấp này có thể ${l.can}. Tại SaigonHSK khoá HSK${l.level} học ${l.months}. Đầu vào: ${l.entry}.`,
      };
    }),
  };
}

export function hskCourseHref(level: number): string | undefined {
  const wanted = `hsk${level}`;
  return visibleCourses().find(
    (course) => course.title.toLowerCase().replace(/[\s.-]/g, "") === wanted,
  )?.href;
}

type PageArgs = { pathname: string; site: URL | undefined };

export const contactPageSchema = ({ pathname, site }: PageArgs): Node => ({
  "@type": "ContactPage",
  "@id": webPageId(pathname, site),
  mainEntity: { "@id": `${site?.origin ?? ""}/#organization` },
});

export const aboutPageSchema = ({ pathname, site }: PageArgs): Node => ({
  "@type": "AboutPage",
  "@id": webPageId(pathname, site),
  mainEntity: { "@id": `${site?.origin ?? ""}/#organization` },
});

export const collectionPageSchema = ({ pathname, site }: PageArgs): Node => ({
  "@type": "CollectionPage",
  "@id": webPageId(pathname, site),
});

export const enrollActionSchema = (origin: string, phone: string): Node => ({
  "@type": "RegisterAction",
  "@id": `${origin}/#enroll`,
  name: "Đăng ký học tiếng Trung tại SaigonHSK",
  description: `Đăng ký qua form tại ${origin}/register, gọi hotline ${phone} hoặc nhắn Zalo. Trung tâm test trình độ miễn phí trước khi xếp lớp.`,
  target: {
    "@type": "EntryPoint",
    urlTemplate: `${origin}/register`,
    actionPlatform: [
      "https://schema.org/DesktopWebPlatform",
      "https://schema.org/MobileWebPlatform",
    ],
  },
  agent: { "@id": `${origin}/#organization` },
});

const DAY_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type ScheduleRowLike = {
  name: string;
  code: string;
  group: string;
  mode: string;
  openDateISO: string;
  duration: string;
  slots: readonly { weekday: number; startTime: string; endTime: string }[];
};

const courseMode = (mode: string) =>
  mode === "online" ? ["Online"] : mode === "hybrid" ? ["Onsite", "Online"] : ["Onsite"];

export function openingScheduleSchema(
  rows: readonly ScheduleRowLike[],
  origin: string,
  provider: { name: string; address: string },
): Node | null {
  if (!rows.length) return null;

  const byCourse = new Map<string, ScheduleRowLike[]>();
  for (const row of rows) {
    const key = row.group || row.code;
    const list = byCourse.get(key);
    if (list) list.push(row);
    else byCourse.set(key, [row]);
  }

  const location = { "@type": "Place", name: provider.name, address: provider.address };

  const courses = [...byCourse.entries()].map(([key, group]) => {
    const modes = [...new Set(group.map((r) => r.mode))];

    return {
      "@type": "Course",
      "@id": `${origin}/schedule#${slugifyName(key)}`,
      name: key,
      description: `Lịch khai giảng ${key} tại ${provider.name}: ${group.length} lớp đang nhận đăng ký${
        modes.length ? ` (${modes.join(", ")})` : ""
      }.`,
      inLanguage: "vi-VN",
      provider: { "@id": `${origin}/#organization` },
      hasCourseInstance: group.map((row) => ({
        "@type": "CourseInstance",
        name: row.name,
        courseMode: courseMode(row.mode),
        location,
        ...(row.openDateISO ? { startDate: row.openDateISO } : {}),
        ...(row.slots.length
          ? {
              courseSchedule: {
                "@type": "Schedule",
                repeatFrequency: "P1W",
                byDay: [...new Set(row.slots.map((s) => DAY_OF_WEEK[s.weekday]))].filter(
                  Boolean,
                ),
                startTime: row.slots[0].startTime,
                endTime: row.slots[0].endTime,
                scheduleTimezone: "Asia/Ho_Chi_Minh",
              },
            }
          : {}),
      })),
    };
  });

  return {
    "@type": "ItemList",
    name: "Lịch khai giảng các lớp tiếng Trung tại SaigonHSK",
    numberOfItems: courses.length,
    itemListElement: courses.map((course, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: course,
    })),
  };
}

export type ProgramSchemaInput = {
  name: string;
  description: string;
  url: string;
  origin: string;
  duration?: string;
  credential?: string;
};

export function programSchema(input: ProgramSchemaInput): Node {
  const timeToComplete = toIsoDuration(input.duration);

  return {
    "@type": "EducationalOccupationalProgram",
    "@id": `${input.url}#program`,
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: "vi-VN",
    programType: "Khoá đào tạo ngoại ngữ ngắn hạn",
    educationalProgramMode: ["onsite", "online"],
    provider: { "@id": `${input.origin}/#organization` },
    occupationalCategory: "Tiếng Trung Quốc — Hán ngữ",
    ...(input.credential
      ? {
          educationalCredentialAwarded: `Chứng chỉ ${input.credential}`,
          competencyRequired: `Chuẩn HSK 3.0 — ${input.credential}`,
        }
      : {}),
    ...(timeToComplete ? { timeToComplete } : {}),
    offers: {
      "@type": "Offer",
      category: "Paid",
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: `${input.origin}/register`,
    },
  };
}
