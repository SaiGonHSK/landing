
const BRAND = "SaigonHSK";

export const title = (main: string) =>
  main.includes(BRAND) ? main : `${main} | ${BRAND}`;

export const CITY = {
  compact: "TPHCM",
  dotted: "TP.HCM",
  legacy: "Sài Gòn",
} as const;

const hskLevelKeywords = (level: number) => [
  `HSK${level}`,
  `HSK ${level}`,
  `học HSK${level}`,
  `khoá học HSK${level}`,
  `khóa học HSK${level}`,
  `lớp HSK${level}`,
  `lớp HSK${level} TPHCM`,
  `luyện thi HSK${level}`,
  `luyện thi HSK ${level}`,
  `luyện thi HSK${level} TPHCM`,
  `lớp luyện thi HSK ${level}`,
  `ôn thi HSK${level}`,
  `ôn tập HSK${level}`,
  `chứng chỉ HSK${level}`,
  `từ vựng HSK${level}`,
  `ngữ pháp HSK${level}`,
  `đề thi HSK${level}`,
  `HSK${level} học bao lâu`,
  `HSK${level} bao nhiêu từ`,
  `hoc hsk${level}`,
  `khoa hoc hsk${level}`,
  `luyen thi hsk${level}`,
  `on thi hsk${level}`,
  `tu vung hsk${level}`,
  `de thi hsk${level}`,
  `lop hsk${level} tphcm`,
];

const HSK_LEVEL_NUMBERS = [1, 2, 3, 4, 5, 6];

export const keywords = {
  core: [
    "học tiếng Trung",
    "trung tâm tiếng Trung TPHCM",
    "trung tâm tiếng Trung Sài Gòn",
    "trung tâm học tiếng Trung tại TPHCM",
    "học tiếng Trung ở đâu tốt",
    "học tiếng Trung ở đâu tốt TPHCM",
    "trung tâm tiếng Trung uy tín",
    "trung tâm tiếng Trung uy tín TPHCM",
    "trung tâm tiếng Trung có giấy phép",
    "trung tâm tiếng Trung được Sở Giáo dục cấp phép",
    "học phí học tiếng Trung",
    "học tiếng Trung TPHCM",
    "học tiếng Trung tại TPHCM",
    "học tiếng Trung Sài Gòn",
    "học tiếng Trung tại Sài Gòn",
    "dạy tiếng Trung TPHCM",
    "lớp tiếng Trung TPHCM",
    "khoá học tiếng Trung TPHCM",
    "khóa học tiếng Trung TPHCM",
    "trung tâm dạy tiếng Trung TPHCM",
    "trung tâm Hoa văn TPHCM",
    "học tiếng Hoa TPHCM",
  ],
  brand: [
    "SaigonHSK",
    "Saigon HSK",
    "Hoa văn SaigonHSK",
    "Hoa văn Sài Gòn HSK",
    "Trung tâm Hoa văn SaigonHSK",
    "Trung tâm Hoa văn Sài Gòn HSK",
    "trung tâm tiếng Trung SaigonHSK",
    "saigonhsk",
    "sai gon hsk",
    "hoa van saigonhsk",
    "hoa van sai gon hsk",
    "trung tam hoa van sai gon hsk",
    "trung tam hoa van saigonhsk",
    "trung tam tieng trung saigonhsk",
  ],
  exam: [
    "luyện thi HSK",
    "luyện thi HSK ở TPHCM",
    "luyện thi HSK TPHCM",
    "trung tâm luyện thi HSK",
    "trung tâm luyện thi HSK TPHCM",
    "lớp luyện thi HSK",
    "khoá luyện thi HSK",
    "ôn thi HSK",
    "ôn tập HSK",
    "ôn thi HSK cấp tốc",
    "chứng chỉ HSK",
    "thi HSK ở đâu",
    "đăng ký thi HSK",
    "HSK 3.0",
    "HSKK",
    "luyện thi HSKK",
    "từ vựng HSK",
    "ngữ pháp HSK",
    "đề thi HSK",
    "HSK4 khó không",
    "HSK5 khó không",
    "học phí HSK",
    "học phí luyện thi HSK",
    ...HSK_LEVEL_NUMBERS.flatMap(hskLevelKeywords),
  ],
  level: [
    "tiếng Trung cho người mới bắt đầu",
    "học tiếng Trung từ con số 0",
    "học tiếng Trung cho người mất gốc",
    "học tiếng Trung cơ bản",
    "học tiếng Trung nâng cao",
    "tiếng Trung sơ cấp",
    "tiếng Trung trung cấp",
    "tiếng Trung cao cấp",
    "tiếng Trung A1", "tiếng Trung A2", "tiếng Trung B1", "tiếng Trung B2",
  ],
  purpose: [
    "tiếng Trung giao tiếp",
    "tiếng Trung giao tiếp cấp tốc",
    "tiếng Trung giao tiếp hàng ngày",
    "tiếng Trung công sở",
    "tiếng Trung thương mại",
    "tiếng Trung doanh nghiệp",
    "tiếng Trung cho trẻ em",
    "tiếng Trung thiếu nhi",
    "tiếng Trung chuyên ngành",
    "tiếng Trung du lịch",
    "tiếng Trung xuất nhập khẩu",
    "tiếng Trung logistics",
    "học tiếng Trung online",
    "học tiếng Trung 1 kèm 1",
    "học tiếng Trung VIP",
    "gia sư tiếng Trung",
    "gia sư tiếng Trung TPHCM",
    "dạy tiếng Trung cho doanh nghiệp",
  ],
  nodiacritics: [
    "hoc tieng trung",
    "trung tam hoc tieng trung",
    "trung tam hoc tieng trung tai tphcm",
    "trung tam tieng trung tphcm",
    "trung tam tieng trung sai gon",
    "trung tam tieng trung uy tin",
    "trung tam day tieng trung tphcm",
    "luyen thi hsk",
    "luyen thi hsk tphcm",
    "trung tam luyen thi hsk",
    "khoa hoc tieng trung",
    "khoa hoc tieng trung tphcm",
    "tieng trung giao tiep",
    "hoc tieng trung o dau",
    "hoc tieng trung o dau tot",
    "hoc tieng trung tphcm",
    "hoc tieng trung tai tphcm",
    "hoc tieng trung sai gon",
    "hoc tieng trung co ban",
    "hoc tieng trung cho nguoi moi",
    "hoc tieng hoa tphcm",
    "tu vung hsk", "ngu phap hsk",
    "de thi hsk", "on thi hsk", "on tap hsk",
    "chung chi hsk",
    "tieng trung thuong mai",
    "gia su tieng trung",
    "hoc phi tieng trung",
    "lich khai giang tieng trung",
  ],
} as const;

