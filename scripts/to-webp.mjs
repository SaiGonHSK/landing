
import { readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOTS = ["src/assets"];

const KEEP = new Set(["src/assets/og-default.jpg"]);

const KEEP_DIRS = ["src/assets/reviews"];

const quality = () => 95;

const dryRun = process.argv.includes("--dry");

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

let converted = 0;
let before = 0;
let after = 0;

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const ext = path.extname(file).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
    if (KEEP.has(file)) continue;
    if (KEEP_DIRS.some((dir) => file.startsWith(`${dir}/`))) continue;

    const output = file.slice(0, -ext.length) + ".webp";

    if (dryRun) {
      console.log(`${file} → ${output}`);
      converted += 1;
      continue;
    }

    const source = file;
    const sourceSize = (await stat(file)).size;

    const lossy = await sharp(source).webp({ quality: quality(file) }).toBuffer();
    const candidates = [lossy];

    if (ext === ".png") {
      candidates.push(await sharp(source).webp({ lossless: true, effort: 6 }).toBuffer());
    }

    const best = candidates.reduce((a, b) => (b.length < a.length ? b : a));

    await writeFile(output, best);
    await unlink(file);

    before += sourceSize;
    after += best.length;
    converted += 1;

    console.log(`${file} → ${path.basename(output)}  ${kb(sourceSize)} → ${kb(best.length)}`);
  }
}

if (converted === 0) {
  console.log("Không có ảnh JPEG/PNG nào cần đổi.");
} else if (dryRun) {
  console.log(`\n${converted} ảnh sẽ được đổi (chạy lại không có --dry để đổi thật).`);
} else {
  console.log(`\nĐã đổi ${converted} ảnh: ${kb(before)} → ${kb(after)}`);
}
