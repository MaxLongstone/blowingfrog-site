// Boss seven: PROBE ONE. Space-Invaders grammar -- a shimmying, descending
// grid of alien ships up top, the frog fixed on a rail at the bottom.
// SHIFT breathes fire straight up in the frog's current lane; killing a
// "loaded" ship drops the explosive it was carrying, and catching that with
// SPACE is still the same fuse rule every other boss in this game runs on.
// Aliens fire straight down at random; dodge by changing lanes before it
// arrives, same lesson learned from every other locked-aim hazard here.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { PROBE_ONE } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';

const W = 832, H = 960;
const RAIL_Y = H * 0.88;
const LANES = 7;
const LANE_W = W / LANES;
const FORM_TOP = 120, ROW_GAP = 74;
const FORM_AMP = W * 0.22;
const FORM_STEP = 14;          // px the formation drops each bounce
const HOP_TIME = 0.1;
const PROJ_SPEED = 260;
const TELL_TIME = 0.28;

const laneX = (l) => (l + 0.5) * LANE_W;

export class InvaderFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = PROBE_ONE; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false; this.frozen = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.flagship = new PIXI.Sprite(this.tex.get('probe_flagship'));
    this.flagship.anchor.set(0.5);
    this.flagship.x = W / 2; this.flagship.y = 60;
    this.flagship.alpha = 0.55;
    this.layer.addChild(this.flagship);

    this.frogSprite = new PIXI.Sprite(this.tex.get('invfrog_idle'));
    this.frogSprite.anchor.set(0.5);
    this.layer.addChild(this.frogSprite);

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.lane = 3;
    this.x = laneX(this.lane);
    this.hopAnim = null; this.fireCd = 0; this.fireFlash = 0; this.hurtT = 0; this.invuln = 0;

    this.fuse = 0;
    this.wave = 0;
    this.aliens = [];
    this.bolts = [];
    this.bombs = [];
    this.hazards = [];
    this.formX = 0; this.formVX = 1; this.formY = 0;
    this.attackTimer = 2.0;

    this.state = 'intro'; this.stateT = 1.2;

    this.drawSpace();
    this.spawnWave();
    this.hud.setStage('PROBE ONE', 'ARROWS move · SHIFT fire · SPACE catches');
    this.hud.say('ARROWS MOVE · SHIFT BREATHES FIRE · SPACE CATCHES WHAT FALLS', 4200);
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  drawSpace() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x05070f);
    for (let i = 0; i < 60; i++) {
      const x = (i * 53) % W, y = (i * 97) % H;
      g.circle(x, y, 1 + (i % 3) * 0.6).fill({ color: 0xffffff, alpha: 0.25 + (i % 4) * 0.1 });
    }
    g.rect(0, RAIL_Y + 30, W, H - RAIL_Y - 30).fill(0x11141c);
    g.rect(0, RAIL_Y + 30, W, 4).fill({ color: 0x3a6a7c, alpha: 0.6 });
  }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over || this.frozen) return;
    if (i.type === 'hop') { this.hop(i.dir); return; }
    if (i.type === 'punch') { this.fireBreath(); return; }
    this.eat();
  }

  hop(dir) {
    if (this.hopAnim) return;
    const d = { left: -1, right: 1 }[dir];
    if (!d) return;
    const nl = Math.max(0, Math.min(LANES - 1, this.lane + d));
    if (nl === this.lane) return;
    this.hopAnim = { from: this.lane, t: 0 };
    this.lane = nl;
    this.audio.hop();
  }

  fireBreath() {
    if (this.over || this.frozen || this.fireCd > 0) return;
    this.fireCd = this.boss.fire.cooldown;
    this.fireFlash = 0.1;
    this.audio.tongue();
    this.bolts.push({ lane: this.lane, y: RAIL_Y - 20, vy: -this.boss.fire.boltSpeed });
  }

  eat() {
    if (this.over || this.frozen) return;
    this.audio.tongue();
    const b = this.bombs.find(x => x.lane === this.lane && Math.abs(x.y - RAIL_Y) < 60);
    if (!b) { this.hud.say('NOTHING TO CATCH', 500); return; }
    b.alive = false;
    this.fuse = Math.min(this.boss.fuseTarget, this.fuse + 1);
    this.hud.setFuse(this.fuse);
    this.audio.eat(); this.addScore(150);
    this.ach?.bump('midairEats');
    this.particles.burst(this.x, RAIL_Y - 20, 0xf2c53d, 16);
    if (this.fuse >= this.boss.fuseTarget) this.clearWave();
  }

  spawnWave() {
    this.aliens = [];
    const total = this.boss.formation.cols * this.boss.formation.rows;
    const loadedSet = new Set();
    while (loadedSet.size < Math.min(this.boss.loadedPerWave, total)) loadedSet.add(this.rng.int(0, total - 1));
    let idx = 0;
    for (let r = 0; r < this.boss.formation.rows; r++) {
      for (let c = 0; c < this.boss.formation.cols; c++) {
        this.aliens.push({ row: r, col: c, alive: true, loaded: loadedSet.has(idx), sprite: null });
        idx++;
      }
    }
    this.formX = 0; this.formY = 0; this.formVX = 1;
  }

  clearWave() {
    this.fuse = 0; this.hud.setFuse(0);
    this.audio.boom(); this.shake.add(14);
    this.particles.burst(W / 2, FORM_TOP + 60, 0xf2c53d, 40, 380);
    this.addScore(1000);
    this.hazards = []; this.bombs = []; this.bolts = [];
    this.wave += 1;
    if (this.wave >= this.boss.wavesToWin) { this.finishSequence(); return; }
    this.hud.say(`WAVE ${this.wave} DOWN. ${this.boss.wavesToWin - this.wave} TO GO.`, 1800);
    this.spawnWave();
  }

  finishSequence() {
    this.frozen = true;
    this.audio.win();
    this.hud.say(this.boss.finale.card, 3400);
    setTimeout(() => {
      this.over = true;
      this.ach?.bump('stagesCleared');
      setTimeout(() => this.emit('won', { score: this.score }), 600);
    }, 1700);
  }

  takeHit(dmg = 1) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.0;
    this.hurtT = 0.4;
    this.audio.hit(); this.shake.add(10);
    this.particles.burst(this.x, RAIL_Y, 0xe23c2f, 18);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish();
  }

  finish() {
    this.over = true;
    this.audio.lose();
    setTimeout(() => this.emit('lost', { score: this.score }), 1500);
  }

  update(dt) {
    if (this.over || this.frozen) { this.render(dt); return; }
    this.time += dt;
    if (this.hopAnim) { this.hopAnim.t += dt; if (this.hopAnim.t >= HOP_TIME) this.hopAnim = null; }
    if (this.fireCd > 0) this.fireCd -= dt;
    if (this.fireFlash > 0) this.fireFlash -= dt;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.invuln > 0) this.invuln -= dt;

    if (this.state === 'intro') { if ((this.stateT -= dt) <= 0) this.state = 'play'; this.render(dt); return; }

    const speed = this.boss.formation.speed[Math.min(2, this.wave)];
    this.formX += this.formVX * speed * dt;
    if (Math.abs(this.formX) > FORM_AMP) {
      this.formX = Math.sign(this.formX) * FORM_AMP;
      this.formVX *= -1;
      this.formY = Math.min(FORM_STEP * 6, this.formY + FORM_STEP);
    }

    for (const b of this.bolts) b.y += b.vy * dt;
    for (const b of this.bolts) {
      if (b.dead) continue;
      const targets = this.aliens.filter(a => a.alive && a.col === b.lane);
      if (!targets.length) continue;
      const closest = targets.reduce((a, c) => (c.row > a.row ? c : a));
      const ay = FORM_TOP + closest.row * ROW_GAP + this.formY;
      if (b.y <= ay + 20) {
        closest.alive = false;
        b.dead = true;
        this.audio.squash();
        this.particles.spark(laneX(closest.col) + this.formX, ay, 0xaab42a, 10);
        this.addScore(80);
        if (closest.loaded) this.bombs.push({ lane: closest.col, y: ay, vy: this.boss.fire.dropSpeed, alive: true });
      }
    }
    this.bolts = this.bolts.filter(b => !b.dead && b.y > 0);

    for (const b of this.bombs) b.y += b.vy * dt;
    for (const b of this.bombs) {
      if (b.y >= RAIL_Y + 40) {
        b.alive = false;
        if (b.lane === this.lane) this.takeHit(1);
      }
    }
    this.bombs = this.bombs.filter(b => b.alive);

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      // Never stack a second hazard into a column that already has one in
      // flight -- with few aliens left, the survivors would otherwise be
      // able to keep their own column permanently occupied, and the frog
      // has to stand in that exact column to land the killing shot.
      const busyCols = new Set(this.hazards.map(h => h.col));
      const openShooters = this.aliens.filter(a => a.alive && !busyCols.has(a.col));
      if (openShooters.length) {
        const shooter = this.rng.pick(openShooters);
        this.hazards.push({ col: shooter.col, y: FORM_TOP + shooter.row * ROW_GAP + this.formY, telegraphT: TELL_TIME, vy: 0, alive: true });
      }
      this.attackTimer = this.boss.formation.fireEvery[Math.min(2, this.wave)];
    }
    for (const h of this.hazards) {
      if (h.telegraphT > 0) { h.telegraphT -= dt; continue; }
      if (!h.vy) h.vy = PROJ_SPEED;
      h.y += h.vy * dt;
      if (h.y >= RAIL_Y - 10) {
        h.alive = false;
        if (h.col === this.lane) this.takeHit(1);
      }
    }
    this.hazards = this.hazards.filter(h => h.alive);

    if (this.aliens.every(a => !a.alive) && this.fuse < this.boss.fuseTarget) {
      this.hud.say('THEY REGROUP', 900);
      this.spawnWave();
    }

    this.render(dt);
  }

  frogTexture() {
    if (this.hurtT > 0) return 'invfrog_hurt';
    if (this.fireFlash > 0) return 'invfrog_fire';
    return 'invfrog_idle';
  }

  render(dt) {
    let lx = this.lane;
    if (this.hopAnim) { const t = Math.min(1, this.hopAnim.t / HOP_TIME); lx = this.hopAnim.from + (this.lane - this.hopAnim.from) * t; }
    this.x = laneX(lx);

    const fs = this.frogSprite;
    const ft = this.frogTexture();
    fs.texture = this.tex.get(ft);
    fs.scale.set(this.tex.scaleFor(ft) * 1.6);
    fs.x = this.x; fs.y = RAIL_Y;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.5 : 1) : 1;

    this.flagship.rotation = Math.sin(this.time * 0.4) * 0.02;

    for (const a of this.aliens) {
      if (!a.sprite) {
        a.sprite = new PIXI.Sprite(this.tex.get(a.loaded ? 'probe_loaded' : 'probe_grunt'));
        a.sprite.anchor.set(0.5);
        this.layer.addChild(a.sprite);
      }
      a.sprite.visible = a.alive;
      if (a.alive) {
        a.sprite.x = laneX(a.col) + this.formX;
        a.sprite.y = FORM_TOP + a.row * ROW_GAP + this.formY;
        a.sprite.scale.set(this.tex.scaleFor(a.loaded ? 'probe_loaded' : 'probe_grunt'));
      }
    }

    this._boltSprites?.forEach(s => s.destroy());
    this._boltSprites = this.bolts.map(b => {
      const s = new PIXI.Sprite(this.tex.get('fire_bolt'));
      s.anchor.set(0.5); s.x = laneX(b.lane); s.y = b.y;
      s.scale.set(this.tex.scaleFor('fire_bolt'));
      this.layer.addChild(s);
      return s;
    });

    this._bombSprites?.forEach(s => s.destroy());
    this._bombSprites = this.bombs.map(b => {
      const s = new PIXI.Sprite(this.tex.get('rift_bomb'));
      s.anchor.set(0.5); s.x = laneX(b.lane); s.y = b.y;
      s.scale.set(this.tex.scaleFor('rift_bomb'));
      this.layer.addChild(s);
      return s;
    });

    const g = this.fx; g.clear();
    for (const h of this.hazards) {
      const a = h.telegraphT > 0 ? 0.5 + 0.5 * Math.sin(this.time * 30) : 0.9;
      g.circle(laneX(h.col), h.y, h.telegraphT > 0 ? 10 : 6).fill({ color: 0xe23c2f, alpha: a });
    }
    for (let i = 0; i < this.boss.wavesToWin; i++)
      g.circle(W / 2 - 34 + i * 34, 26, 10).fill({ color: i < this.wave ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() { return { sizeClass: 4, lives: this.lives, hearts: 3 }; }
  destroy() {
    for (const a of this.aliens) a.sprite?.destroy();
    this._boltSprites?.forEach(s => s.destroy());
    this._bombSprites?.forEach(s => s.destroy());
    this.world.destroy({ children: true });
  }
}
