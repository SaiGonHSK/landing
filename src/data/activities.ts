import christmasClassPhoto from "@/assets/activities/giang-sinh-lop-chup-anh.webp";
import christmasCenter from "@/assets/activities/giang-sinh-tai-trung-tam.webp";
import christmasCheckIn from "@/assets/activities/giang-sinh-poster-check-in.webp";
import christmasSigns from "@/assets/daily/giang-sinh-lop-cam-bang.webp";
import midAutumn from "@/assets/activities/trung-thu-goc-check-in.webp";
import teachersDay from "@/assets/activities/ngay-nha-giao-viet-nam.webp";
import tet from "@/assets/activities/a1.webp";
import tetTeaCeremony from "@/assets/activities/a6.webp";
import dailyBoardWork from "@/assets/classes/giang-vien-chua-bai.webp";
import dailyClassExercise from "@/assets/daily/lop-lam-bai-tap.webp";
import dailyTeacherRounds from "@/assets/daily/giang-vien-di-quanh-lop.webp";
import dailyAoDaiLesson from "@/assets/daily/co-giao-ao-dai-giang-bai.webp";
import dailyMilkTea from "@/assets/daily/lop-uong-tra-sua.webp";
import dailyMilkTeaHandout from "@/assets/daily/giang-vien-phat-tra-sua.webp";
import dailyFrontDesk from "@/assets/daily/quay-le-tan-trang-tri.webp";
import dailyWaitingRoom from "@/assets/daily/hoc-vien-cho-vao-lop.webp";

export type ActivityPoster = {
  image: ImageMetadata;
  caption: string;
};

export const activityPosters: ActivityPoster[] = [
  {
    image: christmasClassPhoto,
    caption:
      "圣诞节快乐 — cả lớp chụp ảnh cùng cây thông ở góc check-in Giáng sinh của trung tâm",
  },
  {
    image: christmasSigns,
    caption:
      "Cả lớp cầm bảng Merry Christmas trước phông Giáng sinh của trung tâm",
  },
  {
    image: christmasCenter,
    caption:
      "Đêm Giáng sinh ở trung tâm — học viên các lớp tụ về góc cây thông chụp ảnh",
  },
  {
    image: midAutumn,
    caption: "Góc Trung thu 中秋 với bánh, trà và đèn lồng do trung tâm bày",
  },
  {
    image: christmasCheckIn,
    caption: "Góc check-in Giáng sinh dựng ngay tại sảnh trung tâm",
  },
  {
    image: teachersDay,
    caption:
      "Góc chúc mừng Ngày Nhà giáo Việt Nam — học viên viết lời chúc gửi từng giảng viên",
  },
  {
    image: tet,
    caption:
      "Minigame Check-in Tết — học viên trao nhau lời chúc năm mới bằng tiếng Trung",
  },
  {
    image: tetTeaCeremony,
    caption:
      "Check-in Tết — bạn Quang Minh pha trà bên mâm ngũ quả và câu đối đỏ",
  },
];

export type Activity = {
  image: ImageMetadata;
  caption: string;
};

export const dailyMoments: Activity[] = [
  {
    image: dailyBoardWork,
    caption: "Giảng viên chữa bài trên bảng, cả lớp ghi theo",
  },
  {
    image: dailyClassExercise,
    caption: "Lớp kín chỗ, cả lớp cùng làm bài trên lớp",
  },
  {
    image: dailyTeacherRounds,
    caption: "Giảng viên đi quanh lớp xem từng bạn làm bài",
  },
  {
    image: dailyAoDaiLesson,
    caption: "Giảng viên giảng bài trong lớp buổi tối",
  },
  {
    image: dailyMilkTea,
    caption: "Trung tâm mời trà sữa cả lớp giữa buổi học",
  },
  {
    image: dailyMilkTeaHandout,
    caption: "Giảng viên phát nước cho học viên trong lớp",
  },
  {
    image: dailyFrontDesk,
    caption: "Quầy lễ tân trang trí theo mùa, luôn có người trực tư vấn",
  },
  {
    image: dailyWaitingRoom,
    caption: "Học viên chờ tới giờ vào lớp ở khu tiếp đón",
  },
];
