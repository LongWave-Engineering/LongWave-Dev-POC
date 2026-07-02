#!/usr/bin/env bash
#
# build.sh — assemble the single, self-contained, double-clickable longwave-dev.html
# from the per-feature source under src/.
#
# Layout:
#   src/core/                shared foundation (tokens, layout, router, i18n, data, pure logic)
#   src/features/<feature>/  one folder per feature: its .html / .css / .js live together
#
# Files are concatenated in the order of the manifests below — CSS order = cascade order,
# JS order = load order inside one shared IIFE (core/intro.js opens it, core/outro.js closes).
# Edit the source files, not the generated longwave-dev.html. Run:  ./build.sh
#
set -euo pipefail
cd "$(dirname "$0")"
OUT="longwave-dev.html"

# ---- CSS (cascade order) ----
CSS=(
  src/core/fonts.css
  src/core/base.css
  src/core/buttons.css
  src/features/header/header.css
  src/core/layout.css
  src/features/home/home.css
  src/features/jobs/jobs.css
  src/features/companies/companies.css
  src/features/partners/partners.css
  src/features/testimonials/testimonials.css
  src/features/articles/articles.css
  src/features/home/home-cta.css
  src/features/footer/footer.css
  src/features/modals/modals.css
  src/core/motion.css
  src/features/waves/waves.css
  src/features/cv/cv.css
  src/features/privacy/privacy.css
  src/core/responsive.css
)

# ---- body markup (document order) ----
BODY=(
  src/features/header/header.html
  src/features/home/home.html
  src/features/jobs/jobs.html
  src/features/companies/companies.html
  src/features/articles/articles.html
  src/features/post/post.html
  src/features/cv/cv.html
  src/features/privacy/privacy.html
  src/features/footer/footer.html
  src/features/modals/modals.html
)

# ---- app JS (load order; one shared IIFE) ----
JS=(
  src/core/intro.js
  src/core/logic.js
  src/core/data.js
  src/core/i18n-data.js
  src/core/i18n.js
  src/features/jobs/jobs.js
  src/features/home/home.js
  src/features/companies/companies.js
  src/features/partners/partners-logos.js
  src/features/partners/partners.js
  src/features/articles/articles.js
  src/features/privacy/privacy.js
  src/features/testimonials/testimonials.js
  src/features/modals/modals.js
  src/core/app.js
  src/features/cv/cv.js
  src/core/init.js
  src/core/outro.js
)

# Pre-flight: fail loudly BEFORE writing anything if a manifest references a missing file,
# so a typo/rename can't leave a truncated bundle behind.
for f in "${CSS[@]}" "${BODY[@]}" "${JS[@]}"; do
  [ -f "$f" ] || { echo "build.sh: missing source file listed in a manifest: $f" >&2; exit 1; }
done

# Build atomically: assemble into a temp file and move into place only on full success, so a
# mid-stream failure can never truncate/corrupt the committed, double-clickable bundle.
TMP="$(mktemp "${OUT}.XXXXXX")"
trap 'rm -f "$TMP"' EXIT
{
  cat src/core/head.html
  printf '<style>\n'
  for f in "${CSS[@]}"; do cat "$f"; done
  printf '</style>\n\n</head>\n<body>\n\n'

  for f in "${BODY[@]}"; do cat "$f"; done

  # The private HRMOS roster (real client jobs) is NOT bundled into the public site —
  # it lives backend-only (backend/data/hrmos-data.js, gitignored) and is served via /api
  # when the site runs against the backend. The public/offline file ships the curated demo
  # set in src/core/data.js instead.
  printf '<script>\n'
  for f in "${JS[@]}"; do cat "$f"; done
  printf '</script>\n\n</body>\n</html>\n'
} > "$TMP"
mv "$TMP" "$OUT"
trap - EXIT

echo "built $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
