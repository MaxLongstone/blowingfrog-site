// One environmental hazard per stage that leads into a boss -- thrown in at
// random, meant to make that crossing harder, never fatal on its own to read.
// Each class below only needs update(dt) and, where it draws, its own Graphics
// layer parented onto play.world so it rides along with the camera shake.
import { ENV } from '../config/envfx.js';
import { makeRng } from '../core/rng.js';

const CELL = 64;

// Painted art for the hazards. Each hazard keeps its plain-shape drawing as a
// fallback: put() returns false when a kind has no painted sprite installed, so
// the caller draws the old shapes instead.
class Pool {
  constructor(play) {
    this.tex = play.tex;
    this.c = new PIXI.Container();
    play.world.addChild(this.c);
    this.items = []; this.n = 0;
  }
  begin() { this.n = 0; }
  put(kind, x, y, w, { rot = 0, alpha = 1, flip = false } = {}) {
    if (!this.tex?.painted?.(kind)) return false;
    let s = this.items[this.n];
    if (!s) { s = new PIXI.Sprite(); s.anchor.set(0.5); this.c.addChild(s); this.items[this.n] = s; }
    const t = this.tex.get(kind), k = w / t.width;
    s.texture = t; s.scale.set(k * (flip ? -1 : 1), k);
    s.x = x; s.y = y; s.rotation = rot; s.alpha = alpha; s.visible = true;
    this.n++;
    return true;
  }
  end() { for (let i = this.n; i < this.items.length; i++) this.items[i].visible = false; }
}

export const BLAST_RADIUS = 1.7;            // in cells
export function inBlast(blast, frog, radius = BLAST_RADIUS) {
  return Math.hypot(blast.x - frog.x, blast.y - frog.y) < radius * CELL;
}
// Opacity of the powder at t seconds after the blast: a quick whiteout, a hold, a slow fade.
export function powderAlpha(t, { rise = 0.5, hold = 3, fade = 3.4, peak = 0.92 } = {}) {
  if (t < 0 || t > rise + hold + fade) return 0;
  if (t < rise) return peak * (t / rise);
  if (t < rise + hold) return peak;
  return peak * (1 - (t - rise - hold) / fade);
}

