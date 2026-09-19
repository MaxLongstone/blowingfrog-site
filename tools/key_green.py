#!/usr/bin/env python3
"""Turn a subject shot on flat green into a transparent PNG.

    python3 tools/key_green.py in.webp assets/game/po_ropes.png

Alpha comes from how much greener a pixel is than its red and blue, so the soft
edge between subject and background keeps its anti-aliasing, and the green that
bled onto the edge is removed (despilled).
"""
import sys
import numpy as np
from PIL import Image

LOW, HIGH = 28, 100      # greenness at which a pixel is fully kept / fully removed


def key(img):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)
    alpha = np.clip(1.0 - (greenness - LOW) / (HIGH - LOW), 0.0, 1.0)
    g = np.minimum(g, np.maximum(r, b))              # despill
    out = np.dstack([r, g, b, alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: key_green.py <in> <out.png>")
    out = key(Image.open(sys.argv[1]))
    out.save(sys.argv[2], optimize=True)
    px = np.asarray(out)[..., 3]
    print(f"wrote {sys.argv[2]}  {out.size}  transparent {100 * (px == 0).mean():.0f}%  kept {100 * (px == 255).mean():.0f}%")
