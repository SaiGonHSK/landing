
import { HSK_LEVELS, specialCourses } from "./catalog";
import { courses as programs, type Course as ProgramSource, type CourseLevel } from "./courses";
import type { CourseIcon, CourseRow, CourseSectionMap, CourseTrack } from "./schema";

const firstNumber = (text: string): number | null => {
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
};

const groupedNumber = (text: string): number | null => {
  const match = text.match(/(\d[\d.]*)/);
  return match ? Number(match[1].replace(/\./g, "")) : null;
};

const parseDuration = (lines: readonly string[]) => {
  const text = lines.join(" ");
  return {
    totalSessions: text.match(/(\d+)\s*buổi(?!\/)/)?.[1] ?? null,
    sessionHours: text.match(/(\d+(?:[.,]\d+)?)\s*(?:h|giờ)\s*\/\s*buổi/)?.[1] ?? null,
    sessionsPerWeek: text.match(/(\d+)\s*buổi\s*\/\s*tuần/)?.[1] ?? null,
    months: text.match(/(\d+(?:[.,]\d+)?)\s*tháng/)?.[1] ?? null,
  };
};

const num = (value: string | null) => (value === null ? null : Number(value.replace(",", ".")));

const TRACK_BY_PROGRAM: Record<string, CourseTrack> = {
  "luyen-thi-hsk": "hsk_exam",
  "tieng-hoa-so-cap": "hsk",
  "tieng-hoa-trung-cap": "hsk",
  "tieng-hoa-cao-cap": "hsk",
  "tieng-hoa-giao-tiep-cap-toc": "communication",
  "tieng-hoa-doanh-nghiep": "business",
  "tieng-hoa-vip": "vip",
  "tieng-hoa-thieu-nhi": "kids",
  "tieng-hoa-nguoi-lon-tuoi": "senior",
};

const emptySections = (): CourseSectionMap => ({
  audience: [],
  goal: [],
  duration: [],
  content: [],
  material: [],
  outcome: [],
  foundation: [],
  grammar_point: [],
  topic_item: [],
});

const hskLevelOf = (level: CourseLevel): number | null => {
  const match = (level.code ?? level.name).match(/HSK\s?([1-6])/i);
  return match ? Number(match[1]) : null;
};

type LevelSpec = (typeof HSK_LEVELS)[number];

const sectionsOf = (level: CourseLevel, spec: LevelSpec | undefined): CourseSectionMap => ({
  ...emptySections(),
  audience: [...level.audience],
  goal: [...level.goals],
  duration: [...level.duration],
  content: [...level.content],
  material: [...level.materials],
  outcome: [...level.outcomes],
  foundation: spec && "foundation" in spec ? [...spec.foundation] : [],
  grammar_point: [],
  topic_item: spec ? [...spec.topics.items] : [],
});

const courseFromLevel = (
  program: ProgramSource,
  level: CourseLevel,
  orderIndex: number,
): CourseRow => {
  const hskLevel = hskLevelOf(level);
  const track = TRACK_BY_PROGRAM[program.slug] ?? "specialized";

  const spec =
    track === "hsk" && hskLevel !== null
      ? HSK_LEVELS.find((l) => l.level === hskLevel)
      : undefined;

  const parsed = parseDuration(level.duration);
  const baseCode = level.code ?? level.name;

  return {
    code: track === "hsk_exam" ? `LT-${baseCode}` : baseCode,
    slug:
      track === "hsk_exam" && hskLevel !== null
        ? `luyen-thi-hsk-${hskLevel}`
        : hskLevel !== null
          ? `hsk-${hskLevel}`
          : baseCode.toLowerCase(),
    title: level.name,

    summary: program.summary,
    intro: "",
    goal: program.goal,
    entry: spec ? spec.entry : program.entry,
    icon: program.icon as CourseIcon,
    thumbnailUrl: "",
    tags: [...program.tags],
    isFeatured: program.featured ?? false,
    contactOnly: program.contactOnly ?? false,
    note: program.note ?? "",

    track,
    hskLevel,
    months: spec ? firstNumber(spec.months) : num(parsed.months),
    totalSessions: num(parsed.totalSessions),
    sessionHours: num(parsed.sessionHours),
    sessionsPerWeek: num(parsed.sessionsPerWeek),
    targetWords: spec ? groupedNumber(spec.words) : null,
    targetChars: spec ? groupedNumber(spec.chars) : null,
    grammarCount: spec ? spec.grammarCount : null,
    entryRequirement: spec ? spec.entry : "",
    canDo: spec ? spec.can : "",
    topicTitle: spec ? spec.topics.title : "",
    topicNote: spec && "note" in spec.topics ? spec.topics.note : "",
    price: null,
    priceDisplay: "Liên hệ trung tâm",
    orderIndex,
    status: "published",
    sections: sectionsOf(level, spec),
    textbookSlugs: [],
  };
};

export const courseRows: CourseRow[] = programs.flatMap((program) =>
  program.levels.map((level, index) => courseFromLevel(program, level, index)),
);

export const unattachedCourseSlugs: string[] = specialCourses.map((item) => item.slug);
