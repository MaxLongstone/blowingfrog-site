// Boss one: a side-on bout. Chaco telegraphs, you dodge or duck, and you counter
// with the tongue only while his mouth is open. The fuse rule still decides it.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { CHACO } from '../config/bosses.js';
import { FUSE_TARGET } from '../config/stages.js';
import { makeRng } from '../core/rng.js';

const W = 832, H = 960;                 // same logical canvas as a stage
const FLOOR = H * 0.78;
// A dodge must comfortably outlast the longest wind-up. Set too tight, a player
// who reacts the instant the tell appears has their dodge expire before impact,
// which punishes reading the tell correctly. It is deliberately generous.
const DODGE_TIME = 1.15;
const STRIKE = 0.22;                    // the damage frame
const RECOVER = 0.34;
const HP_PER_ROUND = 100;
const COUNTER_DAMAGE = 34;
const DYN_EVERY = 5.5;

// Which defensive pose beats which attack.
const BEATS = {
  saludo:   ['left', 'right'],
  cobrador: ['duck'],
  chupada:  ['duck', 'left', 'right'],
  belt:     ['duck'],
  polvo:    [],                         // cannot be dodged, only endured
};

export class BossFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = CHACO;
    this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0;
    this.over = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.world.addChild(this.bg);
    this.layer = new PIXI.Container();
    this.world.addChild(this.layer);
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

    // frog
    this.lives = frogState?.lives ?? 5;
    this.hearts = 3;
    this.fuse = 0;
    this.pose = 'guard';
    this.poseT = 0;
    this.invuln = 0;

    // chaco
    this.round = 1;
    this.knockdowns = 0;
    this.hp = HP_PER_ROUND;
    this.state = 'intro';
    this.stateT = 1.2;
    this.attack = null;
    this.isFeint = false;
    this.blind = 0;
    this.rage = null;
    this.dyn = null;
    this.dynTimer = DYN_EVERY;

    this.drawRing();
    this.hud.setStage('CHACO THE NARCO CHUPACABRA', 'Watch the chains.');
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(evt, fn) { (this.listeners[evt] ||= []).push(fn); return this; }
  emit(evt, p) { (this.listeners[evt] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  drawRing() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x14131a);
    g.rect(0, 0, W, FLOOR - 250).fill(0x0d0c12);
    for (let i = 0; i < 26; i++) {                       // crowd
      const x = (i * 41) % W, h = 30 + (i % 5) * 8;
      g.circle(x, FLOOR - 262 - h, 11).fill(0x08070b);
      g.roundRect(x - 13, FLOOR - 254 - h, 26, h + 14, 7).fill(0x08070b);
    }
    for (let i = -8; i <= 8; i++) {                       // chain-link
      g.moveTo(i * 60, FLOOR - 250).lineTo(i * 60 + 250, FLOOR).stroke({ width: 2, color: 0x8f95a0, alpha: 0.16 });
      g.moveTo(i * 60, FLOOR).lineTo(i * 60 + 250, FLOOR - 250).stroke({ width: 2, color: 0x8f95a0, alpha: 0.16 });
    }
    g.rect(0, FLOOR, W, H - FLOOR).fill(0x8a7f6a);        // canvas floor
    g.rect(0, FLOOR, W, 5).fill(0xb3a68c);
    for (let i = 0; i < 40; i++) g.circle((i * 71) % W, FLOOR + 18 + ((i * 37) % 150), 3 + (i % 3)).fill({ color: 0x6d6353, alpha: 0.45 });
    for (const x of [40, W - 40]) {                       // corner posts and ropes
      g.roundRect(x - 9, FLOOR - 250, 18, 260, 5).fill(0x9b1f28);
      for (let r = 0; r < 3; r++) g.roundRect(0, FLOOR - 220 + r * 70, W, 7, 3).fill({ color: 0xe8e4d8, alpha: 0.5 });
    }
    for (const x of [W * 0.24, W * 0.76]) {               // floodlights
      g.poly([x - 34, 0, x + 34, 0, x + 18, 44, x - 18, 44]).fill(0x2b2b33);
      g.circle(x, 46, 40).fill({ color: 0xfff2c0, alpha: 0.10 });
      g.circle(x, 44, 15).fill(0xfff2c0);
    }
  }

  // ---- input ------------------------------------------------------------
  intent(i) {
    if (this.over) return;
    if (i.type === 'hop') {
      const map = { left: 'left', right: 'right', down: 'duck', up: 'guard' };
      const p = map[i.dir];
      if (!p || this.pose === 'down') return;
      this.pose = p; this.poseT = DODGE_TIME;
      this.audio.hop();
    } else {
      this.tongue();
    }
  }

  tongue() {
    if (this.pose === 'down' || this.over) return;
    this.pose = 'tongue'; this.poseT = 0.3;
    this.audio.tongue();
    // eat a thrown stick
    if (this.dyn && Math.abs(this.dyn.x - W / 2) < 190 && this.dyn.y > FLOOR - 330) {
      this.dyn = null; this.dynSprite.visible = false;
      this.fuse = Math.min(FUSE_TARGET, this.fuse + 1);
      this.hud.setFuse(this.fuse);
      this.audio.eat(); this.addScore(150);
      this.particles.burst(W / 2, FLOOR - 120, 0xf08a24, 16);
      if (this.fuse >= FUSE_TARGET) this.superDetonate();
      return;
    }
    // counter, but only while he is open
    if (this.chacoOpen()) this.land();
  }

  chacoOpen() {
    if (this.state === 'stunned') return true;
    if (this.state === 'strike' && this.attack === 'chupada') return true;
    return false;
  }

  land() {
    this.hp -= COUNTER_DAMAGE;
    this.audio.squash();
    this.shake.add(7);
    this.particles.burst(W / 2, FLOOR - 320, 0xf2c53d, 20);
    this.addScore(200);
    this.ach?.bump('burns');
    if (this.rage) this.rage.t += this.boss.ultimaRaya.counterFillsBar * this.rage.dur;
    if (this.hp <= 0) this.knockDown();
    else this.setState('hurt', 0.45);
  }

  superDetonate() {
    this.hud.say('FUSE LIT. GET OUT OF THE WAY.', 1800);
    this.audio.boom();
    this.shake.add(20);
    this.particles.burst(W / 2, FLOOR - 200, 0xf08a24, 60, 420);
    this.particles.debris(W / 2, FLOOR - 200, 30);
    this.fuse = 0; this.hud.setFuse(0);
    this.hp = 0;
    this.knockDown();
  }

  knockDown() {
    this.knockdowns += 1;
    this.hp = HP_PER_ROUND;
    this.audio.win();
    this.addScore(1000);
    this.particles.debris(W / 2, FLOOR - 120, 24);
    if (this.knockdowns >= this.boss.knockdownsToWin) { this.finish(true); return; }
    this.round = Math.min(3, this.knockdowns + 1);
    if (this.knockdowns === 2) { this.setState('berserk', 2.0); return; }
    this.setState('down', 2.2);
  }

  takeHit(dmg) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.0;
    this.audio.hit();
    this.shake.add(11);
    this.pose = 'hurt'; this.poseT = 0.5;
    this.hud.setLives(Math.max(0, this.hearts), true);
    this.particles.burst(W / 2, FLOOR - 90, 0xe23c2f, 18);
    if (this.hearts <= 0) this.finish(false);
  }

  finish(won) {
    this.over = true;
    this.pose = won ? 'win' : 'down';
    this.setState(won ? 'dead' : 'win', 99);
    if (won) { this.audio.win(); this.ach?.bump('stagesCleared'); }
    else this.audio.lose();
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), 1600);
  }

  setState(s, t) { this.state = s; this.stateT = t; }

  // ---- the bout ---------------------------------------------------------
  pickAttack() {
    const pool = Object.entries(this.boss.attacks)
      .filter(([, a]) => a.round <= this.round)
      .map(([k]) => k);
    return this.rng.pick(pool);
  }

  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    this.stateT -= dt;
    if (this.poseT > 0) { this.poseT -= dt; if (this.poseT <= 0 && this.pose !== 'down') this.pose = 'guard'; }
    if (this.invuln > 0) this.invuln -= dt;
    if (this.blind > 0) this.blind -= dt;

    if (this.rage) {
      this.rage.t += dt;
      if (this.rage.t >= this.rage.dur) { this.rage = null; this.knockDown(); return; }
    }

    // thrown dynamite arcs in during quiet moments
    this.dynTimer -= dt;
    if (!this.dyn && this.dynTimer <= 0 && ['idle', 'taunt', 'recover'].includes(this.state)) {
      this.dyn = { x: W * 0.5, y: FLOOR - 420, vy: 150, t: 0 };
      this.dynTimer = DYN_EVERY;
      this.audio.tick();
    }
    if (this.dyn) {
      this.dyn.t += dt; this.dyn.y += this.dyn.vy * dt;
      if (this.dyn.y > FLOOR - 40) {
        this.dyn = null; this.dynSprite.visible = false;
        this.particles.burst(W / 2, FLOOR - 60, 0xe23c2f, 14);
        this.takeHit(1);
      }
    }

    if (this.stateT > 0) { this.render(dt); return; }

    switch (this.state) {
      case 'intro':
      case 'down':
      case 'hurt':
      case 'recover':
        this.setState('idle', this.rng.range(0.5, 1.2) / (this.rage ? this.boss.ultimaRaya.speedUp : 1));
        break;
      case 'idle': {
        this.attack = this.pickAttack();
        this.isFeint = this.round >= 3 && this.rng() < this.boss.feintChance;
        const tell = this.boss.attacks[this.attack].tell *
          (this.rage ? this.boss.ultimaRaya.tellScale : 1);
        this.audio.warn();
        this.setState('tell', tell);
        break;
      }
      case 'tell':
        if (this.isFeint) { this.setState('recover', 0.3); this.hud.say('FEINT', 700); }
        else this.resolveAttack();
        break;
      case 'strike':
        this.setState('recover', RECOVER);
        break;
      case 'stunned':
        this.setState('recover', RECOVER);
        break;
      case 'berserk':
        this.rage = { t: 0, dur: this.boss.ultimaRaya.duration };
        this.round = 3;
        this.hud.say('SURVIVE IT. DO NOT TRADE.', 2600);
        this.audio.roar();
        this.setState('idle', 0.4);
        break;
      default:
        this.setState('idle', 0.8);
    }
    this.render(dt);
  }

  // The punch connects the moment the wind-up ends. Resolving here rather than
  // when the strike animation finishes keeps the dodge window honest.
  resolveAttack() {
    const a = this.boss.attacks[this.attack];
    const safe = BEATS[this.attack] || [];
    const dodged = safe.includes(this.pose) || (this.pose === 'tongue' && this.attack === 'chupada');
    if (this.attack === 'polvo') {
      this.blind = a.blindFor;
      this.hud.say('YOU CANNOT SEE HIS TELLS', 1800);
    } else if (!dodged) {
      this.takeHit(a.damage);
      if (a.stealsFuse && this.fuse > 0) {
        this.fuse -= 1; this.hud.setFuse(this.fuse);
        this.hud.say('HE TOOK ONE OUT OF YOU', 1600);
      }
    } else if (a.opening) {
      this.audio.tick();
      this.hud.say('HE MISSED. GET IN THERE.', 900);
      this.setState('stunned', a.opening);
      return;
    }
    this.setState('strike', STRIKE);
  }

  chacoTexture() {
    if (this.rage) return this.state === 'strike' ? 'chaco_rage' : 'chaco_berserk';
    switch (this.state) {
      case 'intro': return 'chaco_intro';
      case 'down': return 'chaco_taunt';
      case 'hurt': return 'chaco_hurt';
      case 'stunned': return 'chaco_stunned';
      case 'berserk': return 'chaco_berserk';
      case 'dead': return 'chaco_dead';
      case 'win': return 'chaco_win';
      case 'tell': return this.blind > 0 ? 'chaco_idle'
        : { saludo: 'chaco_tell_jab', cobrador: 'chaco_tell_hay', chupada: 'chaco_tell_hay', polvo: 'chaco_idle', belt: 'chaco_belt' }[this.attack];
      case 'strike': return { saludo: 'chaco_jab', cobrador: 'chaco_hay', chupada: 'chaco_chupada', polvo: 'chaco_polvo', belt: 'chaco_belt' }[this.attack];
      default: return 'chaco_idle';
    }
  }

  render(dt) {
    const cs = this.chacoSprite, fs = this.frogSprite;
    cs.texture = this.tex.get(this.chacoTexture());
    const ck = this.tex.scaleFor(this.chacoTexture()) * 1.7;
    cs.scale.set(ck);
    cs.x = W / 2; cs.y = FLOOR + 4;
    cs.alpha = 1;

    const poseKind = 'boxfrog_' + (this.pose === 'guard' ? 'guard' : this.pose);
    fs.texture = this.tex.get(poseKind);
    const fk = this.tex.scaleFor(poseKind) * 1.9;
    fs.scale.set(this.pose === 'left' ? -fk : fk, fk);
    fs.x = W / 2 + (this.pose === 'left' ? -70 : this.pose === 'right' ? 70 : 0);
    fs.y = H - 10;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.4 : 1) : 1;

    if (this.dyn) { this.dynSprite.visible = true; this.dynSprite.x = this.dyn.x; this.dynSprite.y = this.dyn.y;
      this.dynSprite.scale.set(this.tex.scaleFor('boss_dynamite') * 1.6);
      this.dynSprite.rotation = this.dyn.t * 6; }

    const g = this.fx; g.clear();
    if (this.state === 'tell' && this.blind <= 0) {           // the wind-up warning
      const beat = 0.5 + 0.5 * Math.sin(this.time * 24);
      g.circle(W / 2, FLOOR - 190, 165 + beat * 26).stroke({ width: 4 + beat * 4, color: 0xff5533, alpha: 0.3 + beat * 0.45 });
    }
    if (this.chacoOpen()) {
      const beat = 0.5 + 0.5 * Math.sin(this.time * 16);
      g.circle(W / 2, FLOOR - 300, 100 + beat * 16).stroke({ width: 6, color: 0xaab42a, alpha: 0.55 + beat * 0.4 });
    }
    if (this.blind > 0) g.rect(0, 0, W, H).fill({ color: 0xffffff, alpha: Math.min(0.5, this.blind * 0.14) });
    if (this.rage) {
      const p = this.rage.t / this.rage.dur;
      g.roundRect(W * 0.2, 40, W * 0.6, 16, 8).fill({ color: 0x000000, alpha: 0.55 });
      g.roundRect(W * 0.2, 40, W * 0.6 * p, 16, 8).fill(0xe23c2f);
    }
    // knockdown pips
    for (let i = 0; i < this.boss.knockdownsToWin; i++)
      g.circle(W / 2 - 34 + i * 34, 26, 10).fill({ color: i < this.knockdowns ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() { return { sizeClass: 3, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
