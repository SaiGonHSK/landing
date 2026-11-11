#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mammoth from "mammoth";
import sharp from "sharp";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

import { CATEGORY_DIRS, SLUG_OVERRIDES } from "./categories.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING_ROOT = path.resolve(__dirname, "..", "..");
const CONTENT_ROOT = path.join(LANDING_ROOT, "content", "Web- Thư viện");
const IMAGES_OUT = path.join(LANDING_ROOT, "public", "images", "library");
const MANIFEST_PATH = path.join(__dirname, "manifest.json");

const IMAGE_MAX_WIDTH = 1600;
const IMAGE_QUALITY = 80;

fs.mkdirSync(IMAGES_OUT, { recursive: true });

function slugifyTitle(title) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFilename(baseName) {
  let rest = baseName;
  let lessonNumber = 0;

  const m = /^b[àa]i[_ ]+(\d+)[_ ]+/i.exec(rest);
  if (m) {
    lessonNumber = parseInt(m[1], 10);
    rest = rest.slice(m[0].length);
  }

  rest = rest.replace(/_SaigonHSK$/i, "");
  rest = rest.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  return { lessonNumber, fallbackTitle: rest };
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function hasVietnameseAccent(text) {
  return /[̀-ͯ]/.test(text.normalize("NFD")) || /[đĐ]/.test(text);
}

function hasCJK(text) {
  return /[\u3400-\u9fff]/.test(text);
}

function isAllCapsText(text) {
  return /[a-zA-ZÀ-ỹ]/.test(text) && text === text.toLocaleUpperCase("vi");
}

function capitalizeFirst(text) {
  return text.charAt(0).toLocaleUpperCase("vi") + text.slice(1);
}

function looksLikeNumberedHeading(text) {
  return /^\(?[0-9]+[.)]/.test(text) || /^\(?[ivxlcm]+[.)]/i.test(text);
}

function allHeadings(html) {
  return [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: stripTags(m[2]),
    whole: m[0],
  }));
}

function numberlessHeadingCandidate(html) {
  const all = allHeadings(html);
  if (all.length === 0) return null;
  const minLevel = Math.min(...all.map((h) => h.level));
  return all.find((h) => h.level === minLevel && h.text && !looksLikeNumberedHeading(h.text)) ?? null;
}

function boldOnlyContent(pInnerRaw) {
  const inner = pInnerRaw.replace(/<a\s+id="[^"]*"[^>]*>\s*<\/a>/gi, "").trim();
  const m = /^<strong>([\s\S]*)<\/strong>$/i.exec(inner);
  return m ? m[1] : null;
}

function leadingBoldParagraph(html) {
  const m = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  if (!m) return null;
  const boldInner = boldOnlyContent(m[1]);
  if (boldInner == null) return null;
  const text = stripTags(boldInner);
  if (!text) return null;
  return { text, whole: m[0] };
}

function pickTitle(html, fallbackTitle) {
  if (fallbackTitle && hasVietnameseAccent(fallbackTitle)) {
    return { title: fallbackTitle, source: "tên file" };
  }

  const lead = leadingBoldParagraph(html);
  if (lead && !looksLikeNumberedHeading(lead.text)) {
    const text = isAllCapsText(lead.text) ? capitalizeFirst(lead.text.toLocaleLowerCase("vi")) : lead.text;
    return { title: text, source: "đoạn mở đầu bôi đậm (tên file không có dấu tiếng Việt)" };
  }

  const candidate = numberlessHeadingCandidate(html);
  if (candidate) {
    const text = isAllCapsText(candidate.text) ? capitalizeFirst(candidate.text.toLocaleLowerCase("vi")) : candidate.text;
    return { title: text, source: `heading H${candidate.level} (tên file không có dấu tiếng Việt)` };
  }

  if (fallbackTitle) return { title: fallbackTitle, source: "tên file (không có dấu, không có gì tốt hơn)" };

  const anyHeading = allHeadings(html)[0];
  return { title: anyHeading?.text ?? "(chưa có tên)", source: "heading đánh số (vét cạn, cần soát tay)" };
}