class PowderDrop {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.W = play.grid.cols * CELL; this.H = play.grid.rows * CELL;
    this.g = new PIXI.Graphics();
    play.world.addChild(this.g);             // on top of everything else in the world
    this.pool = new Pool(play);
    this.drops = 1 + (this.rng() < 0.5 ? 1 : 0);
    this.state = 'wait';
    this.timer = this.rng.range(14, 30);
    this.cloudT = -1;
    this.blobs = Array.from({ length: 16 }, () => ({ x: this.rng() * this.W, y: this.rng() * this.H, r: 90 + this.rng() * 150, s: 10 + this.rng() * 30 }));
  }

  startPass() {
    this.state = 'plane';
    this.dir = this.rng() < 0.5 ? 1 : -1;
    this.px = this.dir > 0 ? -140 : this.W + 140;
    this.py = CELL * 0.9;
    this.dropAt = this.W * (0.3 + this.rng() * 0.4);
    this.dropped = false;
    this.play.emit('envCue', { boss: this.boss });        // the boss says its line
  }

  update(dt) {
    const p = this.play;
    if (this.state === 'wait') {
      this.timer -= dt;
      if (this.timer <= 0) this.startPass();
    } else if (this.state === 'plane') {
      this.px += this.dir * (this.W / 4.2) * dt;
      if (!this.dropped && (this.dir > 0 ? this.px >= this.dropAt : this.px <= this.dropAt)) {
        this.dropped = true;
        const ty = CELL * (5 + Math.floor(this.rng() * 6)) + CELL / 2;
        this.pkg = { x: this.px, y: this.py + 20, vy: 0, ty };
        this.state = 'fall';
        p.audio.warn();
        p.hud.say('INCOMING', 1000);
      }
      if (this.px < -200 || this.px > this.W + 200) this.state = 'wait';
    } else if (this.state === 'fall') {
      this.px += this.dir * (this.W / 4.2) * dt;               // the plane keeps going
      const k = this.pkg;
      k.vy += 620 * dt; k.y += k.vy * dt;
      if (k.y >= k.ty) this.explode(k);
    }
    if (this.cloudT >= 0) {
      this.cloudT += dt;
      if (this.cloudT > 7) this.cloudT = -1;
    }
    if (this.state === 'boom') {
      this.boomT -= dt;
      if (this.boomT <= 0) {
        this.drops -= 1;
        if (this.drops > 0) { this.state = 'wait'; this.timer = this.rng.range(16, 24); }
        else this.state = 'done';
      }
    }
    this.draw(dt);
  }

  explode(k) {
    const p = this.play;
    this.blast = { x: k.x, y: k.y };
    this.pkg = null; this.state = 'boom'; this.boomT = 0.45; this.cloudT = 0;
    p.audio.boom(); p.shake.add(16);
    p.particles.burst(k.x, k.y, 0xffffff, 40, 380);
    p.particles.debris(k.x, k.y, 12, 0xf2efe6);
    const fp = p.frog.position();
    const frog = { x: (fp.col + 0.5) * CELL, y: (fp.row + 0.5) * CELL };
    if (inBlast(this.blast, frog)) p.hurtFrog();
    p.hud.say('POWDER', 1200);
  }

  draw(dt) {
    const g = this.g; g.clear();
    const pool = this.pool; pool.begin();
    if (this.state === 'plane' || this.state === 'fall') { if (!pool.put('env_plane', this.px, this.py, 190, { flip: this.dir < 0 })) this.drawPlane(g); }
    if (this.pkg) {
      const k = this.pkg;
      // where it is going to land, so the crossing can be planned around it
      const beat = 0.5 + 0.5 * Math.sin(p2t(this) * 18);
      g.circle(k.x, k.ty, BLAST_RADIUS * CELL).stroke({ width: 5, color: 0xff3a2a, alpha: 0.3 + beat * 0.5 });
      if (!pool.put('env_package', k.x, k.y, 50, { rot: Math.sin(this.play.time * 7) * 0.25 })) {
        g.roundRect(k.x - 16, k.y - 20, 32, 40, 6).fill(0xd6b483).stroke({ width: 3, color: 0x3a2a14 });
        g.rect(k.x - 16, k.y - 6, 32, 6).fill(0xffffff);
      }
    }
    if (this.state === 'boom' && this.blast) {
      const a = Math.max(0, this.boomT / 0.45);
      g.circle(this.blast.x, this.blast.y, BLAST_RADIUS * CELL * (1.1 - a * 0.4)).fill({ color: 0xffffff, alpha: a * 0.85 });
    }
    const a = powderAlpha(this.cloudT);
    if (a > 0) {
      g.rect(0, 0, this.W, this.H).fill({ color: 0xf4f1e8, alpha: a * 0.92 });
      for (const b of this.blobs) {
        b.x += b.s * dt; if (b.x - b.r > this.W) b.x = -b.r;
        if (!pool.put('env_powder_puff', b.x, b.y, b.r * 2.6, { alpha: a * 0.55 })) g.circle(b.x, b.y, b.r).fill({ color: 0xffffff, alpha: a * 0.12 });
      }
    }
    pool.end();
  }

  drawPlane(g) {
    const d = this.dir, x = this.px, y = this.py;
    g.ellipse(x, y, 62, 15).fill(0xd8d8d0).stroke({ width: 3, color: 0x1c1c1a });
    g.poly([x - d * 50, y - 6, x - d * 78, y - 34, x - d * 66, y - 4]).fill(0xb8b8b0).stroke({ width: 2, color: 0x1c1c1a });
    g.poly([x - d * 6, y, x + d * 16, y + 34, x + d * 30, y + 30, x + d * 12, y]).fill(0xb8b8b0).stroke({ width: 2, color: 0x1c1c1a });
    g.circle(x + d * 40, y - 3, 6).fill(0x86c5e6);
  }
}
const p2t = (o) => o.play.time;

