/** Lời báo lỗi hiện trong bong bóng của trình duyệt — viết cho khách, không cho dev. */
export const CONSENT_ERROR =
  "Bạn vui lòng tick đồng ý với Chính sách bảo mật để tiếp tục.";

/**
 * Gắn lời báo tiếng Việt cho ô đồng ý `name="consent"` của form.
 *
 * `required` đã chặn submit; đây chỉ thay câu mặc định của trình duyệt ("Please check
 * this box…", theo ngôn ngữ máy khách) bằng câu cùng giọng với lỗi số điện thoại.
 * Dùng `setCustomValidity` nên `reportValidity()` / submit gốc lo phần hiện bong bóng.
 */
export function bindConsent(form: HTMLFormElement): void {
  const box = form.querySelector<HTMLInputElement>('input[name="consent"]');
  if (!box) return;

  const sync = () => box.setCustomValidity(box.checked ? "" : CONSENT_ERROR);
  sync();
  box.addEventListener("change", sync);
  // `reset` bắn TRƯỚC khi form trả giá trị về mặc định, và bỏ tick không sinh `change`
  // — phải đợi reset xong mới tính lại, không thì ô trống mà vẫn bị coi là hợp lệ.
  form.addEventListener("reset", () => setTimeout(sync));
}
