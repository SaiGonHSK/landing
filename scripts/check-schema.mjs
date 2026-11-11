
const BASE = (process.argv[2] ?? "http://localhost:4321").replace(/\/$/, "");

const PAGES = [
  "/",
  "/contact",
  "/about",
  "/about/teachers",
  "/about/reviews",
  "/about/commitments",
  "/schedule",
  "/register",
  "/courses",
  "/courses/hsk1",
  "/courses/programs/luyen-thi-hsk",
  "/library",
  "/trial",
];

const LD_RE = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  ✗ ${msg}`);
};

const internalUrls = new Set();

const collectUrls = (value, origin) => {
  if (typeof value === "string") {
    if (value.startsWith(origin) && !value.slice(origin.length).startsWith("#")) {
      internalUrls.add(value.split("#")[0]);
    }
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUrls(v, origin));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectUrls(v, origin));
  }
};

const typeOf = (node) => {
  const t = node["@type"];
  return Array.isArray(t) ? t.join("+") : (t ?? "(không có @type)");
};

console.log(`Kiểm dữ liệu có cấu trúc tại ${BASE}\n`);

for (const path of PAGES) {
  const res = await fetch(BASE + path);
  console.log(`${path}  [HTTP ${res.status}]`);

  if (!res.ok) {
    fail(`không tải được trang`);
    continue;
  }

  const html = await res.text();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) {
    fail("thiếu <link rel=canonical>");
    continue;
  }
  const origin = new URL(canonical).origin;

  const nodes = [];
  for (const [, raw] of html.matchAll(LD_RE)) {
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch (err) {
      fail(`JSON-LD không parse được: ${err.message}`);
      continue;
    }
    nodes.push(...(doc["@graph"] ?? [doc]));
    collectUrls(doc, origin);
  }

  if (!nodes.length) {
    fail("không có node JSON-LD nào");
    continue;
  }

  console.log(`  node: ${nodes.map(typeOf).join(", ")}`);

  const pageId = `${canonical}#webpage`;
  const pageNodes = nodes.filter((n) => n["@id"] === pageId);
  if (!pageNodes.length) {
    fail(`không có node nào mang @id ${pageId}`);
  }

  for (const node of nodes) {
    const t = typeOf(node);
    if (/Page/.test(t) && node["@id"] && node["@id"] !== pageId) {
      fail(`node ${t} dùng @id ${node["@id"]}, lệch với ${pageId}`);
    }
  }

  const orgNodes = nodes.filter((n) => n["@id"] === `${origin}/#organization`);
  if (orgNodes.length !== 1) {
    fail(`có ${orgNodes.length} node #organization, phải đúng 1`);
  }
}

console.log(`\nKiểm ${internalUrls.size} URL nội bộ xuất hiện trong JSON-LD…`);

let redirects = 0;

for (const url of [...internalUrls].sort()) {
  const path = new URL(url).pathname;
  const res = await fetch(BASE + path);

  if (res.status !== 200) {
    fail(`${res.status} ${path}  (khai trong JSON-LD là ${url})`);
  } else if (res.redirected) {
    redirects += 1;
    console.log(`  ! ${path} → ${new URL(res.url).pathname}  (chuyển hướng)`);
  }
}

if (redirects) {
  console.log(
    `  ${redirects} URL bị chuyển hướng. Không sai, nhưng schema nên khai đúng URL đích.`,
  );
}

console.log("\nKiểm /llms.txt và /robots.txt…");

for (const [path, needles] of [
  ["/llms.txt", ["# Trung tâm Hoa văn SaigonHSK", "chuẩn HSK 3.0", "Lưu ý khi trích dẫn"]],
  ["/robots.txt", ["User-agent: GPTBot", "Google-Extended", "Sitemap:"]],
]) {
  const res = await fetch(BASE + path);
  const type = res.headers.get("content-type") ?? "";
  const body = await res.text();

  if (res.status !== 200) fail(`${path} trả HTTP ${res.status}`);
  else if (!type.includes("text/plain")) fail(`${path} trả Content-Type ${type}`);
  else {
    const missing = needles.filter((n) => !body.includes(n));
    if (missing.length) fail(`${path} thiếu: ${missing.join(" · ")}`);
    else console.log(`  ✓ ${path} (${body.length} ký tự)`);
  }
}

console.log(
  failures === 0
    ? "\n✓ Không có lỗi."
    : `\n✗ ${failures} lỗi. Xem các dòng ✗ ở trên.`,
);
process.exit(failures === 0 ? 0 : 1);