// ---------------------------------------------------------------------------
// Stage 4, before Probe One: a saucer sweeps a tractor beam across the road.
// Anything caught in it when the beam locks in gets lifted and set down a
// few rows back down the road. A cow drifts up through the light because
// somebody has to, and it costs the frog nothing to watch it happen.
export const BEAM_COLS = 3;                 // how many columns wide the beam is
export function beamCatches(beamCol, frogCol, width = BEAM_COLS) {
  return frogCol >= beamCol && frogCol < beamCol + width;
}
export function pushBackRow(row, rows, by = 3) {
  return Math.min(rows - 1, row + by);
}

class TractorBeam {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.W = play.grid.cols * CELL; this.H = play.grid.rows * CELL;
    this.g = new PIXI.Graphics();
    play.world.addChild(this.g);
    this.pool = new Pool(play);
    this.state = 'wait';
    this.timer = this.rng.range(10, 20);
    this.saucerX = this.W * 0.5;
    this.cow = null;
  }

  update(dt) {
    const p = this.play;
    if (this.state === 'wait') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'sweep';
        this.beamCol = this.rng.int(0, p.grid.cols - BEAM_COLS);
        this.saucerX = (this.beamCol + BEAM_COLS / 2) * CELL;
        this.lockT = 1.1;
        this.cow = { y: this.H * 0.55, t: 0 };
        p.emit('envCue', { boss: this.boss });
        p.hud.say('BEAM LOCKING ON', 900);
        p.audio.warn();
      }
    } else if (this.state === 'sweep') {
      this.lockT -= dt;
      if (this.cow) { this.cow.t += dt; this.cow.y -= 40 * dt; if (this.cow.y < CELL * 1.2) this.cow = null; }
      if (this.lockT <= 0) {
        const fp = p.frog.position();
        if (beamCatches(this.beamCol, fp.col)) {
          p.frog.row = pushBackRow(fp.row, p.grid.rows);
          p.frog.invuln = Math.max(p.frog.invuln, 1.0);
          p.audio.boom(); p.shake.add(10);
          p.particles.burst(this.saucerX, this.H * 0.45, 0x9fe6ff, 26);
          p.hud.say('BEAMED BACK DOWN THE ROAD', 1400);
        }
        this.state = 'wait';
        this.timer = this.rng.range(12, 22);
      }
    }
    this.draw();
  }

  draw() {
    const g = this.g; g.clear();
    const pool = this.pool; pool.begin();
    if (!pool.put('env_saucer', this.W / 2, CELL * 0.7, 190)) {
      g.ellipse(this.W / 2, CELL * 0.7, 70, 20).fill(0x8f95a0).stroke({ width: 3, color: 0x1c1c1a });
      g.ellipse(this.W / 2, CELL * 0.62, 34, 12).fill(0x9fe6ff);
    }
    if (this.state === 'sweep') {
      const beat = 0.5 + 0.5 * Math.sin(this.play.time * 14);
      g.poly([this.saucerX - 18, CELL * 0.85, this.saucerX + 18, CELL * 0.85, this.saucerX + 90, this.H, this.saucerX - 90, this.H])
        .fill({ color: 0x9fe6ff, alpha: 0.18 + beat * 0.12 });
      if (this.cow) {
        const cx = this.saucerX, cy = this.cow.y;
        if (!pool.put('env_cow', cx, cy, 70, { rot: Math.sin(this.play.time * 3) * 0.15 })) {
          g.ellipse(cx, cy, 22, 14).fill(0xf4f2ec).stroke({ width: 2, color: 0x1c1c1a });
          for (const [dx, dy] of [[-10, -6], [8, -8], [2, 4]]) g.circle(cx + dx, cy + dy, 4).fill(0x2a2a30);
        }
      }
      for (let i = 0; i < 4; i++) {                 // rings of light sliding down the beam
        const k = ((this.play.time * 0.9 + i / 4) % 1);
        pool.put('env_beam_ring', this.saucerX, CELL * 0.9 + k * (this.H - CELL), 70 + k * 130, { alpha: 0.7 * (1 - k) });
      }
    }
    pool.end();
  }
}

