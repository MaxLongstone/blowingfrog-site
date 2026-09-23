// The hidden level: unlocked once every other achievement is earned. One long
// crossing, same hop grammar as everywhere else in the game -- LEFT/RIGHT move
// a cell, SHIFT jumps two cells and does not care what is in the one it skips
// over. TNT makes the frog kaiju-big (which is also what makes it able to
// squash the seven things patrolling this road -- they are the bosses you
// already beat, shrunk down to the frog's old size). The beaker is the fire
// power the invader fight already has; the nuke is the invuln power every
// stage already has. Reaching the detonator at the far end wins it.
import { Shake, fitWorld } from '../core/grid.js';
import { Particles } from './particles.js';
import { Frog } from '../entities/frog.js';
import { resolve } from '../systems/collision.js';
import { KAIJU_SIZE } from '../config/stages.js';
import { HIDDEN } from '../config/hiddenlevel.js';
import { makeRng } from '../core/rng.js';
import { canHop, canJump, sizeAfterHit, nextPatrolCol } from './hiddenrules.js';

const W = 832, H = 960;
const CELL = 64;
const VIEW_COLS = W / CELL;               // 13
const GROUND_Y = H * 0.72;
const DUCK_TIME = 0.4;
const HURT_FLASH = 0.5;
const HOP_DUR = 0.16;    // a plain one-column move
const JUMP_DUR = 0.4;    // the two-column jump: longer and higher, so it reads as a jump
const HOP_ARC = 0.35;    // how high a plain move bobs, in cells
const JUMP_ARC = 1.15;   // how high the jump arcs, in cells

// Precomputed once: which columns you can stand on.
function buildSolid() {
  const solid = new Array(HIDDEN.cols).fill(true);
  for (const c of HIDDEN.gaps) solid[c] = false;
  for (const c of HIDDEN.pipes) solid[c] = false;
  return solid;
}
const LEVEL = { rows: 1, cols: HIDDEN.cols, solid: [buildSolid()] };
const R = 0; // the single row everything lives on, in LEVEL's own row-space

