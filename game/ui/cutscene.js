// Full-screen cutscenes. In the painted 2026 mode each one is a generated video
// clip (with its own audio); if a clip is missing, slow to load, or the mode is
// ATARI, the original versions below take over: the 283-frame explosion
// sequence (falling back to a procedural flash) and a canvas-drawn ending.
import { url, cutsceneDetonation, cutsceneBossDefeat, CUTSCENE_ENDING, CUTSCENE_TITLE, DEFEAT_SFX, LEVELS } from '../config/media.js';

const FRAME_DIR = 'assets/contact-hero-frames/';
const FRAME_COUNT = 283;
const STEP = 3;                       // use every 3rd frame -> ~94 frames
const FPS = 34;

export function preloadFrames(onProgress) {
  const idx = [];
  for (let i = 0; i < FRAME_COUNT; i += STEP) idx.push(i);
  let done = 0;
  return Promise.all(idx.map(i => new Promise((resolve) => {
    const img = new Image();
    const finish = () => { done++; onProgress?.(done / idx.length); resolve(img.naturalWidth ? img : null); };
    img.onload = finish;
    img.onerror = finish;
    img.src = `${FRAME_DIR}ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
  }))).then(list => list.filter(Boolean));
}

// Draws frames to a 2D canvas sized to the game viewport.
function playDetonationFrames({ frames, host, audio, onFirstFrame }) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'bf-cutscene';
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      const r = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
    };
    host.append(canvas);
    fit();
    onFirstFrame?.();
    audio?.boom();

    const usable = frames && frames.length >= 40;
    const start = performance.now();
    const total = usable ? frames.length / FPS : 1.5;

    const cover = (img) => {
      const cw = canvas.width, ch = canvas.height;
      const iw = img.naturalWidth || 1920, ih = img.naturalHeight || 1080;
      const s = Math.max(cw / iw, ch / ih);
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
    };

    const tick = (now) => {
      const t = (now - start) / 1000;
      if (usable) {
        const i = Math.min(frames.length - 1, Math.floor(t * FPS));
        cover(frames[i]);
      } else {
        const k = Math.max(0, 1 - t / total);
        ctx.fillStyle = `rgba(${255},${200 + 55 * (1 - k)},${120 * k},${k})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(0,0,0,${1 - k})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (t < total) requestAnimationFrame(tick);
      else {
        canvas.classList.add('out');
        setTimeout(() => { canvas.remove(); resolve(); }, 320);
      }
    };
    requestAnimationFrame(tick);
  });
}

// The final "sit on the Earth" beat. Pure canvas, no frames needed.
function playEndingCanvas({ host, audio }) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'bf-cutscene';
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = host.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
    host.append(canvas);
    audio?.roar();

    const W = canvas.width, H = canvas.height, DUR = 6.2;
    const start = performance.now();
    let boomed = false;

    const frogShape = (cx, cy, s, squash = 0) => {
      const sx = s * (1 + squash * 0.5), sy = s * (1 - squash * 0.55);
      ctx.fillStyle = '#b9c44a'; ctx.strokeStyle = '#1c1c1a'; ctx.lineWidth = Math.max(2, s * 0.05);
      ctx.beginPath(); ctx.ellipse(cx, cy, sx, sy, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#efe6c9';
      ctx.beginPath(); ctx.ellipse(cx, cy + sy * 0.28, sx * 0.62, sy * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      for (const d of [-1, 1]) {
        ctx.fillStyle = '#b9c44a';
        ctx.beginPath(); ctx.arc(cx + d * sx * 0.44, cy - sy * 0.62, s * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx + d * sx * 0.44, cy - sy * 0.62, s * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#232323';
        ctx.beginPath(); ctx.arc(cx + d * sx * 0.46, cy - sy * 0.62, s * 0.1, 0, Math.PI * 2); ctx.fill();
      }
    };
    const earth = (cx, cy, rad, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#2f6fb5';
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4f9a3c';
      for (const [ox, oy, rr] of [[-0.3, -0.2, 0.34], [0.25, 0.1, 0.4], [0.1, -0.5, 0.22], [-0.45, 0.4, 0.26]]) {
        ctx.beginPath(); ctx.ellipse(cx + ox * rad, cy + oy * rad, rr * rad, rr * rad * 0.7, 0.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(140,200,255,0.5)'; ctx.lineWidth = rad * 0.06;
      ctx.beginPath(); ctx.arc(cx, cy, rad * 1.03, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    };
    const stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2 + 0.5 }));

    const tick = (now) => {
      const t = Math.min(DUR, (now - start) / 1000);
      ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      for (const s of stars) { ctx.globalAlpha = 0.35 + Math.sin(t * 2 + s.x) * 0.25; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;

      const cx = W / 2;
      if (t < 2.6) {                                  // frog descends toward Earth
        const k = t / 2.6;
        earth(cx, H * 0.72, H * 0.2);
        frogShape(cx, H * (0.16 + k * 0.3), H * (0.1 + k * 0.06));
      } else if (t < 3.4) {                           // impact
        if (!boomed) { audio?.boom(); boomed = true; }
        const k = (t - 2.6) / 0.8;
        earth(cx, H * 0.72, H * 0.2 * (1 - k * 0.25), 1 - k * 0.3);
        frogShape(cx, H * (0.46 + k * 0.18), H * (0.16 + k * 0.05), k);
        ctx.fillStyle = `rgba(255,220,140,${0.5 * (1 - k)})`; ctx.fillRect(0, 0, W, H);
      } else if (t < 4.4) {                           // debris and dust
        const k = (t - 3.4) / 1.0;
        frogShape(cx, H * 0.64, H * 0.21, 1);
        ctx.fillStyle = `rgba(120,120,130,${0.5 * (1 - k)})`;
        for (let i = 0; i < 40; i++) {
          const a = i * 0.7, rad = H * (0.12 + k * 0.5) * (0.6 + (i % 5) * 0.1);
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rad, H * 0.72 + Math.sin(a) * rad * 0.4, 6 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill();
        }
      } else {                                        // fade to THE END
        const k = Math.min(1, (t - 4.4) / 1.2);
        frogShape(cx, H * 0.64, H * 0.21, 1);
        ctx.fillStyle = `rgba(5,6,10,${k})`; ctx.fillRect(0, 0, W, H);
        if (k > 0.55) {
          ctx.globalAlpha = (k - 0.55) / 0.45;
          ctx.fillStyle = '#f4f2ec';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = `900 ${Math.round(H * 0.11)}px "Barlow Condensed", system-ui, sans-serif`;
          ctx.fillText('THE END', cx, H * 0.5);
          ctx.globalAlpha = 1;
        }
      }
      if (t < DUR) requestAnimationFrame(tick);
      else { canvas.classList.add('out'); setTimeout(() => { canvas.remove(); resolve(); }, 400); }
    };
    requestAnimationFrame(tick);
  });
}


// ---------------------------------------------------------------------------
// Video cutscenes
// ---------------------------------------------------------------------------

let manifestPromise = null;
// Per-clip facts measured at import time (duration, when its own audio peaks).
const clipManifest = () => (manifestPromise ||= fetch(url.cutsceneManifest())
  .then((r) => (r.ok ? r.json() : {})).catch(() => ({})));

// Warm the browser cache so a clip starts instantly when its moment arrives.
export function prefetchCutscene(id) { fetch(url.cutscene(id)).catch(() => {}); }

// Plays one clip full-frame and resolves 'ended', 'skipped' or 'failed'. On
// 'failed' nothing was shown, so the caller can fall back to the old version.
// The clip is shown whole (letterboxed): the game area is portrait and the
// clips are 16:9, so filling the frame would throw away most of the picture.
export function playVideo({ host, id, audio, sfx = null, readyTimeout = 3500 }) {
  return new Promise(async (resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'bf-cutscene bf-cutscene-video';
    const video = document.createElement('video');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.volume = LEVELS.cutscene;
    video.muted = !!audio?.muted;
    video.src = url.cutscene(id);
    wrap.append(video);
    host.append(wrap);

    const timers = [];
    let done = false;
    const finish = (how) => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      window.removeEventListener('pointerdown', onSkip);
      window.removeEventListener('keydown', onSkip);
      video.pause();
      if (how === 'failed') { wrap.remove(); resolve(how); return; }
      wrap.classList.add('out');
      setTimeout(() => { wrap.remove(); resolve(how); }, 300);
    };
    const onSkip = () => finish('skipped');

    const ready = await new Promise((res) => {
      // iOS won't buffer until play() is called, so metadata alone counts as ready.
      video.addEventListener('loadedmetadata', () => res(true), { once: true });
      video.addEventListener('canplay', () => res(true), { once: true });
      video.addEventListener('error', () => res(false), { once: true });
      timers.push(setTimeout(() => res(false), readyTimeout));
    });
    if (done) return;
    if (!ready) { finish('failed'); return; }

    try { await video.play(); }
    catch {
      // Unmuted playback can be refused; the picture is still worth showing.
      video.muted = true;
      try { await video.play(); } catch { finish('failed'); return; }
    }

    if (sfx) {
      const manifest = await clipManifest();
      const at = sfx.at === 'peak' ? Math.max(0, (manifest[id]?.peak ?? 0) - 0.05) : sfx.at;
      timers.push(setTimeout(() => audio?.playSfx(sfx.name, { gain: 0.6 }), at * 1000));
    }
    video.addEventListener('ended', () => finish('ended'), { once: true });
    // A moment before skip is honoured, so a stray double-tap can't eat the scene.
    timers.push(setTimeout(() => {
      window.addEventListener('pointerdown', onSkip);
      window.addEventListener('keydown', onSkip);
    }, 700));
    timers.push(setTimeout(() => finish('ended'), ((video.duration || 8) + 2) * 1000));
  });
}

// After every regular stage. `painted` is false in ATARI mode.
export async function playDetonation(opts) {
  const { host, audio, stageId, painted } = opts;
  if (painted && stageId != null) {
    audio?.stopMusic({ fade: 0.4 });
    const how = await playVideo({ host, id: cutsceneDetonation(stageId), audio });
    if (how !== 'failed') return;
  }
  return playDetonationFrames(opts);
}

// The true ending, once ever per run.
export async function playEnding(opts) {
  const { host, audio, painted } = opts;
  if (painted) {
    audio?.stopMusic({ fade: 0.6 });
    const how = await playVideo({ host, id: CUTSCENE_ENDING, audio });
    if (how !== 'failed') return;
  }
  return playEndingCanvas(opts);
}

// A boss going down. Resolves false when there was no clip to show, so the
// caller knows nothing played (ATARI mode, or the file is missing).
export async function playBossDefeat({ host, audio, bossId, painted }) {
  if (!painted) return false;
  audio?.stopMusic({ fade: 0.5 });
  const how = await playVideo({ host, id: cutsceneBossDefeat(bossId), audio, sfx: DEFEAT_SFX[bossId] || null });
  return how !== 'failed';
}

// The opening: the frog growing through every form, once per visit.
export async function playOpening({ host, audio, painted }) {
  if (!painted) return false;
  audio?.stopMusic({ fade: 0.5 });
  const how = await playVideo({ host, id: CUTSCENE_TITLE, audio });
  return how !== 'failed';
}
