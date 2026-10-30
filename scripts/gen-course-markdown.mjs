/*
  Sinh nội dung Markdown cho cột trái trang khoá học, từ chính dữ liệu đang render.

  Trước khi có `courses.landing_body`, phần dài nhất của trang (“Bạn đạt được sau khoá
  học”, “Chương trình học”) được `src/data/catalog.ts` SINH ra bằng template — giáo vụ
  không sửa được. Script này đóng băng bản sinh đó thành Markdown để nhét vào DB, nên
  trang sau khi chuyển sang đọc `landing_body` ra đúng từng chữ như trước.

  Chạy một lần để dựng `migrations/036_courses_landing_body.sql` bên repo server. Giữ lại
  trong repo vì nó là bằng chứng nội dung seed đến từ đâu, và để chạy lại được nếu phải
  sửa quy ước Markdown.

      node scripts/gen-course-markdown.mjs            # in Markdown từng khoá ra stdout
      node scripts/gen-course-markdown.mjs --sql      # in migration SQL

  `intro`, `Đầu vào` và khối “Chương trình học” vẫn được in ra, nhưng chỉ làm bản dự
  phòng: migration ưu tiên cột DB (`courses.intro`, `courses.entry`, `courses.curriculum`)
  và chỉ rơi về bản chụp khi cột đó rỗng — giống hệt luật `merge()` trong `coursesApi.ts`
  mà trang đang chạy.
*/

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Nạp `catalog.ts` mà không kéo theo cả cây import của Astro.
 *
 * File chỉ có đúng một dòng import — `export … from "./library"` — và nó không dính gì
 * tới khoá học, nhưng đường dẫn thiếu đuôi `.ts` nên `node --experimental-strip-types`
 * không phân giải được. Cắt dòng đó, ghi bản tạm cạnh bản gốc rồi import: rẻ hơn dựng
 * cả bundler chỉ để chạy một script sinh dữ liệu.
 */
const catalogURL = new URL("../src/data/catalog.ts", import.meta.url);
const tempURL = new URL("../src/data/.catalog.gen-tmp.ts", import.meta.url);

writeFileSync(
  tempURL,
  readFileSync(fileURLToPath(catalogURL), "utf8").replace(
    /^export \{[^}]*\} from "\.\/library";$/m,
    "",
  ),
);

let onlineOfflineCourses;
try {
  ({ onlineOfflineCourses } = await import(tempURL.href));
} finally {
  rmSync(tempURL, { force: true });
}

/** Giống `heroFacts` trong CatalogDetail.astro: hai giá trị này không đến từ dữ liệu khoá. */
const CLASS_SIZE = "10–15 học viên";
const DEFAULT_MODE = "Offline tại TP.HCM hoặc online";

const fact = (item, label) =>
  item.facts.find((f) => f.label.startsWith(label))?.value ?? "";

/** Markdown escape cho đầu dòng: chỉ cần lo dấu `-` và `#` mở đầu. */
const line = (text) => String(text).replace(/^([-#>])/, "\\$1");

const bullets = (items) => items.map((i) => `- ${line(i)}`).join("\n");

/**
 * Khối “Chương trình học” sinh từ repo — hai panel `content` và `topics`, đúng thứ tự
 * CatalogDetail dựng chúng. Khoá nào đã có `curriculum` trong DB thì migration bỏ qua
 * phần này.
 */
function curriculumSection(item) {
  const blocks = [];
  if (item.content?.length) {
    blocks.push(`### Nội dung khoá học\n\n${bullets(item.content)}`);
  }
  if (item.topics?.items?.length) {
    const note = item.topics.note ? `${line(item.topics.note)}\n\n` : "";
    blocks.push(`### ${line(item.topics.title)}\n\n${note}${bullets(item.topics.items)}`);
  }
  return blocks.join("\n\n");
}

/**
 * Hai nửa Markdown của một khoá.
 *
 * Tách đôi vì migration ghép chúng lại với dữ liệu DB: `{{entry}}` thay bằng cột
 * `courses.entry`, và nửa `program` bị bỏ qua hẳn nếu khoá đã có `curriculum` soạn
 * từ console — nội dung giáo vụ tự soạn luôn thắng bản sinh từ template.
 */
function markdownFor(item) {
  const head = [
    "## Thông tin cơ bản",
    "",
    `- **Sĩ số lớp:** ${line(CLASS_SIZE)}`,
    `- **Hình thức học:** ${line(fact(item, "Hình thức") || DEFAULT_MODE)}`,
    "- **Đầu vào:** {{entry}}",
  ].join("\n");

  const outcomes = item.outcomes?.length
    ? `\n\n## Bạn đạt được sau khoá học\n\n${bullets(item.outcomes)}`
    : "";

  const curriculum = curriculumSection(item);
  const months = fact(item, "Thời lượng");
  const program = curriculum
    ? `## Chương trình học${months ? ` ${line(months)}` : ""}\n\n${curriculum}`
    : "";

  return { head: head + outcomes, program };
}

const rows = onlineOfflineCourses.map((item) => ({
  catalogKey: item.slug,
  title: item.title,
  months: fact(item, "Thời lượng"),
  entry: fact(item, "Đầu vào"),
  intro: item.intro ?? "",
  ...markdownFor(item),
}));

const sqlString = (value) => `'${String(value).replace(/'/g, "''")}'`;

if (process.argv.includes("--sql")) {
  const values = rows
    .map(
      (r) =>
        `    (${sqlString(r.catalogKey)}, ${sqlString(r.months)}, ` +
        `${sqlString(r.entry)}, ${sqlString(r.intro)}, ` +
        `${sqlString(r.head)}, ${sqlString(r.program)})`,
    )
    .join(",\n");
  process.stdout.write(values + "\n");
} else {
  for (const r of rows) {
    process.stdout.write(`\n${"=".repeat(70)}\n${r.catalogKey} — ${r.title}\n${"=".repeat(70)}\n\n`);
    process.stdout.write(`${r.intro}\n\n${r.head}\n\n${r.program}\n`);
  }
}
