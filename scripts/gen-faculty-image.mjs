import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const SOURCE_DIR = "src/assets/teacher";
const OUTPUT = "src/assets/values/doi-ngu-giang-vien.webp";

const OUT_SCALE = 2;
const W = 1440;
const H = 760;

const out = (value) => Math.round(value * OUT_SCALE);
const CANVAS = "#f6f6f7";
const DISC_TOP = "#ffffff";
const DISC_BOTTOM = "#e9e9ec";
const RING = "#c9cace";
const LEAD_RING = "#35363d";
const INK = "#121316";
const MUTED = "#6f7078";

const FONT = "'Avenir Next','Helvetica Neue',sans-serif";

const site = JSON.parse(readFileSync("content/site.json", "utf8"));
const teacherBySlug = new Map(
  site.teachers.map((teacher) => [
    path.basename(teacher.image, path.extname(teacher.image)),
    teacher,
  ]),
);

const LINEUP = ["vo-thi-quynh-trang", "cao-hoai-nhon", "huynh-thi-my-chinh", "le-tuan-minh"];

const REST = site.teachers
  .map((teacher) => path.basename(teacher.image, path.extname(teacher.image)))
  .filter((slug) => !LINEUP.includes(slug));

const DISC = 288;
const COLUMN = W / LINEUP.length;

const SIDE = 2.8;
const ABOVE = 1.55;

const work = mkdtempSync(path.join(tmpdir(), "faculty-"));

function build(name) {
  const bin = path.join(work, name);
  execFileSync("/usr/bin/swiftc", [
    "-O",
    "-framework", "Vision",
    "-framework", "AppKit",
    "-framework", "CoreImage",
    "-o", bin,
    `scripts/${name}.swift`,
  ]);
  return bin;
}

const cutoutBin = build("cutout");
const faceRectBin = build("face-rect");

async function liftSubject(slug) {
  const source = path.join(SOURCE_DIR, `${slug}.webp`);
  const { width, height } = await sharp(source).metadata();

  const column = await sharp(source)
    .extract({ left: 20, top: 0, width: 1, height })
    .raw()
    .toBuffer();

  let redTop = height;
  for (let y = 0; y < height; y += 1) {
    const [r, g, b] = column.subarray(y * 3, y * 3 + 3);
    if (r > 140 && g < 90 && b < 90) {
      redTop = y;
      break;
    }
  }

  const cropped = path.join(work, `${slug}-top.png`);
  await sharp(source)
    .extract({ left: 0, top: 0, width, height: redTop - 40 })
    .png()
    .toFile(cropped);

  const lifted = path.join(work, `${slug}-cut.png`);
  execFileSync(cutoutBin, [cropped, lifted], { stdio: ["ignore", "ignore", "ignore"] });
  return lifted;
}

async function portrait(slug, size) {
  const lifted = await liftSubject(slug);
  const face = JSON.parse(execFileSync(faceRectBin, [lifted], { encoding: "utf8" }));
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;

  const side = Math.round(SIDE * face.height);
  const windowX = Math.round(centerX - side / 2);
  const windowY = Math.round(centerY - ABOVE * face.height);

  const { width, height } = await sharp(lifted).metadata();
  const left = Math.max(0, windowX);
  const top = Math.max(0, windowY);
  const slice = await sharp(lifted)
    .extract({
      left,
      top,
      width: Math.min(width, windowX + side) - left,
      height: Math.min(height, windowY + side) - top,
    })
    .png()
    .toBuffer();

  const square = await sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: slice, left: left - windowX, top: top - windowY }])
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`,
  );

  const circular = await sharp(square)
    .resize(size, size, { kernel: "lanczos3" })
    .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.6 })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs>
        <linearGradient id="disc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${DISC_TOP}"/>
          <stop offset="1" stop-color="${DISC_BOTTOM}"/>
        </linearGradient>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#disc)"/>
    </svg>`,
  ))
    .composite([{ input: circular }])
    .png()
    .toBuffer();
}

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, fontSize, maxWidth) {
  const limit = Math.floor(maxWidth / (fontSize * 0.52));
  const lines = [];
  let line = "";

  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  return lines;
}

function credentials(title) {
  const [degree, school = ""] = title.split("—").map((part) => part.trim());
  return { degree, school: school.replace(/Đại học/g, "ĐH") };
}

