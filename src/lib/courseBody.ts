import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { List, Nodes, Root, RootContent } from "mdast";

import { renderArticleBody } from "./articleBody";

/**
 * Cột trái trang khoá học, dựng từ Markdown giáo vụ soạn ở console.
 *
 * Trước đây phần dài nhất của trang được `data/catalog.ts` SINH ra bằng template chạy
 * trên `HSK_LEVELS`, nên giáo vụ không sửa được chữ nào. Giờ nó là cột
 * `courses.landing_body`; file này dịch Markdown đó về đúng các khối giao diện
 * `CatalogDetail.astro` vẫn dựng, thay vì đổ ra một mảng prose trơn.
 *
 * Vì sao không render thẳng Markdown → HTML: ba khối của trang có giao diện riêng
 * (hàng fact có biểu tượng, thẻ tick xanh, các panel viền) chứ không phải chữ chạy.
 * Đổ prose ra là mất hết, và trang khoá học khác hẳn trang hiện tại.
 */

/** Một mục của hàng ba fact dưới tên khoá. */
export type FactItem = { label: string; value: string };

/** Một panel của khối “Chương trình học”. */
export type ProgramBlock = { title: string; note: string; items: string[] };

export type CourseBlock =
  | { kind: "intro"; text: string }
  | { kind: "facts"; items: FactItem[] }
  | { kind: "outcomes"; title: string; items: string[] }
  | { kind: "program"; title: string; blocks: ProgramBlock[] }
  /** Tiêu đề không nằm trong ba khối trên — in ra như bài viết thường. */
  | { kind: "prose"; title: string; html: string };

/**
 * Tiền tố tiêu đề `##` ứng với từng khối có giao diện riêng.
 *
 * Khớp theo TIỀN TỐ chứ không khớp tuyệt đối, vì tiêu đề khối chương trình mang theo
 * thời lượng của khoá (“Chương trình học 2,5 tháng”, “Chương trình học 3 tháng”) —
 * CatalogDetail vẫn luôn in nó kèm thời lượng như vậy.
 *
 * Danh sách này phải khớp `LANDING_SECTIONS` trong console
 * (`app/portal/courses/[courseId]/components/step-info.tsx`): đó là chỗ giáo vụ đọc để
 * biết gõ tiêu đề nào.
 */
const SECTION_PREFIXES = [
  { prefix: "thông tin cơ bản", kind: "facts" },
  { prefix: "bạn đạt được", kind: "outcomes" },
  { prefix: "chương trình học", kind: "program" },
] as const;

type SectionKind = (typeof SECTION_PREFIXES)[number]["kind"];

const sectionKindOf = (heading: string): SectionKind | null => {
  const text = heading.trim().toLowerCase();
  return SECTION_PREFIXES.find((s) => text.startsWith(s.prefix))?.kind ?? null;
};

const parser = unified().use(remarkParse).use(remarkGfm);

/**
 * Chữ trần của một nút mdast, bỏ hết đánh dấu.
 *
 * Tự viết thay vì thêm `mdast-util-to-string`: cần đúng một hàm bốn dòng, mà mỗi gói
 * thêm vào là một thứ nữa phải vá khi có CVE. `value` phủ text/inlineCode/html, còn
 * lại đệ quy xuống `children`.
 */
function textOf(node: Nodes): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node) return node.children.map((child) => textOf(child)).join("");
  return "";
}

/** Các mục của danh sách gạch đầu dòng đầu tiên trong `nodes`, dưới dạng chữ. */
function listItems(nodes: RootContent[]): string[] {
  const list = nodes.find((n): n is List => n.type === "list");
  return list ? list.children.map((item) => textOf(item).trim()).filter(Boolean) : [];
}

/**
 * `- **Nhãn:** giá trị` → `{label, value}`.
 *
 * Dấu hai chấm nằm trong phần in đậm ở bản seed, nhưng người soạn sau này dễ gõ ra
 * ngoài (`**Nhãn**: giá trị`), nên cắt ở dấu hai chấm đầu tiên của cả dòng thay vì tin
 * vào cấu trúc in đậm. Dòng không có dấu hai chấm thì coi như chỉ có giá trị — vẫn hiện
 * được, chỉ là không có nhãn.
 */
