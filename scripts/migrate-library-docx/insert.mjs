#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, "manifest.json");

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:9909/api/v1";
const FORCE = process.argv.includes("--force");

async function readCredentials() {
  const fileArg = process.env.ADMIN_CREDENTIALS_FILE;
  if (fileArg) {
    const { email, password } = JSON.parse(fs.readFileSync(fileArg, "utf-8"));
    if (!email || !password) throw new Error(`${fileArg} thiếu "email" hoặc "password".`);
    return { email, password };
  }

  if (process.stdin.isTTY) {
    const email = await askVisible("Email admin (DB local): ");
    const password = await askHidden("Mật khẩu: ");
    return { email, password };
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠ Đang đọc mật khẩu từ biến môi trường ADMIN_PASSWORD — cách này lọt vào " +
        "~/.zsh_history dưới dạng chữ thô. Ưu tiên ADMIN_CREDENTIALS_FILE hoặc chạy trong terminal có TTY.",
    );
    return { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
  }

  throw new Error(
    "Không có thông tin đăng nhập. Dùng một trong: ADMIN_CREDENTIALS_FILE=<file JSON {email,password}>, " +
      "chạy trong terminal thật (sẽ hỏi trực tiếp), hoặc (không khuyến khích) ADMIN_EMAIL/ADMIN_PASSWORD.",
  );
}

function askVisible(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const originalWrite = rl._writeToOutput?.bind(rl);
    rl._writeToOutput = (str) => {
      if (str.trim() === question.trim() || str === "\n" || str === "\r\n") originalWrite?.(str);
    };
    rl.question(question, (answer) => {
      rl._writeToOutput = originalWrite;
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  const token = json?.data?.tokens?.access_token;
  if (!res.ok || !token) {
    throw new Error(`Đăng nhập thất bại (${res.status}): ${JSON.stringify(json)}`);
  }
  return token;
}

async function fetchExistingSlugs(token) {
  const res = await fetch(`${API_BASE}/admin/pages`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Không lấy được /admin/pages (${res.status}): ${JSON.stringify(json)}`);
  const list = Array.isArray(json.data) ? json.data : json.data?.list ?? [];
  return new Set(list.map((p) => p.slug));
}

async function upsertPage(token, entry) {
  const res = await fetch(`${API_BASE}/admin/pages${entry.slug}`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: entry.title,
      summary: entry.summary,
      intro: entry.intro,
      body: entry.body,
      coverImage: entry.coverImage,
      status: "draft",
      orderIndex: 0,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PUT ${entry.slug} thất bại (${res.status}): ${JSON.stringify(json)}`);
  return json.data;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Chưa có ${MANIFEST_PATH} — chạy node convert.mjs trước.`);
  }
  const entries = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  const ready = entries.filter((e) => !e.needsDecision);
  const blocked = entries.filter((e) => e.needsDecision);

  if (blocked.length > 0) {
    console.log(`Bỏ qua ${blocked.length} bài đang needsDecision (chưa có SLUG_OVERRIDES):`);
    for (const e of blocked) console.log(`  - ${e.sourceFile}: ${e.needsDecision}`);
    console.log();
  }

  const seen = new Map();
  for (const e of ready) {
    if (seen.has(e.slug)) {
      throw new Error(`Trùng slug trong danh sách sẽ nạp: "${e.slug}" (${seen.get(e.slug)} và ${e.sourceFile}).`);
    }
    seen.set(e.slug, e.sourceFile);
  }

  const { email, password } = await readCredentials();

  console.log(`→ Đăng nhập ${email} tại ${API_BASE}`);
  const token = await login(email, password);

  console.log("→ Lấy danh sách bài hiện có trong DB local để đối chiếu…");
  const existingSlugs = await fetchExistingSlugs(token);

  const toCreate = ready.filter((e) => !existingSlugs.has(e.slug));
  const toUpdate = ready.filter((e) => existingSlugs.has(e.slug));

  console.log(`→ Nạp ${toCreate.length} bài mới (status=draft, order_index=0, publishedAt=null)…\n`);
  const results = [];
  for (const e of toCreate) {
    process.stdout.write(`  tạo mới  ${e.slug} … `);
    const saved = await upsertPage(token, e);
    console.log("OK");
    results.push({ slug: e.slug, id: saved.id, action: "created" });
  }

  if (toUpdate.length > 0) {
    if (FORCE) {
      console.log(`\n→ --force: GHI ĐÈ ${toUpdate.length} bài đã tồn tại (mất sửa tay nếu có)…\n`);
      for (const e of toUpdate) {
        process.stdout.write(`  ghi đè  ${e.slug} … `);
        const saved = await upsertPage(token, e);
        console.log("OK");
        results.push({ slug: e.slug, id: saved.id, action: "overwritten" });
      }
    } else {
      console.log(`\n→ ${toUpdate.length} bài đã tồn tại trong DB — BỎ QUA (không có --force):`);
      for (const e of toUpdate) console.log(`  - ${e.slug}`);
      console.log(`  Chạy lại với --force nếu thật sự muốn ghi đè các bài này.`);
    }
  }

  console.log(`\nXong: tạo mới ${results.filter((r) => r.action === "created").length}, ghi đè ${results.filter((r) => r.action === "overwritten").length}, bỏ qua ${FORCE ? 0 : toUpdate.length}, needsDecision ${blocked.length}.`);
  if (blocked.length > 0) {
    console.log(`\nBài KHÔNG nạp vì trùng slug — thêm SLUG_OVERRIDES rồi chạy lại convert.mjs:`);
    for (const e of blocked) console.log(`  - ${e.sourceFile} (title: "${e.title}")`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
