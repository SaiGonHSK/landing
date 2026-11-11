
export function normalizePhone(raw: string): string {
  const compact = raw.replace(/[^\d+]/g, "");

  if (compact.startsWith("+84")) return `0${compact.slice(3)}`;
  if (compact.startsWith("84") && compact.length >= 11) return `0${compact.slice(2)}`;

  return compact;
}

export const PHONE_LENGTH = 10;

export function sanitizePhoneInput(raw: string): string {
  return normalizePhone(raw).replace(/\D/g, "").slice(0, PHONE_LENGTH);
}

const VN_PHONE = /^0[35789]\d{8}$/;

export function isValidPhone(raw: string): boolean {
  return VN_PHONE.test(normalizePhone(raw));
}

export const PHONE_ERROR =
  "Số điện thoại chưa đúng. Bạn nhập đủ 10 số, bắt đầu bằng 0 — ví dụ 0912345678.";