// ---------------------------------------------------------------------------
// K1, before The Landlord: rent notices flutter down and stamp one lane,
// which runs faster for a few seconds while they are stuck to it. Steam
// vents burst here and there for flavour; they do nothing but look mean.
export function laneSpeedMultiplier(active, mult = 1.6) { return active ? mult : 1; }

class RentNotice {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.W = play.grid.cols * CELL; this.H = play.grid.rows * CELL;
    this.g = new PIXI.Graphics();
    play.world.addChild(this.g);
    this.pool = new Pool(play);
    this.timer = this.rng.range(12, 20);
    this.activeRow = -1; this.activeT = 0;
    this.steamTimer = this.rng.range(3, 7);
    this.papers = [];
  }

  update(dt) {
    const p = this.play;
    if (this.activeRow < 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.activeRow = this.rng.int(2, p.grid.rows - 2);
        this.activeT = 6.0;
        this.papers = Array.from({ length: 10 }, () => ({ x: this.rng() * this.W, y: -this.rng() * 200, r: this.rng() * 6.28 }));
        p.emit('envCue', { boss: this.boss });
        p.hud.say('THAT LANE JUST GOT FASTER', 1400);
      }
    } else {
      this.activeT -= dt;
      for (const paper of this.papers) { paper.y += 160 * dt; paper.r += dt * 2; }
      for (const m of p.movers) if (m.row === this.activeRow) m.speed = m.baseSpeed * laneSpeedMultiplier(true);
      if (this.activeT <= 0) {
        for (const m of p.movers) if (m.row === this.activeRow) m.speed = m.baseSpeed;
        this.activeRow = -1;
        this.timer = this.rng.range(14, 24);
      }
    }
    this.steamTimer -= dt;
    if (this.steamTimer <= 0) {
      p.particles.smoke(this.rng() * this.W, this.rng.int(1, p.grid.rows - 2) * CELL + CELL / 2, 6);
      this.steamTimer = this.rng.range(4, 8);
    }
    this.draw();
  }

  draw() {
    const g = this.g; g.clear();
    const pool = this.pool; pool.begin();
    if (this.activeRow >= 0) {
      const beat = 0.5 + 0.5 * Math.sin(this.play.time * 10);
      g.rect(0, this.activeRow * CELL, this.W, CELL).fill({ color: 0xe23c2f, alpha: 0.1 + beat * 0.08 });
      [0.18, 0.5, 0.82].forEach((f, i) => pool.put('env_stamp', this.W * f, this.activeRow * CELL + CELL / 2, 56, { rot: -0.3 + i * 0.25, alpha: 0.8 }));
      for (const paper of this.papers) {
        if (!pool.put('env_notice', paper.x, paper.y, 30, { rot: paper.r, alpha: 0.95 })) g.rect(paper.x - 8, paper.y - 10, 16, 20).fill({ color: 0xf4f0e6, alpha: 0.85 });
      }
    }
    pool.end();
  }
}

// ---------------------------------------------------------------------------
// K2, before The Neco Frog: the whole screen mirrors for a few seconds, twice
// a stage. Purely a camera trick -- the controls stay exactly as literal as
// they always were, which is what makes it disorienting rather than unfair.
export function worldFlipTransform(cols, cell, flipped) {
  return flipped ? { x: cols * cell, scaleX: -1 } : { x: 0, scaleX: 1 };
}

