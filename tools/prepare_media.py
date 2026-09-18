#!/usr/bin/env python3
"""Bring the finished audio, cutscenes and boss posters into the repo.

    python3 tools/prepare_media.py                 # everything
    python3 tools/prepare_media.py sfx cutscenes   # just those groups

Source folder defaults to the Desktop drop folder; override with --src.

  voice      copied as-is                      -> assets/voice/
  music      copied as-is (already levelled)   -> assets/music/
  sfx        trimmed to the real sound, faded, levelled, mono mp3 -> assets/sfx/
  cutscenes  re-encoded smaller, audio kept, faststart -> assets/cutscenes/ (+ manifest.json)
  posters    cropped-in-place JPEGs            -> assets/splash/splash_<boss>.jpg

The SFX pass exists because the generated files are 1-4.5s long even for a
0.2s hop, with extra bursts tacked on and wildly different loudness. Frequent
sounds have to stay short and sit at a sensible level, so each one keeps only
its first real event (capped per sound) and is levelled to a per-sound target.
Levels are set by measurement, not by ear -- audition them once.
"""
import argparse, array, json, math, shutil, subprocess, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SRC = Path.home() / "Desktop/Blowing Frog/Web Blowing Frog/game"
SR = 44100

# name -> (seconds to keep at most, target RMS in dBFS). None = keep the natural length.
SFX = {
    "hop": (0.30, -25), "tick": (0.16, -29), "tongue": (0.40, -24), "eat": (0.50, -23),
    "food": (0.40, -25), "warn": (0.55, -26), "hit": (0.80, -19), "squash": (0.70, -21),
    "boom": (None, -17), "roar": (1.25, -19), "win": (1.60, -21), "lose": (1.60, -21),
    # cutscene one-shots keep their natural length
    "glass_shatter": (None, -20), "broadcast_squeal": (1.4, -22), "rising_drone": (None, -27),
    "comedic_clatter": (2.2, -22), "electrical_overload": (None, -20),
}

POSTERS = {  # keyword in the source filename -> boss id
    "chaco": "chaco", "landlord": "landlord", "neco": "neco", "narrator": "narrator",
    "sack": "sackman", "umma": "umma", "probe": "probe",
}


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, **kw)


def decode_mono(path):
    raw = run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"]).stdout
    a = array.array("h"); a.frombytes(raw)
    return a


def rms_db(samples):
    if not samples: return -120.0
    return 20 * math.log10(max(math.sqrt(sum(x * x for x in samples) / len(samples)) / 32768, 1e-9))


def onset_index(a, win=110):
    peak = max((abs(x) for x in a), default=1)
    thr = peak * 0.03
    for i in range(0, len(a), win):
        if max(abs(x) for x in a[i:i + win]) > thr: return i
    return 0


def last_active_index(a, win=441):
    peak = max((abs(x) for x in a), default=1)
    thr = peak * 0.012
    last = len(a)
    for i in range(len(a) - win, -1, -win):
        if max(abs(x) for x in a[i:i + win]) > thr: return min(len(a), i + win * 3)
    return last


def encode_mp3(samples, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "96k", str(out)], input=samples.tobytes(), check=True)


def do_sfx(src, dst):
    dst.mkdir(parents=True, exist_ok=True)
    for name, (keep, target) in SFX.items():
        f = next(iter(sorted(src.glob(f"sfx_{name}.*"))), None)
        if not f: print(f"  !  sfx_{name}: not found"); continue
        a = decode_mono(f)
        start = onset_index(a)
        a = a[max(0, start - 44):]                       # 1ms of lead-in
        end = int(keep * SR) if keep else last_active_index(a)
        a = a[:min(end, len(a))]
        n = len(a); fi = min(88, n // 4); fo = min(int(0.06 * SR), n // 3)
        for i in range(fi): a[i] = int(a[i] * i / fi)
        for i in range(fo): a[n - 1 - i] = int(a[n - 1 - i] * i / fo)
        gain = 10 ** ((target - rms_db(a)) / 20)
        peak = max((abs(x) for x in a), default=1)
        gain = min(gain, 0.89 * 32768 / peak)            # never clip: ~ -1 dBFS ceiling
        a = array.array("h", (max(-32768, min(32767, int(x * gain))) for x in a))
        encode_mp3(a, dst / f"sfx_{name}.mp3")
        print(f"  ok sfx_{name}.mp3  {n / SR:4.2f}s  rms {rms_db(a):5.1f} dBFS  peak {max(abs(x) for x in a) / 32768:.2f}")


def do_copy(files, dst, label):
    dst.mkdir(parents=True, exist_ok=True)
    n = 0
    for f in sorted(files):
        shutil.copy2(f, dst / f.name); n += 1
    print(f"  ok {label}: {n} files -> {dst.relative_to(ROOT)}")


def probe_dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).stdout)


def loudest_second(p):
    """When the clip's own sound peaks -- used to line a layered SFX up with the impact."""
    a = decode_mono(p); win = SR // 10
    best, at = -1, 0.0
    for i in range(0, len(a) - win, win):
        e = sum(x * x for x in a[i:i + win])
        if e > best: best, at = e, i / SR
    return round(at, 2)


def do_cutscenes(src, dst):
    dst.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for f in sorted(src.glob("cutscene_*.mp4")):
        out = dst / f.name
        run(["ffmpeg", "-v", "error", "-y", "-i", str(f), "-c:v", "libx264", "-crf", "27", "-preset", "slow",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "96k", str(out)])
        manifest[f.stem] = {"duration": round(probe_dur(out), 2), "peak": loudest_second(out)}
        print(f"  ok {f.name}  {f.stat().st_size / 1e6:4.1f}MB -> {out.stat().st_size / 1e6:4.1f}MB  peak@{manifest[f.stem]['peak']}s")
    (dst / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


def do_posters(src, dst):
    from PIL import Image
    dst.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.glob("*.png")):
        key = unicodedata.normalize("NFC", f.name).lower()
        boss = next((b for k, b in POSTERS.items() if k in key), None)
        if not boss: print(f"  !  {f.name}: no boss matched, skipped"); continue
        out = dst / f"splash_{boss}.jpg"
        Image.open(f).convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)
        print(f"  ok {out.name}  {f.stat().st_size / 1e6:4.1f}MB -> {out.stat().st_size / 1e3:4.0f}KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("groups", nargs="*", default=["voice", "music", "sfx", "cutscenes", "posters"])
    ap.add_argument("--src", type=Path, default=DEFAULT_SRC)
    args = ap.parse_args()
    s = args.src
    voice_dir = s / "Frogpocalypse-Voice"
    a = ROOT / "assets"
    for g in args.groups:
        print(f"[{g}]")
        if g == "voice": do_copy(voice_dir.glob("voice_*.mp3"), a / "voice", "voice")
        elif g == "music": do_copy((voice_dir / "music").glob("music_*.mp3"), a / "music", "music")
        elif g == "sfx": do_sfx(voice_dir, a / "sfx")
        elif g == "cutscenes": do_cutscenes(s / "cutscenes", a / "cutscenes")
        elif g == "posters": do_posters(s / "Posters", a / "splash")
        else: sys.exit(f"unknown group {g}")


if __name__ == "__main__":
    main()
