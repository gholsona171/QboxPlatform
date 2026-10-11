#!/usr/bin/env bash
# Installs or refreshes yt-dlp, which Music uses to search and play YouTube.
# It is the official standalone program from the yt-dlp GitHub releases, put
# in ~/.local/bin (no sudo). YouTube changes break old versions within weeks,
# so update.sh runs this on every check and it downloads at most once a day.
#
#   bash ops/oracle/ytdlp.sh           refresh when the last check is a day old
#   bash ops/oracle/ytdlp.sh --force   download now
#
# A failed download never fails the caller: this script always exits 0 and
# keeps the version that is already installed.
set -u

BIN_DIR="${HOME}/.local/bin"
BIN="${BIN_DIR}/yt-dlp"
STAMP="${BIN_DIR}/.yt-dlp-checked"
RELEASE_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download"

if [ "${1:-}" != "--force" ] && [ -x "$BIN" ] && [ -n "$(find "$STAMP" -mmin -1440 2>/dev/null)" ]; then
  exit 0
fi

case "$(uname -m)" in
  x86_64 | amd64) ASSET=yt-dlp_linux ;;
  aarch64 | arm64) ASSET=yt-dlp_linux_aarch64 ;;
  *)
    echo "yt-dlp: no standalone build for $(uname -m); YouTube stays off. Install yt-dlp yourself and set YTDLP_PATH." >&2
    exit 0
    ;;
esac

mkdir -p "$BIN_DIR" || exit 0
# Stamp first, so a failing download is tried again in an hour, not every 5 minutes.
touch -d '23 hours ago' "$STAMP" 2>/dev/null || touch "$STAMP"

TMP="$(mktemp "${BIN_DIR}/.yt-dlp.XXXXXX")" || exit 0
trap 'rm -f "$TMP"' EXIT

fail() {
  echo "Warning: could not update yt-dlp ($1). Keeping $([ -x "$BIN" ] && "$BIN" --version 2>/dev/null || echo 'no version'); trying again in an hour." >&2
  exit 0
}

curl -fsSL --retry 2 --connect-timeout 15 --max-time 180 -o "$TMP" "${RELEASE_URL}/${ASSET}" || fail "download failed"
[ -s "$TMP" ] || fail "empty download"

# The release lists a SHA-256 for every file; a download that does not match is thrown away.
EXPECTED="$(curl -fsSL --retry 2 --connect-timeout 15 --max-time 60 "${RELEASE_URL}/SHA2-256SUMS" | awk -v asset="$ASSET" '$2 == asset { print $1 }')"
[ -n "$EXPECTED" ] || fail "no checksum published"
[ "$(sha256sum "$TMP" | cut -d' ' -f1)" = "$EXPECTED" ] || fail "checksum mismatch"

chmod 755 "$TMP" || fail "chmod failed"
VERSION="$("$TMP" --version 2>/dev/null)" || fail "the download does not run on this server"
mv -f "$TMP" "$BIN" || fail "could not replace ${BIN}"
touch "$STAMP"
echo "yt-dlp ${VERSION} installed in ${BIN}"
exit 0