class MirrorFlip {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.firesLeft = 2;
    this.flipped = false;
    this.timer = this.rng.range(8, 16);
    this.flipT = 0;
  }

  update(dt) {
    const p = this.play;
    if (!this.flipped) {
      if (this.firesLeft > 0) {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.flipped = true; this.flipT = 3.5; this.firesLeft -= 1;
          p.emit('envCue', { boss: this.boss });
          p.hud.say('THE MIRROR FLIPS', 1200);
          p.audio.warn();
        }
      }
    } else {
      this.flipT -= dt;
      if (this.flipT <= 0) { this.flipped = false; this.timer = this.rng.range(10, 18); }
    }
  }

  worldTransform() { return worldFlipTransform(this.play.grid.cols, CELL, this.flipped); }
}

// ---------------------------------------------------------------------------
// K3, before The Narrator: the captions lie. "ALL CLEAR" while a lane quietly
// speeds up, and every so often a fake "LEFT IS RIGHT" notice actually swaps
// the two for a few seconds -- the one hazard here that touches the controls
// at all, and it says so, which does not make it less annoying.
export function swappedDir(dir) {
  return dir === 'left' ? 'right' : dir === 'right' ? 'left' : dir;
}

class LyingCaptions {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.speedTimer = this.rng.range(10, 18);
    this.activeRow = -1; this.activeT = 0;
    this.swapTimer = this.rng.range(16, 26);
    this.swapT = 0;
  }

  get swapped() { return this.swapT > 0; }
  remapDir(dir) { return this.swapped ? swappedDir(dir) : dir; }

  update(dt) {
    const p = this.play;
    if (this.activeRow < 0) {
      this.speedTimer -= dt;
      if (this.speedTimer <= 0) {
        this.activeRow = this.rng.int(2, p.grid.rows - 2);
        this.activeT = 5.0;
        p.emit('envCue', { boss: this.boss });
        p.hud.say('ALL CLEAR', 1400);
      }
    } else {
      this.activeT -= dt;
      for (const m of p.movers) if (m.row === this.activeRow) m.speed = m.baseSpeed * 1.5;
      if (this.activeT <= 0) {
        for (const m of p.movers) if (m.row === this.activeRow) m.speed = m.baseSpeed;
        this.activeRow = -1;
        this.speedTimer = this.rng.range(12, 20);
      }
    }
    if (this.swapT > 0) {
      this.swapT -= dt;
    } else {
      this.swapTimer -= dt;
      if (this.swapTimer <= 0) {
        this.swapT = 4.0;
        p.hud.say('LEFT IS RIGHT', 1600);
        p.audio.warn();
        this.swapTimer = this.rng.range(18, 28);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// K4, before The Sack Man: the lights go out, again and again, and for a few
// seconds you can only see a small window around the frog. Drawn as four
// dark panels around a clear rectangle rather than a true mask, which is
// simpler and just as effective.
export function blackoutWindow(fx, fy, half, W, H) {
  return {
    x0: Math.max(0, fx - half), y0: Math.max(0, fy - half),
    x1: Math.min(W, fx + half), y1: Math.min(H, fy + half),
  };
}

class Blackout {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.W = play.grid.cols * CELL; this.H = play.grid.rows * CELL;
    this.g = new PIXI.Graphics();
    play.world.addChild(this.g);
    this.pool = new Pool(play);
    this.timer = this.rng.range(10, 16);
    this.outT = 0;
    this.firstCue = true;
  }

  update(dt) {
    const p = this.play;
    if (this.outT <= 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.outT = this.rng.range(3, 4);
        if (this.firstCue) { this.firstCue = false; p.emit('envCue', { boss: this.boss }); }
        p.hud.say('THE LIGHTS ARE OUT', 900);
        p.audio.warn();
        this.timer = this.rng.range(12, 18);
      }
    } else {
      this.outT -= dt;
    }
    this.draw();
  }

  draw() {
    const g = this.g; g.clear();
    this.pool.begin();
    if (this.outT <= 0) { this.pool.end(); return; }
    const fp = this.play.frog.position();
    const fx = (fp.col + 0.5) * CELL, fy = (fp.row + 0.5) * CELL;
    const w = blackoutWindow(fx, fy, CELL * 1.7, this.W, this.H);
    const a = 0.94;
    g.rect(0, 0, this.W, w.y0).fill({ color: 0x05050a, alpha: a });
    g.rect(0, w.y1, this.W, this.H - w.y1).fill({ color: 0x05050a, alpha: a });
    g.rect(0, w.y0, w.x0, w.y1 - w.y0).fill({ color: 0x05050a, alpha: a });
    g.rect(w.x1, w.y0, this.W - w.x1, w.y1 - w.y0).fill({ color: 0x05050a, alpha: a });
    // a dead bulb, dangling and flickering, over the little patch of light you have left
    const flick = Math.sin(this.play.time * 31) > 0.2 ? 1 : 0.3;
    this.pool.put('env_sack_lightbulb', fx + Math.sin(this.play.time * 2) * 6, w.y0 + 26, 36, { alpha: flick });
    this.pool.end();
  }
}

// ---------------------------------------------------------------------------
// K5, before UMMA: Crocs come tumbling across the lanes end over end, ahead
// of the real thing waiting up the road, and steam clouds blow through.
class TumblingCrocs {
  constructor(play, cfg) {
    this.play = play; this.boss = cfg.boss;
    this.rng = makeRng();
    this.W = play.grid.cols * CELL;
    this.g = new PIXI.Graphics();
    play.world.addChild(this.g);
    this.timer = this.rng.range(4, 9);
    this.steamTimer = this.rng.range(3, 6);
    this.crocs = [];
    this.firstCue = true;
  }

  update(dt) {
    const p = this.play;
    this.timer -= dt;
    if (this.timer <= 0) {
      const row = this.rng.int(1, p.grid.rows - 2);
      const dir = this.rng() < 0.5 ? 1 : -1;
      this.crocs.push({ row, x: dir > 0 ? -1 : p.grid.cols + 1, dir, speed: this.rng.range(3.2, 4.4), spin: 0 });
      if (this.firstCue) { this.firstCue = false; p.emit('envCue', { boss: this.boss }); }
      this.timer = this.rng.range(3.5, 7);
    }
    this.steamTimer -= dt;
    if (this.steamTimer <= 0) {
      p.particles.smoke(this.rng() * this.W, this.rng.int(1, p.grid.rows - 2) * CELL + CELL / 2, 5);
      this.steamTimer = this.rng.range(3, 6);
    }
    const survivors = [];
    for (const c of this.crocs) {
      c.x += c.dir * c.speed * dt; c.spin += dt * 10;
      const fp = p.frog.position();
      if (Math.round(fp.col) === Math.round(c.x) && fp.row === c.row) { p.hurtFrog(); continue; }
      if (c.x >= -1.5 && c.x <= p.grid.cols + 1.5) survivors.push(c);
    }
    this.crocs = survivors;
    this.draw();
  }

  draw() {
    const g = this.g; g.clear();
    const t = this.play.tex;
    for (const c of this.crocs) {
      const x = (c.x + 0.5) * CELL, y = (c.row + 0.5) * CELL;
      const s = t?.scaleFor ? t.scaleFor('croc_shoe') : 1;
      if (t?.get) {
        const sp = c.sprite || (c.sprite = new PIXI.Sprite());
        if (!c.sprite.parent) this.play.layer.addChild(c.sprite);
        sp.texture = t.get('croc_shoe'); sp.anchor.set(0.5);
        sp.x = x; sp.y = y; sp.rotation = c.spin; sp.scale.set(s * 1.1);
      }
    }
    // sprites for crocs no longer in this.crocs are cleaned up on stage teardown
  }
}

export function createEnvFx(play) {
  const cfg = ENV[play.stage.id];
  if (!cfg) return null;
  const kinds = { powder: PowderDrop, beam: TractorBeam, speedlane: RentNotice, mirror: MirrorFlip, lying: LyingCaptions, blackout: Blackout, crocs: TumblingCrocs };
  const Kind = kinds[cfg.id];
  return Kind ? new Kind(play, cfg) : null;
}
