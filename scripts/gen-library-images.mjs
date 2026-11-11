import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const RED = "#b2182b";
const INK = "#121316";
const PAPER = "#f7f3ef";

const ITEMS = [
  {
    file: "tu-vung-chu-de-gia-dinh",
    han: "家",
    pinyin: "jiā",
    category: "Từ vựng theo chủ đề",
  },
  {
    file: "phan-biet-le-va-guo",
    han: "过",
    pinyin: "guo",
    category: "Kiến thức ngữ pháp",
  },
  { file: "thanh-ngu-ve-hoc-tap", han: "学", pinyin: "xué", category: "Thành ngữ" },
  { file: "cau-chuyen-chu-hao", han: "好", pinyin: "hǎo", category: "Câu chuyện Hán tự" },
  {
    file: "tet-nguyen-dan-o-trung-quoc",
    han: "年",
    pinyin: "nián",
    category: "Văn hoá Trung Quốc",
  },
  {
    file: "bang-luong-tu-hsk1-hsk3",
    han: "量",
    pinyin: "liàng",
    category: "Tài liệu ngữ pháp",
  },

  { file: "cau-chu-ba", han: "把", pinyin: "bǎ", category: "Tài liệu ngữ pháp" },
  { file: "cau-chu-bei", han: "被", pinyin: "bèi", category: "Tài liệu ngữ pháp" },
  { file: "cau-so-sanh", han: "比", pinyin: "bǐ", category: "Tài liệu ngữ pháp" },
  { file: "cau-kiem-ngu", han: "兼", pinyin: "jiān", category: "Tài liệu ngữ pháp" },
  { file: "cau-ton-hien", han: "在", pinyin: "zài", category: "Tài liệu ngữ pháp" },
  { file: "dinh-ngu-tieng-trung", han: "的", pinyin: "de", category: "Tài liệu ngữ pháp" },
  { file: "tro-tu-dong-thai", han: "了", pinyin: "le", category: "Tài liệu ngữ pháp" },
  { file: "tro-tu-ngu-khi", han: "吗", pinyin: "ma", category: "Tài liệu ngữ pháp" },
  { file: "bo-ngu-thoi-luong", han: "久", pinyin: "jiǔ", category: "Tài liệu ngữ pháp" },
  { file: "bo-ngu-dong-luong", han: "次", pinyin: "cì", category: "Tài liệu ngữ pháp" },
  { file: "bo-ngu-xu-huong", han: "来", pinyin: "lái", category: "Tài liệu ngữ pháp" },
  { file: "bo-ngu-trang-thai", han: "得", pinyin: "de", category: "Tài liệu ngữ pháp" },
  { file: "bo-ngu-kha-nang", han: "能", pinyin: "néng", category: "Tài liệu ngữ pháp" },
  { file: "dong-tu-li-hop", han: "离", pinyin: "lí", category: "Tài liệu ngữ pháp" },
  { file: "dong-tu-trung-diep", han: "叠", pinyin: "dié", category: "Tài liệu ngữ pháp" },
  {
    file: "trat-tu-thanh-phan-cau-trong-tieng-han",
    han: "序",
    pinyin: "xù",
    category: "Tài liệu ngữ pháp",
  },
  {
    file: "phan-biet-thanh-ngu-va-quan-dung-ngu-trong-tieng-trung",
    han: "惯",
    pinyin: "guàn",
    category: "Quán dụng ngữ",
  },
];

const W = 960;
const H = 540;

const svg = ({ han, pinyin, category }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <text x="300" y="452" text-anchor="middle"
        font-family="'Songti SC','Noto Serif SC','SimSun',serif"
        font-size="440" fill="${INK}">${han}</text>

  <g transform="translate(700,96) rotate(-4)">
    <rect width="126" height="126" rx="5" fill="${RED}"/>
    <text x="63" y="58" text-anchor="middle" font-family="'Songti SC',serif" font-size="50" fill="${PAPER}">华</text>
    <text x="63" y="110" text-anchor="middle" font-family="'Songti SC',serif" font-size="50" fill="${PAPER}">文</text>
  </g>

  <text x="763" y="316" text-anchor="middle" font-family="Georgia,'Times New Roman',serif"
        font-size="52" font-style="italic" fill="${INK}">${pinyin}</text>
  <line x1="683" y1="352" x2="843" y2="352" stroke="${RED}" stroke-width="3"/>
  <text x="763" y="386" text-anchor="middle" font-family="system-ui,sans-serif" font-size="17"
        font-weight="700" letter-spacing="1.5" fill="${INK}" opacity=".55">${category}</text>
</svg>
`;

const force = process.argv.includes("--force");

mkdirSync("public/images/library", { recursive: true });

for (const item of ITEMS) {
  const out = `public/images/library/${item.file}.webp`;

  if (!force && existsSync(out)) {
    console.log("bỏ qua (đã có ảnh)", out);
    continue;
  }

  const png = await sharp(Buffer.from(svg(item)), { density: 220 })
    .resize(W * 2, H * 2, { fit: "fill" })
    .webp({ quality: 88 })
    .toBuffer();

  writeFileSync(out, png);
  console.log("wrote", out, `${Math.round(png.length / 1024)}KB`);
}
