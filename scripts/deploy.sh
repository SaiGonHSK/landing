#!/usr/bin/env bash

set -euo pipefail

REPO="${REPO:-/var/www/hoavan-hsk-landing-page}"
RELEASES="${RELEASES:-/var/www/hoavan-releases}"
CURRENT="${CURRENT:-/var/www/hoavan-current}"
SERVICE="${SERVICE:-hoavan-landing}"
OWNER="${OWNER:-www-data:www-data}"
PORT="${PORT:-4321}"
PUBLIC_URL="${PUBLIC_URL:-https://trungtamhoavansaigonhsk.edu.vn}"

KEEP=3
DO_PULL=1
DO_VERIFY=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-pull)   DO_PULL=0; shift ;;
    --no-verify) DO_VERIFY=0; shift ;;
    --keep)      KEEP="${2:?--keep cần một con số}"; shift 2 ;;
    -h|--help)   sed -n '2,26p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)           echo "Tham số không hiểu: $1 (xem --help)" >&2; exit 2 ;;
  esac
done

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
warn() { printf '\033[33m!  %s\033[0m\n' "$*"; }
die()  { printf '\033[31m✗  %s\033[0m\n' "$*" >&2; exit 1; }

say "Kiểm điều kiện"

[[ "$(uname -s)" == "Linux" ]] || die "Script này chỉ chạy trên Linux (VPS), không chạy trên máy dev."
[[ "$(id -u)" == "0" ]]        || die "Cần root: chown, symlink trong /var/www và systemctl đều cần. Dùng sudo."

[[ -d "$REPO/.git" ]] || die "Không thấy repo ở $REPO (đặt biến REPO nếu nằm chỗ khác)."
command -v yarn >/dev/null   || die "Không có yarn trong PATH của root."
command -v node >/dev/null   || die "Không có node trong PATH của root."
systemctl cat "$SERVICE" >/dev/null 2>&1 \
  || die "Chưa có systemd unit '$SERVICE'. Tạo theo README dòng 130 trước khi deploy lần đầu."

node_major="$(node -p 'process.versions.node.split(".")[0]')"
node_minor="$(node -p 'process.versions.node.split(".")[1]')"
if (( node_major < 22 || (node_major == 22 && node_minor < 12) )); then
  die "Node $(node -v) quá cũ, cần ≥ 22.12."
fi

mkdir -p "$RELEASES"

cd "$REPO"

if (( DO_PULL )); then
  say "git pull"
  git pull --ff-only
else
  warn "Bỏ qua git pull — deploy đúng code đang có ở $REPO."
fi
echo "   commit: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"

say "yarn install"
yarn install --frozen-lockfile

say "yarn build"
yarn build

say "Kiểm bundle không chứa localhost:9909"
if grep -rl 'localhost:9909' dist/client/ 2>/dev/null | head -5 | grep -q .; then
  grep -rl 'localhost:9909' dist/client/ | head -5
  die "Bundle chứa localhost:9909 — kiểm .env.production rồi build lại."
fi
echo "   sạch."

REL="$RELEASES/$(date +%Y%m%d-%H%M%S)"
say "Tạo bản phát hành $REL"

mkdir -p "$REL/dist"
cp -r dist/. "$REL/dist/"
cp -r node_modules "$REL/"
chown -R "$OWNER" "$REL"
echo "   $(du -sh "$REL" | cut -f1)"

PREVIOUS=""
if [[ -L "$CURRENT" ]]; then
  PREVIOUS="$(readlink -f "$CURRENT")"
  echo "   bản hiện tại: $PREVIOUS"
elif [[ -e "$CURRENT" ]]; then
  die "$CURRENT đang là thư mục thật, không phải symlink. Xử lý tay trước (xem README dòng 113)."
else
  warn "Chưa có $CURRENT — đây là lần phát hành đầu, sẽ không rollback được."
fi

rollback() {
  if [[ -z "$PREVIOUS" ]]; then
    warn "Không có bản trước để lùi về. Bản mới vẫn đang được trỏ tới, service có thể đang lỗi."
    return
  fi
  warn "Lùi về $PREVIOUS"
  ln -sfn "$PREVIOUS" "$CURRENT.rollback"
  mv -T "$CURRENT.rollback" "$CURRENT"
  systemctl restart "$SERVICE" || warn "restart lúc rollback cũng lỗi — kiểm journalctl -u $SERVICE"
  warn "Đã lùi. Bản lỗi còn ở $REL để xem lại."
}

say "Đổi symlink và restart $SERVICE"

ln -sfn "$REL" "$CURRENT.new"
mv -T "$CURRENT.new" "$CURRENT"

trap rollback ERR

systemctl restart "$SERVICE"

say "Kiểm service trả lời trên 127.0.0.1:$PORT"

ok=0
for _ in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)"
  if [[ "$code" == "200" ]]; then ok=1; break; fi
  sleep 1
done
(( ok )) || die "Service không trả 200 sau 30 giây (lần cuối: ${code:-không kết nối được}). Xem: journalctl -u $SERVICE -n 50"
echo "   HTTP 200."

if (( DO_VERIFY )); then
  say "Kiểm dữ liệu có cấu trúc"
  node "$REPO/scripts/check-schema.mjs" "http://127.0.0.1:$PORT"
fi

trap - ERR

say "Dọn bản cũ, giữ $KEEP bản"

current_abs="$(readlink -f "$CURRENT")"
previous_abs="${PREVIOUS:+$(readlink -f "$PREVIOUS" 2>/dev/null || echo "$PREVIOUS")}"
kept=0
while IFS= read -r dir; do
  abs="$(readlink -f "$dir")"
  if [[ "$abs" == "$current_abs" || ( -n "$previous_abs" && "$abs" == "$previous_abs" ) ]]; then
    continue
  fi
  if (( kept < KEEP )); then
    kept=$((kept + 1))
    continue
  fi
  echo "   xoá $dir"
  rm -rf "$dir"
done < <(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d | sort -r)

say "Kiểm site công khai"

missing_code="$(curl -s -o /dev/null -w '%{http_code}' -m 15 "$PUBLIC_URL/khong-ton-tai-$(date +%s)" || echo "")"
llms_type="$(curl -s -o /dev/null -w '%{content_type}' -m 15 "$PUBLIC_URL/llms.txt" || echo "")"

if [[ "$missing_code" == "200" ]]; then
  warn "URL không tồn tại trả HTTP 200 → nginx vẫn phục vụ file tĩnh."
  warn "Đổi vhost sang proxy_pass http://127.0.0.1:$PORT (README dòng 152), rồi: nginx -t && systemctl reload nginx"
elif [[ "$missing_code" == "404" ]]; then
  echo "   URL sai trả 404 — vhost đã proxy về node."
else
  warn "URL sai trả HTTP ${missing_code:-không kết nối được} — kiểm lại bằng tay."
fi

if [[ "$llms_type" != *"text/plain"* ]]; then
  warn "/llms.txt trả Content-Type '${llms_type:-không có}', đúng phải là text/plain."
else
  echo "   /llms.txt đúng text/plain."
fi

say "Xong — đang chạy $(readlink -f "$CURRENT")"
