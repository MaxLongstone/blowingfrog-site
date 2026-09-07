#!/usr/bin/env python3
"""Cut a generated sprite sheet into individual transparent PNGs.

    python3 tools/slice_sheet.py A ~/Downloads/sheet-a.png

Sheets are defined below and must match the reading order in
docs/game-sprite-prompts.md (left to right, top row first).

Background removal floods in from each cell's edges only, so white *inside*
a sprite (the frog's eyes, a chef's hat) is preserved.
"""
import json
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "game"
MANIFEST = OUT_DIR / "manifest.json"

SHEETS = {
    "A": (3, 3, ["frog_s1", "frog_s2", "frog_s3", "frog_s4", "frog_k1",
                 "frog_k2", "frog_k3", "frog_k4", "frog_k5"]),
    "B": (3, 3, ["robotaxi", "foodtruck", "semi", "police", "drone",
                 "newsdrone", "heli", "jet", "bomber"]),
    "C": (3, 3, ["tank", "swattervan", "tubeman", "chef", "flymech",
                 "liberty", "kraken", "duck", "carrier"]),
    "D": (3, 3, ["heron", "hurricane", "moon", "station", "alienship",
                 "dynamite", "mine", "tanker", "gasstation"]),
    "E": (3, 3, ["propane", "silo", "volcano", "sub", "oilrig",
                 "nukesilo", "missile", "bomb", "cruise"]),
    # The generator repeated the final row, so the last three cells are ignored.
    "F": (3, 3, ["pw_invuln", "pw_freeze", "pw_fire", "pw_armor", "pw_life", "food",
                 None, None, None]),
    "G": (3, 3, ["torpedo", "nuke", "bullet", "strafe", "fork",
                 "jetlaunch", "laser", "hand", "flare"]),
    "H": (3, 3, ["ach_sentient", "ach_piggy", "ach_wing", "ach_breach", "ach_pest",
                 "ach_revolting", "ach_untouched", "ach_daddy", "ach_unavailable"]),
    # Boss one: Chaco the Narco Chupacabra
    "I": (3, 3, ["chaco_idle", "chaco_tell_jab", "chaco_jab", "chaco_tell_hay", "chaco_hay",
                 "chaco_chupada", "chaco_stunned", "chaco_polvo", "chaco_down"]),
    "J": (3, 3, ["chaco_intro", "chaco_taunt", "chaco_hurt", "chaco_stagger", "chaco_belt",
                 "chaco_berserk", "chaco_rage", "chaco_dead", "chaco_win"]),
    "L": (3, 3, ["boxfrog_guard", "boxfrog_left", "boxfrog_right", "boxfrog_duck",
                 "boxfrog_tongue", "boxfrog_eat", "boxfrog_hurt", "boxfrog_down", "boxfrog_win"]),
    # Boss two: the Landlord
    "M": (3, 3, ["landlord_idle", "landlord_lift", "landlord_throw", "landlord_notes",
                 "landlord_fling", "landlord_heft", "landlord_valve", "landlord_sit", "landlord_end"]),
    "N": (3, 3, ["climb_plank", "climb_plank_rot", "boss_boiler", "boss_radiator",
                 "boss_notice", "boss_box", "climb_scaffold", "climb_dish", "climb_ac"]),
    "O": (3, 3, ["climbfrog_hold", "climbfrog_up", "climbfrog_left", "climbfrog_right",
                 "climbfrog_catch", "climbfrog_punch", "climbfrog_hurt", "climbfrog_fall",
                 "climbfrog_top"]),
    "K": (3, 3, ["ring_canvas", "ring_fence", "ring_light", "ring_crowd", "boss_dynamite",
                 "boss_bag", "boss_belt", "ring_post", "boss_stars"]),
}

WHITE_CUTOFF = 234   # a pixel this bright in every channel counts as background
PAD = 6              # transparent pixels kept around each trimmed sprite
INSET = 14           # trimmed off each cell edge, so printed grid rules never survive
# Some sheets place each subject on a white card over a tinted background. The
# flood has to start on the card, not the gutter, so those need a deeper inset.
INSETS = {"E": 44}


def drop_background(cell):
    """Flood transparency in from the borders. Interior white survives."""
    cell = cell.convert("RGBA")
    w, h = cell.size
    px = cell.load()
    seen = bytearray(w * h)
    queue = deque()

    def maybe_push(x, y):
        i = y * w + x
        if seen[i]:
            return
        r, g, b, _ = px[x, y]
        if r >= WHITE_CUTOFF and g >= WHITE_CUTOFF and b >= WHITE_CUTOFF:
            seen[i] = 1
            queue.append((x, y))

    for x in range(w):
        maybe_push(x, 0)
        maybe_push(x, h - 1)
    for y in range(h):
        maybe_push(0, y)
        maybe_push(w - 1, y)

    while queue:
        x, y = queue.popleft()
        px[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                maybe_push(nx, ny)
    return cell


def trim(cell):
    box = cell.getbbox()
    if not box:
        return None
    left, top, right, bottom = box
    return cell.crop((max(0, left - PAD), max(0, top - PAD),
                      min(cell.width, right + PAD), min(cell.height, bottom + PAD)))


def update_manifest(names):
    data = {"note": "", "sprites": []}
    if MANIFEST.exists():
        data = json.loads(MANIFEST.read_text())
    data.setdefault("note", "Kinds listed here load assets/game/<kind>.png instead of the built-in drawing.")
    have = set(data.get("sprites", []))
    data["sprites"] = sorted(have | set(names))
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n")
    return len(data["sprites"])


def main():
    if len(sys.argv) != 3 or sys.argv[1].upper() not in SHEETS:
        sys.exit(f"usage: python3 {Path(__file__).name} <{'|'.join(SHEETS)}> <sheet.png>")

    key = sys.argv[1].upper()
    cols, rows, names = SHEETS[key]
    inset = INSETS.get(key, INSET)
    sheet = Image.open(sys.argv[2]).convert("RGBA")
    cw, ch = sheet.width // cols, sheet.height // rows
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    written = []
    for i, name in enumerate(names):
        if not name:
            continue                     # duplicate or blank cell
        cx, cy = (i % cols) * cw, (i // cols) * ch
        box = (cx + inset, cy + inset, cx + cw - inset, cy + ch - inset)
        sprite = trim(drop_background(sheet.crop(box)))
        if sprite is None:
            print(f"  !  {name}: cell came out empty, skipped")
            continue
        sprite.save(OUT_DIR / f"{name}.png")
        written.append(name)
        print(f"  ok {name}.png  {sprite.width}x{sprite.height}")

    total = update_manifest(written)
    print(f"\nSheet {key}: wrote {len(written)}/{len(names)} sprites. Manifest now lists {total}.")


if __name__ == "__main__":
    main()
