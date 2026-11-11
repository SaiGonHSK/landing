export const CONSENT_ERROR =
  "Bạn vui lòng tick đồng ý với Chính sách bảo mật để tiếp tục.";

export function bindConsent(form: HTMLFormElement): void {
  const box = form.querySelector<HTMLInputElement>('input[name="consent"]');
  if (!box) return;

  const sync = () => box.setCustomValidity(box.checked ? "" : CONSENT_ERROR);
  sync();
  box.addEventListener("change", sync);
  form.addEventListener("reset", () => setTimeout(sync));
}
