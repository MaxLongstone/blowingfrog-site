// Boss six, rebuilt: UMMA as a Donkey Kong climb. Fixed girders and ladders,
// offset so no climb is a straight line up; she stands at the top throwing
// Crocs that roll along a girder and tumble down to the next one at each edge,
// cascading toward the ground the way a barrel does. SHIFT jumps over
// whatever is rolling through your column -- not at her, never at her, there
// is still no punch in this fight. Banchan on the girders fills the universal
// fuse; filling it does not hurt her here, it makes her proud, and she stops
// throwing for a few seconds. She still barks an order mid-climb, same three
// as always, and she still trips over her own front hall once you reach her
// a third time.
import { Shake, fitWorld } from '../core/grid.js';
import { Particles } from './particles.js';
import { UMMA } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';
import { ladderAt, canClimb, cascadeStep } from './dkrules.js';

const W = 832, H = 960;
const TOP_Y = 150, BOTTOM_Y = 860;
const MARGIN = 60;
const STEP_TIME = 0.14;
const LADDER_TIME = 0.32;
const JUMP_INVULN = 0.35, JUMP_COOLDOWN = 1.0;
const SOUP_SPLASH = 0.3;

let nextId = 1;

export class UmmaFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = UMMA; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;

    this.levels = this.boss.levels; this.cols = this.boss.cols;
    this.gap = (BOTTOM_Y - TOP_Y) / (this.levels - 1);
    this.girderW = W - 2 * MARGIN;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    const fit = fitWorld(this.app, W, H);
    this.world.scale.set(fit.scale);
    this.baseX = fit.x; this.baseY = fit.y;
    this.bg = new PIXI.Graphics();
    this.plate = new PIXI.Sprite(); this.plate.visible = false;
    this.structure = new PIXI.Container();
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.plate, this.structure, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.ummaSprite = new PIXI.Sprite(this.tex.get('umma_idle'));
    this.ummaSprite.anchor.set(0.5, 1);
    this.frogSprite = new PIXI.Sprite(this.tex.get('ummafrog_guard'));
    this.frogSprite.anchor.set(0.5, 1);
    this.goalSprite = new PIXI.Sprite(this.tex.get('dk_ricecooker'));
    this.goalSprite.anchor.set(0.5, 1);
    this.layer.addChild(this.goalSprite, this.ummaSprite, this.frogSprite);
    this.crocSprites = new Map(); this.banchanSprites = new Map();
    this.soupSprite = null;

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.invuln = 0; this.jumpT = 0; this.jumpCooldown = 0;
    this.fuse = 0; this.proudT = 0;
    this.roundIndex = 0;

    this.state = 'intro'; this.stateT = 1.2;

    this.drawBackdrop();
    this.hud.setStage('UMMA', 'ARROWS climb · SHIFT jump · SPACE eat · listen when she talks');
    this.hud.say('SHIFT JUMPS OVER WHAT ROLLS THROUGH · THERE IS NO PUNCH HERE', 4200);
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
    this.startRound(0);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }
  colX(col) { return MARGIN + (col + 0.5) * (this.girderW / this.cols); }
  levelY(level) { return BOTTOM_Y - level * this.gap; }

  drawBackdrop() {
    const t = this.tex.get('dk_bg');
    if (t && t.width > 600) {
      const k = Math.max(W / t.width, H / t.height);
      this.plate.texture = t; this.plate.scale.set(k);
      this.plate.x = (W - t.width * k) / 2; this.plate.y = (H - t.height * k) / 2;
      this.plate.visible = true;
    } else {
      const g = this.bg; g.clear();
      g.rect(0, 0, W, H).fill(0x1b1712);
      for (let i = 0; i < 10; i++) g.rect(i * (W / 10), 0, 2, H).fill({ color: 0x6a4f30, alpha: 0.25 });
    }
    this.buildStructure();
  }

  // The girders and ladders never move once placed, so they are built once
  // here rather than redrawn every frame.
  buildStructure() {
    this.structure.removeChildren();
    for (let level = 0; level < this.levels; level++) {
      const g = new PIXI.Sprite(this.tex.get('dk_girder'));
      g.anchor.set(0.5); g.width = this.girderW + 20; g.height = 28;
      g.x = W / 2; g.y = this.levelY(level);
      this.structure.addChild(g);
    }
    for (const l of this.boss.ladders) {
      const lad = new PIXI.Sprite(this.tex.get('dk_ladder'));
      lad.anchor.set(0.5, 1); lad.width = 44; lad.height = this.gap + 20;
      lad.x = this.colX(l.col); lad.y = this.levelY(l.level + 1) + 10;
      this.structure.addChild(lad);
    }
  }

  // ---- a round: frog back at the bottom, the board cleared, freshly hard
  startRound(idx) {
    this.roundIndex = idx;
    this.fuse = 0; this.hud.setFuse(0);
    this.proudT = 0;
    this.frog = { level: 0, col: Math.floor(this.cols / 2), climb: null, facing: 1 };
    this.frogPix = { x: this.colX(this.frog.col), y: this.levelY(0) };
    this.crocs = []; this.soup = null;
    this.banchan = [];
    for (let i = 0; i < this.boss.minBanchan + 1; i++) this.spawnBanchan();
    this.throwTimer = this.boss.throwEvery[idx] * 0.6;
    this.soupTimer = this.rng.range(...[this.boss.soupEvery[idx] * 0.7, this.boss.soupEvery[idx]]);
    this.commandTimer = this.rng.range(...[this.boss.commandEvery[idx] * 0.6, this.boss.commandEvery[idx]]);
    this.command = null;
    this.hud.say(`ROUND ${idx + 1}`, 1400);
  }

  spawnBanchan() {
    for (let tries = 0; tries < 30; tries++) {
      const level = this.rng.int(0, this.levels - 2), col = this.rng.int(0, this.cols - 1);
      if (this.banchan.some((b) => b.level === level && b.col === col)) continue;
      this.banchan.push({ id: nextId++, level, col });
      return;
    }
  }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over || this.state === 'finale' || this.state === 'roundwon') return;
    if (this.command?.def.need === 'freeze' && (i.type === 'hop' || i.type === 'punch')) this.command.moved = true;
    if (i.type === 'hop') { this.move(i.dir); return; }
    if (i.type === 'punch') { this.jump(); return; }
    this.eat();
  }

  move(dir) {
    if (this.frog.climb) return;
    if (dir === 'left' || dir === 'right') {
      this.frog.facing = dir === 'right' ? 1 : -1;
      const nc = this.frog.col + this.frog.facing;
      if (nc < 0 || nc >= this.cols) return;
      this.frog.col = nc; this.audio.hop();
      return;
    }
    const up = dir === 'up';
    if (up && this.frog.level >= this.levels - 1) return;
    if (!up && this.frog.level <= 0) return;
    if (!canClimb(this.boss.ladders, this.frog.level, this.frog.col, up ? 'up' : 'down')) {
      this.hud.say('NO LADDER HERE', 500); return;
    }
    this.frog.climb = { from: this.frog.level, to: this.frog.level + (up ? 1 : -1), t: 0 };
    this.audio.hop();
  }

  jump() {
    if (this.jumpCooldown > 0 || this.frog.climb) return;
    this.jumpT = JUMP_INVULN; this.jumpCooldown = JUMP_COOLDOWN;
    this.audio.hop();
    this.particles.spark(this.frogPix.x, this.frogPix.y - 20, 0xffffff, 8);
  }

  eat() {
    if (this.frog.climb) return;
    const i = this.banchan.findIndex((b) => b.level === this.frog.level && b.col === this.frog.col);
    if (i === -1) { this.hud.say('NOTHING TO EAT', 500); this.audio.tongue(); return; }
    const b = this.banchan.splice(i, 1)[0];
    this.audio.tongue(); this.audio.eat();
    this.particles.burst(this.colX(b.col), this.levelY(b.level), 0xf2c53d, 12);
    this.addScore(this.boss.scoring.banchan);
    this.ach?.bump('midairEats');
    if (this.command?.def.need === 'eat') this.command.satisfied = true;
    this.fuse = Math.min(this.boss.fuseTarget, this.fuse + 1);
    this.hud.setFuse(this.fuse);
    if (this.fuse >= this.boss.fuseTarget) this.proud();
  }

  proud() {
    this.fuse = 0; this.hud.setFuse(0);
    this.proudT = this.boss.proudFor;
    this.crocs = []; this.soup = null;
    this.audio.win();
    this.hud.say('SHE IS PROUD OF YOU', 1800);
    this.particles.burst(this.ummaSprite.x, this.ummaSprite.y - 60, 0xffb703, 20);
  }

  // ---- damage -------------------------------------------------------------
  takeHit(dmg) {
    if (this.invuln > 0 || this.jumpT > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.0;
    this.audio.hit(); this.shake.add(10);
    this.particles.burst(this.frogPix.x, this.frogPix.y - 20, 0xe23c2f, 18);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish(false);
  }

  finish() {
    this.over = true;
    this.audio.lose();
    setTimeout(() => this.emit('lost', { score: this.score }), 1500);
  }

  roundWon() {
    this.addScore(this.boss.scoring.roundClear);
    this.state = 'roundwon'; this.stateT = 1.4;
    if (this.roundIndex + 1 >= this.boss.outburstsToWin) { this.finaleSequence(); return; }
    this.hud.say(`ROUND CLEARED. ${this.boss.outburstsToWin - this.roundIndex - 1} LEFT.`, 1800);
  }

  finaleSequence() {
    this.over = true;
    this.state = 'finale';
    this.ummaSprite.texture = this.tex.get('umma_pride');
    this.emit('finale', { text: this.boss.finale.card });
    this.audio.warn();
    setTimeout(() => {
      this.ummaSprite.texture = this.tex.get('umma_trip');
      this.audio.boom(); this.shake.add(18);
      this.particles.burst(this.ummaSprite.x, this.ummaSprite.y - 40, 0xffb703, 50, 420);
    }, 1000);
    setTimeout(() => {
      this.audio.win(); this.ach?.bump('stagesCleared'); this.ach?.bump('ummaCleared');
    }, 2200);
    setTimeout(() => this.emit('won', { score: this.score }), 3800);
  }

  // ---- the loop -------------------------------------------------------------
  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.jumpT > 0) this.jumpT -= dt;
    if (this.jumpCooldown > 0) this.jumpCooldown -= dt;
    if (this.proudT > 0) this.proudT -= dt;

    if (this.state === 'intro') { this.stateT -= dt; if (this.stateT <= 0) this.state = 'idle'; }
    if (this.state === 'roundwon') {
      this.stateT -= dt;
      if (this.stateT <= 0) { this.state = 'idle'; this.startRound(this.roundIndex + 1); }
      this.render(dt); return;
    }

    // climbing: a timed tween between two levels, nothing else can happen mid-climb
    if (this.frog.climb) {
      this.frog.climb.t += dt;
      if (this.command?.def.need === 'ladder') this.command.satisfied = true;
      if (this.frog.climb.t >= LADDER_TIME) {
        this.frog.level = this.frog.climb.to;
        this.frog.climb = null;
        if (this.frog.level >= this.levels - 1) { this.roundWon(); this.render(dt); return; }
      }
    }

    // banchan: keep the minimum topped up
    this.banchanTimer = (this.banchanTimer ?? 0) - dt;
    if (this.banchan.length < this.boss.minBanchan && this.banchanTimer <= 0) {
      this.spawnBanchan();
      this.banchanTimer = this.rng.range(...this.boss.banchanRespawn);
    }

    if (this.proudT <= 0) {
      // thrown Crocs, rolling and tumbling down the girders
      this.throwTimer -= dt;
      if (this.throwTimer <= 0 && this.crocs.length < this.boss.maxCrocsOnScreen) {
        const fromLeft = this.rng() < 0.5;
        this.crocs.push({ id: nextId++, level: this.levels - 1, col: fromLeft ? 0 : this.cols - 1, dir: fromLeft ? 1 : -1, moveT: 0.3 });
        this.throwTimer = this.boss.throwEvery[this.roundIndex] * this.rng.range(0.85, 1.15);
        this.audio.tick();
      }
      // the hot jar: a tell locked to wherever the frog is standing, then a splash
      this.soupTimer -= dt;
      if (this.soupTimer <= 0 && !this.soup && !this.frog.climb) {
        this.soup = { level: this.frog.level, col: this.frog.col, t: 0 };
        this.soupTimer = this.boss.soupEvery[this.roundIndex];
        this.audio.warn();
      }
    }

    const survivors = [];
    for (const c of this.crocs) {
      c.moveT -= dt;
      if (c.moveT > 0) { survivors.push(c); continue; }
      const speed = this.boss.crocSpeed[this.roundIndex];
      const next = cascadeStep(c, this.cols);
      if (next) { next.moveT = 1 / speed; survivors.push(next); }
    }
    this.crocs = survivors;
    for (const c of this.crocs) {
      if (!this.frog.climb && c.level === this.frog.level && c.col === this.frog.col) this.takeHit(1);
    }

    if (this.soup) {
      this.soup.t += dt;
      if (this.soup.t >= this.boss.soupTell) {
        if (!this.frog.climb && this.frog.level === this.soup.level && this.frog.col === this.soup.col) this.takeHit(1);
        this.particles.burst(this.colX(this.soup.col), this.levelY(this.soup.level), 0xe23c2f, 16);
        this.audio.squash();
        this.soup = null;
      }
    }

    // barked commands
    if (!this.command) {
      this.commandTimer -= dt;
      if (this.commandTimer <= 0 && !this.frog.climb) {
        const keys = Object.keys(this.boss.commands);
        const key = this.rng.pick(keys);
        const def = this.boss.commands[key];
        this.command = { key, def, t: 0, moved: false, satisfied: false };
        this.hud.say(def.line, def.window * 1000);
        this.audio.warn();
      }
    } else {
      this.command.t += dt;
      if (this.command.t >= this.command.def.window) {
        const need = this.command.def.need;
        const ok = need === 'freeze' ? !this.command.moved : this.command.satisfied;
        if (ok) { this.addScore(this.boss.scoring.commandGood); this.hud.say('GOOD.', 700); }
        else { this.hud.say('WRONG.', 700); this.takeHit(1); }
        this.command = null;
        this.commandTimer = this.boss.commandEvery[this.roundIndex] * this.rng.range(0.85, 1.2);
      }
    }

    this.render(dt);
  }

  // ---- what to draw -----------------------------------------------------------
  syncSprite(map, key, kind, target) {
    let e = map.get(key);
    if (!e) { e = new PIXI.Sprite(); e.anchor.set(0.5); this.layer.addChild(e); map.set(key, e); }
    e.texture = this.tex.get(kind);
    e.scale.set(this.tex.scaleFor(kind));
    e.x = target.x; e.y = target.y;
    return e;
  }

  render(dt) {
    // UMMA, perched at the top
    const goalCol = Math.floor(this.cols / 2);
    if (this.state !== 'finale') {
      this.ummaSprite.texture = this.tex.get(this.proudT > 0 ? 'umma_scold' : this.crocs.some((c) => c.level === this.levels - 1) ? 'umma_throw' : 'umma_idle');
    }
    const uk = this.tex.scaleFor(this.ummaSprite.texture === this.tex.get('umma_pride') ? 'umma_pride' : 'umma_idle');
    this.ummaSprite.scale.set(-uk * 1.6, uk * 1.6);
    this.ummaSprite.x = this.colX(goalCol) - 40; this.ummaSprite.y = this.levelY(this.levels - 1) + 6;
    this.goalSprite.scale.set(this.tex.scaleFor('dk_ricecooker') * 1.1);
    this.goalSprite.x = this.colX(goalCol) + 60; this.goalSprite.y = this.levelY(this.levels - 1) + 6;

    // banchan
    const bSeen = new Set();
    for (const b of this.banchan) {
      bSeen.add(b.id);
      const sp = this.syncSprite(this.banchanSprites, b.id, 'dk_banchan', { x: this.colX(b.col), y: this.levelY(b.level) - 14 });
      sp.rotation = Math.sin(this.time * 4 + b.col) * 0.1;
    }
    for (const [k, sp] of this.banchanSprites) if (!bSeen.has(k)) { sp.destroy(); this.banchanSprites.delete(k); }

    // Crocs
    const cSeen = new Set();
    for (const c of this.crocs) {
      cSeen.add(c.id);
      const sp = this.syncSprite(this.crocSprites, c.id, 'dk_crocs', { x: this.colX(c.col), y: this.levelY(c.level) - 16 });
      sp.rotation = this.time * 6 * c.dir;
    }
    for (const [k, sp] of this.crocSprites) if (!cSeen.has(k)) { sp.destroy(); this.crocSprites.delete(k); }

    // the soup jar's tell
    if (this.soup) {
      if (!this.soupSprite) { this.soupSprite = new PIXI.Sprite(); this.soupSprite.anchor.set(0.5, 1); this.layer.addChild(this.soupSprite); }
      this.soupSprite.visible = true;
      this.soupSprite.texture = this.tex.get('dk_jar');
      this.soupSprite.scale.set(this.tex.scaleFor('dk_jar'));
      this.soupSprite.x = this.colX(this.soup.col); this.soupSprite.y = this.levelY(this.soup.level) - 14;
      this.soupSprite.alpha = 0.4 + 0.6 * (this.soup.t / this.boss.soupTell);
    } else if (this.soupSprite) this.soupSprite.visible = false;

    // the frog
    const targetX = this.colX(this.frog.col);
    let targetY;
    if (this.frog.climb) {
      const k = Math.min(1, this.frog.climb.t / LADDER_TIME);
      targetY = this.levelY(this.frog.climb.from) + (this.levelY(this.frog.climb.to) - this.levelY(this.frog.climb.from)) * k;
    } else targetY = this.levelY(this.frog.level);
    this.frogPix.x += (targetX - this.frogPix.x) * Math.min(1, dt / STEP_TIME);
    this.frogPix.y += (targetY - this.frogPix.y) * Math.min(1, (this.frog.climb ? 1 : dt / STEP_TIME));
    const ft = this.jumpT > 0 ? 'ummafrog_win' : this.invuln > 0.7 ? 'ummafrog_hurt'
      : this.frog.facing < 0 ? 'ummafrog_left' : 'ummafrog_right';
    this.frogSprite.texture = this.tex.get(ft);
    this.frogSprite.scale.set(this.tex.scaleFor(ft) * (this.jumpT > 0 ? 1.15 : 1));
    this.frogSprite.x = this.frogPix.x;
    this.frogSprite.y = this.frogPix.y - (this.jumpT > 0 ? 22 : 0);
    this.frogSprite.visible = this.state !== 'finale';
    this.frogSprite.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.4 : 1) : 1;

    const g = this.fx; g.clear();
    for (let i = 0; i < this.boss.outburstsToWin; i++)
      g.circle(W / 2 - 30 + i * 30, 26, 8).fill({ color: i < this.roundIndex + (this.state === 'roundwon' ? 1 : 0) ? 0xaab42a : 0x2a2a30, alpha: 0.95 });
    if (this.proudT > 0) {
      const p = this.proudT / this.boss.proudFor;
      g.roundRect(W * 0.25, 44, W * 0.5, 10, 5).fill({ color: 0x000000, alpha: 0.5 });
      g.roundRect(W * 0.25, 44, W * 0.5 * p, 10, 5).fill(0xffb703);
    }

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = this.baseX + s.x; this.world.y = this.baseY + s.y;
  }

  frogState() { return { sizeClass: 9, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
