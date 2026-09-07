// Boss one, side on. The frog stands left, Chaco right, and they face each other.
// Distance is the whole fight: you must step INTO his range to counter, and that
// is exactly where most of his attacks land. Every attack has one correct answer.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { CHACO } from '../config/bosses.js';
import { FUSE_TARGET } from '../config/stages.js';
import { makeRng } from '../core/rng.js';

const W = 832, H = 960;
const FLOOR = H * 0.80;
const CHACO_X = W * 0.70;
const ZONE_X = [W * 0.13, W * 0.29, W * 0.45];   // out, mid, in
const OUT = 0, MID = 1, IN = 2;

const STEP_TIME = 0.16;      // how long a step takes
// A duck has to outlast the longest wind-up (0.75s) or ducking the moment you
// read the tell would wear off before the punch actually arrives.
const DUCK_TIME = 1.05;
const TONGUE_TIME = 0.3;
const STRIKE = 0.26;
const RECOVER = 0.36;
const HP_PER_ROUND = 100;
const COUNTER_DAMAGE = 34;
const DYN_EVERY = 6.0;

// reach: the closest zone the attack can still touch. duckable: ducking beats it.
const REACH = {
  saludo:   { reach: MID, duckable: true,  hint: 'STEP BACK OR DUCK' },
  cobrador: { reach: OUT, duckable: true,  hint: 'DUCK' },
  chupada:  { reach: MID, duckable: false, hint: 'STEP BACK' },
  belt:     { reach: OUT, duckable: true,  hint: 'DUCK' },
  polvo:    { reach: OUT, duckable: false, hint: 'NOTHING TO DO' },
};