function removeHeadingMatchingTitle(html, title) {
  const target = slugifyTitle(title);
  if (!target) return html;

  const lead = leadingBoldParagraph(html);
  if (lead && slugifyTitle(lead.text) === target) return html.replace(lead.whole, "");

  for (const h of allHeadings(html)) {
    if (slugifyTitle(h.text) === target) return html.replace(h.whole, "");
  }
  return html;
}

const MIN_HEADING_WORTHY_LENGTH = 8;

function isHeadingWorthyBoldLine(text) {
  if (text.length < MIN_HEADING_WORTHY_LENGTH) return false;
  if (!/[A-Za-zÀ-ỹ]/.test(text)) return false;
  if (/[。？！，、]$/.test(text.trim())) return false;
  return true;
}

function leadingDotDepth(text) {
  const m = /^\(?((?:\d+\.){1,4})/.exec(text.trim());
  return m ? m[1].split(".").filter(Boolean).length : 1;
}

function boldParagraphsAsHeadings(html) {
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (whole, _attrs, innerRaw) => {
    const inner = innerRaw.replace(/<a\s+id="[^"]*"[^>]*>\s*<\/a>/gi, "").trim();

    let nested = false;
    let matched = false;
    if (/^<strong>[\s\S]*<\/strong>$/i.test(inner)) {
      matched = true;
      nested = /^<strong>\s*<em>[\s\S]*<\/em>\s*<\/strong>$/i.test(inner);
    } else if (/^<em>\s*<strong>[\s\S]*<\/strong>\s*<\/em>$/i.test(inner)) {
      matched = true;
      nested = true;
    }
    if (!matched) return whole;

    const text = stripTags(inner);
    if (!isHeadingWorthyBoldLine(text)) return whole;

    const dotDepth = leadingDotDepth(text);
    const level = Math.min((nested ? Math.max(dotDepth, 2) : dotDepth) + 1, 6);

    return `<h${level}>${inner}</h${level}>`;
  });
}

function allParagraphsPlainText(html) {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
}

