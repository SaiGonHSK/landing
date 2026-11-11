import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DEFAULT_NAME = "hoc-vien-hsk1-hsk4";

const name = process.argv[2]?.replace(/\.webp$/, "") ?? DEFAULT_NAME;
const SOURCE = `src/assets/hero/${name}.webp`;
const OUTPUT = `src/assets/hero/${name}-tach-nen.webp`;

const OUT_HEIGHT = 1200;

const CORE_ALPHA = 0.97;

const FLOOR_ALPHA = 0.12;

const CEIL_ALPHA = 0.9;

function extendColour(rgba, width, height, isKnown, passes) {
  const n = width * height;
  const r = new Float32Array(n);
  const g = new Float32Array(n);
  const b = new Float32Array(n);
  const known = new Uint8Array(n);

  let unknown = [];
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (let i = 0; i < n; i++) {
    if (isKnown(rgba[i * 4 + 3] / 255)) {
      known[i] = 1;
      r[i] = rgba[i * 4];
      g[i] = rgba[i * 4 + 1];
      b[i] = rgba[i * 4 + 2];
      sumR += r[i];
      sumG += g[i];
      sumB += b[i];
    } else {
      unknown.push(i);
    }
  }

  const seeds = n - unknown.length;
  if (seeds === 0) return { r, g, b, known };

  for (let pass = 0; pass < passes && unknown.length > 0; pass++) {
    const filled = [];
    const rest = [];

    for (const i of unknown) {
      const x = i % width;
      const y = (i - x) / width;
      let cr = 0;
      let cg = 0;
      let cb = 0;
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width || (dx === 0 && dy === 0)) continue;
          const j = ny * width + nx;
          if (!known[j]) continue;
          cr += r[j];
          cg += g[j];
          cb += b[j];
          count++;
        }
      }

      if (count === 0) rest.push(i);
      else filled.push(i, cr / count, cg / count, cb / count);
    }

    if (filled.length === 0) break;

    for (let k = 0; k < filled.length; k += 4) {
      const i = filled[k];
      r[i] = filled[k + 1];
      g[i] = filled[k + 2];
      b[i] = filled[k + 3];
      known[i] = 1;
    }

    unknown = rest;
  }

  if (unknown.length > 0) {
    const mr = sumR / seeds;
    const mg = sumG / seeds;
    const mb = sumB / seeds;
    for (const i of unknown) {
      r[i] = mr;
      g[i] = mg;
      b[i] = mb;
      known[i] = 1;
    }
  }

  return { r, g, b, known };
}

function trimFringe(rgba, width, height) {
  const ext = extendColour(rgba, width, height, (a) => a >= CORE_ALPHA, 6);
  const n = width * height;
  const span = CEIL_ALPHA - FLOOR_ALPHA;

  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const a = rgba[p + 3] / 255;
    if (a >= CORE_ALPHA) continue;

    const trust = a <= 0.85 ? 0 : (a - 0.85) / (CORE_ALPHA - 0.85);
    rgba[p] = Math.round(ext.r[i] + (rgba[p] - ext.r[i]) * trust);
    rgba[p + 1] = Math.round(ext.g[i] + (rgba[p + 1] - ext.g[i]) * trust);
    rgba[p + 2] = Math.round(ext.b[i] + (rgba[p + 2] - ext.b[i]) * trust);

    if (a <= 0) continue;
    const stretched = (a - FLOOR_ALPHA) / span;
    rgba[p + 3] = Math.round(Math.min(1, Math.max(0, stretched)) * 255);
  }
}

function solidify(rgba, width, height) {
  const ext = extendColour(rgba, width, height, (a) => a > 0, 24);
  const n = width * height;
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    if (rgba[p + 3] > 0) continue;
    rgba[p] = Math.round(ext.r[i]);
    rgba[p + 1] = Math.round(ext.g[i]);
    rgba[p + 2] = Math.round(ext.b[i]);
  }
}

async function toRaw(input) {
  const { data, info } = await input
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const work = mkdtempSync(path.join(tmpdir(), "hero-cutout-"));

try {
  const binary = path.join(work, "cutout");
  const cutout = path.join(work, "cutout.png");

  execFileSync("/usr/bin/swiftc", [
    "-O",
    "-framework", "Vision",
    "-framework", "AppKit",
    "-framework", "CoreImage",
    "-o", binary,
    "scripts/cutout.swift",
  ], { stdio: "inherit" });

  execFileSync(binary, [SOURCE, cutout], { stdio: "inherit" });

  const full = await toRaw(sharp(cutout));
  trimFringe(full.data, full.width, full.height);

  const raw = { raw: { width: full.width, height: full.height, channels: 4 } };
  const resized = await toRaw(
    sharp(full.data, raw)
      .trim({ threshold: 1 })
      .resize({ height: OUT_HEIGHT, fit: "inside", withoutEnlargement: true }),
  );

  solidify(resized.data, resized.width, resized.height);

  const resizedRaw = {
    raw: { width: resized.width, height: resized.height, channels: 4 },
  };

  const info = await sharp(resized.data, resizedRaw)
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 2 })
    .webp({ quality: 95, alphaQuality: 100, effort: 6 })
    .toFile(OUTPUT);

  console.log(`${SOURCE} → ${OUTPUT}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)}KB`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
