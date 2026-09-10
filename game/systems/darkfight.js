// Boss five: THE SACK MAN. Vision is the resource here, not health. A light
// radius around the frog decays on its own; eating an explosive refills it
// and feeds the fuse, same call, same rule every boss in this game obeys.
// Everything hostile is only visible near the edge of that light, and its
// tell is a half-second flicker right at that edge before it moves. There is
// almost no character art on purpose -- he is never drawn as a body, only
// glimpsed as a silhouette, a reaching shape, or a dragged sack.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { SACK_MAN } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';

const COLS = 13, ROWS = 15, CELL = 64;
const W = COLS * CELL, H = ROWS * CELL;
const HOP_TIME = 0.13;
const EAT_RANGE = 1.4;              // cells; how close you must be to eat
const SWAT_RANGE = 1.6;
const SWAT_TIME = 0.22;
const REPRIEVE_TIME = 2.2;          // full light, no attacks, between surges
const HAZARD_SPEED = 190;           // px/sec once a lunge or drag commits

export class DarkFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = SACK_MAN; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.glow = new PIXI.Graphics();       // the soft "you are lit here" halo
    this.layer = new PIXI.Container();     // explosives, hazards, frog
    this.world.addChild(this.bg, this.glow, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.frogSprite = new PIXI.Sprite(this.tex.get('climbfrog_hold'));
    this.frogSprite.anchor.set(0.5);
    this.layer.addChild(this.frogSprite);

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.col = COLS / 2; this.row = ROWS / 2;
    this.x = this.col * CELL; this.y = this.row * CELL;
    this.hopAnim = null; this.invuln = 0; this.eatT = 0; this.swatT = 0;

    this.surge = 0;                 // 0,1,2 -- which darkening tier we're in
    this.fuse = 0;
    this.light = this.boss.light.max[0];
    this.reprieveT = 0;              // >0 during the calm window between surges
    this.frozen = false;             // true while the finale plays out

    this.pickups = [];               // explosives floating in the dark
    this.spawnTimer = 1.2;
    this.hazards = [];                // grasps, drags, and the blackout beat
    this.attackTimer = 2.6;
    this.blackoutPhase = null;        // 'warn' | 'active' | null
    this.blackoutT = 0;               // seconds left in the current phase

    this.state = 'intro'; this.stateT = 1.0;

    this.drawBackdrop();
    this.hud.setStage('THE SACK MAN', 'Watch the edge, not the middle.');
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  drawBackdrop() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x04070c);
    for (let i = 0; i < 30; i++) {
      const x = (i * 71) % W, y = (i * 113) % H;
      g.circle(x, y, 1 + (i % 3)).fill({ color: 0x2a4a5c, alpha: 0.25 });
    }
  }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over || this.frozen) return;
    if (i.type === 'hop') { this.hop(i.dir); return; }
    if (i.type === 'punch') { this.swat(); return; }
    this.eat();
  }

  hop(dir) {
    if (this.hopAnim) return;
    // During the active blackout (not the warning before it), moving at
    // all is the mistake -- the tutorial beat says so plainly.
    if (this.blackoutPhase === 'active') { this.stumble(); return; }
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    if (!d) return;
    const nc = Math.max(0, Math.min(COLS - 1, this.col + d[0]));
    const nr = Math.max(0, Math.min(ROWS - 1, this.row + d[1]));
    if (nc === this.col && nr === this.row) return;
    this.hopAnim = { fromC: this.col, fromR: this.row, t: 0 };
    this.col = nc; this.row = nr;
    this.audio.hop();
  }

  stumble() {
    this.audio.hit();
    this.hud.say('MOVED IN THE DARK', 700);
    this.takeHit();
  }

  swat() {
    if (this.over || this.frozen) return;
    this.swatT = SWAT_TIME;
    this.audio.hop();
    const near = this.hazards.find(h => h.kind === 'grasp' && h.committed &&
      Math.hypot(h.x - this.x, h.y - this.y) < SWAT_RANGE * CELL);
    if (near) {
      near.alive = false;
      this.audio.squash();
      this.particles.spark(near.x, near.y, 0x7fc7e8, 10);
      this.hud.say('SWATTED IT AWAY', 800);
    } else this.hud.say('NOTHING THERE', 500);
  }

  eat() {
    if (this.over || this.frozen) return;
    this.eatT = 0.24;
    this.audio.tongue();
    const p = this.pickups.find(x => Math.hypot(x.col - this.col, x.row - this.row) < EAT_RANGE / 1);
    if (!p) { this.hud.say('NOTHING TO EAT', 500); return; }
    p.alive = false;
    this.audio.eat(); this.addScore(140);
    this.fuse = Math.min(this.boss.fuseTarget, this.fuse + 1);
    this.hud.setFuse(this.fuse);
    this.ach?.bump('midairEats');
    const max = this.boss.light.max[this.surge];
    this.light = Math.min(max, this.light + this.boss.light.boost);
    this.particles.burst(this.x, this.y, 0xf2c53d, 16);
    if (this.fuse >= this.boss.fuseTarget) this.clearSurge();
  }

  clearSurge() {
    this.fuse = 0; this.hud.setFuse(0);
    this.audio.boom(); this.shake.add(12);
    this.particles.burst(this.x, this.y, 0xf2c53d, 40, 360);
    this.addScore(900);
    this.hazards = [];
    this.surge += 1;
    if (this.surge >= this.boss.surgesToWin) { this.finishSequence(); return; }
    this.reprieveT = REPRIEVE_TIME;
    this.light = this.boss.light.max[Math.min(2, this.surge)];
    this.hud.say('CLEAR. FOR NOW.', 1800);
  }

  finishSequence() {
    this.frozen = true;
    this.audio.roar();
    this.hud.say(this.boss.finale.card, 3400);
    let t = 0;
    const step = () => {
      t += 1 / 30;
      this.light = Math.min(1400, this.light + 900 * (1 / 30));
      if (t < 1.4) requestAnimationFrame(step);
      else {
        this.over = true;
        this.audio.win(); this.ach?.bump('stagesCleared');
        setTimeout(() => this.emit('won', { score: this.score }), 1400);
      }
    };
    step();
  }

  takeHit(dmg = 1) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.0;
    this.audio.hit(); this.shake.add(10);
    this.particles.burst(this.x, this.y, 0xe23c2f, 18);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish();
  }

  finish() {
    this.over = true;
    this.audio.lose();
    setTimeout(() => this.emit('lost', { score: this.score }), 1500);
  }

  spawnPickup() {
    this.pickups.push({
      col: this.rng.int(1, COLS - 2), row: this.rng.int(1, ROWS - 2), alive: true,
    });
  }

  spawnHazard(kind) {
    // Appears exactly at the edge of the CURRENT light radius, at a random
    // angle, and flickers there before it commits toward the frog. The aim
    // is locked right now, at the frog's position the instant it appears --
    // not when the telegraph ends -- so ducking away during the flicker
    // actually leaves it lunging at empty water instead of always re-aiming
    // at wherever you happen to be standing once it starts moving.
    const a = this.rng.range(0, Math.PI * 2);
    const r = this.light * 0.95;
    const hx = this.x + Math.cos(a) * r, hy = this.y + Math.sin(a) * r;
    const dx = this.x - hx, dy = this.y - hy;
    const d = Math.hypot(dx, dy) || 1;
    this.hazards.push({
      kind, x: hx, y: hy, angle: a,
      vx: (dx / d) * HAZARD_SPEED, vy: (dy / d) * HAZARD_SPEED,
      telegraphT: this.boss.attacks[kind].tell, committed: false, alive: true,
    });
  }

  update(dt) {
    if (this.over) { this.render(dt); return; }
    if (this.frozen) { this.render(dt); return; }
    this.time += dt;
    if (this.hopAnim) { this.hopAnim.t += dt; if (this.hopAnim.t >= HOP_TIME) this.hopAnim = null; }
    if (this.invuln > 0) this.invuln -= dt;
    if (this.eatT > 0) this.eatT -= dt;
    if (this.swatT > 0) this.swatT -= dt;
    if (this.blackoutPhase) {
      this.blackoutT -= dt;
      if (this.blackoutT <= 0) {
        if (this.blackoutPhase === 'warn') { this.blackoutPhase = 'active'; this.blackoutT = 1.6; }
        else { this.blackoutPhase = null; this.hud.say('LIGHT BACK', 700); }
      }
    }

    if (this.state === 'intro') { if ((this.stateT -= dt) <= 0) this.state = 'play'; this.render(dt); return; }

    if (this.reprieveT > 0) {
      this.reprieveT -= dt;
      this.render(dt);
      if (this.reprieveT <= 0) this.hud.say('IT IS COMING BACK', 1200);
      return;
    }

    // light decays on its own; the fuse rule is the only thing that refills it
    const decay = this.boss.light.decay[this.surge];
    this.light = Math.max(this.boss.light.min, this.light - decay * dt);

    // explosives to eat
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) { this.spawnPickup(); this.spawnTimer = this.rng.range(2.2, 3.2); }

    // its three attacks
    this.attackTimer -= dt;
    if (this.attackTimer <= 0 && !this.blackoutPhase) {
      const kind = this.rng.pick(['grasp', 'drag', 'blackout']);
      this.attackTimer = this.rng.range(3.0, 4.2);
      if (kind === 'blackout') {
        this.blackoutPhase = 'warn';
        this.blackoutT = this.boss.attacks.blackout.tell;
        this.audio.warn();
        this.hud.say('IT IS GOING DARK. DO NOT MOVE.', 1600);
      } else {
        this.spawnHazard(kind);
        this.audio.warn();
      }
    }

    for (const h of this.hazards) {
      if (h.telegraphT > 0) { h.telegraphT -= dt; continue; }
      h.committed = true;
      h.x += h.vx * dt; h.y += h.vy * dt;
      if (Math.hypot(this.x - h.x, this.y - h.y) < CELL * 0.6) {
        h.alive = false;
        this.light = Math.max(this.boss.light.min, this.light - 40);
        this.takeHit(this.boss.attacks[h.kind].damage);
      }
    }
    this.hazards = this.hazards.filter(h => h.alive);
    this.pickups = this.pickups.filter(p => p.alive);

    this.render(dt);
  }

  render(dt) {
    let fc = this.col, fr = this.row;
    if (this.hopAnim) {
      const t = Math.min(1, this.hopAnim.t / HOP_TIME), e = 1 - Math.pow(1 - t, 3);
      fc = this.hopAnim.fromC + (this.col - this.hopAnim.fromC) * e;
      fr = this.hopAnim.fromR + (this.row - this.hopAnim.fromR) * e;
    }
    this.x = (fc + 0.5) * CELL; this.y = (fr + 0.5) * CELL;

    const fs = this.frogSprite;
    fs.texture = this.tex.get(this.invuln > 0.6 ? 'climbfrog_hurt' : this.eatT > 0 ? 'climbfrog_catch' : 'climbfrog_hold');
    fs.scale.set(this.tex.scaleFor('climbfrog_hold') * 1.1);
    fs.x = this.x; fs.y = this.y;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.5 : 1) : 1;

    const lightR = this.reprieveT > 0 || this.state === 'intro' || this.frozen
      ? Math.max(W, H) : (this.blackoutPhase === 'active' ? 0 : this.light);

    // the soft halo marking how far you can actually see
    const gl = this.glow; gl.clear();
    if (lightR < Math.max(W, H)) {
      gl.circle(this.x, this.y, lightR * 1.15).fill({ color: 0x2a4a5c, alpha: 0.12 });
      gl.circle(this.x, this.y, lightR).fill({ color: 0x3a6a7c, alpha: 0.10 });
    }

    const vis = (ex, ey, flicker = false) => {
      const d = Math.hypot(ex - this.x, ey - this.y);
      if (flicker) return d < lightR * 1.15 ? 0.85 : 0;
      if (d <= lightR * 0.7) return 1;
      if (d <= lightR) return 1 - (d - lightR * 0.7) / (lightR * 0.3);
      return 0;
    };

    for (const p of this.pickups) {
      if (!p.sprite) {
        p.sprite = new PIXI.Sprite(this.tex.get('rift_bomb'));
        p.sprite.anchor.set(0.5);
        this.layer.addChild(p.sprite);
      }
      p.sprite.x = (p.col + 0.5) * CELL; p.sprite.y = (p.row + 0.5) * CELL;
      p.sprite.scale.set(this.tex.scaleFor('rift_bomb') * 1.1);
      p.sprite.alpha = vis(p.sprite.x, p.sprite.y);
      p.sprite.visible = p.sprite.alpha > 0.02;
    }
    for (const h of this.hazards) {
      if (!h.gfx) { h.gfx = new PIXI.Graphics(); this.layer.addChild(h.gfx); }
      const g = h.gfx; g.clear();
      const a = vis(h.x, h.y, h.telegraphT > 0);
      if (a > 0.02) {
        if (h.kind === 'grasp') {
          g.circle(h.x, h.y, 16).fill({ color: 0x120c18, alpha: a });
          for (let i = -2; i <= 2; i++) g.moveTo(h.x, h.y).lineTo(h.x + i * 7, h.y - 22).stroke({ width: 4, color: 0x120c18, alpha: a });
        } else if (h.kind === 'drag') {
          g.roundRect(h.x - 20, h.y - 26, 40, 46, 14).fill({ color: 0x2b2418, alpha: a });
          g.moveTo(h.x - 14, h.y - 20).lineTo(h.x + 14, h.y - 20).stroke({ width: 3, color: 0x4a3f2a, alpha: a * 0.8 });
        }
      }
      g.alpha = 1;
    }

    const g = this.fx; g.clear();
    if (this.blackoutPhase === 'warn') {
      g.rect(0, 0, W, H).fill({ color: 0x000000, alpha: Math.min(0.5, this.blackoutT * 0.8) });
    } else if (this.blackoutPhase === 'active') {
      g.rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.94 });
    }
    for (let i = 0; i < this.boss.surgesToWin; i++)
      g.circle(W / 2 - 34 + i * 34, 20, 9).fill({ color: i < this.surge ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() { return { sizeClass: 8, lives: this.lives, hearts: 3 }; }
  destroy() {
    for (const p of this.pickups) p.sprite?.destroy();
    for (const h of this.hazards) h.gfx?.destroy();
    this.world.destroy({ children: true });
  }
}
