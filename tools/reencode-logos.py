#!/usr/bin/env python3
"""Re-encode the PNG data URIs in partners-logos.js as lossless WebP.

The 95 baked partner logos are ~59% of the shipped bundle (measured 2026-07-29:
1.79MB of a 3.02MB file, 1.36MB of the 2.08MB wire size). Lossless WebP encodes
the same pixels in roughly a quarter of the bytes — and because it is lossless,
a partner's brand mark cannot be degraded by this tool, only shrunk. A PNG is
only replaced when its WebP is actually smaller (it always is in practice, but
the guard keeps the tool honest); SVGs are left untouched.

Run after regenerating logos, before build.sh:

    python3 tools/reencode-logos.py        # rewrites src/features/partners/partners-logos.js
    bash build.sh

test/guardrails.test.js pins the outcome: a PNG data URI reappearing in
PARTNER_LOGOS fails the suite, so a regenerated logo can't silently reinflate
the bundle. Requires Pillow (pip install Pillow) — dev-machine only, never a
runtime or build-server dependency.
"""
import base64
import io
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

SRC = Path(__file__).resolve().parent.parent / "src" / "features" / "partners" / "partners-logos.js"
PNG_URI = re.compile(r"data:image/png;base64,([A-Za-z0-9+/=]+)")

text = SRC.read_text()
before = len(text)
stats = {"converted": 0, "kept_png": 0, "png_bytes": 0, "webp_bytes": 0}


def to_webp(match: re.Match) -> str:
    png = base64.b64decode(match.group(1))
    img = Image.open(io.BytesIO(png))
    buf = io.BytesIO()
    # lossless: pixel-identical output, so brand marks are safe by construction
    img.save(buf, format="WEBP", lossless=True, quality=100, method=6)
    webp = buf.getvalue()
    if len(webp) >= len(png):  # never trade up
        stats["kept_png"] += 1
        return match.group(0)
    stats["converted"] += 1
    stats["png_bytes"] += len(png)
    stats["webp_bytes"] += len(webp)
    return "data:image/webp;base64," + base64.b64encode(webp).decode()


text = PNG_URI.sub(to_webp, text)
SRC.write_text(text)
print(
    f"converted {stats['converted']} PNGs -> lossless WebP "
    f"({stats['png_bytes']:,} -> {stats['webp_bytes']:,} decoded bytes), "
    f"kept {stats['kept_png']} PNGs that were already smaller; "
    f"file {before:,} -> {len(text):,} bytes"
)
