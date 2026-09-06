// One stage of play: entities, rules, rendering, and the win/lose signals.
import { Grid, Shake } from '../core/grid.js';
import { Frog, TONGUE_TIME } from '../entities/frog.js';
import { Spawner, behaviors } from './spawner.js';
import { resolve } from './collision.js';
import { Particles } from './particles.js';
import { Backdrop } from './backdrop.js';
import { SPRITES } from '../config/sprites.js';
import { MOVERS, FUSE_TARGET, KAIJU_SIZE, POWERS, PICKUPS } from '../config/stages.js';
import { makeRng } from '../core/rng.js';

const CELL = 64;
const MAX_PROJECTILES = 5;
const FROG_SPRITE = ['frog_s1', 'frog_s1', 'frog_s2', 'frog_s3', 'frog_s4', 'frog_k1', 'frog_k2', 'frog_k3', 'frog_k4', 'frog_k5'];

export class Play {
  constructor({ app, stage, textures, audio, hud, frogState, score = 0, density = 1, cols = 13 }) {
    this.app = app; this.stage = stage; this.tex = textures; this.audio = audio; this.hud = hud;
    this.grid = new Grid(cols, 15, CELL);
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.density = density;
    this.time = 0;
    this.over = false;
    this.listeners = {};

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.backdrop = new Backdrop(this.world, this.grid, stage);
    this.layer = new PIXI.Container();
    this.world.addChild(this.layer);
    this.particles = new Particles(this.world, CELL);
    this.tongueG = new PIXI.Graphics();
    this.world.addChild(this.tongueG);

    this.frog = new Frog({
      sizeClass: frogState?.sizeClass ?? stage.sizeClass,
      lives: frogState?.lives ?? stage.lives,
      hearts: stage.hearts,
      col: Math.floor(cols / 2),
      row: 14,
    });
    this.frogSprite = new PIXI.Sprite(this.tex.get(FROG_SPRITE[this.frog.sizeClass]));
    this.frogSprite.anchor.set(0.5);
    this.layer.addChild(this.frogSprite);

    this.frog.invuln = 1.2;   // grace so a prewarmed car cannot spawn-kill you
    this.spawner = new Spawner(stage, this.grid, this.rng, { density });
    this.movers = this.spawner.prewarm();
    this.pickups = this.spawner.seedPickups();
    this.pickups.push(...this.spawner.seedPowers(this.pickups));
    this.projectiles = [];
    this.sprites = new Map();

    this.hud.setStage(stage.name, stage.subtitle);
    this.hud.setFuse(0);
    this.hud.setLives(this.frog.isKaiju() ? this.frog.hearts : this.frog.lives, this.frog.isKaiju());
    this.hud.setScore(this.score);
  }

  on(evt, fn) { (this.listeners[evt] ||= []).push(fn); return this; }
  emit(evt, payload) { (this.listeners[evt] || []).forEach(f => f(payload)); }

  get ctx() {
    const p = this.frog.position();
    return {
      grid: this.grid,
      behaviors,
      rng: this.rng,
      moverWidth: (k) => MOVERS[k]?.w ?? 2,
      frog: { col: this.frog.col, row: this.frog.row, x: p.col + 0.5, y: p.row + 0.5, isKaiju: this.frog.isKaiju() },
    };
  }

  intent(i) {
    if (this.over || this.frog.dead) return;
    if (i.type === 'hop') {
      if (this.frog.hop(i.dir, this.grid)) this.audio.hop();
    } else {
      const t = this.frog.startTongue(i.dir);
      if (t) this.audio.tongue();
    }
  }

  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  px(col, row) { return { x: col * CELL, y: row * CELL }; }

