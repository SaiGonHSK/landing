
import { staticContent } from "./content";

export const site = staticContent.site;
export const contact = staticContent.contact;
export const hero = staticContent.hero;
export const commitments = staticContent.commitments;
export const values = staticContent.values;
export const mission = staticContent.mission;
export const model = staticContent.model;
export const stats = staticContent.stats;
export const milestones = staticContent.milestones;
export const teacher = staticContent.teacher;
export const about = staticContent.about;
export const reasons = staticContent.reasons;

/** Pháp nhân in ở chân trang. Để trống thì footer không hiện dòng tương ứng. */
export const legal = {
  company: "Công ty TNHH Phát triển Giáo dục SaigonHSK",
  taxCode: "0315640740",
};

export const footerLinks = [
  {
    title: "Khoá học",
    items: [
      { label: "Khoá HSK1 – HSK6", href: "/courses" },
      { label: "Lớp luyện thi HSK3 – HSK5", href: "/courses/luyen-thi-hsk-4" },
      { label: "Giao tiếp công sở", href: "/courses/giao-tiep-cong-so-co-ban" },
      { label: "Ngữ pháp tiếng Trung", href: "/courses/ngu-phap-co-ban" },
      { label: "Tiếng Trung trẻ em", href: "/courses/tieng-trung-tre-em" },
      { label: "Học theo giáo trình", href: "/courses/textbooks" },
    ],
  },
  {
    title: "Ôn tập & thư viện",
    items: [
      { label: "Ôn tập theo cấp HSK", href: "/practice" },
      { label: "Tài liệu luyện thi HSK", href: "/practice/exam-prep" },
      { label: "Luyện 4 kỹ năng", href: "/practice/skills" },
      { label: "Học thử miễn phí", href: "/trial" },
      { label: "Thư viện tiếng Trung", href: "/library" },
    ],
  },
  {
    title: "Trung tâm",
    items: [
      { label: "Về chúng tôi", href: "/about" },
      { label: "Đội ngũ giảng viên", href: "/about/teachers" },
      { label: "Cam kết", href: "/about/commitments" },
      { label: "Lịch khai giảng", href: "/schedule" },
      { label: "Đăng ký học", href: "/register" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
] as const;
