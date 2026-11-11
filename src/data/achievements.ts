import poster1 from "@/assets/archivements/a1.webp";
import poster2 from "@/assets/archivements/a2.webp";
import poster3 from "@/assets/archivements/a3.webp";
import poster4 from "@/assets/archivements/a4.webp";

export type HonorPoster = {
  image: ImageMetadata;
  name: string;
  title: string;
  exam: string;
  total: string;
  max: string;
  testDate: string;
  parts: { label: string; score: string }[];
  note?: string;
  result: string;
};

export const honorPosters: HonorPoster[] = [
  {
    image: poster1,
    name: "Rosie Cao",
    title: "Vinh danh học viên thi đỗ HSK5 (HSK 3.0)",
    exam: "HSK5",
    total: "238",
    max: "300",
    testDate: "31/01/2026",
    parts: [
      { label: "Nghe", score: "86" },
      { label: "Đọc", score: "86" },
      { label: "Viết", score: "66" },
      { label: "Nói (HSKK)", score: "74" },
    ],
    note: "Phần nói HSKK: đạt (Pass)",
    result: "HSK5 — 238/300 · HSKK 74/100",
  },
  {
    image: poster2,
    name: "Nhã Anh",
    title: "Vinh danh học viên thi đỗ HSK5",
    exam: "HSK5",
    total: "256",
    max: "300",
    testDate: "22/03/2026",
    parts: [
      { label: "Nghe", score: "84" },
      { label: "Đọc", score: "89" },
      { label: "Viết", score: "83" },
    ],
    note: "Điểm HSKK (phần nói) chưa công bố",
    result: "HSK5 — 256/300",
  },
  {
    image: poster3,
    name: "Lê Văn Tân",
    title: "Vinh danh học viên thi đỗ HSK6",
    exam: "HSK6",
    total: "222",
    max: "300",
    testDate: "22/03/2026",
    parts: [
      { label: "Nghe", score: "66" },
      { label: "Đọc", score: "86" },
      { label: "Viết", score: "70" },
    ],
    note: "Học lớp luyện HSK5, thi đỗ luôn HSK6",
    result: "HSK6 — 222/300",
  },
  {
    image: poster4,
    name: "Quỳnh Anh",
    title: "Vinh danh học viên thi đỗ HSK5",
    exam: "HSK5",
    total: "238",
    max: "300",
    testDate: "22/03/2026",
    parts: [
      { label: "Nghe", score: "78" },
      { label: "Đọc", score: "76" },
      { label: "Viết", score: "84" },
    ],
    note: "Điểm HSKK (phần nói) chưa công bố",
    result: "HSK5 — 238/300",
  },
];