  update(dt) {
    if (this.over) return;
    this.time += dt;
    const ctx = this.ctx;

    this.frog.update(dt);
    this.backdrop.update(dt);

    // spawn
    const made = this.spawner.update(dt, ctx);
    this.movers.push(...made.movers);
    const room = MAX_PROJECTILES - this.projectiles.length;
    if (room > 0) this.projectiles.push(...made.projectiles.slice(0, room));
    if (made.projectiles.some(p => p.warn > 0)) this.audio.warn();

    const frozen = this.frog.frozen;
    if (frozen) this.freezeFlash = (this.freezeFlash || 0) + dt;

    // movers
    for (const m of (frozen ? [] : this.movers)) {
      m.update(dt, ctx);
      if (m.def.drops) {
        m.dropTimer -= dt;
        if (m.dropTimer <= 0) {
          m.dropTimer = m.def.drops === 'food' ? 4.2 : 2.6;
          if (m.age > 0.6 && m.x > 0 && m.x < this.grid.cols) {
            const d = this.spawner.dropFrom(m, ctx);
            if (d) (d.type ? this.pickups : this.projectiles).push(d);
          }
        }
      }
    }
    if (!frozen) for (const p of this.projectiles) p.update(dt, ctx);
    for (const p of this.pickups) p.update(dt);

    // collisions
    const tongueCells = this.frog.tongue?.cells || null;
    const cctx = {
      tongueCells, invulnerable: this.frog.invuln > 0,
      kaiju: this.frog.isKaiju(), fire: this.frog.breathingFire,
    };

    for (const list of [this.pickups, this.movers, this.projectiles]) {
      for (const e of list) {
        if (!e.alive) continue;
        const r = resolve(this.frog, e, cctx);
        if (r === 'none') continue;
        this.handle(r, e);
        if (this.over) return;
      }
    }

    this.movers = this.movers.filter(m => m.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.pickups = this.pickups.filter(p => p.alive);
    this.particles.update(dt);

    // goal
    if (this.frog.reachedGoal()) {
      this.over = true;
      if (this.frog.fuse >= FUSE_TARGET) { this.emit('goal', { score: this.score }); }
      else { this.audio.win(); this.emit('stillHungry', { fuse: this.frog.fuse, score: this.score }); }
      return;
    }

    this.render();
  }

  handle(result, e) {
    const b = e.bounds();
    const cx = (b.x + b.w / 2) * CELL, cy = (b.y + b.h / 2) * CELL;
    if (result === 'eat') {
      e.alive = false;
      const n = this.frog.eat();
      this.audio.eat();
      if (n >= FUSE_TARGET) this.audio.tick();
      this.hud.setFuse(n);
      this.particles.burst(cx, cy, 0xf08a24, 16);
      this.particles.ring(cx, cy, 0xf2c53d);
      this.addScore(150);
      this.shake.add(3);
      if (n === FUSE_TARGET) this.hud.say('FUSE LIT — GET TO THE TOP');
    } else if (result === 'food') {
      e.alive = false; this.audio.food();
      this.particles.spark(cx, cy, 0x4f9a3c); this.addScore(50);
    } else if (result === 'power') {
      e.alive = false;
      const name = e.power;
      const def = POWERS[name];
      this.frog.gainPower(name);
      this.audio.win();
      this.particles.burst(cx, cy, def.color, 22);
      this.particles.ring(cx, cy, def.color);
      this.addScore(250);
      this.hud.say(def.shout, 2200);
      this.hud.setLives(this.frog.isKaiju() ? this.frog.hearts : this.frog.lives, this.frog.isKaiju());
    } else if (result === 'burn') {
      e.alive = false;
      this.audio.squash();
      this.particles.burst(cx, cy, 0xf08a24, 14);
      this.particles.smoke(cx, cy, 4);
      this.addScore(90);
      this.shake.add(3);
    } else if (result === 'squash') {
      e.squash(); this.audio.squash();
      this.particles.debris(cx, cy, 16); this.particles.smoke(cx, cy, 5);
      this.addScore(120); this.shake.add(5);
    } else if (result === 'push') {
      const dir = this.frog.col < this.grid.cols / 2 ? 1 : -1;
      const nc = Math.max(0, Math.min(this.grid.cols - 1, this.frog.col + dir));
      this.frog.col = nc; this.shake.add(4);
      this.hud.say('BLOWN OFF COURSE');
    } else if (result === 'damage') {
      const out = this.frog.takeHit();
      if (out === 'none') return;
      this.audio.hit();
      const fp = this.frog.position();
      this.particles.burst((fp.col + 0.5) * CELL, (fp.row + 0.5) * CELL, 0xe23c2f, 20);
      this.shake.add(10);
      // A projectile is spent on impact; a beam or hand finishes its own strike window.
      if ('vx' in e && !e.warn) e.alive = false;
      this.hud.setLives(this.frog.isKaiju() ? this.frog.hearts : this.frog.lives, this.frog.isKaiju());
      if (out === 'dead') { this.over = true; this.audio.lose(); this.emit('dead', { score: this.score }); }
      else if (out === 'shielded') this.hud.say(`ARMOUR HOLDING · ${this.frog.shield} LEFT`);
      else if (out === 'reset') this.hud.say('BACK TO THE START');
      else this.hud.say('HIT');
    }
  }

  spriteFor(e) {
    let s = this.sprites.get(e);
    if (!s) {
      s = new PIXI.Sprite(this.tex.get(e.kind));
      s.anchor.set(0.5);
      this.layer.addChild(s);
      this.sprites.set(e, s);
    }
    return s;
  }

  render() {
    const seen = new Set();
    const place = (e, x, y, opts = {}) => {
      const s = this.spriteFor(e);
      seen.add(e);
      s.x = x; s.y = y;
      s.visible = true;
      s.alpha = opts.alpha ?? 1;
      s.scale.set(opts.flip ? -1 : 1, 1);
      if (opts.rotation != null) s.rotation = opts.rotation;
      return s;
    };

    for (const m of this.movers) place(m, m.x * CELL, (m.y + 0.5) * CELL, { flip: m.dir < 0 });
    for (const p of this.pickups) place(p, (p.col + 0.5) * CELL, (p.row + 0.5) * CELL, { alpha: 0.85 + Math.sin(this.time * 4 + p.col) * 0.15 });
    for (const p of this.projectiles) {
      const alpha = p.telegraphing ? 0.25 + Math.sin(this.time * 30) * 0.2 : 1;
      const rot = p.vx !== 0 && p.vy === 0 ? (p.vx > 0 ? 0 : Math.PI) : 0;
      place(p, p.x * CELL, p.y * CELL, { alpha, rotation: rot });
    }

    for (const [e, s] of this.sprites) {
      if (!seen.has(e)) { s.destroy(); this.sprites.delete(e); }
    }

    // frog
    const fp = this.frog.position();
    const fs = this.frogSprite;
    fs.texture = this.tex.get(FROG_SPRITE[Math.min(9, this.frog.sizeClass)]);
    fs.x = (fp.col + 0.5) * CELL;
    fs.y = (fp.row + 0.5) * CELL - fp.arc * 16;
    const base = this.frog.scale;
    fs.scale.set(base * (1 + fp.arc * 0.12), base * (1 - fp.arc * 0.06));
    fs.alpha = this.frog.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.35 : 1) : 1;
    fs.rotation = { up: 0, down: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[this.frog.dir] || 0;
    this.layer.addChild(fs);

    // tongue
    const g = this.tongueG; g.clear();
    if (this.frog.tongue) {
      const k = 1 - Math.abs(this.frog.tongue.t / TONGUE_TIME - 0.5) * 2;
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[this.frog.tongue.dir];
      const reach = this.frog.tongue.cells.length;
      const x0 = (fp.col + 0.5) * CELL, y0 = (fp.row + 0.5) * CELL;
      const x1 = x0 + d[0] * CELL * reach * k, y1 = y0 + d[1] * CELL * reach * k;
      if (this.frog.breathingFire) {
        g.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: 30 * k, color: 0xf08a24, alpha: 0.35, cap: 'round' });
        g.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: 16 * k, color: 0xf2c53d, alpha: 0.8, cap: 'round' });
        g.circle(x1, y1, 13 * k).fill({ color: 0xffffff, alpha: 0.9 });
      } else {
        g.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: 9, color: 0xe86fa7, cap: 'round' });
        g.circle(x1, y1, 8).fill(0xe86fa7);
      }
    }
    if (this.frog.frozen) {
      g.rect(0, 0, this.grid.width, this.grid.height).fill({ color: 0x9fd8ff, alpha: 0.12 });
    }
    if (this.frog.hasPower('invuln')) {
      g.circle(fs.x, fs.y, CELL * 0.72).stroke({ width: 4, color: 0x7fc7e8, alpha: 0.55 + Math.sin(this.time * 8) * 0.25 });
    }
    this.hud.setPower(this.frog.activePower());

    const s = this.shake.update(1 / 60);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() {
    return { sizeClass: this.frog.sizeClass, lives: this.frog.lives, hearts: this.frog.hearts };
  }

  destroy() {
    for (const [, s] of this.sprites) s.destroy();
    this.sprites.clear();
    this.particles.clear();
    this.world.destroy({ children: true });
  }
}