export const keywordString = Array.from(
  new Set([
    ...keywords.core,
    ...keywords.brand,
    ...keywords.exam,
    ...keywords.level,
    ...keywords.purpose,
    ...keywords.nodiacritics,
  ]),
).join(", ");

export const keywordsFor = (...extra: string[]) =>
  Array.from(
    new Set([
      ...extra.map((k) => k.trim()).filter(Boolean),
      ...keywords.brand,
      ...keywords.core,
      ...keywords.exam,
    ]),
  ).join(", ");

export const defaultDescription =
  "Trung tâm Hoa văn SaigonHSK — học tiếng Trung và luyện thi HSK tại TP.HCM. Lớp 10–15 học viên, giảng viên Thạc sĩ – Tiến sĩ, cam kết 100% đầu ra.";

export const pickTitle = (...candidates: string[]) => {
  const usable = candidates.filter(Boolean);
  return (
    usable.find((c) => c.length <= 60) ??
    usable.reduce((a, b) => (a.length <= b.length ? a : b))
  );
};

export const clampDescription = (text: string, max = 158) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

export function courseFaqs(input: {
  title: string;
  facts: { label: string; value: string }[];
  outcomes: string[];
  phone: string;
}) {
  const fact = (label: string) =>
    input.facts.find((f) => f.label.toLowerCase().includes(label.toLowerCase()))?.value;

  const faqs: { question: string; answer: string }[] = [];

  const vocab = fact("Từ vựng");
  if (vocab) {
    faqs.push({
      question: `${input.title} cần bao nhiêu từ vựng?`,
      answer: `Theo chuẩn HSK 3.0, ${input.title} yêu cầu ${vocab.toLowerCase()}${
        fact("Chữ Hán") ? ` và ${fact("Chữ Hán")!.toLowerCase()}` : ""
      }. Trung tâm dạy đủ phạm vi này theo từng chủ điểm, kèm bài kiểm tra định kỳ.`,
    });
  }

  const entry = fact("Đầu vào");
  if (entry) {
    faqs.push({
      question: `Chưa học gì có theo được ${input.title} không?`,
      answer: `Đầu vào của khoá là: ${entry}. Nếu bạn chưa chắc trình độ, trung tâm test miễn phí trước khi xếp lớp để không phải học lại phần đã biết.`,
    });
  }

  faqs.push({
    question: `Học phí ${input.title} bao nhiêu tiền?`,
    answer: `Học phí thay đổi theo hình thức lớp (lớp nhóm 10–15 học viên, VIP 1 kèm 1, lớp doanh nghiệp) và số buổi của từng cấp. Gọi ${input.phone} hoặc nhắn Zalo để nhận bảng học phí và lịch khai giảng mới nhất — trung tâm báo giá trọn khoá, không phát sinh.`,
  });

  const duration = fact("Thời lượng") ?? fact("Số buổi");
  if (duration) {
    faqs.push({
      question: `Học ${input.title} mất bao lâu?`,
      answer: `Thời lượng của khoá là ${duration}. Nhịp học phổ biến là 3 buổi/tuần; học viên đi làm có thể chọn lớp buổi tối hoặc lớp cuối tuần.`,
    });
  }

  if (input.outcomes.length) {
    faqs.push({
      question: `Học ${input.title} tại SaigonHSK có cam kết đầu ra không?`,
      answer: `Có. ${input.outcomes[0]} Nếu không đạt mục tiêu đã cam kết, học viên được học lại hoàn toàn miễn phí.`,
    });
  }

  return faqs;
}

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