function toFact(line: string): FactItem {
  const at = line.indexOf(":");
  if (at === -1) return { label: "", value: line.trim() };
  return { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() };
}

/** Các panel `###` của khối “Chương trình học”. */
function programBlocks(nodes: RootContent[]): ProgramBlock[] {
  const blocks: ProgramBlock[] = [];
  let current: { title: string; nodes: RootContent[] } | null = null;

  const flush = () => {
    if (!current) return;
    const note = current.nodes
      .filter((n) => n.type === "paragraph")
      .map((n) => textOf(n).trim())
      .filter(Boolean)
      .join(" ");
    blocks.push({ title: current.title, note, items: listItems(current.nodes) });
    current = null;
  };

  for (const node of nodes) {
    if (node.type === "heading" && node.depth >= 3) {
      flush();
      current = { title: textOf(node).trim(), nodes: [] };
      continue;
    }
    // Nội dung trước `###` đầu tiên: dựng một panel không tiêu đề để không nuốt mất chữ.
    if (!current) current = { title: "", nodes: [] };
    current.nodes.push(node);
  }
  flush();

  return blocks.filter((b) => b.title || b.note || b.items.length > 0);
}

/**
 * Markdown → các khối của cột trái.
 *
 * Phần đứng trước tiêu đề `##` đầu tiên là đoạn mở đầu dưới H1. Rỗng thì không trả khối
 * nào, và trang tự quay về đường cũ (nội dung sinh từ repo).
 */
export function parseCourseBody(markdown: string): CourseBlock[] {
  if (!markdown.trim()) return [];

  const tree = parser.parse(markdown) as Root;

  const sections: { heading: string; nodes: RootContent[] }[] = [];
  const lead: RootContent[] = [];

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth <= 2) {
      sections.push({ heading: textOf(node).trim(), nodes: [] });
      continue;
    }
    (sections.at(-1)?.nodes ?? lead).push(node);
  }

  const blocks: CourseBlock[] = [];

  const intro = lead
    .filter((n) => n.type === "paragraph")
    .map((n) => textOf(n).trim())
    .filter(Boolean)
    .join("\n\n");
  if (intro) blocks.push({ kind: "intro", text: intro });

  for (const section of sections) {
    switch (sectionKindOf(section.heading)) {
      case "facts": {
        const items = listItems(section.nodes).map(toFact);
        if (items.length) blocks.push({ kind: "facts", items });
        break;
      }
      case "outcomes": {
        const items = listItems(section.nodes);
        if (items.length) blocks.push({ kind: "outcomes", title: section.heading, items });
        break;
      }
      case "program": {
        const programs = programBlocks(section.nodes);
        if (programs.length) blocks.push({ kind: "program", title: section.heading, blocks: programs });
        break;
      }
      default: {
        /*
         * Khối tự do: dựng lại Markdown của riêng phần này rồi đẩy qua cùng bộ render
         * với bài viết Thư viện — ảnh, bảng, liên kết hành xử y như bên đó.
         *
         * Cắt theo vị trí trong văn bản gốc thay vì `mdast-util-to-markdown`: giữ
         * nguyên từng ký tự người soạn gõ, không bị bộ in lại chuẩn hoá (`*` thành `-`,
         * xuống dòng bị gộp…).
         */
        const from = section.nodes[0]?.position?.start.offset;
        const to = section.nodes.at(-1)?.position?.end.offset;
        const html =
          from != null && to != null ? renderArticleBody(markdown.slice(from, to)) : "";
        if (html) blocks.push({ kind: "prose", title: section.heading, html });
      }
    }
  }

  return blocks;
}

/** Đoạn mở đầu — trang dùng cho thẻ mô tả SEO khi khoá không có `summary`. */
export const introOf = (blocks: CourseBlock[]): string =>
  blocks.find((b): b is Extract<CourseBlock, { kind: "intro" }> => b.kind === "intro")?.text ?? "";

/** Giá trị của một fact theo tiền tố nhãn — cùng cách tra với `facts` cũ. */
export function factOf(blocks: CourseBlock[], label: string): string {
  for (const block of blocks) {
    if (block.kind !== "facts") continue;
    const hit = block.items.find((item) => item.label.toLowerCase().startsWith(label.toLowerCase()));
    if (hit) return hit.value;
  }
  return "";
}