const columns = [];
for (const [index, slug] of LINEUP.entries()) {
  const teacher = teacherBySlug.get(slug);
  if (!teacher) throw new Error(`content/site.json không có giảng viên nào dùng ảnh ${slug}`);

  columns.push({
    slug,
    lead: Boolean(teacher.lead),
    centerX: Math.round(COLUMN * (index + 0.5)),
    name: teacher.name,
    ...credentials(teacher.title),
  });
}

const DISC_CENTER_Y = 246;
const NAME_BASELINE = 464;

const caption = ({ centerX, name, degree, school }) => {
  const schoolLines = wrap(school, 24, COLUMN - 44);

  return `
    ${wrap(name, 28, COLUMN - 36)
      .map(
        (line, i) =>
          `<text x="${centerX}" y="${NAME_BASELINE + i * 34}" text-anchor="middle"
                 font-family="${FONT}" font-size="28" font-weight="800"
                 fill="${INK}">${escape(line)}</text>`,
      )
      .join("")}
    <text x="${centerX}" y="${NAME_BASELINE + 42}" text-anchor="middle" font-family="${FONT}"
          font-size="26" font-weight="700" fill="${INK}">${escape(degree)}</text>
    ${schoolLines
      .map(
        (line, i) =>
          `<text x="${centerX}" y="${NAME_BASELINE + 80 + i * 30}" text-anchor="middle"
                 font-family="${FONT}" font-size="23" fill="${MUTED}">${escape(line)}</text>`,
      )
      .join("")}`;
};

const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${out(W)}" height="${out(H)}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${CANVAS}"/>

    <text x="${W - 44}" y="${H - 34}" text-anchor="end"
          font-family="'Noto Serif SC','Songti SC','SimSun',serif"
          font-size="170" fill="${INK}" opacity=".05">师</text>
  </svg>`,
);

const layers = [];
for (const column of columns) {
  layers.push({
    input: await portrait(column.slug, out(DISC)),
    left: out(column.centerX - DISC / 2),
    top: out(DISC_CENTER_Y - DISC / 2),
  });
}

const THUMB = 96;
const THUMB_STEP = 70;
const REST_LABEL = `và ${REST.length} giảng viên khác`;
const REST_FONT = 27;

const restRowWidth = THUMB + THUMB_STEP * (REST.length - 1);
const restLabelWidth = REST_LABEL.length * REST_FONT * 0.52;
const restLeft = Math.round((W - (restRowWidth + 22 + restLabelWidth)) / 2);
const REST_CENTER_Y = H - 92;

for (const [index, slug] of REST.entries()) {
  layers.push({
    input: await portrait(slug, out(THUMB)),
    left: out(restLeft + index * THUMB_STEP),
    top: out(REST_CENTER_Y - THUMB / 2),
  });
}

layers.push({
  input: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${out(W)}" height="${out(H)}" viewBox="0 0 ${W} ${H}">
      ${columns
        .map(
          (column) => `
        <circle cx="${column.centerX}" cy="${DISC_CENTER_Y}" r="${DISC / 2 - 2}"
                fill="none" stroke="${column.lead ? LEAD_RING : RING}"
                stroke-width="${column.lead ? 4 : 2}"/>`,
        )
        .join("")}
      ${columns.map(caption).join("")}

      ${REST.map(
        (_, index) =>
          `<circle cx="${restLeft + index * THUMB_STEP + THUMB / 2}" cy="${REST_CENTER_Y}"
                   r="${THUMB / 2 - 2}" fill="none" stroke="${CANVAS}" stroke-width="5"/>
           <circle cx="${restLeft + index * THUMB_STEP + THUMB / 2}" cy="${REST_CENTER_Y}"
                   r="${THUMB / 2 - 4}" fill="none" stroke="${RING}" stroke-width="1.5"/>`,
      ).join("")}
      <text x="${restLeft + restRowWidth + 22}" y="${REST_CENTER_Y + 10}"
            font-family="${FONT}" font-size="${REST_FONT}" font-weight="700"
            fill="${MUTED}">${escape(REST_LABEL)}</text>

    </svg>`,
  ),
  left: 0,
  top: 0,
});

mkdirSync(path.dirname(OUTPUT), { recursive: true });
await sharp(background).composite(layers).webp({ quality: 96 }).toFile(OUTPUT);
rmSync(work, { recursive: true, force: true });
console.log(`wrote ${OUTPUT} — ${out(W)}x${out(H)}`);
