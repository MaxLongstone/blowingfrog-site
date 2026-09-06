// Builds a texture for every sprite kind. A PNG at assets/game/<kind>.png wins;
// otherwise the procedural drawing is rendered once into a RenderTexture.
import { SPRITES, CELL } from '../config/sprites.js';

// Painted PNGs come in at whatever size they were generated. Procedural textures
// are already drawn at their true footprint, so only overrides need fitting.
const BLEED = 1.18;   // outlines and glows are allowed a little past the cell

const PNG_DIR = 'assets/game/';
const SUPERSAMPLE = 2;

function drawToTexture(app, kind, def) {
  const g = new PIXI.Graphics();
  const W = def.w * CELL, H = def.h * CELL;
  try {
    def.draw(g, W, H);
  } catch (err) {
    console.warn(`[bf] sprite ${kind} draw failed`, err);
    g.clear().roundRect(-W / 2, -H / 2, W, H, 6).fill(0xff00ff);
  }
  // resolution handles the supersample: the texture keeps its logical size (W+pad*2)
  // while storing SUPERSAMPLE times the pixels, so sprites draw at the intended scale.
  const pad = 12;
  const tex = PIXI.RenderTexture.create({
    width: W + pad * 2,
    height: H + pad * 2,
    resolution: SUPERSAMPLE,
    antialias: true,
  });
  const wrap = new PIXI.Container();
  wrap.addChild(g);
  wrap.position.set(W / 2 + pad, H / 2 + pad);
  app.renderer.render({ container: wrap, target: tex });
  wrap.destroy({ children: true });
  return tex;
}

function loadPng(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Only kinds listed in assets/game/manifest.json are fetched, so a fresh install
// makes zero failed requests. Drop a PNG in and add its kind to the list to override.
async function readManifest() {
  try {
    const res = await fetch(`${PNG_DIR}manifest.json`, { cache: 'no-cache' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.sprites) ? json.sprites : [];
  } catch (e) {
    return [];
  }
}

export async function loadSprites(app, { usePng = true } = {}) {
  const map = new Map();
  const scales = new Map();
  const kinds = Object.keys(SPRITES);
  const overrides = usePng ? await readManifest() : [];
  const wanted = kinds.filter(k => overrides.includes(k));
  const loaded = new Map(await Promise.all(wanted.map(async k => [k, await loadPng(`${PNG_DIR}${k}.png`)])));
  if (wanted.length) console.info(`[bf] art overrides: ${wanted.length}`);

  kinds.forEach((kind) => {
    const def = SPRITES[kind];
    const img = loaded.get(kind);
    if (img) {
      try {
        const tex = PIXI.Texture.from(img);
        map.set(kind, tex);
        // Fit the painted art inside the footprint the game expects, keeping aspect.
        const targetW = def.w * CELL * BLEED, targetH = def.h * CELL * BLEED;
        scales.set(kind, Math.min(targetW / tex.width, targetH / tex.height));
        return;
      } catch (e) { /* fall through to the drawing */ }
    }
    map.set(kind, drawToTexture(app, kind, def));
    scales.set(kind, 1);
  });

  const missing = new Set();
  return {
    overrideCount: wanted.length,
    // Multiplier that brings a texture to its intended on-grid size.
    scaleFor(kind) { return scales.get(kind) ?? 1; },
    get(kind) {
      const t = map.get(kind);
      if (!t) {
        if (!missing.has(kind)) { console.warn(`[bf] no sprite for "${kind}"`); missing.add(kind); }
        return PIXI.Texture.WHITE;
      }
      return t;
    },
    has: (kind) => map.has(kind),
    size: map.size,
  };
}
