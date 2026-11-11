import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeImageFigure)
  .use(rehypeStringify, { allowDangerousHtml: true });

export function renderArticleBody(body: string): string {
  if (!body.trim()) return "";
  return String(processor.processSync(body)).trim();
}

function loneImage(node: Element): Element | null {
  if (node.tagName !== "p") return null;

  const meaningful = node.children.filter(
    (child) => child.type !== "text" || child.value.trim() !== "",
  );
  const only = meaningful.length === 1 ? meaningful[0] : null;
  return only && only.type === "element" && only.tagName === "img" ? only : null;
}

function rehypeImageFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;
      const src = node.properties.src;
      if (typeof src !== "string" || !src) return;

      node.properties.dataLightbox = src;
      const caption = node.properties.title ?? node.properties.alt;
      if (typeof caption === "string" && caption) node.properties.dataCaption = caption;
    });

    visit(tree, "element", (node: Element) => {
      const img = loneImage(node);
      if (!img) return;

      const alt = String(img.properties.alt ?? "");
      const title = String(img.properties.title ?? "");
      if (!/^\d+(\.\d+)?$/.test(alt)) return;

      img.properties.alt = title;
      delete img.properties.title;
      if (!title) return;

      node.tagName = "figure";
      node.properties = {};
      node.children = [
        img,
        { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: title }] },
      ];
    });
  };
}
