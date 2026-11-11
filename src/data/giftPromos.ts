export type Season = "christmas" | "luna";

export const PREVIEW_SEASON: Season | null = null;

const LUNA_SEASONS = [{ start: "2027-01-15", end: "2027-02-15" }];

const vnDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    date,
  );

export const currentSeason = (date = new Date()): Season | null => {
  if (PREVIEW_SEASON) return PREVIEW_SEASON;
  const today = vnDate(date);
  if (LUNA_SEASONS.some((s) => today >= s.start && today <= s.end))
    return "luna";
  if (today.slice(5, 7) === "12") return "christmas";
  return null;
};

export const teachersDayGift = {
  amount: 200000,
  eyebrow: "Ưu đãi 20/11",
  title: "Bạn có một món quà",
  message:
    "Dành cho học viên đăng ký mới trong dịp 20/11 — áp dụng cho mọi khoá học.",
  endsAt: "2026-11-20T23:59:59+07:00",
};