function summaryQualityIssue(text) {
  if (!text) return "rỗng";
  if (text.length < 40) return `quá ngắn ("${text}")`;
  if (isAllCapsText(text)) return `viết hoa toàn bộ, giống tiêu đề chứ không phải mở bài ("${text}")`;
  if (looksLikeNumberedHeading(text)) return `trông như tiêu đề đánh số, không phải văn xuôi ("${text}")`;
  if (!/[A-Za-zÀ-ỹ]/.test(text)) return `toàn chữ Hán, chưa có phần dịch tiếng Việt ("${text}")`;
  return null;
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function normaliseHeadingLevels(markdown) {
  const levels = new Set();
  for (const m of markdown.matchAll(/^(#{1,6})\s/gm)) levels.add(m[1].length);
  if (levels.size === 0) return markdown;

  const sorted = [...levels].sort((a, b) => a - b);
  const remap = new Map();
  sorted.forEach((level, i) => remap.set(level, Math.min(2 + i, 4)));

  return markdown.replace(/^(#{1,6})(\s)/gm, (_match, hashes, ws) => {
    const target = remap.get(hashes.length) ?? hashes.length;
    return "#".repeat(target) + ws;
  });
}

function stripEmptyWordAnchors(markdown) {
  return markdown.replace(/\[\]\(\)/g, "");
}

function unescapeSafePunctuation(markdown) {
  return markdown.replace(/\\([()+])/g, "$1");
}

function promoteEmptyTableHeaders(markdown) {
  const lines = markdown.split("\n");
  const out = [];
  const isRow = (l) => l != null && /^\s*\|.*\|\s*$/.test(l);
  const isSep = (l) => l != null && /^\s*\|[\s:-]+\|\s*$/.test(l) && l.includes("-");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sep = lines[i + 1];
    if (isRow(line) && isSep(sep)) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      const allEmpty = cells.length > 0 && cells.every((c) => c === "");
      const nextRow = lines[i + 2];
      if (allEmpty && isRow(nextRow)) {
        out.push(nextRow);
        out.push(`| ${Array(cells.length).fill("---").join(" | ")} |`);
        i += 2;
        continue;
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

function markdownToPlainText(text) {
  return unescapeSafePunctuation(text)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\\([.!()+_*[\]])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function articleKeyFor(sourceFile, title, fallbackTitle, baseName) {
  const override = SLUG_OVERRIDES[sourceFile];
  if (override) return { articleKey: override, overridden: true };
  const articleKey = slugifyTitle(title) || slugifyTitle(fallbackTitle) || slugifyTitle(baseName);
  return { articleKey, overridden: false };
}

function slugDroppedWordsWarning(title, slug, overridden) {
  if (overridden || !hasCJK(title)) return null;
  const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
  const slugWords = slug.split("/").pop().split("-").filter(Boolean).length;
  if (slugWords < titleWords * 0.6) {
    return (
      `Title có chữ Hán, slug tự suy chỉ còn ${slugWords} đoạn so với ${titleWords} từ trong Title — ` +
      `có thể đã mất từ khoá phân biệt khi slugify bỏ chữ Hán (giống ca "mianzi"). Soát lại, thêm vào ` +
      `SLUG_OVERRIDES trong categories.mjs nếu cần.`
    );
  }
  return null;
}

function escapeHtmlAttr(text) {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function captionAfterPlaceholder(html, placeholder) {
  const re = new RegExp(
    `<p[^>]*>[^<]*<img[^>]*src="${placeholder}"[^>]*>[^<]*<\\/p>\\s*<p[^>]*>\\s*<em>([\\s\\S]*?)<\\/em>\\s*<\\/p>`,
    "i",
  );
  const m = re.exec(html);
  return m ? stripTags(m[1]) : null;
}

function removeCoverImageNode(html, coverSrc) {
  const escaped = coverSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wholeParagraph = new RegExp(`<p[^>]*>\\s*<img[^>]*src="${escaped}"[^>]*>\\s*<\\/p>`, "i");
  if (wholeParagraph.test(html)) return html.replace(wholeParagraph, "");
  const bareImg = new RegExp(`<img[^>]*src="${escaped}"[^>]*>`, "i");
  return html.replace(bareImg, "");
}

async function compressToWebp(buffer) {
  return sharp(buffer)
    .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer();
}

const htmlToMdProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, { bullet: "-", fences: true, resourceLink: true });

async function convertOne(categoryKey, filePath) {
  const baseName = path.basename(filePath, ".docx");
  const sourceFile = path.relative(LANDING_ROOT, filePath);
  const buf = fs.readFileSync(filePath);

  const collectedImages = [];
  const { value: rawHtml, messages } = await mammoth.convertToHtml(
    { buffer: buf },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const index = collectedImages.length;
        const base64 = await image.readAsBase64String();
        collectedImages.push({ base64 });
        return { src: `__IMG_PLACEHOLDER_${index}__` };
      }),
    },
  );

  const warnings = messages.filter((m) => m.type === "warning").map((m) => m.message);

  const { lessonNumber, fallbackTitle } = parseFilename(baseName);
  const { title: rawTitle, source: titleSource } = pickTitle(rawHtml, fallbackTitle);
  const title = rawTitle.trim();
  const { articleKey, overridden } = articleKeyFor(sourceFile, title, fallbackTitle, baseName);
  const slug = `/library/${categoryKey}/${articleKey}`;
  const slugWarning = slugDroppedWordsWarning(title, slug, overridden);

  let htmlWithImages = rawHtml;
  const imageFiles = [];
  for (let index = 0; index < collectedImages.length; index++) {
    const placeholder = `__IMG_PLACEHOLDER_${index}__`;
    const fileName = index === 0 ? `${articleKey}.webp` : `${articleKey}-${index + 1}.webp`;
    const compressed = await compressToWebp(Buffer.from(collectedImages[index].base64, "base64"));
    fs.writeFileSync(path.join(IMAGES_OUT, fileName), compressed);

    const publicPath = `/images/library/${fileName}`;
    const caption = captionAfterPlaceholder(htmlWithImages, placeholder);
    const altAttr = caption ? escapeHtmlAttr(caption) : "";
    const imgTagRe = new RegExp(`<img[^>]*src="${placeholder}"[^>]*>`, "i");
    htmlWithImages = htmlWithImages.replace(imgTagRe, `<img src="${publicPath}" alt="${altAttr}">`);
    imageFiles.push(publicPath);
  }

  const htmlNoDupCover = imageFiles.length > 0 ? removeCoverImageNode(htmlWithImages, imageFiles[0]) : htmlWithImages;

  let htmlBody = removeHeadingMatchingTitle(htmlNoDupCover, title);

  htmlBody = boldParagraphsAsHeadings(htmlBody);

  const paragraphs = allParagraphsPlainText(htmlBody);
  const naiveLead = paragraphs[0] ?? "";
  const goodLead = paragraphs.find((p) => !summaryQualityIssue(p));
  const leadPlain = markdownToPlainText(goodLead ?? naiveLead);
  const summaryWarning = goodLead ? null : `Không tìm được đoạn văn xuôi mở bài dùng được — ${summaryQualityIssue(naiveLead) ?? "rỗng"}.`;

  const rawMarkdown = String(htmlToMdProcessor.processSync(htmlBody)).trim();
  const cleaned = promoteEmptyTableHeaders(
    unescapeSafePunctuation(normaliseHeadingLevels(stripEmptyWordAnchors(rawMarkdown))),
  ).trim();

  const summary = truncate(leadPlain, 500);
  const intro = truncate(leadPlain, 4000);

  return {
    sourceFile,
    categoryKey,
    articleKey,
    slug,
    slugOverridden: overridden,
    title,
    titleSource,
    summary,
    intro,
    coverImage: imageFiles[0] ?? "",
    extraImages: imageFiles.slice(1),
    lessonNumber,
    body: cleaned,
    bodyBytes: Buffer.byteLength(cleaned, "utf-8"),
    warnings,
    slugWarning,
    summaryWarning,
  };
}

async function main() {
  const entries = [];

  for (const [dirName, categoryKey] of Object.entries(CATEGORY_DIRS)) {
    const dirPath = path.join(CONTENT_ROOT, dirName);
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.toLowerCase().endsWith(".docx"))
      .sort();

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      process.stdout.write(`→ ${dirName}/${file}\n`);
      const entry = await convertOne(categoryKey, filePath);
      entries.push(entry);
    }
  }

  const bySlug = new Map();
  for (const e of entries) {
    if (!bySlug.has(e.slug)) bySlug.set(e.slug, []);
    bySlug.get(e.slug).push(e);
  }
  const collisions = [...bySlug.entries()].filter(([, list]) => list.length > 1);
  for (const [slug, list] of collisions) {
    for (const e of list) {
      e.needsDecision = `Trùng slug "${slug}" với: ${list.filter((x) => x !== e).map((x) => x.sourceFile).join(", ")}. Không tự đặt slug khác — thêm vào SLUG_OVERRIDES trong categories.mjs.`;
    }
  }
  if (collisions.length > 0) {
    console.error(`\nTrùng slug trong batch (${collisions.length} nhóm) — ĐÁNH DẤU needsDecision, KHÔNG tự đổi tên:\n`);
    for (const [slug, list] of collisions) {
      console.error(`  "${slug}":`);
      for (const e of list) console.error(`      - ${e.sourceFile}  (title: "${e.title}")`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2));

  console.log(`\nXong: ${entries.length} bài → ${path.relative(LANDING_ROOT, MANIFEST_PATH)}`);

  const withWarnings = entries.filter((e) => e.warnings.length > 0);
  if (withWarnings.length > 0) {
    console.log(`\nCảnh báo mammoth (${withWarnings.length} file):`);
    for (const e of withWarnings) {
      console.log(`  - ${e.sourceFile}:`);
      for (const w of e.warnings) console.log(`      ${w}`);
    }
  } else {
    console.log("Không file nào có cảnh báo từ mammoth.");
  }

  const withSlugWarning = entries.filter((e) => e.slugWarning);
  if (withSlugWarning.length > 0) {
    console.log(`\nCảnh báo slug có thể mất chữ Hán (${withSlugWarning.length} file):`);
    for (const e of withSlugWarning) console.log(`  - ${e.sourceFile} → ${e.slug}: ${e.slugWarning}`);
  }

  const withSummaryWarning = entries.filter((e) => e.summaryWarning);
  if (withSummaryWarning.length > 0) {
    console.log(`\nCảnh báo summary (${withSummaryWarning.length} file):`);
    for (const e of withSummaryWarning) console.log(`  - ${e.sourceFile}: ${e.summaryWarning}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