export class BossFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = CHACO; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.behind = new PIXI.Graphics();          // swing arcs, drawn under the sprites
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.behind, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.chacoSprite = new PIXI.Sprite(this.tex.get('chaco_intro'));
    this.chacoSprite.anchor.set(0.5, 1);
    this.frogSprite = new PIXI.Sprite(this.tex.get('boxfrog_guard'));
    this.frogSprite.anchor.set(0.5, 1);
    this.dynSprite = new PIXI.Sprite(this.tex.get('boss_dynamite'));
    this.dynSprite.anchor.set(0.5);
    this.dynSprite.visible = false;
    this.layer.addChild(this.chacoSprite, this.dynSprite, this.frogSprite);

    // the frog
    this.lives = frogState?.lives ?? 5;
    this.hearts = 3;
    this.fuse = 0;
    this.zone = MID;
    this.x = ZONE_X[MID];
    this.duckT = 0;
    this.tongueT = 0;
    this.hurtT = 0;
    this.invuln = 0;

    // Chaco
    this.round = 1;
    this.knockdowns = 0;
    this.hp = HP_PER_ROUND;
    this.state = 'intro'; this.stateT = 1.4;
    this.attack = null; this.isFeint = false;
    this.lunge = 0;               // how far he leans in on a strike
    this.blind = 0;
    this.rage = null;
    this.dyn = null; this.dynTimer = DYN_EVERY;
    this.flash = null;

    this.drawRing();
    this.hud.setStage('CHACO THE NARCO CHUPACABRA', 'Watch the chains.');
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }
  get ducking() { return this.duckT > 0; }

  drawRing() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x14131a);
    g.rect(0, 0, W, FLOOR - 210).fill(0x0c0b10);
    for (let i = 0; i < 30; i++) {
      const x = (i * 37) % W, h = 26 + (i % 5) * 9;
      g.circle(x, FLOOR - 224 - h, 10).fill(0x07060a);
      g.roundRect(x - 12, FLOOR - 216 - h, 24, h + 12, 6).fill(0x07060a);
    }
    for (let i = -8; i <= 10; i++) {
      g.moveTo(i * 60, FLOOR - 210).lineTo(i * 60 + 210, FLOOR).stroke({ width: 2, color: 0x8f95a0, alpha: 0.14 });
      g.moveTo(i * 60, FLOOR).lineTo(i * 60 + 210, FLOOR - 210).stroke({ width: 2, color: 0x8f95a0, alpha: 0.14 });
    }
    g.rect(0, FLOOR, W, H - FLOOR).fill(0x8a7f6a);
    g.rect(0, FLOOR, W, 5).fill(0xb3a68c);
    for (let i = 0; i < 46; i++) g.circle((i * 71) % W, FLOOR + 14 + ((i * 37) % 210), 3 + (i % 3)).fill({ color: 0x6d6353, alpha: 0.4 });
    // the three standing marks, so distance is something you can see
    ZONE_X.forEach((zx, i) => {
      g.ellipse(zx, FLOOR + 24, 46, 11).stroke({ width: 3, color: 0xffffff, alpha: i === IN ? 0.20 : 0.10 });
    });
    for (const x of [26, W - 26]) g.roundRect(x - 9, FLOOR - 230, 18, 244, 5).fill(0x9b1f28);
    for (let r = 0; r < 3; r++) g.roundRect(0, FLOOR - 200 + r * 66, W, 7, 3).fill({ color: 0xe8e4d8, alpha: 0.42 });
    for (const x of [W * 0.2, W * 0.8]) {
      g.poly([x - 32, 0, x + 32, 0, x + 17, 40, x - 17, 40]).fill(0x2b2b33);
      g.circle(x, 42, 38).fill({ color: 0xfff2c0, alpha: 0.09 });
      g.circle(x, 40, 14).fill(0xfff2c0);
    }
  }

  // ---- input ------------------------------------------------------------
  intent(i) {
    if (this.over || this.hurtT > 0) return;
    if (i.type === 'hop') {
      if (i.dir === 'down') { this.duckT = DUCK_TIME; this.audio.hop(); return; }
      if (i.dir === 'left' && this.zone > OUT) { this.zone -= 1; this.audio.hop(); }
      else if (i.dir === 'right' && this.zone < IN) { this.zone += 1; this.audio.hop(); }
      return;
    }
    this.tongue();
  }

  tongue() {
    if (this.over || this.hurtT > 0) return;
    this.tongueT = TONGUE_TIME;
    this.audio.tongue();
    if (this.dyn && Math.abs(this.dyn.x - this.x) < 120 && this.dyn.y > FLOOR - 300) {
      this.dyn = null; this.dynSprite.visible = false;
      this.fuse = Math.min(FUSE_TARGET, this.fuse + 1);
      this.hud.setFuse(this.fuse);
      this.audio.eat(); this.addScore(150);
      this.particles.burst(this.x, FLOOR - 90, 0xf08a24, 16);
      this.ach?.bump('midairEats');
      if (this.fuse >= FUSE_TARGET) this.superDetonate();
      return;
    }
    if (this.zone === IN && this.chacoOpen()) this.land();
    else if (this.chacoOpen()) this.hud.say('TOO FAR. STEP IN.', 900);
  }

  chacoOpen() {
    return this.state === 'stunned' || (this.state === 'strike' && this.attack === 'chupada');
  }

  land() {
    this.hp -= COUNTER_DAMAGE;
    this.audio.squash();
    this.shake.add(8);
    this.flash = { x: CHACO_X - 90, y: FLOOR - 200, t: 0 };
    this.particles.burst(CHACO_X - 80, FLOOR - 210, 0xf2c53d, 22);
    this.addScore(200);
    this.ach?.bump('burns');
    if (this.rage) this.rage.t += this.boss.ultimaRaya.counterFillsBar * this.rage.dur;
    if (this.hp <= 0) this.knockDown();
    else this.setState('hurt', 0.5);
  }

  superDetonate() {
    this.hud.say('FUSE LIT. IN HIS FACE.', 1800);
    this.audio.boom(); this.shake.add(22);
    this.particles.burst(CHACO_X - 60, FLOOR - 180, 0xf08a24, 60, 430);
    this.particles.debris(CHACO_X - 60, FLOOR - 160, 30);
    this.fuse = 0; this.hud.setFuse(0);
    this.hp = 0; this.knockDown();
  }

  knockDown() {
    this.knockdowns += 1;
    this.hp = HP_PER_ROUND;
    this.audio.win(); this.addScore(1000);
    this.particles.debris(CHACO_X, FLOOR - 60, 26);
    if (this.knockdowns >= this.boss.knockdownsToWin) { this.finish(true); return; }
    this.round = Math.min(3, this.knockdowns + 1);
    this.hud.say(`KNOCKDOWN ${this.knockdowns}. ROUND ${this.round}.`, 2000);
    if (this.knockdowns === 2) { this.setState('berserk', 2.2); return; }
    this.setState('down', 2.4);
  }

  takeHit(dmg) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.1;
    this.hurtT = 0.55;
    this.duckT = 0;
    this.audio.hit(); this.shake.add(12);
    this.flash = { x: this.x + 40, y: FLOOR - 90, t: 0 };
    this.particles.burst(this.x, FLOOR - 80, 0xe23c2f, 20);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish(false);
  }

  finish(won) {
    this.over = true;
    this.setState(won ? 'dead' : 'win', 99);
    if (won) { this.audio.win(); this.ach?.bump('stagesCleared'); }
    else { this.audio.lose(); this.hurtT = 99; }
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), 1700);
  }

  setState(s, t) { this.state = s; this.stateT = t; }

  pickAttack() {
    const pool = Object.entries(this.boss.attacks).filter(([, a]) => a.round <= this.round).map(([k]) => k);
    return this.rng.pick(pool);
  }

  // The punch connects the instant the wind-up ends, not when its animation does.
  resolveAttack() {
    const a = this.boss.attacks[this.attack];
    const r = REACH[this.attack];
    this.lunge = 1;
    if (this.attack === 'polvo') {
      this.blind = a.blindFor;
      this.hud.say('POWDER. READ HIS BODY.', 1800);
      this.setState('strike', STRIKE);
      return;
    }
    const inRange = this.zone >= r.reach;
    const beaten = (r.duckable && this.ducking) || !inRange;
    if (!beaten) {
      this.takeHit(a.damage);
      if (a.stealsFuse && this.fuse > 0) {
        this.fuse -= 1; this.hud.setFuse(this.fuse);
        this.hud.say('HE TOOK ONE OUT OF YOU', 1600);
      }
      this.setState('strike', STRIKE);
      return;
    }
    this.audio.tick();
    this.particles.spark(this.x + 60, FLOOR - 130, 0xffffff, 8);
    if (a.opening) {
      this.hud.say('HE MISSED. STEP IN.', 1100);
      this.setState('stunned', a.opening);
    } else {
      this.hud.say('MISS', 700);
      this.setState('strike', STRIKE);
    }
  }

  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    this.stateT -= dt;
    if (this.duckT > 0) this.duckT -= dt;
    if (this.tongueT > 0) this.tongueT -= dt;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.blind > 0) this.blind -= dt;
    if (this.lunge > 0) this.lunge = Math.max(0, this.lunge - dt / STRIKE);
    if (this.flash) { this.flash.t += dt; if (this.flash.t > 0.25) this.flash = null; }

    // glide toward the zone you asked for
    const target = ZONE_X[this.zone];
    this.x += (target - this.x) * Math.min(1, dt / STEP_TIME);

    if (this.rage) {
      this.rage.t += dt;
      if (this.rage.t >= this.rage.dur) { this.rage = null; this.knockDown(); return; }
    }

    this.dynTimer -= dt;
    if (!this.dyn && this.dynTimer <= 0 && ['idle', 'down', 'recover'].includes(this.state)) {
      this.dyn = { x: CHACO_X, y: FLOOR - 260, vx: (this.x - CHACO_X) * 0.55, vy: 40, t: 0 };
      this.dynTimer = DYN_EVERY;
      this.audio.tick();
      this.hud.say('CATCH IT', 800);
    }
    if (this.dyn) {
      this.dyn.t += dt;
      this.dyn.vy += 320 * dt;
      this.dyn.x += this.dyn.vx * dt; this.dyn.y += this.dyn.vy * dt;
      if (this.dyn.y > FLOOR - 20) {
        this.particles.burst(this.dyn.x, FLOOR - 40, 0xe23c2f, 16);
        const near = Math.abs(this.dyn.x - this.x) < 110;
        this.dyn = null; this.dynSprite.visible = false;
        if (near) this.takeHit(1);
      }
    }

    if (this.stateT > 0) { this.render(dt); return; }

    switch (this.state) {
      case 'intro': case 'down': case 'hurt': case 'recover':
        this.setState('idle', this.rng.range(0.55, 1.25) / (this.rage ? this.boss.ultimaRaya.speedUp : 1));
        break;
      case 'idle': {
        this.attack = this.pickAttack();
        this.isFeint = this.round >= 3 && this.rng() < this.boss.feintChance;
        const tell = this.boss.attacks[this.attack].tell * (this.rage ? this.boss.ultimaRaya.tellScale : 1);
        this.audio.warn();
        this.setState('tell', tell);
        break;
      }
      case 'tell':
        if (this.isFeint) { this.setState('recover', 0.32); this.hud.say('FEINT', 700); }
        else this.resolveAttack();
        break;
      case 'strike': this.setState('recover', RECOVER); break;
      case 'stunned': this.setState('recover', RECOVER); break;
      case 'berserk':
        this.rage = { t: 0, dur: this.boss.ultimaRaya.duration };
        this.round = 3;
        this.hud.say('SURVIVE IT. STAY BACK.', 2600);
        this.audio.roar();
        this.setState('idle', 0.5);
        break;
      default: this.setState('idle', 0.8);
    }
    this.render(dt);
  }

  chacoTexture() {
    if (this.rage) return this.state === 'strike' ? 'chaco_rage' : 'chaco_berserk';
    switch (this.state) {
      case 'intro': return 'chaco_intro';
      case 'down': return 'chaco_taunt';
      case 'hurt': return 'chaco_hurt';
      case 'stunned': return 'chaco_stagger';
      case 'berserk': return 'chaco_berserk';
      case 'dead': return 'chaco_dead';
      case 'win': return 'chaco_win';
      case 'tell': return this.blind > 0 ? 'chaco_idle' : {
        saludo: 'chaco_tell_jab', cobrador: 'chaco_tell_hay', chupada: 'chaco_tell_hay',
        polvo: 'chaco_idle', belt: 'chaco_belt' }[this.attack];
      case 'strike': return {
        saludo: 'chaco_jab', cobrador: 'chaco_hay', chupada: 'chaco_chupada',
        polvo: 'chaco_polvo', belt: 'chaco_belt' }[this.attack];
      default: return 'chaco_idle';
    }
  }

  frogTexture() {
    if (this.over) return this.hearts <= 0 ? 'boxfrog_down' : 'boxfrog_win';
    if (this.hurtT > 0) return 'boxfrog_hurt';
    if (this.tongueT > 0) return this.dyn ? 'boxfrog_eat' : 'boxfrog_tongue';
    if (this.ducking) return 'boxfrog_duck';
    if (this.zone === IN) return 'boxfrog_right';
    if (this.zone === OUT) return 'boxfrog_left';
    return 'boxfrog_guard';
  }

  render(dt) {
    const cs = this.chacoSprite, fs = this.frogSprite;
    const ct = this.chacoTexture();
    cs.texture = this.tex.get(ct);
    const ck = this.tex.scaleFor(ct) * 1.85;
    cs.scale.set(-ck, ck);                       // mirrored so he faces the frog
    cs.x = CHACO_X + this.lunge * -70;
    cs.y = FLOOR + 6;

    const ft = this.frogTexture();
    fs.texture = this.tex.get(ft);
    const fk = this.tex.scaleFor(ft) * 1.9;
    fs.scale.set(fk, fk);
    fs.x = this.x;
    fs.y = FLOOR + 6;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.45 : 1) : 1;

    if (this.dyn) {
      this.dynSprite.visible = true;
      this.dynSprite.x = this.dyn.x; this.dynSprite.y = this.dyn.y;
      this.dynSprite.scale.set(this.tex.scaleFor('boss_dynamite') * 1.5);
      this.dynSprite.rotation = this.dyn.t * 7;
    }

    // the swing itself, so a punch is something you watch travel
    const b = this.behind; b.clear();
    if (this.state === 'strike' && this.attack !== 'polvo') {
      const r = REACH[this.attack];
      const tipX = ZONE_X[r.reach] - 30;
      const k = 1 - this.lunge;
      const y = FLOOR - (this.attack === 'chupada' ? 90 : 170);
      b.moveTo(CHACO_X - 60, y)
        .lineTo(CHACO_X - 60 + (tipX - CHACO_X + 60) * Math.min(1, k * 2), y)
        .stroke({ width: 16, color: 0xffffff, alpha: 0.16 * (1 - k) + 0.1, cap: 'round' });
    }

    const g = this.fx; g.clear();
    if (this.state === 'tell' && this.blind <= 0) {
      const beat = 0.5 + 0.5 * Math.sin(this.time * 24);
      g.circle(CHACO_X - 40, FLOOR - 210, 150 + beat * 24)
        .stroke({ width: 4 + beat * 4, color: 0xff5533, alpha: 0.32 + beat * 0.45 });
      // Round one spells out the answer; after that you are on your own.
      if (this.round === 1 && !this.rage) {
        const r = REACH[this.attack];
        this.hud.say(r.hint, 500);
      }
    }
    if (this.chacoOpen()) {
      const beat = 0.5 + 0.5 * Math.sin(this.time * 16);
      g.circle(CHACO_X - 40, FLOOR - 200, 110 + beat * 18)
        .stroke({ width: 6, color: 0xaab42a, alpha: 0.55 + beat * 0.4 });
      if (this.zone !== IN) {
        g.poly([this.x + 60, FLOOR - 130, this.x + 100, FLOOR - 150, this.x + 100, FLOOR - 110])
          .fill({ color: 0xaab42a, alpha: 0.5 + beat * 0.4 });
      }
    }
    if (this.flash) {
      const k = 1 - this.flash.t / 0.25;
      g.circle(this.flash.x, this.flash.y, 30 + (1 - k) * 60).fill({ color: 0xffffff, alpha: k * 0.6 });
    }
    if (this.blind > 0) g.rect(0, 0, W, H).fill({ color: 0xffffff, alpha: Math.min(0.45, this.blind * 0.13) });
    if (this.rage) {
      const p = this.rage.t / this.rage.dur;
      g.roundRect(W * 0.2, 40, W * 0.6, 16, 8).fill({ color: 0x000000, alpha: 0.55 });
      g.roundRect(W * 0.2, 40, W * 0.6 * p, 16, 8).fill(0xe23c2f);
    }
    for (let i = 0; i < this.boss.knockdownsToWin; i++)
      g.circle(W / 2 - 34 + i * 34, 26, 10).fill({ color: i < this.knockdowns ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() { return { sizeClass: 3, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
