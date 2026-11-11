import { applySchedule, type ApiSchedule } from "./scheduleApi";
import { applyContent } from "./content";
import { applyCourses, type ApiCourse } from "./coursesApi";
import { applyLibraryCategories, type ApiLibraryCategory } from "./library";
import { applyMenu, applyPageContents, type MenuEntry, type PageContent } from "./pages";
import { applyPrograms, type ApiProgram } from "./programsApi";
import * as schedule from "./schedule";

const TTL_MS = 60_000;

const apiBase = (): string => {
  const raw =
    (typeof process !== "undefined" ? process.env.CONTENT_API : undefined) ||
    import.meta.env.PUBLIC_CONTENT_API ||
    "";
  return raw.replace(/\/$/, "");
};

let lastAt = 0;
let inflight: Promise<void> | null = null;
let warned = false;

let contentOk: boolean | null = null;
let pagesOk: boolean | null = null;
let coursesOk: boolean | null = null;
let menuOk: boolean | null = null;
let categoriesOk: boolean | null = null;
let programsOk: boolean | null = null;
let scheduleOk: boolean | null = null;

export async function refreshContent(): Promise<void> {
  if (Date.now() - lastAt < TTL_MS) return;

  inflight ??= load().finally(() => {
    inflight = null;
    lastAt = Date.now();
  });

  return inflight;
}

async function load(): Promise<void> {
  const API = apiBase();

  if (!API) {
    if (!warned) {
      console.warn(
        "[content] chưa đặt CONTENT_API — dùng nội dung trong content/site.json, các trang động bị bỏ qua",
      );
      warned = true;
    }
    return;
  }

  await Promise.all([
    loadSiteContent(API),
    loadMenu(API),
    loadLibraryCategories(API),
    loadPages(API),
    loadCourses(API),
    loadPrograms(API),
    loadSchedule(API),
  ]);
}

async function loadMenu(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/menu`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: MenuEntry[] };
    const count = applyMenu(body.data ?? []);
    if (count === 0) throw new Error("menu rỗng");

    if (menuOk !== true) {
      console.info(`[menu] ${count} mục header soạn từ trang quản trị`);
      menuOk = true;
    }
  } catch (error) {
    console.warn(
      `[menu] không đọc được ${API}/api/v1/menu (${String(error)}) — giữ menu đang dùng`,
    );
    menuOk = false;
  }
}

async function loadLibraryCategories(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/library-categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: ApiLibraryCategory[] };
    const count = applyLibraryCategories(body.data ?? []);
    if (count === 0) throw new Error("danh sách chuyên mục rỗng");

    if (categoriesOk !== true) {
      console.info(`[library] ${count} chuyên mục Thư viện soạn từ trang quản trị`);
      categoriesOk = true;
    }
  } catch (error) {
    console.warn(
      `[library] không đọc được ${API}/api/v1/library-categories (${String(error)}) — giữ chuyên mục đang dùng`,
    );
    categoriesOk = false;
  }
}

async function loadPrograms(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/programs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: ApiProgram[] };
    const count = applyPrograms(body.data ?? []);
    if (count === 0) throw new Error("danh sách chương trình rỗng");

    if (programsOk !== true) {
      console.info(`[programs] ${count} chương trình soạn từ trang quản trị`);
      programsOk = true;
    }
  } catch (error) {
    console.warn(
      `[programs] không đọc được ${API}/api/v1/programs (${String(error)}) — giữ chương trình đang dùng`,
    );
    programsOk = false;
  }
}

async function loadSiteContent(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/content`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: unknown };
    if (!body.data || typeof body.data !== "object") {
      throw new Error("phản hồi không có tài liệu nội dung");
    }

    applyContent(body.data);

    if (contentOk !== true) {
      const version = (body.data as { version?: number }).version;
      console.info(
        `[content] đã nạp nội dung từ ${API} (version ${version ?? "?"}), làm mới mỗi ${TTL_MS / 1000}s`,
      );
      contentOk = true;
    }
  } catch (error) {
    console.warn(
      `[content] không đọc được ${API}/api/v1/content (${String(error)}) — giữ nội dung đang dùng`,
    );
    contentOk = false;
  }
}

async function loadPages(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/pages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: PageContent[] };
    const count = applyPageContents(body.data ?? []);
    if (pagesOk !== true) {
      console.info(`[pages] ${count} trang động soạn từ trang quản trị`);
      pagesOk = true;
    }
  } catch (error) {
    console.warn(
      `[pages] không đọc được ${API}/api/v1/pages (${String(error)}) — giữ danh sách trang đang dùng`,
    );
    pagesOk = false;
  }
}

async function loadSchedule(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/schedule`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: ApiSchedule };
    const count = applySchedule(body.data);
    schedule.syncFromSchedule();

    if (scheduleOk !== true) {
      console.info(
        `[schedule] “${schedule.scheduleTitle || "chưa đăng đợt nào"}” · ${count} dòng, soạn từ trang quản trị`,
      );
      scheduleOk = true;
    }
  } catch (error) {
    console.warn(
      `[schedule] không đọc được ${API}/api/v1/schedule (${String(error)}) — giữ lịch khai giảng đang dùng`,
    );
    scheduleOk = false;
  }
}

async function loadCourses(API: string): Promise<void> {
  try {
    const res = await fetch(`${API}/api/v1/courses`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { data?: ApiCourse[] };
    const count = applyCourses(body.data ?? []);
    if (coursesOk !== true) {
      console.info(`[courses] ${count} khoá đang mở, soạn từ trang quản trị`);
      coursesOk = true;
    }
  } catch (error) {
    console.warn(
      `[courses] không đọc được ${API}/api/v1/courses (${String(error)}) — giữ danh sách khoá đang dùng`,
    );
    coursesOk = false;
  }
}
