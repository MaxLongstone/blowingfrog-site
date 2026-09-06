// Plays the existing 283-frame explosion sequence as a full-screen interstitial.
// Falls back to a procedural flash when the frames are not loaded.
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
export function playDetonation({ frames, host, audio, onFirstFrame }) {
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
export function playEnding({ host, audio }) {
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
