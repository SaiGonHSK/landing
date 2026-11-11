import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SOURCE = "src/assets/classes/lop-luyen-thi-hsk.webp";
const OUTPUT = "src/assets/og-default.jpg";

const CROP_TOP = 200;

await mkdir(path.dirname(OUTPUT), { recursive: true });

const { width, height } = await sharp(SOURCE).metadata();
const cropHeight = Math.round((width * 630) / 1200);

await sharp(SOURCE)
  .extract({
    left: 0,
    top: Math.min(CROP_TOP, height - cropHeight),
    width,
    height: cropHeight,
  })
  .resize(1200, 630)
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUTPUT);

console.log(`[og] đã tạo ${OUTPUT} (1200×630, JPEG)`);
