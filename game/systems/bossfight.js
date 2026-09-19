// Boss one, Punch-Out style. The camera sits behind the frog and Chaco faces you.
// He winds up (the tell), then strikes. Lean away from a hook to leave him open,
// punch him while he winds up to counter and earn a star, and spend the stars on
// an uppercut. Three knockdowns and he is finished.
import { Shake, fitWorld } from '../core/grid.js';
import { Particles } from './particles.js';
import { CHACO } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';
import { resolveStrike, punchOutcome, starPunchDamage, patternPool, pickPattern } from './punchrules.js';

const W = 832, H = 960;
const CX = W / 2;
const CHACO_FEET = H * 0.70;
const FROG_FEET = H - 4;
const LEAN_X = 170;              // how far a dodge carries the frog sideways

const DODGE_T = 0.38;            // how long a lean protects you
const BLOCK_T = 0.5;
const PUNCH_T = 0.2;
const UPPER_T = 0.5;
const HURT_T = 0.45;
const REACT = 0.12;              // an action this close to finished can be followed at once
const BUFFER = 0.2;              // a press slightly too early is remembered, not lost
const COUNT_STEP = 0.42;         // seconds per number when Chaco is on the canvas
const FROG_COUNT_STEP = 0.7;
const MAX_STARS = CHACO.starPunch.maxStars;

// How Chaco's state looks to the punch rules.
const PHASE = { idle: 'idle', guard: 'guard', tell: 'tell', strike: 'strike', chain: 'idle', open: 'open',
  dazed: 'dazed', feint: 'idle', recover: 'idle', intro: 'watch', down: 'down', getup: 'getup',
  berserk: 'berserk', dead: 'dead', win: 'watch', watch: 'watch' };

