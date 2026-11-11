import { values } from "./site";
import { honorPosters } from "./achievements";
import appHome from "@/assets/mobile-app/app-trang-chu.webp";
import appCourse from "@/assets/mobile-app/app-lo-trinh-khoa.webp";
import appWrite from "@/assets/mobile-app/app-tap-viet.webp";
import appDict from "@/assets/mobile-app/app-tra-tu.webp";
import textbook from "@/assets/hero/hoc-vien-hsk1-hsk4-tach-nen.webp";
import faculty from "@/assets/values/doi-ngu-giang-vien.webp";

export type ValuePanel = {
  tab: string;
  tabNote: string;
  badge: string;
  image: ImageMetadata;
  contain?: boolean;
  illustration?: "textbook-set" | "honor-stack";
  devices?: { src: ImageMetadata; alt: string }[];
  strong: string;
  note: string;
};

const bestPoster = honorPosters.reduce((a, b) =>
  Number(b.total) > Number(a.total) ? b : a,
);

const PANELS: Record<string, ValuePanel> = {
  "vi-nguoi-hoc": {
    tab: "Giáo trình riêng",
    tabNote: "Biên soạn cho người Việt",
    badge: "Giáo trình độc quyền",
    illustration: "textbook-set",
    image: textbook,
    contain: true,
    strong: "Học lại miễn phí",
    note: "nếu chưa đạt đầu ra đã cam kết",
  },
  "giang-vien-chat-luong": {
    tab: "Đội ngũ giảng viên",
    tabNote: "Thạc sĩ – Tiến sĩ",
    badge: "Chuyên môn dẫn dắt",
    image: faculty,
    contain: true,
    strong: "Tiến sĩ, Thạc sĩ",
    note: "tốt nghiệp các đại học lớn tại Trung Quốc",
  },
  "ung-dung-hoc-tap": {
    tab: "Hệ thống LMS",
    tabNote: "Lộ trình & tiến độ",
    badge: "Nền tảng học tập số",
    image: appCourse,
    devices: [
      {
        src: appCourse,
        alt: "Chi tiết khoá HSK3 trên LMS — lộ trình 18 bài, tiến độ 10/18, giảng viên và lịch lớp phụ trách",
      },
      {
        src: appWrite,
        alt: "Bài tập viết chữ Hán trên LMS — xem thứ tự nét của chữ 健康 rồi viết lại bằng ngón tay",
      },
    ],
    strong: "Lộ trình từng bài · Tiến độ đồng bộ · Từ điển giáo trình",
    note: "Khoá học chia sẵn theo bài, tiến độ và điểm số đồng bộ với giảng viên; tra từ theo giáo trình, tập viết theo thứ tự nét và luyện nói – luyện nghe với AI đều nằm trong hệ thống",
  },
  "hieu-qua-cao": {
    tab: "Đầu ra đạt chuẩn",
    tabNote: "Nghe – nói – đọc – viết",
    badge: "Hiệu quả thực tế",
    illustration: "honor-stack",
    image: bestPoster.image,
    contain: true,
    strong: `${bestPoster.exam} ${bestPoster.total}/${bestPoster.max}`,
    note: `Bạn ${bestPoster.name} — thi ngày ${bestPoster.testDate}`,
  },
};

export const valuePanels = values
  .filter((v) => PANELS[v.id])
  .map((v) => ({ ...v, ...PANELS[v.id] }));
