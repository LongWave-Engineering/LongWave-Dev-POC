#!/usr/bin/env bash
#
# build.sh — concatenate the per-feature source files in src/ back into the
# single, self-contained longwave-dev.html that you can double-click to open.
#
# Source layout:
#   src/html/*.html   page structure, split one file per section
#   src/css/*.css     styles, split one file per feature (loaded in name order)
#   src/js/*.js        app logic, one IIFE split into parts (loaded in name order)
#   src/data/*.js      generated HRMOS job data (window.__HRMOS_DATA__)
#
# The CSS/JS files are concatenated in filename order, which is why each is
# numbered (01-, 02-, ...). Run:  ./build.sh
#
set -euo pipefail
cd "$(dirname "$0")"

OUT="longwave-dev.html"

{
  cat src/html/00-head.html
  printf '<style>\n'
  for f in src/css/*.css; do cat "$f"; done
  printf '</style>\n\n</head>\n<body>\n\n'

  cat src/html/10-header.html
  cat src/html/20-page-home.html
  cat src/html/30-page-jobs.html
  cat src/html/40-page-companies.html
  cat src/html/50-page-articles.html
  cat src/html/60-page-post.html
  cat src/html/70-page-cv.html
  cat src/html/80-footer.html
  cat src/html/90-modals.html

  printf '<script>\n'
  cat src/data/hrmos-data.js
  printf '</script>\n\n\n<script>\n'
  for f in src/js/*.js; do cat "$f"; done
  printf '</script>\n\n</body>\n</html>\n'
} > "$OUT"

echo "built $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
