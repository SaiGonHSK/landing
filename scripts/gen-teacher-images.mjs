import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIR = "src/assets/teacher";
const OUTPUT_DIR = "src/assets/teachers";

const OUT_SIZE = 1080;

await mkdir(OUTPUT_DIR, { recursive: true });

const files = (await readdir(SOURCE_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (files.length === 0) throw new Error(`Không tìm thấy ảnh nguồn trong ${SOURCE_DIR}`);

for (const file of files.sort()) {
  const slug = path.basename(file, path.extname(file));
  const source = path.join(SOURCE_DIR, file);
  const output = path.join(OUTPUT_DIR, `${slug}.webp`);

  await sharp(source).resize(OUT_SIZE, OUT_SIZE).webp({ quality: 82 }).toFile(output);

  console.log(`${slug} -> ${output}`);
}
