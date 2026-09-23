// The hidden level: unlocked once every other achievement is earned. One long
// crossing in the Mario manner -- stacks of blocks, wide tall pipes, and the
// seven bosses you already beat, shrunk down and each attacking differently
// (see systems/hiddenfoes.js). Arrows move and step up a block, SPACE jumps two
// columns and lands on top of a pipe, SHIFT breathes fire when you have the
// beaker. TNT makes the frog kaiju-big, and anything it touches is squashed.
import { Shake, fitWorld } from '../core/grid.js';
import { Particles } from './particles.js';
import { Frog } from '../entities/frog.js';
import { KAIJU_SIZE } from '../config/stages.js';
import { HIDDEN, buildHeights } from '../config/hiddenlevel.js';
import { makeRng } from '../core/rng.js';
import { hopTarget, jumpTarget, jumpArc, sizeAfterHit, crocArc } from './hiddenrules.js';
import { createFoes, EXPLODE_TIME, SWELL_TIME } from './hiddenfoes.js';

const W = 832, H = 960;
const CELL = 64;
const VIEW_COLS = W / CELL;
const SURF = H * 0.72 - CELL / 2;            // the top of the ground: what everything stands on
const elevY = (el) => SURF - el * CELL;      // screen y of a foot at `el` blocks above the ground
const px = (x) => x * CELL + CELL / 2;       // screen x of the middle of column x
const HOP_DUR = 0.16, JUMP_DUR = 0.42, HOP_ARC = 0.3;
const BLACKOUT_TIME = 3;
const FIRE_TIME = 0.5, HURT_FLASH = 0.5, HIT_INVULN = 1.6;
const HEIGHTS = buildHeights();
const LEVEL = { cols: HIDDEN.cols, heights: HEIGHTS };

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
    this.bgLayer = new PIXI.Container();
    this.tileLayer = new PIXI.Container();
    this.layer = new PIXI.Container();
    this.pipeLayer = new PIXI.Container();       // above the actors, so a piranha comes out from behind its pipe
    this.world.addChild(this.bgLayer, this.tileLayer, this.layer, this.pipeLayer);
    this.particles = new Particles(this.layer);
    this.wfx = new PIXI.Graphics();               // flames, shadows: drawn in world space
    this.layer.addChild(this.wfx);
    this.fx = new PIXI.Graphics();                // screen-space overlay
    this.world.addChild(this.fx);

    this.drawBackdrop();
    this.buildTiles();

    this.frog = new Frog({ sizeClass: 1, lives: 3, hearts: 3, col: HIDDEN.startCol, row: 0 });
    this.frog.act1MaxLives = 3;
    this.frogSprite = new PIXI.Sprite();
    this.frogSprite.anchor.set(0.5, 1);
    this.layer.addChild(this.frogSprite);
    this.facing = 1; this.duckT = 0; this.fireT = 0; this.hurtFlash = 0;
    this.action = null;              // { fromCol, toCol, fromH, toH, t, dur, arc, jumping }
    this.camCol = HIDDEN.startCol;
    this.lastSafeCol = HIDDEN.startCol;

    this.foes = createFoes(HIDDEN, { heights: HEIGHTS, pipes: HIDDEN.pipes });
    this.foeSprites = new Map();
    this.crocs = [];
    this.cows = [];
    this.blackout = 0;               // seconds of darkness left, after Neco goes off
    this.projSprites = new Map();
    this.pickups = [
      ...HIDDEN.tnt.map((p) => ({ ...p, kind: 'tnt', taken: false })),
      ...HIDDEN.beaker.map((p) => ({ ...p, kind: 'beaker', taken: false })),
      ...HIDDEN.nuke.map((p) => ({ ...p, kind: 'nuke', taken: false })),
      ...HIDDEN.burgers.map((p) => ({ ...p, kind: 'burger', taken: false })),
    ];
    this.pickupSprites = new Map();

    // what the foes are allowed to do to the world
    this.env = {
      frog: this.frogInfo(),
      heights: (c) => (c < 0 || c >= HIDDEN.cols ? -2 : HEIGHTS[c]),
      puff: (x, el) => this.puff(x, el),
      shake: (n) => this.shake.add(n),
      say: (t) => this.hud.say(t, 1400),
      throwCroc: (from, tx, dur) => this.throwCroc(from, tx, dur),
      dropCow: (x, el) => this.cows.push({ x, el, vy: 0 }),
    };

    this.hud.setStage('WORLD ???', 'The level that does not exist.');
    this.hud.say('ARROWS MOVE · SPACE JUMPS · SHIFT BREATHES FIRE · LAND ON THEIR HEADS', 4600);
    this.hud.setFuse(0);
    this.hud.setLives(this.frog.lives, false);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach((f) => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  // ---- the backdrop and the ground ----------------------------------------
  drawBackdrop() {
    const t = this.tex.get('hl_bg');
    this.bgW = 0;
    if (t && t.width > 400) {
      const k = H / t.height;
      this.bgW = t.width * k;
      for (let i = 0; i < 2; i++) { const s = new PIXI.Sprite(t); s.scale.set(k); s.x = i * this.bgW; this.bgLayer.addChild(s); }
    } else { const g = new PIXI.Graphics(); g.rect(0, 0, W, H).fill(0x6fb7e6); this.bgLayer.addChild(g); }
  }

  tile(kind, x, y, w, h, layer = this.tileLayer) {
    const sp = new PIXI.Sprite(this.tex.get(kind));
    sp.width = w; sp.height = h; sp.x = x; sp.y = y;
    layer.addChild(sp);
    return sp;
  }

  // Static once built, so this runs once.
  buildTiles() {
    for (let c = 0; c < HIDDEN.cols; c++) {
      const h = HEIGHTS[c];
      if (h < 0) continue;
      this.tile('hl_ground', c * CELL, SURF, CELL + 1, CELL + 1);
      const isPipe = HIDDEN.pipes.some((p) => c >= p.col && c < p.col + p.w);
      if (isPipe) continue;
      for (let i = 1; i <= h; i++) this.tile('hl_brick', c * CELL, SURF - i * CELL, CELL + 1, CELL + 1);
    }
    // wide, tall pipes: one body, one wider cap
    for (const p of HIDDEN.pipes) {
      const capH = CELL * 0.72, wPx = p.w * CELL;
      this.tile('hl_pipe_body', p.col * CELL + wPx * 0.05, SURF - p.h * CELL + capH * 0.6, wPx * 0.9, p.h * CELL - capH * 0.6, this.pipeLayer);
      this.tile('hl_pipe_top', p.col * CELL - wPx * 0.04, SURF - p.h * CELL, wPx * 1.08, capH, this.pipeLayer);
    }
    const goal = new PIXI.Sprite(this.tex.get('hi_detonator'));
    goal.anchor.set(0.5, 1); goal.scale.set(this.tex.scaleFor('hi_detonator') * 1.3);
    goal.x = px(HIDDEN.goalCol); goal.y = SURF + 2;
    this.tileLayer.addChild(goal);
  }

  // ---- where the frog is ----------------------------------------------------
  progress() { const a = this.action; return a ? Math.min(1, a.t / a.dur) : 1; }
  drawnCol() { const a = this.action; return a ? a.fromCol + (a.toCol - a.fromCol) * this.progress() : this.frog.col; }
  elevation() {
    const a = this.action;
    if (!a) return HEIGHTS[this.frog.col];
    const k = this.progress();
    return a.fromH + (a.toH - a.fromH) * k + Math.sin(Math.PI * k) * a.arc;
  }
  frogInfo() {
    return {
      x: this.drawnCol(), el: this.elevation(), facing: this.facing,
      falling: !!(this.action && this.action.jumping && this.progress() > 0.5),
      kaiju: this.frog.isKaiju(), star: this.frog.hasPower('invuln'), grace: this.frog.invuln > 0,
    };
  }

  // ---- input ------------------------------------------------------------------
  // Arrows move and turn to face that way; SPACE jumps in the direction the
  // frog faces; SHIFT breathes fire while the beaker's power lasts.
  intent(i) {
    if (this.over) return;
    if (i.type === 'hop') {
      if (i.dir === 'left' || i.dir === 'right') { this.facing = i.dir === 'right' ? 1 : -1; this.move(i.dir); }
      else this.duckT = 0.4;
      return;
    }
    if (i.type === 'tongue') { this.jump(); return; }
    this.breatheFire();
  }

  get busy() { return !!this.action; }

  startAction(toCol, { jumping = false } = {}) {
    const fromCol = this.frog.col;
    const arc = jumping ? jumpArc(LEVEL, fromCol, toCol) : HOP_ARC;
    this.action = { fromCol, toCol, fromH: HEIGHTS[fromCol], toH: HEIGHTS[toCol], t: 0, dur: jumping ? JUMP_DUR : HOP_DUR, arc, jumping };
    this.frog.col = toCol;
    this.lastSafeCol = toCol;
    this.checkGoal();
  }

  move(dir) {
    if (this.busy) return;
    const t = hopTarget(LEVEL, this.frog.col, dir);
    if (t.kind === 'fall') { this.fall(); return; }
    if (t.kind === 'blocked') { this.shake.add(2); return; }
    this.audio.hop();
    this.startAction(t.col);
  }

  jump() {
    if (this.busy) return;
    const dir = this.facing > 0 ? 'right' : 'left';
    const t = jumpTarget(LEVEL, this.frog.col, dir);
    this.audio.hop();
    if (t.kind === 'fall') { this.fall(); return; }
    if (t.kind === 'move') { this.startAction(t.col, { jumping: true }); return; }
    // nowhere to land two over: a hop in place of it, so a jump never does nothing
    const one = hopTarget(LEVEL, this.frog.col, dir);
    if (one.kind === 'move') this.startAction(one.col, { jumping: true });
    else if (one.kind === 'fall') this.fall();
    else this.shake.add(2);
  }

  breatheFire() {
    if (!this.frog.breathingFire || this.fireT > 0) { this.duckT = 0.4; return; }
    this.fireT = FIRE_TIME;
    this.audio.hit();
  }

  // Bounce off a head you just landed on, ready for the next stomp.
  bounce() {
    const col = this.frog.col;
    this.action = { fromCol: col, toCol: col, fromH: HEIGHTS[col], toH: HEIGHTS[col], t: 0, dur: 0.36, arc: 1.15, jumping: true };
  }

  // ---- getting hurt -------------------------------------------------------------
  // Stepping into a gap.
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
    this.hud.setLives(this.frog.act === 2 ? this.frog.hearts : this.frog.lives, this.frog.act === 2);
    this.particles.burst(px(this.frog.col), SURF, 0xe23c2f, 16);
  }

  // Something got to a small frog. (A big one is not hurt: it flattens things.)
  hurt() {
    if (this.frog.invuln > 0 || this.frog.isKaiju()) return;
    this.hurtFlash = HURT_FLASH;
    this.shake.add(7);
    this.audio.hit();
    const out = this.frog.takeHit();
    this.action = null;
    this.frog.col = this.lastSafeCol;
    this.frog.invuln = HIT_INVULN;
    this.hud.setLives(this.frog.act === 2 ? this.frog.hearts : this.frog.lives, this.frog.act === 2);
    if (out === 'dead') { this.finish(false); return; }
    this.hud.say('OUCH. REGROUP.', 900);
  }

  checkGoal() { if (this.frog.col >= HIDDEN.goalCol) this.finish(true); }

  finish(won) {
    this.over = true; this.won = won;
    if (won) {
      this.audio.win(); this.shake.add(14);
      this.particles.burst(px(HIDDEN.goalCol), SURF, 0xf2c53d, 40, 380);
      this.ach?.bump('worldQFinished');
    } else this.audio.lose();
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), won ? 1400 : 1200);
  }

  // ---- pickups, projectiles, effects -------------------------------------------
  collect(p) {
    p.taken = true;
    this.audio.eat();
    this.particles.burst(px(p.col), elevY(HEIGHTS[p.col]) - 20, 0xf2c53d, 14);
    if (p.kind === 'tnt') {
      this.frog.sizeClass = Math.max(this.frog.sizeClass, KAIJU_SIZE);
      this.frog.hearts = this.frog.maxHearts;
      this.hud.say('BIG NOW. EVERYTHING GETS SQUASHED.', 1400);
      this.addScore(500);
    } else if (p.kind === 'beaker') {
      this.frog.gainPower('fire');
      this.hud.say('FIRE BREATH: PRESS SHIFT', 1600);
      this.addScore(300);
    } else if (p.kind === 'nuke') {
      this.frog.gainPower('invuln');
      this.hud.say('UNTOUCHABLE. GO RUIN SOMEONE.', 1400);
      this.addScore(400);
    } else this.addScore(150);
    this.hud.setLives(this.frog.act === 2 ? this.frog.hearts : this.frog.lives, this.frog.act === 2);
  }

  puff(x, el) {
    const cx = px(x), cy = elevY(el);
    this.particles.burst(cx, cy, 0xffffff, 12, 130);
    this.particles.smoke(cx, cy, 6);
  }

  throwCroc(from, tx, dur) {
    const c = Math.round(tx);
    const el = c >= 0 && c < HIDDEN.cols && HEIGHTS[c] >= 0 ? HEIGHTS[c] : 0;
    this.crocs.push({ from, to: { x: tx, el }, t: 0, dur });
  }

  // Neco does not just fall over: he goes off in a cloud of black and the whole
  // screen goes dark for three seconds.
  explode(f) {
    f.burst = true;
    this.blackout = BLACKOUT_TIME;
    this.audio.hit(); this.shake.add(16);
    const cx = px(f.x), cy = elevY(f.level) - 30;
    this.particles.burst(cx, cy, 0x0b0b12, 26, 300);
    this.particles.smoke(cx, cy, 14);
    this.hud.say('NECO: LIGHTS OUT', 2600);
  }

  killFoe(f, points, say) {
    if (!f.alive) return;
    f.alive = false; f.deadT = f.explodes ? EXPLODE_TIME : 0.6; f.deadLook = 'flat';
    this.audio.squash(); this.shake.add(5);
    this.particles.debris(px(f.x), elevY(f.level) - 10, 10);
    this.addScore(points);
    this.ach?.bump('squashes');
    if (say) this.hud.say(say, 900);
  }

  // ---- the loop ----------------------------------------------------------------
  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    this.frog.update(dt);
    if (this.action) { this.action.t += dt; if (this.action.t >= this.action.dur) this.action = null; }
    if (this.duckT > 0) this.duckT -= dt;
    if (this.fireT > 0) this.fireT -= dt;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    if (this.blackout > 0) this.blackout -= dt;

    this.env.frog = this.frogInfo();
    const info = this.env.frog;

    for (const f of this.foes) {
      if (!f.alive) { if (f.deadT > 0) f.deadT -= dt; continue; }
      if (f.lock > 0) f.lock -= dt;
      f.update(dt, this.env);
    }
    this.updateProjectiles(dt, info);
    for (const f of this.foes) if (!f.alive && f.explodes && !f.burst && f.deadT <= EXPLODE_TIME - SWELL_TIME) this.explode(f);

    // pickups: you have to actually be there
    const fc = Math.round(info.x);
    for (const p of this.pickups) if (!p.taken && p.col === fc && Math.abs(info.el - HEIGHTS[p.col]) < 0.8) this.collect(p);

    // fire
    if (this.fireT > 0) {
      for (const f of this.foes) {
        if (!f.alive) continue;
        const ahead = (f.x - info.x) * this.facing;
        const vertical = f.type === 'ufo' ? 6 : 2.6;
        const out = f.type === 'chaco' && f.r < 0.3;
        if (!out && ahead > 0.2 && ahead < (f.fireReach ?? 4) && Math.abs((f.el ?? f.level) - info.el) < vertical) this.killFoe(f, 400, 'BURNED');
      }
    }

    // a kicked Landlord flattens whatever it slides into
    for (const k of this.foes) {
      if (!k.alive || !k.lethalToFoes?.()) continue;
      for (const g of this.foes) if (g !== k && g.alive && g.type !== 'ufo' && g.type !== 'ghost' && g.type !== 'chaco' && Math.abs(g.x - k.x) < 0.7 && g.level === k.level) this.killFoe(g, 300, 'STRIKE');
    }

    // the frog against the foes
    for (const f of this.foes) {
      if (!f.alive || this.over || f.lock > 0) continue;
      const v = f.hit(info);
      if (v === 'none') continue;
      if (info.kaiju || info.star) { this.killFoe(f, 300); continue; }       // big, or on the nuke: everything is flattened
      if (info.grace) continue;                                              // just been hurt: a moment to get clear
      if (v === 'stomp') {
        const r = f.stomp?.(info);
        if (r) { this.audio.squash(); this.shake.add(4); this.addScore(r.points ?? 0); if (r.say) this.hud.say(r.say, 900); if (r.bounce) { this.bounce(); f.lock = 0.5; } this.ach?.bump('squashes'); }
        else this.hurt();
      } else if (v === 'jumped') {
        const r = f.jumped();
        this.addScore(r.points); this.hud.say(r.say, 900); this.audio.squash();
      } else if (v === 'touch') {
        const r = f.touch?.(info);
        if (r) { this.addScore(r.points ?? 0); if (r.say) this.hud.say(r.say, 800); this.audio.squash(); }
        else this.hurt();
      }
    }

    this.render(dt);
  }

  updateProjectiles(dt, info) {
    const hitsFrog = (x, el) => Math.abs(x - info.x) < 0.55 && Math.abs((el + 0.3) - (info.el + 0.45)) < 0.75;
    const strike = () => { if (!info.kaiju && !info.star && !info.grace) this.hurt(); return !info.grace || info.kaiju || info.star; };
    for (let i = this.crocs.length - 1; i >= 0; i--) {
      const c = this.crocs[i];
      c.t += dt;
      const k = c.t / c.dur, p = crocArc(c.from, c.to, k);
      c.x = p.x; c.el = p.el;
      if (hitsFrog(c.x, c.el) && strike(c)) { this.particles.debris(px(c.x), elevY(c.el), 8, 0xd9c8a0); this.crocs.splice(i, 1); continue; }
      if (k >= 1) { this.particles.debris(px(c.to.x), elevY(c.to.el), 6, 0xd9c8a0); this.crocs.splice(i, 1); }
    }
    for (let i = this.cows.length - 1; i >= 0; i--) {
      const c = this.cows[i];
      c.vy += 14 * dt; c.el -= c.vy * dt;
      const ground = HEIGHTS[Math.max(0, Math.min(HIDDEN.cols - 1, Math.round(c.x)))];
      if (hitsFrog(c.x, c.el) && strike(c)) { this.particles.debris(px(c.x), elevY(c.el), 10, 0xf4f2ec); this.cows.splice(i, 1); continue; }
      if (ground < 0 && c.el < -2) { this.cows.splice(i, 1); continue; }
      if (ground >= 0 && c.el <= ground) { this.shake.add(4); this.particles.burst(px(c.x), elevY(ground), 0xf4f2ec, 10, 160); this.cows.splice(i, 1); }
    }
  }

  // ---- what to draw ------------------------------------------------------------------
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
    const pfx = big ? 'hf_big' : 'hf_small';
    if (this.over) return `${pfx}_${this.won ? 'win' : 'dead'}`;
    if (this.fireT > 0) return big ? 'hf_big_fire' : 'hf_small_jump';
    if (this.action?.jumping) return `${pfx}_jump`;
    if (this.action) return this.frog.breathingFire && big ? 'hf_big_firerun' : `${pfx}_run2`;
    if (this.duckT > 0) return `${pfx}_duck`;
    if (this.hurtFlash > 0 && !big) return 'hf_small_dead';
    return `${pfx}_idle`;
  }

  render(dt) {
    const info = this.frogInfo();
    const targetCam = Math.max(VIEW_COLS / 2, Math.min(HIDDEN.cols - VIEW_COLS / 2, info.x));
    this.camCol += (targetCam - this.camCol) * Math.min(1, dt * 6);
    const camX = this.camCol * CELL - W / 2 + CELL / 2;
    this.tileLayer.x = -camX; this.layer.x = -camX; this.pipeLayer.x = -camX;
    if (this.bgW) this.bgLayer.x = -((camX * 0.3) % this.bgW);

    // pickups
    const seen = new Set();
    for (const item of this.pickups) {
      if (item.taken) continue;
      seen.add(item.col);
      const kind = item.kind === 'tnt' ? 'hi_tnt' : item.kind === 'beaker' ? 'hi_beaker' : item.kind === 'nuke' ? 'hi_nuke' : 'hi_burger';
      const sp = this.syncSprite(this.pickupSprites, item.col, kind, px(item.col), elevY(HEIGHTS[item.col]) - 4);
      sp.y += Math.sin(this.time * 4 + item.col) * 4;
    }
    for (const [k, sp] of this.pickupSprites) if (!seen.has(k)) { sp.destroy(); this.pickupSprites.delete(k); }

    // the foes
    for (const f of this.foes) {
      let sp = this.foeSprites.get(f.id);
      if (!f.alive && f.deadT <= 0) { if (sp) { sp.destroy(); this.foeSprites.delete(f.id); } continue; }
      const v = f.view();
      if (!sp) { sp = new PIXI.Sprite(); sp.anchor.set(0.5, 1); this.layer.addChild(sp); this.foeSprites.set(f.id, sp); }
      sp.visible = !v.hidden;
      sp.texture = this.tex.get(v.tex);
      const s = this.tex.scaleFor(v.tex);
      const mul = v.scaleMul ?? 1;
      sp.scale.set(s * mul * (v.flip ? -1 : 1), s * mul);
      sp.x = px(f.x + (v.xOff ?? 0)); sp.y = elevY(v.elev) + 3;
      sp.tint = v.tint ?? 0xffffff;
      sp.alpha = v.alpha ?? 1;
      sp.rotation = v.spin ?? 0;
      if (v.spin) { sp.anchor.set(0.5, 0.5); sp.y -= 20; } else sp.anchor.set(0.5, 1);
    }

    // crocs and cows in the air
    const pseen = new Set();
    this.crocs.forEach((c, i) => {
      const key = 'croc' + i; pseen.add(key);
      const sp = this.syncSprite(this.projSprites, key, 'croc_shoe', px(c.x), elevY(c.el));
      sp.anchor.set(0.5, 0.5); sp.rotation = c.t * 12;
    });
    this.cows.forEach((c, i) => {
      const key = 'cow' + i; pseen.add(key);
      const sp = this.syncSprite(this.projSprites, key, 'hi_cow', px(c.x), elevY(c.el));
      sp.anchor.set(0.5, 0.5); sp.rotation = Math.sin(this.time * 8 + i) * 0.4;
    });
    for (const [k, sp] of this.projSprites) if (!pseen.has(k)) { sp.destroy(); this.projSprites.delete(k); }

    // the frog
    const ft = this.frogTexture();
    this.frogSprite.texture = this.tex.get(ft);
    const big = info.kaiju;
    // the art faces right natively: unflipped to face right, flipped to face left
    this.frogSprite.scale.set(this.tex.scaleFor(ft) * (this.facing > 0 ? 1 : -1) * (big ? 1.3 : 1), this.tex.scaleFor(ft) * (big ? 1.3 : 1));
    this.frogSprite.x = px(info.x);
    this.frogSprite.y = elevY(info.el) + 2;
    this.frogSprite.alpha = this.frog.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.4 : 1) : 1;

    // flames, cow shadows
    const g = this.wfx; g.clear();
    if (this.fireT > 0) {
      const k = 1 - this.fireT / FIRE_TIME, len = CELL * 3.6 * Math.min(1, k * 3);
      const x0 = px(info.x) + this.facing * CELL * (big ? 0.7 : 0.5), y0 = elevY(info.el) - CELL * (big ? 0.85 : 0.6);
      const flick = Math.sin(this.time * 60) * 6;
      g.poly([x0, y0, x0 + this.facing * len, y0 - 26 - flick, x0 + this.facing * len * 0.9, y0 + 26 + flick]).fill({ color: 0xf08a24, alpha: 0.9 });
      g.poly([x0, y0, x0 + this.facing * len * 0.7, y0 - 12, x0 + this.facing * len * 0.65, y0 + 12]).fill({ color: 0xffe066, alpha: 0.95 });
    }
    for (const c of this.cows) {                 // a shadow on the ground says where it is going to land
      const ground = HEIGHTS[Math.max(0, Math.min(HIDDEN.cols - 1, Math.round(c.x)))];
      if (ground >= 0) g.ellipse(px(c.x), elevY(ground) + 2, 24, 6).fill({ color: 0x000000, alpha: 0.3 });
    }
    for (const f of this.foes) {                 // the Narrator's warning: a red bar along the ground where it will dash
      if (f.alive && f.type === 'narrator' && f.state === 'twinkle') g.rect(px(f.x) - CELL * 0.4, elevY(f.level) - 6, CELL * 0.8, 6).fill({ color: 0xe23c2f, alpha: 0.6 });
    }

    const o = this.fx; o.clear();
    if (this.hurtFlash > 0) o.rect(0, 0, W, H).fill({ color: 0xe23c2f, alpha: this.hurtFlash * 0.5 });
    if (this.blackout > 0) {                     // black in fast, out slowly; two glowing eyes are all that is left of the frog
      const a = Math.min(1, (BLACKOUT_TIME - this.blackout) / 0.2) * Math.min(1, this.blackout / 0.6);
      o.rect(0, 0, W, H).fill({ color: 0x000000, alpha: a });
      const ex = px(info.x) - camX, ey = elevY(info.el) - CELL * (info.kaiju ? 0.9 : 0.6);
      for (const d of [-1, 1]) o.circle(ex + d * 7, ey, 3.5).fill({ color: 0xf4f2ec, alpha: a });
    }
    const pct = Math.max(0, Math.min(1, (info.x - HIDDEN.startCol) / (HIDDEN.goalCol - HIDDEN.startCol)));
    o.roundRect(W * 0.25, 20, W * 0.5, 8, 4).fill({ color: 0x000000, alpha: 0.5 });
    o.roundRect(W * 0.25, 20, W * 0.5 * pct, 8, 4).fill(0xaab42a);

    this.particles.update(dt);
    const sh = this.shake.update ? this.shake.update(dt) : { x: 0, y: 0 };
    this.world.x = this.baseX + (sh.x || 0); this.world.y = this.baseY + (sh.y || 0);
  }

  frogState() { return { sizeClass: 1, lives: this.frog.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
