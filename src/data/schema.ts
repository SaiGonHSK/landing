

export type CourseIcon =
  | "hsk"
  | "seed"
  | "growth"
  | "peak"
  | "chat"
  | "briefcase"
  | "vip"
  | "kids"
  | "senior";

export type CourseTrack =
  | "hsk"
  | "hsk_exam"
  | "communication"
  | "business"
  | "vip"
  | "kids"
  | "senior"
  | "specialized";

export type CourseSectionKind =
  | "audience"
  | "goal"
  | "duration"
  | "content"
  | "material"
  | "outcome"
  | "foundation"
  | "grammar_point"
  | "topic_item";

export type PublishStatus = "draft" | "published" | "archived";

export type CourseSectionMap = Record<CourseSectionKind, string[]>;

export type CourseRow = {
  code: string;
  slug: string;
  title: string;

  summary: string;
  intro: string;
  goal: string;
  entry: string;
  icon: CourseIcon;
  thumbnailUrl: string;
  tags: string[];
  isFeatured: boolean;
  contactOnly: boolean;
  note: string;

  track: CourseTrack;
  hskLevel: number | null;

  months: number | null;
  totalSessions: number | null;
  sessionHours: number | null;
  sessionsPerWeek: number | null;

  targetWords: number | null;
  targetChars: number | null;
  grammarCount: number | null;

  entryRequirement: string;
  canDo: string;
  topicTitle: string;
  topicNote: string;

  price: number | null;
  priceDisplay: string;

  orderIndex: number;
  status: PublishStatus;
  sections: CourseSectionMap;
  textbookSlugs: string[];
};

export type ClassMode = "offline" | "online" | "hybrid";

export type ClassStatus = "draft" | "recruiting" | "ongoing" | "finished" | "cancelled";

export type ScheduleSlot = {
  weekday: number;
  startTime: string;
  endTime: string;
};