export const itemListSchema = (
  name: string,
  items: { title: string; href: string }[],
  origin: string,
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.title,
    url: `${origin}${it.href}`,
  })),
});

export function toIsoDuration(text?: string): string | undefined {
  if (!text) return undefined;
  const hours = text.match(/(?<![\d,])(\d+)\s*(?:giờ|tiếng)/i);
  if (hours) return `PT${hours[1]}H`;
  const months = text.match(/(?<![\d,])(\d+)\s*tháng/i);
  if (months) return `P${months[1]}M`;
  const weeks = text.match(/(?<![\d,])(\d+)\s*tuần/i);
  if (weeks) return `P${weeks[1]}W`;
  return undefined;
}

const sessionCount = (text?: string) => {
  const m = text?.match(/(\d+)\s*buổi(?!\s*\/)/i);
  return m ? Number(m[1]) : undefined;
};

const weeklySessions = (text?: string) => {
  const m = text?.match(/(\d+)\s*buổi\s*\/\s*tuần/i);
  return m ? Number(m[1]) : undefined;
};

export type CourseSchemaInput = {
  name: string;
  description: string;
  url: string;
  origin: string;
  provider: { name: string; address: string };
  workload?: string;
  level?: string;
  credential?: string;
};

export function courseSchema(input: CourseSchemaInput) {
  const workload = toIsoDuration(input.workload);
  const repeatCount = sessionCount(input.workload);
  const perWeek = weeklySessions(input.workload);

  const instance: Record<string, unknown> = {
    "@type": "CourseInstance",
    courseMode: ["Onsite", "Online"],
    location: {
      "@type": "Place",
      name: input.provider.name,
      address: input.provider.address,
    },
  };
  if (workload) instance.courseWorkload = workload;
  if (repeatCount || perWeek) {
    instance.courseSchedule = {
      "@type": "Schedule",
      ...(perWeek ? { repeatFrequency: "P1W" } : {}),
      ...(repeatCount ? { repeatCount } : {}),
      scheduleTimezone: "Asia/Ho_Chi_Minh",
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: "vi-VN",
    teaches: "Tiếng Trung Quốc (Hán ngữ)",
    about: { "@type": "Thing", name: "Tiếng Trung Quốc" },
    availableLanguage: ["vi", "zh-Hans"],
    ...(input.level ? { educationalLevel: input.level } : {}),
    ...(input.credential
      ? {
          educationalCredentialAwarded: {
            "@type": "EducationalOccupationalCredential",
            name: `Chứng chỉ ${input.credential}`,
            credentialCategory: "certificate",
          },
        }
      : {}),
    provider: {
      "@type": "EducationalOrganization",
      "@id": `${input.origin}/#organization`,
      name: input.provider.name,
      url: input.origin,
    },
    offers: {
      "@type": "Offer",
      category: "Paid",
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: `${input.origin}/register`,
    },
    hasCourseInstance: instance,
  };
}