export class HiddenLevel {
  constructor({ app, textures, audio, hud, ach = null, score = 0 }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false; this.won = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    const fit = fitWorld(this.app, W, H);
    this.world.scale.set(fit.scale);
    this.baseX = fit.x; this.baseY = fit.y;
    this.bg = new PIXI.Sprite();
    this.tileLayer = new PIXI.Container();
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.tileLayer, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.drawBackdrop();
    this.buildTiles();

    this.frog = new Frog({ sizeClass: 1, lives: 3, hearts: 3, col: HIDDEN.startCol, row: R });
    this.frog.act1MaxLives = 3;
    this.frogSprite = new PIXI.Sprite();
    this.frogSprite.anchor.set(0.5, 1);
    this.layer.addChild(this.frogSprite);
    this.facing = 1; this.duckT = 0; this.hurtFlash = 0;
    // The frog's own on-screen glide, independent of Frog's built-in hop timer
    // so a jump can take its own, longer time to land than an ordinary step.
    this.action = null;         // { fromCol, toCol, t, dur, arc, jumping }
    this.drawCol = HIDDEN.startCol;
    this.camCol = HIDDEN.startCol;
    this.lastSafeCol = HIDDEN.startCol;

    this.enemies = HIDDEN.enemies.map((e) => ({ id: e.id, sprite_name: e.sprite, range: e.range, col: e.range[0], row: R, dir: 1, alive: true, squashed: false, squashT: 0, sprite: null }));
    this.pickups = [
      ...HIDDEN.tnt.map((p) => ({ ...p, kind: 'tnt', taken: false })),
      ...HIDDEN.beaker.map((p) => ({ ...p, kind: 'beaker', taken: false })),
      ...HIDDEN.nuke.map((p) => ({ ...p, kind: 'nuke', taken: false })),
      ...HIDDEN.burgers.map((p) => ({ ...p, kind: 'burger', taken: false })),
    ];
    this.pickupSprites = new Map();

    this.hud.setStage('WORLD ???', 'The level that does not exist.');
    this.hud.say('ARROWS MOVE · SPACE JUMPS TWO · IT DOES NOT CARE WHAT IT SKIPS', 4200);
    this.hud.setFuse(0);
    this.hud.setLives(this.frog.lives, false);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach((f) => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }
  colPx(col) { return col * CELL; }

  drawBackdrop() {
    const t = this.tex.get('hl_bg');
    if (t && t.width > 400) { this.bg.texture = t; const k = H / t.height; this.bg.scale.set(k); this.bg.y = 0; }
    else { const g = new PIXI.Graphics(); g.rect(0, 0, W, H).fill(0x6fb7e6); this.bg = g; this.world.addChildAt(g, 0); }
  }

  // The ground row is static once built: gaps and pipes never move, so this
  // only has to run once, not every frame.
  buildTiles() {
    for (let c = 0; c < HIDDEN.cols; c++) {
      const isGap = HIDDEN.gaps.includes(c);
      const isPipe = HIDDEN.pipes.includes(c);
      if (isGap) continue;
      const kind = isPipe ? 'hl_pipe_body' : 'hl_ground';
      const sp = new PIXI.Sprite(this.tex.get(kind));
      sp.anchor.set(0.5, 1);
      sp.scale.set(this.tex.scaleFor(kind));
      sp.x = this.colPx(c) + CELL / 2; sp.y = GROUND_Y + CELL / 2;
      this.tileLayer.addChild(sp);
      if (isPipe) {
        const top = new PIXI.Sprite(this.tex.get('hl_pipe_top'));
        top.anchor.set(0.5, 1); top.scale.set(this.tex.scaleFor('hl_pipe_top'));
        top.x = sp.x; top.y = GROUND_Y - CELL * 0.7;
        this.tileLayer.addChild(top);
      }
    }
    // a detonator waits at the goal
    const goal = new PIXI.Sprite(this.tex.get('hi_detonator'));
    goal.anchor.set(0.5, 1); goal.scale.set(this.tex.scaleFor('hi_detonator') * 1.3);
    goal.x = this.colPx(HIDDEN.goalCol) + CELL / 2; goal.y = GROUND_Y + CELL / 2;
    this.tileLayer.addChild(goal);
  }

  // ---- input --------------------------------------------------------------
  // Arrows move and turn to face that way; SPACE jumps two columns in whatever
  // direction the frog is already facing; SHIFT is just a cosmetic duck.
  intent(i) {
    if (this.over) return;
    if (i.type === 'hop') {
      if (i.dir === 'left' || i.dir === 'right') { this.facing = i.dir === 'right' ? 1 : -1; this.move(i.dir); }
      else this.duck();
      return;
    }
    if (i.type === 'tongue') { this.jump(); return; }
    this.duck();
  }

  duck() { this.duckT = DUCK_TIME; }
  get busy() { return !!this.action; }

  startAction(toCol, { jumping = false } = {}) {
    this.action = { fromCol: this.frog.col, toCol, t: 0, dur: jumping ? JUMP_DUR : HOP_DUR, arc: jumping ? JUMP_ARC : HOP_ARC, jumping };
    this.frog.col = toCol;
    this.lastSafeCol = toCol;
    this.checkGoal();
  }

  move(dir) {
    if (this.busy) return;
    const dest = canHop(LEVEL, this.frog.col, R, dir);
    if (!dest) { this.fall(); return; }
    this.audio.hop();
    this.startAction(dest.col);
  }

  jump() {
    if (this.busy) return;
    const dir = this.facing > 0 ? 'right' : 'left';
    const dest = canJump(LEVEL, this.frog.col, R, dir);
    this.audio.hop();
    if (!dest) {
      // nothing to land on two over: try one, so a jump right at the goal or
      // against a wall still does something instead of nothing
      const one = canHop(LEVEL, this.frog.col, R, dir);
      if (one) this.startAction(one.col, { jumping: true });
      else this.fall();
      return;
    }
    this.startAction(dest.col, { jumping: true });
  }

  // Stepping into a gap or a pipe you did not clear.
  fall() {
    if (this.frog.invuln > 0) return;
    this.hurtFlash = HURT_FLASH;
    this.shake.add(8);
    this.audio.hit();
    this.action = null;
    if (this.frog.isKaiju()) {
      this.frog.sizeClass = sizeAfterHit(this.frog.sizeClass, KAIJU_SIZE);
      this.frog.hearts = this.frog.maxHearts;
      this.frog.invuln = 1.2;
      this.hud.say('SHRUNK BACK DOWN', 1200);
      this.frog.col = this.lastSafeCol;
    } else {
      const out = this.frog.takeHit();
      this.frog.col = this.lastSafeCol;
      if (out === 'dead') { this.finish(false); return; }
      this.hud.say('BACK A FEW STEPS', 1000);
    }
    this.drawCol = this.frog.col;
    this.hud.setLives(this.frog.act === 2 ? this.frog.hearts : this.frog.lives, this.frog.act === 2);
    this.particles.burst(this.colPx(this.frog.col) + CELL / 2, GROUND_Y, 0xe23c2f, 16);
  }

  checkGoal() {
    if (this.frog.col >= HIDDEN.goalCol) this.finish(true);
  }

  finish(won) {
    this.over = true; this.won = won;
    if (won) {
      this.audio.win(); this.shake.add(14);
      this.particles.burst(this.colPx(HIDDEN.goalCol) + CELL / 2, GROUND_Y, 0xf2c53d, 40, 380);
      this.ach?.bump('worldQFinished');
    } else this.audio.lose();
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), won ? 1400 : 1200);
  }

  // ---- collectables and the ones patrolling the road -----------------------
  collect(p) {
    p.taken = true;
    this.audio.eat();
    this.particles.burst(this.colPx(p.col) + CELL / 2, GROUND_Y - 20, 0xf2c53d, 14);
    if (p.kind === 'tnt') {
      this.frog.sizeClass = Math.max(this.frog.sizeClass, KAIJU_SIZE);
      this.frog.hearts = this.frog.maxHearts;
      this.hud.say('BIG NOW', 1000);
      this.addScore(500);
    } else if (p.kind === 'beaker') {
      this.frog.gainPower('fire');
      this.hud.say('FIRE BREATH', 1000);
      this.addScore(300);
    } else if (p.kind === 'nuke') {
      this.frog.gainPower('invuln');
      this.hud.say('UNTOUCHABLE', 1000);
      this.addScore(400);
    } else {
      this.addScore(150);
    }
    this.hud.setLives(this.frog.act === 2 ? this.frog.hearts : this.frog.lives, this.frog.act === 2);
  }

  squash(e) {
    e.alive = false; e.squashed = true; e.squashT = 0.5;
    this.audio.squash(); this.shake.add(6);
    this.particles.debris(this.colPx(e.col) + CELL / 2, GROUND_Y, 10);
    this.addScore(300);
    this.ach?.bump('squashes');
  }

  // ---- the loop -------------------------------------------------------------
  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    this.frog.update(dt);
    if (this.action) { this.action.t += dt; if (this.action.t >= this.action.dur) this.action = null; }
    if (this.duckT > 0) this.duckT -= dt;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;

    for (const e of this.enemies) {
      if (!e.alive) { if (e.squashT > 0) e.squashT -= dt; continue; }
      e.stepT = (e.stepT ?? 0) - dt;
      if (e.stepT <= 0) {
        const next = nextPatrolCol(e, LEVEL);
        e.col = next.col; e.dir = next.dir;
        e.stepT = 0.55;
      }
    }

    // pickups: same cell, auto-collect
    const fc = Math.round(this.frog.col);
    for (const p of this.pickups) if (!p.taken && p.col === fc) this.collect(p);

    // enemies: squash if big, otherwise it costs you, exactly like collision.resolve already says
    const kaiju = this.frog.isKaiju();
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const eBounds = { x: e.col + 0.1, y: R + 0.1, w: 0.8, h: 0.8 };
      const outcome = resolve(this.frog, { bounds: () => eBounds }, { kaiju, invulnerable: this.frog.invuln > 0 });
      if (outcome === 'squash') this.squash(e);
      else if (outcome === 'damage') {
        this.hurtFlash = HURT_FLASH;
        const out = this.frog.takeHit();
        this.action = null;
        this.frog.col = this.lastSafeCol;
        this.drawCol = this.frog.col;
        this.hud.setLives(this.frog.act === 2 ? this.frog.hearts : this.frog.lives, this.frog.act === 2);
        if (out === 'dead') { this.finish(false); return; }
      }
    }

    this.render(dt);
  }

  // ---- what to draw -----------------------------------------------------------
  syncSprite(map, key, kind, x, y) {
    let sp = map.get(key);
    if (!sp) { sp = new PIXI.Sprite(); sp.anchor.set(0.5, 1); this.layer.addChild(sp); map.set(key, sp); }
    sp.texture = this.tex.get(kind);
    sp.scale.set(this.tex.scaleFor(kind));
    sp.x = x; sp.y = y;
    return sp;
  }

  frogTexture() {
    const big = this.frog.isKaiju();
    const fire = this.frog.breathingFire;
    const pfx = big ? 'hf_big' : 'hf_small';
    if (this.over) return `${pfx}_${this.won ? 'win' : 'dead'}`;
    if (this.action?.jumping) return fire ? `${pfx}_firerun` : `${pfx}_jump`;
    if (this.action) return fire ? `${pfx}_firerun` : `${pfx}_run2`;
    if (this.duckT > 0) return `${pfx}_duck`;
    if (this.hurtFlash > 0 && !big) return 'hf_small_dead';
    return fire ? `${pfx}_firerun` : `${pfx}_run1`;
  }

  render(dt) {
    // where the frog is actually drawn: mid-glide during a move or jump, its
    // resting column otherwise -- decoupled from Frog's own fixed hop timer
    // so a jump can take its own, longer time to land.
    const a = this.action;
    const drawnCol = a ? a.fromCol + (a.toCol - a.fromCol) * Math.min(1, a.t / a.dur) : this.frog.col;
    const arcK = a ? Math.sin(Math.PI * Math.min(1, a.t / a.dur)) * a.arc : 0;
    const p = { col: this.frog.col };
    const targetCam = Math.max(VIEW_COLS / 2, Math.min(HIDDEN.cols - VIEW_COLS / 2, drawnCol));
    this.camCol += (targetCam - this.camCol) * Math.min(1, dt * 6);
    const camX = this.colPx(this.camCol) - W / 2 + CELL / 2;
    this.tileLayer.x = -camX; this.layer.x = -camX;
    this.bg.x = -camX * 0.3;   // a little parallax

    // pickups
    const pSeen = new Set();
    for (const item of this.pickups) {
      if (item.taken) continue;
      pSeen.add(item.col);
      const kind = item.kind === 'tnt' ? 'hi_tnt' : item.kind === 'beaker' ? 'hi_beaker' : item.kind === 'nuke' ? 'hi_nuke' : 'hi_burger';
      const sp = this.syncSprite(this.pickupSprites, item.col, kind, this.colPx(item.col) + CELL / 2, GROUND_Y - 6);
      sp.y = GROUND_Y - 6 + Math.sin(this.time * 4 + item.col) * 4;
    }
    for (const [k, sp] of this.pickupSprites) if (!pSeen.has(k)) { sp.destroy(); this.pickupSprites.delete(k); }

    // enemies
    for (const e of this.enemies) {
      if (!e.alive && e.squashT <= 0) { if (e.sprite) { e.sprite.destroy(); e.sprite = null; } continue; }
      if (!e.sprite) { e.sprite = new PIXI.Sprite(); e.sprite.anchor.set(0.5, 1); this.layer.addChild(e.sprite); }
      const walkKind = e.alive ? `${e.sprite_name}_${1 + (Math.floor(this.time * 3) % 2)}` : `${e.sprite_name}_flat`;
      e.sprite.texture = this.tex.get(walkKind);
      e.sprite.scale.set(this.tex.scaleFor(walkKind) * (e.dir < 0 ? 1 : -1), this.tex.scaleFor(walkKind));
      e.sprite.x = this.colPx(e.col) + CELL / 2; e.sprite.y = GROUND_Y + CELL / 2;
    }

    // the frog
    const ft = this.frogTexture();
    this.frogSprite.texture = this.tex.get(ft);
    const big = this.frog.isKaiju();
    // The art faces right natively: face right unflipped, flip to face left.
    this.frogSprite.scale.set(this.tex.scaleFor(ft) * (this.facing > 0 ? 1 : -1) * (big ? 1.3 : 1), this.tex.scaleFor(ft) * (big ? 1.3 : 1));
    this.frogSprite.x = this.colPx(drawnCol) + CELL / 2;
    this.frogSprite.y = GROUND_Y + CELL / 2 - arcK * CELL;
    this.frogSprite.alpha = this.frog.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.4 : 1) : 1;

    const g = this.fx; g.clear();
    if (this.hurtFlash > 0) g.rect(0, 0, W, H).fill({ color: 0xe23c2f, alpha: this.hurtFlash * 0.5 });
    // a distance readout, so the crossing has a sense of how much is left
    const pct = Math.max(0, Math.min(1, (p.col - HIDDEN.startCol) / (HIDDEN.goalCol - HIDDEN.startCol)));
    g.roundRect(W * 0.25, 20, W * 0.5, 8, 4).fill({ color: 0x000000, alpha: 0.5 });
    g.roundRect(W * 0.25, 20, W * 0.5 * pct, 8, 4).fill(0xaab42a);

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = this.baseX + s.x; this.world.y = this.baseY + s.y;
  }

  frogState() { return { sizeClass: 1, lives: this.frog.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
