import { getContent, staticContent } from "./content";

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image?: string;
  link?: string;
  rating?: number;
  source?: string;
  postedAt?: string;
};

export const testimonials = (): Testimonial[] => getContent().testimonials;

export const orderedTestimonials = (): Testimonial[] =>
  [...testimonials()].sort((a, b) => ageInDays(a.postedAt) - ageInDays(b.postedAt));

const WORD_NUMBERS: Record<string, number> = {
  một: 1,
  hai: 2,
  ba: 3,
  bốn: 4,
  năm: 5,
  sáu: 6,
  bảy: 7,
  tám: 8,
  chín: 9,
  mười: 10,
};

const UNIT_DAYS: Record<string, number> = {
  giây: 0,
  phút: 0,
  giờ: 0,
  ngày: 1,
  tuần: 7,
  tháng: 30,
  năm: 365,
};

function ageInDays(postedAt?: string): number {
  const text = (postedAt ?? "").toLowerCase();
  const match = text.match(
    /(\d+|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)?\s*(giây|phút|giờ|ngày|tuần|tháng|năm)\s*trước/,
  );
  if (!match) return Infinity;

  const [, rawCount, unit] = match;
  const count = rawCount ? (WORD_NUMBERS[rawCount] ?? Number(rawCount)) : 1;
  if (!Number.isFinite(count)) return Infinity;

  return count * UNIT_DAYS[unit];
}

export type ReviewsSummary = {
  score: string;
  count: number;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: string;
};

export const reviewsSummary = (): ReviewsSummary => staticContent.reviewsSummary;

export const reviewAnchor = (t: Testimonial, index: number): string =>
  `review-${index + 1}-${slugify(t.name)}`;

export const reviewDetailHref = (t: Testimonial, index: number): string =>
  `/about/reviews#${reviewAnchor(t, index)}`;

export const sourceLabel = (source?: string): string => {
  switch ((source ?? "").toLowerCase()) {
    case "google":
      return "Google";
    case "facebook":
      return "Facebook";
    case "":
      return "";
    default:
      return source as string;
  }
};

function slugify(value: string): string {
  return value
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
