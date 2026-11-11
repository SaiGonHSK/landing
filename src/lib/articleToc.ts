
export type TocEntry = {
  id: string;
  text: string;
  level: number;
};

function slugify(text: string, index: number): string {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `${slug}-${index + 1}` : `muc-${index + 1}`;
}

const decode = (text: string) =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export function buildToc(body: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];

  const html = body.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level, attrs, inner) => {
      const text = decode(inner);
      if (!text) return match;

      const existing = /\sid=["']([^"']+)["']/i.exec(attrs);
      const id = existing ? existing[1] : slugify(text, toc.length);
      toc.push({ id, text, level: Number(level) });

      return existing
        ? match
        : `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html, toc };
}
