import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SOURCE_LOGO = "src/assets/logo-mark.webp";
const OUT_DIR = "public";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const logoPng = (size) =>
  sharp(SOURCE_LOGO)
    .trim()
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .sharpen({ sigma: 0.6 })
    .png({ compressionLevel: 9 })
    .toBuffer();

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const ICO_SIZES = [16, 32, 48];
const icoImages = await Promise.all(
  ICO_SIZES.map(async (size) => ({ size, data: await logoPng(size) })),
);
await writeFile(`${OUT_DIR}/favicon.ico`, buildIco(icoImages));
console.log(`[favicon] đã tạo ${OUT_DIR}/favicon.ico (${ICO_SIZES.join(", ")}px)`);

for (const size of [16, 32]) {
  await writeFile(`${OUT_DIR}/favicon-${size}.png`, await logoPng(size));
  console.log(`[favicon] đã tạo ${OUT_DIR}/favicon-${size}.png`);
}

const TOUCH = 180;
const TOUCH_PAD = 18;
await sharp(SOURCE_LOGO)
  .trim()
  .resize(TOUCH - TOUCH_PAD * 2, TOUCH - TOUCH_PAD * 2, {
    fit: "contain",
    background: TRANSPARENT,
  })
  .extend({
    top: TOUCH_PAD,
    bottom: TOUCH_PAD,
    left: TOUCH_PAD,
    right: TOUCH_PAD,
    background: "#ffffff",
  })
  .flatten({ background: "#ffffff" })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT_DIR}/apple-touch-icon.png`);
console.log(`[favicon] đã tạo ${OUT_DIR}/apple-touch-icon.png (${TOUCH}×${TOUCH})`);
