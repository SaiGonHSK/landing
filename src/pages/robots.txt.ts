import type { APIRoute } from "astro";

const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Amazonbot",
  "Bytespider",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "CCBot",
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? "";

  const aiBlock = AI_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n");

  const body = `User-agent: *
Allow: /

${aiBlock}

# Bản tóm tắt trang dành cho mô hình ngôn ngữ (quy ước llms.txt):
# ${origin}/llms.txt

Sitemap: ${origin}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
