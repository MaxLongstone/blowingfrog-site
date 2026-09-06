// Renders a 1080x1080 share card as a PNG blob. Square so it drops straight into
// an Instagram post; the same file works for a Story or any other feed.
import { ACHIEVEMENTS } from '../config/achievements.js';

const SIZE = 1080;
const BADGE_SRC = (id) => `assets/game/ach_${id}.png`;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function buildShareCard(ach, best = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  try { await document.fonts?.ready; } catch { /* fall back to system fonts */ }
  const badges = await Promise.all(ACHIEVEMENTS.map(a => loadImage(BADGE_SRC(a.id))));

  // ground
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const glow = ctx.createRadialGradient(SIZE / 2, 120, 40, SIZE / 2, 120, SIZE * 0.9);
  glow.addColorStop(0, 'rgba(139,148,33,0.30)');
  glow.addColorStop(1, 'rgba(139,148,33,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const disp = (w, s) => `${w} ${s}px "Barlow Condensed", "Arial Narrow", system-ui, sans-serif`;
  const body = (w, s) => `${w} ${s}px Barlow, system-ui, sans-serif`;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#aab42a';
  ctx.font = body(600, 24);
  ctx.letterSpacing = '6px';
  ctx.fillText('BLOWING FROG PRESENTS', SIZE / 2, 84);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#ffffff';
  ctx.font = disp(900, 104);
  ctx.fillText('FROGPOCALYPSE', SIZE / 2, 186);

  const got = ACHIEVEMENTS.filter(a => ach.has(a.id)).length;
  ctx.fillStyle = '#aab42a';
  ctx.font = disp(900, 58);
  ctx.fillText(`${got} OF ${ACHIEVEMENTS.length} ACHIEVEMENTS`, SIZE / 2, 258);

  // badge grid — sized so three rows plus the footer fit inside the square
  const cols = 3, cell = 226, gridW = cols * cell;
  const x0 = (SIZE - gridW) / 2, y0 = 285;
  ACHIEVEMENTS.forEach((a, i) => {
    const cx = x0 + (i % cols) * cell + cell / 2;
    const cy = y0 + Math.floor(i / cols) * cell;
    const unlocked = ach.has(a.id);

    ctx.globalAlpha = unlocked ? 1 : 0.26;
    roundRect(ctx, cx - 100, cy + 4, 200, 200, 18);
    ctx.fillStyle = unlocked ? 'rgba(139,148,33,0.16)' : 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.strokeStyle = unlocked ? 'rgba(170,180,42,0.65)' : 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 3;
    ctx.stroke();

    const img = badges[i];
    if (img) {
      ctx.drawImage(img, cx - 52, cy + 16, 104, 104);
    } else {
      ctx.font = '66px system-ui, "Apple Color Emoji", sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(a.emoji, cx, cy + 100);
    }

    ctx.fillStyle = unlocked ? '#e8e6df' : 'rgba(255,255,255,0.55)';
    ctx.font = disp(800, 20);
    const label = unlocked ? a.title : 'LOCKED';
    const words = label.split(' ');
    let line = '', lines = [];
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (ctx.measureText(next).width > 178 && line) { lines.push(line); line = w; }
      else line = next;
    }
    if (line) lines.push(line);
    lines.slice(0, 3).forEach((l, li) => ctx.fillText(l, cx, cy + 142 + li * 22));
    ctx.globalAlpha = 1;
  });

  // footer
  const fy = y0 + 3 * cell + 46;
  if (best) {
    ctx.fillStyle = '#ffffff';
    ctx.font = disp(900, 42);
    ctx.fillText(`BEST SCORE ${String(best).padStart(6, '0')}`, SIZE / 2, fy);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = body(500, 25);
  ctx.letterSpacing = '3px';
  ctx.fillText('blowingfrog.com/play', SIZE / 2, fy + 42);
  ctx.letterSpacing = '0px';

  return new Promise((resolve) => canvas.toBlob(b => resolve(b), 'image/png'));
}

// Where the card can go. Instagram has no web share endpoint, so it needs the
// image file: the native sheet handles it on a phone, a download does elsewhere.
export function socialTargets(text, url) {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  return [
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}` },
    { id: 'x',        label: 'X',        href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}` },
    { id: 'reddit',   label: 'Reddit',   href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
  ];
}

export async function shareCardNatively(blob, text, url) {
  if (!blob || !navigator.share) return false;
  try {
    const file = new File([blob], 'frogpocalypse.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text, title: 'Frogpocalypse' });
      return true;
    }
    await navigator.share({ text, url, title: 'Frogpocalypse' });
    return true;
  } catch { return false; }
}

export function downloadCard(blob, name = 'frogpocalypse-achievements.png') {
  if (!blob) return;
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}
