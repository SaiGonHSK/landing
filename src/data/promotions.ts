export type Promotion = {
  id: string;

  valuePrefix?: string;
  value: string;
  unit: string;

  title: string;
  desc: string;

  accent: "green" | "gold" | "blue";

  terms: { label: string; value: string }[];
};

export const promotions: Promotion[] = [
  {
    id: "next-course",
    accent: "green",
    value: "5%",
    unit: "học phí khoá sau",
    title: "Học lên khoá tiếp theo",
    desc: "Giảm ngay khi học viên đang học đăng ký khoá kế tiếp.",
    terms: [
      { label: "Dành cho", value: "Học viên đang học" },
      { label: "Áp dụng", value: "Khoá kế tiếp" },
      { label: "Mức giảm", value: "5% học phí" },
    ],
  },
  {
    id: "referral",
    accent: "gold",
    value: "200.000",
    unit: "đồng mỗi học viên",
    title: "Giới thiệu học viên mới",
    desc: "Trung tâm gửi phí giới thiệu khi bạn mới đăng ký khoá học.",
    terms: [
      { label: "Dành cho", value: "Người giới thiệu" },
      { label: "Nhận khi", value: "Bạn mới nhập học" },
      { label: "Mức nhận", value: "200.000đ/bạn" },
    ],
  },
  {
    id: "group",
    accent: "blue",
    valuePrefix: "Đến",
    value: "200.000",
    unit: "đồng mỗi học viên",
    title: "Đăng ký theo nhóm",
    desc: "Cả nhóm cùng đăng ký, mỗi bạn đều được giảm học phí.",
    terms: [
      { label: "Nhóm từ 2 bạn", value: "Giảm 100.000đ" },
      { label: "Nhóm từ 5 bạn", value: "Giảm 200.000đ" },
      { label: "Áp dụng", value: "Mỗi học viên" },
    ],
  },
];
