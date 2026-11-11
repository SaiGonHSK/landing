import type { ImageMetadata } from "astro";
import chatLuong from "@/assets/values/chat-luong.webp";
import tanTam from "@/assets/values/tan-tam.webp";
import chuyenNghiep from "@/assets/values/chuyen-nghiep.webp";
import doiMoi from "@/assets/values/doi-moi.webp";
import uyTin from "@/assets/values/uy-tin.webp";

export type CoreValue = {
  id: string;
  icon: string;
  image: ImageMetadata;
  imageAlt: string;
  title: string;
  desc: string;
};

export const coreValues: CoreValue[] = [
  {
    id: "chat-luong",
    icon: "shield",
    image: chatLuong,
    imageAlt: "Một trang thư pháp chữ Hán viết tay",
    title: "Chất lượng",
    desc: "Nỗ lực cải tiến chương trình giảng dạy và dịch vụ, mang lại hiệu quả học tập tốt nhất cho học viên.",
  },
  {
    id: "tan-tam",
    icon: "heart",
    image: tanTam,
    imageAlt: "Học viên tươi cười trong giờ học trên giảng đường",
    title: "Tận tâm",
    desc: "Lấy học viên làm trung tâm, luôn đồng hành và hỗ trợ học viên phát huy tối đa năng lực.",
  },
  {
    id: "chuyen-nghiep",
    icon: "cap",
    image: chuyenNghiep,
    imageAlt: "Giảng viên đứng lớp trước bảng, học viên ngồi nghe giảng",
    title: "Chuyên nghiệp",
    desc: "Xây dựng môi trường học tập hiện đại cùng đội ngũ giảng viên chất lượng cao và lộ trình học tập rõ ràng.",
  },
  {
    id: "doi-moi",
    icon: "sparkle",
    image: doiMoi,
    imageAlt: "Nhóm học viên cùng xem bài học trên máy tính xách tay",
    title: "Đổi mới",
    desc: "Cập nhật liên tục kiến thức, công nghệ và phương pháp tiên tiến để nâng cao trải nghiệm học tập.",
  },
  {
    id: "uy-tin",
    icon: "target",
    image: uyTin,
    imageAlt: "Học viên trong lễ tốt nghiệp với mũ và áo cử nhân",
    title: "Uy tín",
    desc: "Giữ vững cam kết, lấy kết quả và sự hài lòng của học viên làm thước đo phát triển.",
  },
];
