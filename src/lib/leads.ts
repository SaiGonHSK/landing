
import type { LeadSource } from "@/lib/attribution";

const RAW_BASE = (import.meta.env.PUBLIC_API_BASE ?? "").trim();

const BASE = RAW_BASE === "/" ? "" : RAW_BASE.replace(/\/+$/, "");

export const LEADS_ENDPOINT =
  (import.meta.env.PUBLIC_REGISTER_ENDPOINT ?? "").trim() ||
  (RAW_BASE ? `${BASE}/api/v1/leads` : "");

export type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  course?: string;
  level?: string;
  note?: string;
  source?: LeadSource;
};

export type LeadResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fields?: Record<string, string>;
    };

type Envelope = {
  success: boolean;
  data?: { received?: boolean };
  error?: { code: string; message: string; fields?: Record<string, string> };
};

const LABELS: Record<string, string> = {
  name: "Họ và tên",
  phone: "Số điện thoại",
  email: "Email",
  course: "Khoá học quan tâm",
  level: "Trình độ hiện tại",
  note: "Ghi chú",
  source: "Nguồn",
};

const GENERIC =
  "Gửi chưa thành công. Bạn vui lòng gọi hotline hoặc chat Zalo để được hỗ trợ ngay.";

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  return postPublic(LEADS_ENDPOINT, payload);
}

async function postPublic(endpoint: string, payload: unknown): Promise<LeadResult> {
  if (!endpoint) return { ok: false, message: GENERIC };

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      message:
        "Không kết nối được tới hệ thống. Bạn kiểm tra lại mạng rồi gửi lại, hoặc gọi hotline giúp trung tâm nhé.",
    };
  }

  let body: Envelope | null = null;
  try {
    body = (await res.json()) as Envelope;
  } catch {
    body = null;
  }

  if (res.ok && body?.success) return { ok: true };

  if (res.status === 429) {
    return {
      ok: false,
      message:
        "Bạn gửi quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau vài phút hoặc gọi hotline để được tư vấn ngay.",
    };
  }

  const fields = body?.error?.fields;
  if (fields) {
    const [field, detail] = Object.entries(fields)[0] ?? [];
    if (field && detail) {
      return {
        ok: false,
        message: `${LABELS[field] ?? field}: ${detail.charAt(0).toLowerCase()}${detail.slice(1)}`,
        fields,
      };
    }
  }

  return { ok: false, message: body?.error?.message ?? GENERIC };
}
