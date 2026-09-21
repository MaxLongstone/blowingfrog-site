// The stage before Chaco: a plane crosses the screen and drops a package. It
// falls where the frog can see it land, explodes, and blankets the screen in
// white powder. Getting caught in the blast costs a hit; then the powder makes
// the rest of the crossing hard to see.
import { ENV } from '../config/envfx.js';
import { makeRng } from '../core/rng.js';

const CELL = 64;

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
    if (this.state === 'plane' || this.state === 'fall') this.drawPlane(g);
    if (this.pkg) {
      const k = this.pkg;
      // where it is going to land, so the crossing can be planned around it
      const beat = 0.5 + 0.5 * Math.sin(p2t(this) * 18);
      g.circle(k.x, k.ty, BLAST_RADIUS * CELL).stroke({ width: 5, color: 0xff3a2a, alpha: 0.3 + beat * 0.5 });
      g.roundRect(k.x - 16, k.y - 20, 32, 40, 6).fill(0xd6b483).stroke({ width: 3, color: 0x3a2a14 });
      g.rect(k.x - 16, k.y - 6, 32, 6).fill(0xffffff);
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
        g.circle(b.x, b.y, b.r).fill({ color: 0xffffff, alpha: a * 0.12 });
      }
    }
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

export function createEnvFx(play) {
  const cfg = ENV[play.stage.id];
  if (!cfg) return null;
  if (cfg.id === 'powder') return new PowderDrop(play, cfg);
  return null;
}