export class BossFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = CHACO; this.ach = ach;
    this.acceptsStar = true;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;
    this.lives = frogState?.lives ?? 5;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    const fit = fitWorld(this.app, W, H);
    this.world.scale.set(fit.scale);
    this.baseX = fit.x; this.baseY = fit.y;
    this.bg = new PIXI.Graphics();
    this.plate = new PIXI.Sprite();
    this.plate.visible = false;
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.plate, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.chacoSprite = new PIXI.Sprite(this.tex.get('chaco_po_idle'));
    this.chacoSprite.anchor.set(0.5, 1);
    this.frogSprite = new PIXI.Sprite(this.tex.get('frogback_guard'));
    this.frogSprite.anchor.set(0.5, 1);
    this.layer.addChild(this.chacoSprite, this.frogSprite);

    const big = (size, fill) => {
      const t = new PIXI.Text({ text: '', style: { fontFamily: '"Barlow Condensed", system-ui, sans-serif',
        fontSize: size, fontWeight: '900', fill, stroke: { color: 0x000000, width: 8 }, align: 'center' } });
      t.anchor.set(0.5); t.x = CX; t.visible = false;
      this.world.addChild(t);
      return t;
    };
    this.banner = big(120, 0xfff2c0); this.banner.y = H * 0.30;
    this.counter = big(190, 0xffffff); this.counter.y = H * 0.36;
    this.bannerT = 0;

    // the frog
    const f = CHACO.frog;
    this.maxHearts = f.hearts;
    this.hearts = f.hearts;
    this.downs = 0;
    this.stars = 0;
    this.lean = 0; this.leanX = 0;
    this.dodgeT = 0; this.blockT = 0; this.punchT = 0; this.upperT = 0; this.hurtT = 0; this.invuln = 0;
    this.side = 'l';
    this.combo = 0; this.comboT = 0;
    this.buffer = null;
    this.frogDown = null;

    // Chaco
    this.round = 1;
    this.knockdowns = 0;
    this.hp = 100;
    this.state = 'intro'; this.stateT = 1.7;
    this.pattern = null; this.patIdx = 0; this.lastPattern = null;
    this.attack = null; this.isFeint = false; this.lastOutcome = null;
    this.tellDur = 0; this.dazedT = 0; this.flinchT = 0;
    this.kd = null;
    this.rage = null;
    this.hinted = new Set();
    this.flash = null; this.hurtFlash = 0;

    this.hud.mid.style.visibility = 'hidden';       // no fuse in this fight
    this.drawRing();
    this.hud.setStage('CHACO THE NARCO CHUPACABRA', '← → dodge · ↓ block · SHIFT / SPACE punch · Z star');
    this.hud.say('← → DODGE · ↓ BLOCK · SHIFT / SPACE PUNCH · Z STAR', 4200);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
    this.announce('ROUND 1', 1.0);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(fn => fn(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }
  announce(text, t = 1.2) { this.banner.text = text; this.bannerT = t; this.bannerDur = t; }
  get phase() { return this.rage && this.state !== 'berserk' ? 'rage' : (PHASE[this.state] || 'idle'); }

  // ---- the ring ---------------------------------------------------------
  drawRing() {
    const t = this.tex.get('po_ring');
    if (t && t.width > 600) {                   // the painted plate, if it is installed
      this.plate.texture = t;
      const k = Math.max(W / t.width, H / t.height);
      this.plate.scale.set(k);
      this.plate.x = (W - t.width * k) / 2; this.plate.y = (H - t.height * k) / 2;
      this.plate.visible = true;
      return;
    }
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x0d0c12);
    for (let row = 0; row < 3; row++) {                                  // the crowd
      for (let i = 0; i < 26; i++) {
        const x = i * 34 + (row % 2) * 17, y = 70 + row * 62;
        g.circle(x, y - 22, 13).fill(0x06050a);
        g.roundRect(x - 16, y - 12, 32, 50, 9).fill(0x06050a);
      }
    }
    const farY = H * 0.5, ropeY = [H * 0.36, H * 0.42, H * 0.48];
    g.poly([W * 0.13, farY, W * 0.87, farY, W * 1.12, H, -W * 0.12, H]).fill(0x7d7360);
    g.poly([W * 0.13, farY, W * 0.87, farY, W * 1.12, H, -W * 0.12, H]).fill({ color: 0x000000, alpha: 0.18 });
    for (const y of ropeY) g.roundRect(W * 0.13, y, W * 0.74, 7, 3).fill({ color: 0xe8e4d8, alpha: 0.5 });
    for (const d of [-1, 1]) {                                            // ropes running toward the camera
      const fx = d < 0 ? W * 0.13 : W * 0.87;
      for (const y of ropeY) g.moveTo(fx, y).lineTo(d < 0 ? -W * 0.2 : W * 1.2, y + H * 0.55).stroke({ width: 7, color: 0xe8e4d8, alpha: 0.35 });
      g.roundRect(fx - 10, ropeY[0] - 40, 20, farY - ropeY[0] + 50, 5).fill(0x9b1f28);
    }
    g.ellipse(CX, CHACO_FEET, 300, 44).fill({ color: 0x000000, alpha: 0.22 });
    g.poly([CX - 40, 0, CX + 40, 0, CX + 380, CHACO_FEET, CX - 380, CHACO_FEET]).fill({ color: 0xfff2c0, alpha: 0.055 });
    g.circle(CX, 8, 20).fill(0xfff2c0);
  }

  // ---- input ------------------------------------------------------------
  // Turns whatever the player pressed into one of the frog's actions.
  decode(i) {
    if (i.type === 'hop') {
      if (i.dir === 'left') return { k: 'dodge', dir: -1 };
      if (i.dir === 'right') return { k: 'dodge', dir: 1 };
      if (i.dir === 'down') return { k: 'block' };
      if (i.dir === 'up' && i.touch) return { k: 'star' };     // a swipe up; on a keyboard, Z
      return null;
    }
    if (i.type === 'star') return { k: 'star' };
    if (i.type === 'tongue') return { k: 'punch', side: 'r' };
    if (i.type === 'punch') {
      if (i.at) {                                    // a tap: which half of the screen it landed on
        const r = this.app.canvas.getBoundingClientRect();
        return { k: 'punch', side: i.at.x < r.left + r.width / 2 ? 'l' : 'r' };
      }
      return { k: 'punch', side: 'l' };
    }
    return null;
  }

  busy() {
    return Math.max(this.dodgeT, this.blockT, this.punchT, this.upperT, this.hurtT) > REACT;
  }

  intent(i) {
    if (this.over) return;
    if (this.frogDown) { if (i.type !== 'hop' || i.dir) this.mash(); return; }
    const act = this.decode(i);
    if (!act) return;
    if (this.busy()) { this.buffer = { act, t: BUFFER }; return; }
    this.perform(act);
  }

  perform(a) {
    if (a.k === 'dodge') {
      this.lean = a.dir; this.dodgeT = DODGE_T; this.blockT = 0; this.audio.hop();
    } else if (a.k === 'block') {
      this.blockT = BLOCK_T; this.dodgeT = 0; this.lean = 0; this.audio.hop();
    } else if (a.k === 'punch') {
      this.punchT = PUNCH_T; this.side = a.side; this.blockT = 0; this.dodgeT = 0; this.lean = 0;
      this.audio.hop();
      this.landPunch(a.side);
    } else if (a.k === 'star') {
      if (this.stars <= 0) { this.hud.say('NO STARS YET', 700); return; }
      this.upperT = UPPER_T; this.blockT = 0; this.dodgeT = 0; this.lean = 0;
      this.audio.hop();
      this.landStar();
    }
  }

  // ---- damage to Chaco --------------------------------------------------
  landPunch(side) {
    const out = punchOutcome(this.phase, this.boss.damage);
    const x = CX + (side === 'l' ? -85 : 85), y = CHACO_FEET - 320;
    if (out.kind === 'none') {
      if (this.phase === 'rage') this.say('NOTHING LANDS. SURVIVE.', 800);
      return;
    }
    if (out.kind === 'blocked') {
      this.audio.tick();
      this.particles.spark(x, y, 0xffffff, 6);
      this.combo = 0;
      return;
    }
    this.combo = this.comboT > 0 ? this.combo + 1 : 1;
    this.comboT = 0.9;
    let dmg = out.damage;
    if (out.kind === 'open' && this.combo >= 3) dmg += 2;       // a flurry pays extra
    this.hp -= dmg;
    this.audio.squash();
    this.flash = { x, y, t: 0 };
    if (out.kind === 'counter') {
      this.stars = Math.min(MAX_STARS, this.stars + 1);
      this.state = 'dazed'; this.stateT = this.boss.dazedTime; this.dazedT = 0;
      this.pattern = null;
      this.shake.add(11);
      this.particles.burst(x, y, 0xf2c53d, 26);
      this.say(this.stars >= MAX_STARS ? 'COUNTER! FULL STARS' : 'COUNTER!', 900);
      this.addScore(200);
    } else if (out.kind === 'open') {
      this.shake.add(6);
      this.particles.burst(x, y, 0xffffff, 12);
      this.addScore(60);
    } else {
      this.flinchT = 0.16;
      this.shake.add(2);
      this.addScore(15);
    }
    if (this.hp <= 0) this.knockDown();
  }

  landStar() {
    const dmg = starPunchDamage(this.stars, this.boss.starPunch);
    const x = CX, y = CHACO_FEET - 300;
    const p = this.phase;
    if (p === 'guard') { this.audio.tick(); this.particles.spark(x, y, 0xffffff, 10); this.say('BLOCKED. YOU WASTED IT.', 900); this.stars = 0; return; }
    if (p === 'rage' || p === 'down' || p === 'getup' || p === 'berserk' || p === 'dead' || p === 'watch') return;
    this.stars = 0;
    this.hp -= dmg;
    this.audio.boom(); this.shake.add(16);
    this.particles.burst(x, y, 0xf2c53d, 40, 360);
    this.particles.ring(x, y, 0xffe066);
    this.addScore(400);
    this.say('STAR PUNCH!', 1000);
    this.state = 'dazed'; this.stateT = this.boss.dazedTime * 0.8; this.dazedT = 0;
    this.pattern = null;
    if (this.hp <= 0) this.knockDown();
  }

  say(text, ms) { this.hud.say(text, ms); }

  knockDown() {
    this.knockdowns += 1;
    this.stars = 0;
    this.audio.win(); this.addScore(1000);
    this.shake.add(20);
    this.particles.debris(CX, CHACO_FEET - 60, 26);
    if (this.knockdowns >= this.boss.knockdownsToWin) { this.finish(true); return; }
    this.hp = 0;
    this.kd = { count: 0, t: 0 };
    this.state = 'down'; this.stateT = 99;
    this.pattern = null;
    this.counter.visible = true;
  }

  // ---- damage to the frog -----------------------------------------------
  takeHit(dmg) {
    if (this.invuln > 0 || this.over || this.frogDown) return;
    this.hearts -= dmg;
    this.stars = 0; this.combo = 0;
    this.invuln = 1.0; this.hurtT = HURT_T;
    this.dodgeT = 0; this.blockT = 0; this.lean = 0; this.buffer = null;
    this.audio.hit(); this.shake.add(13);
    this.hurtFlash = 0.3;
    this.particles.burst(this.leanX + CX, FROG_FEET - 260, 0xe23c2f, 20);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.frogKnockedDown();
  }

  frogKnockedDown() {
    this.downs += 1;
    this.hearts = 0;
    if (this.downs >= this.boss.frog.downsToLose) { this.finish(false); return; }
    const need = this.boss.frog.getUpPresses[this.downs - 1] ?? 10;
    this.frogDown = { count: 0, t: 0, presses: 0, need };
    this.counter.visible = true;
    this.say('MASH TO GET UP', 1600);
  }

  mash() {
    const d = this.frogDown; if (!d) return;
    d.presses += 1; this.audio.tick();
    if (d.presses >= d.need) this.frogGetUp();
  }

  frogGetUp() {
    this.frogDown = null;
    this.counter.visible = false;
    this.hearts = Math.ceil(this.maxHearts * 0.6);
    this.hud.setLives(this.hearts, true);
    this.invuln = 1.6; this.hurtT = 0;
    this.audio.win();
    this.enterGap(0.9);
  }

  finish(won) {
    this.over = true;
    this.state = won ? 'dead' : 'win'; this.stateT = 99;
    this.counter.visible = false;
    if (won) { this.audio.win(); this.ach?.bump('stagesCleared'); this.ach?.bump('chacoCleared'); }
    else { this.audio.lose(); }
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), 1700);
  }

  // ---- Chaco's rhythm ---------------------------------------------------
  setState(s, t) { this.state = s; this.stateT = t; }

  // The breathing space between patterns, spent guarding some of the time.
  enterGap(t = null) {
    if (this.rage) { this.setState('idle', this.boss.ultimaRaya.gap); return; }
    const [lo, hi] = this.boss.idleGap;
    const gap = t ?? this.rng.range(lo, hi);
    this.setState(this.rng() < this.boss.guardChance ? 'guard' : 'idle', gap);
  }

  beginPattern() {
    if (this.rage) {
      const pool = ['hookL', 'hookR', 'hookL', 'hookR', 'chupada'];
      this.pattern = [pool[Math.floor(this.rng() * pool.length)]];
    } else {
      this.pattern = pickPattern(patternPool(this.boss.patterns, Math.min(2, this.round)), this.rng, this.lastPattern);
      this.lastPattern = this.pattern;
    }
    this.patIdx = 0;
    this.startTell();
  }

  startTell() {
    this.attack = this.pattern[this.patIdx];
    const def = this.boss.attacks[this.attack];
    this.isFeint = !this.rage && this.patIdx === 0 && this.rng() < (this.boss.feintChance[this.round] ?? 0);
    const scale = this.rage ? 1 : (this.boss.tellScale[this.round] ?? 0.7) * (this.patIdx > 0 ? 0.88 : 1);
    this.tellDur = this.rage ? this.boss.ultimaRaya.tell : def.tell * scale;
    this.setState('tell', this.tellDur);
    this.audio.warn();
    // Round one spells out the answer the first time each attack appears.
    if (this.round === 1 && !this.rage && !this.hinted.has(this.attack)) {
      this.hinted.add(this.attack);
      this.say(def.hint, 1400);
    }
  }

  // The blow connects the instant the wind-up ends.
  resolveTell() {
    const def = this.boss.attacks[this.attack];
    const out = resolveStrike(def, { lean: this.dodgeT > 0 ? this.lean : 0, blocking: this.blockT > 0 });
    this.lastOutcome = out;
    this.setState('strike', def.strike);
    const bx = this.leanX + CX;
    if (out === 'hit') {
      this.takeHit(def.damage);
    } else {
      this.audio.tick();
      this.particles.spark(bx, FROG_FEET - 240, 0xffffff, 8);
      if (out === 'dodged') {
        this.addScore(50);
        this.say(this.rage ? 'DODGED' : 'DODGED. HIT HIM.', 700);
        if (this.rage) this.rage.t += this.boss.ultimaRaya.dodgeShortensBy;
      } else if (this.rage) this.rage.t += this.boss.ultimaRaya.blockShortensBy;
    }
  }

  afterStrike() {
    if (this.pattern && this.patIdx + 1 < this.pattern.length) {
      this.patIdx += 1;
      this.setState('chain', this.boss.chainGap);
      return;
    }
    if (this.lastOutcome === 'dodged' && !this.rage) this.setState('open', this.boss.openWindow[Math.min(3, this.round)]);
    else this.setState('recover', 0.4);
  }

  advanceState() {
    switch (this.state) {
      case 'intro': this.enterGap(0.5); break;
      case 'idle': case 'guard': this.beginPattern(); break;
      case 'chain': this.startTell(); break;
      case 'tell':
        if (this.isFeint) { this.setState('feint', 0.55); this.say('FEINT', 600); }
        else this.resolveTell();
        break;
      case 'strike': this.afterStrike(); break;
      case 'feint': case 'open': case 'dazed': case 'recover': this.enterGap(); break;
      case 'getup': this.newRound(); break;
      case 'berserk': this.startRage(); break;
      default: this.enterGap();
    }
  }

  newRound() {
    if (this.knockdowns === 2) {              // the second knockdown is followed by the bag
      this.setState('berserk', 2.4);
      this.hud.say('SURVIVE IT.', 2400);
      this.emit('finale', { text: this.boss.ultimaRaya.card });
      this.audio.roar();
      return;
    }
    this.round = this.knockdowns + 1;
    this.hp = (this.boss.getUpHealth[this.knockdowns - 1] ?? 0.5) * 100;
    this.announce(`ROUND ${this.round}`, 1.1);
    this.setState('intro', 1.7);
  }

  startRage() {
    this.round = 3;
    this.hp = 100;
    this.rage = { t: 0, dur: this.boss.ultimaRaya.duration };
    this.hud.say('STAY ALIVE. LET HIM BURN.', 2400);
    this.setState('idle', 0.6);
  }

  // ---- the loop -----------------------------------------------------------
  update(dt) {
    this.time += dt;
    if (this.bannerT > 0) this.bannerT -= dt;
    this.banner.visible = this.bannerT > 0;
    if (this.flash) { this.flash.t += dt; if (this.flash.t > 0.25) this.flash = null; }
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    if (this.over) { this.render(dt); return; }

    for (const k of ['dodgeT', 'blockT', 'punchT', 'upperT', 'hurtT', 'invuln', 'flinchT', 'comboT']) {
      if (this[k] > 0) this[k] = Math.max(0, this[k] - dt);
    }
    if (this.dodgeT <= 0) this.lean = 0;
    this.leanX += (this.lean * LEAN_X - this.leanX) * Math.min(1, dt / 0.06);
    if (this.buffer) {
      this.buffer.t -= dt;
      if (this.buffer.t <= 0) this.buffer = null;
      else if (!this.busy() && !this.frogDown) { const a = this.buffer.act; this.buffer = null; this.perform(a); }
    }

    if (this.frogDown) {                                  // the frog is on the canvas; Chaco waits
      const d = this.frogDown;
      d.t += dt;
      const n = Math.floor(d.t / FROG_COUNT_STEP) + 1;
      if (n > d.count) { d.count = n; this.audio.tick(); }
      if (d.count > 10) { this.frogDown = null; this.finish(false); }
      this.counter.text = String(Math.min(10, d.count));
      this.render(dt); return;
    }

    if (this.rage) {
      this.rage.t += dt;
      if (this.rage.t >= this.rage.dur) { this.rage = null; this.knockDown(); this.render(dt); return; }
    }

    if (this.state === 'dazed') this.dazedT += dt;

    if (this.state === 'down') {                          // Chaco is on the canvas
      const k = this.kd; k.t += dt;
      const n = Math.floor(k.t / COUNT_STEP) + 1;
      if (n > k.count) { k.count = n; this.audio.tick(); this.shake.add(2); }
      this.counter.text = String(Math.min(8, k.count));
      if (k.count >= 9) { this.kd = null; this.counter.visible = false; this.setState('getup', 1.0); }
      this.render(dt); return;
    }

    this.stateT -= dt;
    if (this.stateT <= 0) this.advanceState();
    this.render(dt);
  }

  // ---- what to draw -----------------------------------------------------------
  chacoTexture() {
    switch (this.state) {
      case 'intro': case 'feint': case 'open': case 'win': return 'chaco_po_taunt';
      case 'guard': return 'chaco_po_block';
      case 'tell':
        return { hookL: 'chaco_po_tell_left', hookR: 'chaco_po_tell_right', chupada: 'chaco_po_tell_chupada' }[this.attack];
      case 'strike':
        if (this.rage) return 'chaco_po_rage_swing';
        return { hookL: 'chaco_po_hook_left', hookR: 'chaco_po_hook_right', chupada: 'chaco_po_chupada' }[this.attack];
      case 'dazed': return this.dazedT < 0.35 ? 'chaco_po_hit_face' : 'chaco_po_dazed';
      case 'down': return this.kd && this.kd.t < 0.45 ? 'chaco_po_stagger' : 'chaco_po_down';
      case 'getup': return 'chaco_po_getup';
      case 'berserk': return 'chaco_po_rage_bag';
      case 'dead': return 'chaco_po_ko';
      default: return this.flinchT > 0 ? 'chaco_po_hit_body' : 'chaco_po_idle';
    }
  }

  frogTexture() {
    if (this.over) return this.hearts <= 0 || this.frogDown ? 'frogback_down' : 'frogback_guard';
    if (this.frogDown) return 'frogback_down';
    if (this.hurtT > 0) return 'frogback_hurt';
    if (this.upperT > 0) return 'frogback_uppercut';
    if (this.punchT > 0) return this.side === 'l' ? 'frogback_jab_left' : 'frogback_jab_right';
    if (this.blockT > 0) return 'frogback_block';
    if (this.dodgeT > 0) return this.lean < 0 ? 'frogback_dodge_left' : 'frogback_dodge_right';
    return 'frogback_guard';
  }

  render(dt) {
    const cs = this.chacoSprite, fs = this.frogSprite;
    const ct = this.chacoTexture();
    cs.texture = this.tex.get(ct);
    let ck = this.tex.scaleFor(ct) * 1.8;
    const bob = (this.state === 'idle' || this.state === 'guard' || this.state === 'intro') ? Math.sin(this.time * 6) * 5 : 0;
    if (this.state === 'strike') {                   // the blow comes at you, so he grows
      const def = this.boss.attacks[this.attack];
      const k = 1 - Math.max(0, this.stateT) / (def.strike || 0.25);
      ck *= 1 + (this.attack === 'chupada' ? 0.2 : 0.09) * Math.min(1, k * 2);
    } else if (this.state === 'tell') ck *= 0.98 + 0.02 * Math.sin(this.time * 40);
    cs.scale.set(ck);
    cs.x = CX + (this.state === 'tell' ? Math.sin(this.time * 55) * 3 : 0);
    cs.y = CHACO_FEET + bob;
    cs.tint = this.rage ? (Math.sin(this.time * 14) > 0 ? 0xff9a88 : 0xffffff) : 0xffffff;

    const ft = this.frogTexture();
    fs.texture = this.tex.get(ft);
    const fk = this.tex.scaleFor(ft) * 1.9;
    fs.scale.set(fk);
    fs.x = CX + this.leanX;
    fs.y = FROG_FEET + (this.frogDown ? 0 : Math.sin(this.time * 5) * 3);
    fs.alpha = this.invuln > 0 && this.hurtT <= 0 ? (Math.sin(this.time * 30) > 0 ? 0.4 : 0.9) : 0.92;

    const g = this.fx; g.clear();
    this.drawGlove(g);
    if (this.state === 'tell' && this.round === 1 && !this.rage) {    // round one flashes the warning
      const beat = Math.sin(this.time * 26) > 0;
      const sx = this.attack === 'hookL' ? -170 : this.attack === 'hookR' ? 170 : 0;
      if (beat) {
        g.roundRect(CX + sx - 9, CHACO_FEET - 590, 18, 50, 5).fill(0xffd23c);
        g.circle(CX + sx, CHACO_FEET - 520, 10).fill(0xffd23c);
      }
    }
    if (this.state === 'tell' && this.rage) {
      g.circle(CX, CHACO_FEET - 300, 200).stroke({ width: 8, color: 0xff3a2a, alpha: 0.4 + 0.3 * Math.sin(this.time * 30) });
    }
    if (this.phase === 'open' || this.phase === 'dazed') {           // a plain "hit him" cue
      const beat = 0.5 + 0.5 * Math.sin(this.time * 16);
      g.circle(CX, CHACO_FEET - 300, 150 + beat * 16).stroke({ width: 6, color: 0xaab42a, alpha: 0.5 + beat * 0.4 });
    }
    if (this.flash) {
      const k = 1 - this.flash.t / 0.25;
      g.circle(this.flash.x, this.flash.y, 26 + (1 - k) * 60).fill({ color: 0xffffff, alpha: k * 0.6 });
    }
    if (this.hurtFlash > 0) g.rect(0, 0, W, H).fill({ color: 0xc41d13, alpha: this.hurtFlash * 0.9 });
    this.drawBars(g);

    if (this.banner.visible) {
      const k = this.bannerT / (this.bannerDur || 1);
      this.banner.alpha = Math.min(1, k * 3);
      this.banner.scale.set(1 + (1 - k) * 0.15);
    }
    this.counter.visible = !!(this.frogDown || this.kd);

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = this.baseX + s.x; this.world.y = this.baseY + s.y;
  }

  // A glove flying at his face, shrinking as it goes away from the camera.
  drawGlove(g) {
    if (this.punchT > 0) {
      const p = 1 - this.punchT / PUNCH_T;
      const sx = CX + this.leanX + (this.side === 'l' ? -70 : 70), sy = FROG_FEET - 270;
      const ex = CX + (this.side === 'l' ? -85 : 85), ey = CHACO_FEET - 320;
      const x = sx + (ex - sx) * p, y = sy + (ey - sy) * p, r = 34 - 16 * p;
      g.moveTo(sx, sy).lineTo(x, y).stroke({ width: r * 0.9, color: 0xe8564a, alpha: 0.35, cap: 'round' });
      g.circle(x, y, r).fill(0xd8352b).stroke({ width: 3, color: 0x1c1c1a });
    }
    if (this.upperT > 0) {
      const p = 1 - this.upperT / UPPER_T;
      const x = CX + this.leanX, y = FROG_FEET - 230 + (CHACO_FEET - 290 - (FROG_FEET - 230)) * Math.min(1, p * 1.6);
      g.circle(x, y, 44 - 14 * p).fill(0xffe066).stroke({ width: 4, color: 0xd8352b });
    }
  }

  drawBars(g) {
    // Chaco's bar, and how many times he has gone down
    const bx = CX - 170, by = 74, bw = 340, bh = 16;
    g.roundRect(bx - 3, by - 3, bw + 6, bh + 6, 8).fill({ color: 0x000000, alpha: 0.6 });
    g.roundRect(bx, by, bw * Math.max(0, Math.min(1, this.hp / 100)), bh, 6).fill(this.rage ? 0xff3a2a : 0xe8564a);
    for (let i = 0; i < this.boss.knockdownsToWin; i++)
      g.circle(CX - 34 + i * 34, by + bh + 22, 9).fill({ color: i < this.knockdowns ? 0xaab42a : 0x2a2a30, alpha: 0.95 });
    if (this.rage) {
      const p = this.rage.t / this.rage.dur;
      g.roundRect(W * 0.2, by + bh + 46, W * 0.6, 12, 6).fill({ color: 0x000000, alpha: 0.55 });
      g.roundRect(W * 0.2, by + bh + 46, W * 0.6 * Math.min(1, p), 12, 6).fill(0xffb02e);
    }
    // the frog's stars, bottom left
    for (let i = 0; i < MAX_STARS; i++) {
      const x = 46 + i * 46, y = H - 46, on = i < this.stars;
      const pts = [];
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 9 : 20; pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.poly(pts).fill({ color: on ? 0xffe066 : 0x2a2a30, alpha: on ? 1 : 0.7 }).stroke({ width: 2, color: 0x1c1c1a });
    }
  }

  frogState() { return { sizeClass: 3, lives: this.lives, hearts: 3 }; }
  destroy() {
    this.hud.mid.style.visibility = '';
    this.world.destroy({ children: true });
  }
}
