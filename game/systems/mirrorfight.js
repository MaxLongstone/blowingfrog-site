// Boss four: THE NECO FROG. A doppelganger from a dark mirror dimension that
// obeys the exact same fuse rule the player does. A shared bomb spawns in one
// of three zones; whoever reaches five first detonates. The player's win
// damages nothing directly -- it just wins the round. The Neco Frog's own
// wins make it bigger and meaner. It also throws three telegraphed attacks,
// each with one correct zone to dodge to, same grammar as Chaco.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { NECO_FROG } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';

const W = 832, H = 960;
const FLOOR = H * 0.80;
const NECO_X = W * 0.72;
const ZONE_X = [W * 0.16, W * 0.32, W * 0.5];   // out, mid, in (distance from Neco)
const OUT = 0, MID = 1, IN = 2;

const STEP_TIME = 0.14;
const PUNCH_TIME = 0.22;
const EAT_TIME = 0.26;
const STRIKE = 0.24;
const RECOVER = 0.4;
const BOMB_EVERY = [3.2, 2.6, 2.1];       // seconds between bomb spawns, per growth tier
const RACE_BASE = 3.4;                     // seconds Neco takes to reach a fresh bomb at tier 0

// Each attack is dangerous in exactly one zone (its `reach`, from the boss
// config); the other two zones dodge it. Two of three safe, since the player
// is already juggling the bomb race at the same time.
const ZONE_NAME = { [OUT]: 'out', [MID]: 'mid', [IN]: 'in' };

export class MirrorFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = NECO_FROG; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.behind = new PIXI.Graphics();
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.behind, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.necoSprite = new PIXI.Sprite(this.tex.get('neco_idle'));
    this.necoSprite.anchor.set(0.5, 1);
    this.heroSprite = new PIXI.Sprite(this.tex.get('hero_idle'));
    this.heroSprite.anchor.set(0.5, 1);
    this.bombSprite = new PIXI.Sprite(this.tex.get('rift_bomb'));
    this.bombSprite.anchor.set(0.5);
    this.bombSprite.visible = false;
    this.layer.addChild(this.bombSprite, this.necoSprite, this.heroSprite);

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.zone = MID;
    this.x = ZONE_X[MID];
    this.punchT = 0; this.eatT = 0; this.invuln = 0;

    this.roundsWon = 0;
    this.tier = 0;
    this.fuse = 0; this.necoFuse = 0;
    this.bomb = null;                 // { zone, raceT }
    this.bombTimer = 1.4;

    this.state = 'intro'; this.stateT = 1.1;
    this.attack = null;
    this.attackTimer = 2.0;

    this.drawBackdrop();
    this.hud.setStage('THE NECO FROG', 'Watch the goatee.');
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  drawBackdrop() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x0a0710);
    for (let i = 0; i < 40; i++) {
      const x = (i * 53) % W, y = (i * 97) % (FLOOR - 60);
      g.circle(x, y, 1.5 + (i % 3)).fill({ color: 0xc23fe0, alpha: 0.25 + (i % 4) * 0.1 });
    }
    g.rect(0, FLOOR, W, H - FLOOR).fill(0x140f1c);
    g.rect(0, FLOOR, W, 4).fill({ color: 0xc23fe0, alpha: 0.6 });
    for (let i = 0; i < 3; i++) {
      const x = W * 0.5 - 260 + i * 260;
      g.moveTo(x, FLOOR).lineTo(x - 10, FLOOR - 40).lineTo(x + 10, FLOOR - 40).fill({ color: 0xc23fe0, alpha: 0.12 });
    }
  }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over) return;
    if (i.type === 'hop') {
      if (i.dir === 'left' && this.zone > OUT) { this.zone -= 1; this.audio.hop(); }
      else if (i.dir === 'right' && this.zone < IN) { this.zone += 1; this.audio.hop(); }
      return;
    }
    if (i.type === 'punch') { this.punch(); return; }
    this.eat();
  }

  punch() {
    if (this.over) return;
    this.punchT = PUNCH_TIME;
    this.audio.hop();
    if (this.zone !== IN) { this.hud.say('TOO FAR TO SWING', 700); return; }
    if (this.bomb) {
      this.bomb.raceT += 0.7;
      this.audio.squash();
      this.particles.spark(NECO_X - 60, FLOOR - 260, 0xc23fe0, 10);
      this.hud.say('SHOVED IT BACK', 800);
    } else {
      this.hud.say('NOTHING TO HIT', 600);
    }
  }

  eat() {
    if (this.over) return;
    this.eatT = EAT_TIME;
    this.audio.tongue();
    if (!this.bomb || this.bomb.zone !== this.zone) { this.hud.say('NO BOMB THERE', 600); return; }
    this.winBomb('player');
  }

  winBomb(who) {
    const cx = ZONE_X[this.bomb.zone], cy = FLOOR - 140;
    this.bomb = null; this.bombSprite.visible = false;
    this.bombTimer = BOMB_EVERY[this.tier] * this.rng.range(0.8, 1.15);
    if (who === 'player') {
      this.fuse = Math.min(this.boss.fuseTarget, this.fuse + 1);
      this.audio.eat(); this.addScore(150);
      this.particles.burst(cx, cy, 0xf2c53d, 16);
      this.hud.setFuse(this.fuse);
      this.ach?.bump('midairEats');
      if (this.fuse >= this.boss.fuseTarget) this.playerDetonate();
    } else {
      this.necoFuse = Math.min(this.boss.fuseTarget, this.necoFuse + 1);
      this.audio.tick();
      this.particles.burst(cx, cy, 0xc23fe0, 16);
      if (this.necoFuse >= this.boss.fuseTarget) this.necoDetonate();
    }
  }

  playerDetonate() {
    this.fuse = 0; this.necoFuse = 0; this.hud.setFuse(0);
    this.roundsWon += 1;
    this.audio.boom(); this.shake.add(14);
    this.particles.burst(NECO_X - 40, FLOOR - 260, 0xf08a24, 40, 380);
    this.addScore(900);
    if (this.roundsWon >= this.boss.roundsToWin) { this.finishSequence(); return; }
    this.hud.say(`ROUND WON. ${this.boss.roundsToWin - this.roundsWon} LEFT.`, 2000);
    this.setState('recover', 1.0);
  }

  necoDetonate() {
    this.fuse = 0; this.necoFuse = 0; this.hud.setFuse(0);
    this.tier = Math.min(2, this.tier + 1);
    this.audio.roar(); this.shake.add(16);
    this.particles.burst(NECO_X, FLOOR - 260, 0xc23fe0, 44, 420);
    this.hud.say('IT GREW', 2000);
    this.setState('recover', 1.0);
  }

  // The scripted finish: framed as its own overreach, not a normal round win.
  finishSequence() {
    this.over = true;
    this.setState('greedy', 1.0);
    this.audio.warn();
    this.hud.say(this.boss.finale.card, 3200);
    setTimeout(() => {
      this.setState('overload', 1.1);
      this.audio.boom(); this.shake.add(22);
      this.particles.burst(NECO_X, FLOOR - 260, 0xc23fe0, 60, 460);
    }, 1000);
    setTimeout(() => {
      this.setState('dead', 99);
      this.audio.win(); this.ach?.bump('stagesCleared');
    }, 2200);
    setTimeout(() => this.emit('won', { score: this.score }), 3800);
  }

  takeHit(dmg) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.0;
    this.audio.hit(); this.shake.add(10);
    this.particles.burst(this.x, FLOOR - 90, 0xe23c2f, 18);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish(false);
  }

  finish(won) {
    this.over = true;
    this.audio.lose();
    setTimeout(() => this.emit('lost', { score: this.score }), 1500);
  }

  setState(s, t) { this.state = s; this.stateT = t; }

  pickAttack() { return this.rng.pick(Object.keys(this.boss.attacks)); }

  resolveAttack() {
    const a = this.boss.attacks[this.attack];
    const dodged = ZONE_NAME[this.zone] !== a.reach;
    if (!dodged) this.takeHit(a.damage);
    else { this.audio.tick(); this.hud.say('DODGED', 500); }
    this.setState('strike', STRIKE);
  }

  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    if (this.punchT > 0) this.punchT -= dt;
    if (this.eatT > 0) this.eatT -= dt;
    if (this.invuln > 0) this.invuln -= dt;
    this.stateT -= dt;

    if (this.state === 'intro' && this.stateT <= 0) this.setState('idle', 0.6);

    // the shared bomb race
    if (!['intro'].includes(this.state)) {
      this.bombTimer -= dt;
      if (!this.bomb && this.bombTimer <= 0) {
        this.bomb = { zone: this.rng.int(0, 2), raceT: RACE_BASE / this.boss.growth.raceSpeed[this.tier] * this.rng.range(0.85, 1.15) };
        this.audio.warn();
      }
      if (this.bomb) {
        this.bomb.raceT -= dt;
        if (this.bomb.raceT <= 0) this.winBomb('neco');
      }
    }

    // its own claw/lash/throw attacks, same tell-strike-recover loop as Chaco
    if (this.stateT <= 0) {
      switch (this.state) {
        case 'idle':
          this.attackTimer -= dt;
          if (this.attackTimer <= 0) {
            this.attack = this.pickAttack();
            this.attackTimer = 2.4 * this.boss.growth.attackEvery[this.tier];
            this.setState('tell', this.boss.attacks[this.attack].tell * this.boss.growth.attackEvery[this.tier]);
          } else this.setState('idle', 0.15);
          break;
        case 'tell': this.resolveAttack(); break;
        case 'strike': case 'recover': this.setState('idle', 0.3); break;
      }
    }

    this.render(dt);
  }

  necoTexture() {
    switch (this.state) {
      case 'intro': case 'idle': return ['neco_idle', 'neco_r1', 'neco_r2'][this.tier];
      case 'tell': return 'neco_charge';
      case 'strike': return { claw: 'neco_claw', lash: 'neco_lash', throw: 'neco_throw' }[this.attack] || 'neco_idle';
      case 'recover': return this.necoFuse === 0 && this.tier > 0 ? 'neco_r2' : 'neco_hurt';
      case 'greedy': return 'neco_greedy';
      case 'overload': return 'neco_overload';
      case 'dead': return 'neco_dead';
      default: return 'neco_idle';
    }
  }

  heroTexture() {
    if (this.over) return 'hero_roar';
    if (this.punchT > 0) return 'hero_claw';
    if (this.eatT > 0) return 'hero_catch';
    if (this.invuln > 0.6) return 'hero_hurt';
    return 'hero_idle';
  }

  render(dt) {
    const ns = this.necoSprite, hs = this.heroSprite;
    const nk = this.necoTexture();
    ns.texture = this.tex.get(nk);
    const nScale = this.tex.scaleFor(nk) * (1.7 + this.tier * 0.22);
    ns.scale.set(-nScale, nScale);
    ns.x = NECO_X; ns.y = FLOOR + 6;

    const hk = this.heroTexture();
    hs.texture = this.tex.get(hk);
    const hScale = this.tex.scaleFor(hk) * 1.7;
    hs.scale.set(hScale, hScale);
    this.x += (ZONE_X[this.zone] - this.x) * Math.min(1, dt / STEP_TIME);
    hs.x = this.x; hs.y = FLOOR + 6;
    hs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.45 : 1) : 1;

    if (this.bomb) {
      this.bombSprite.visible = true;
      this.bombSprite.x = ZONE_X[this.bomb.zone];
      this.bombSprite.y = FLOOR - 240;
      this.bombSprite.scale.set(this.tex.scaleFor('rift_bomb') * 1.4);
      this.bombSprite.rotation = Math.sin(this.time * 6) * 0.2;
    }

    const g = this.fx; g.clear();
    if (this.state === 'tell') {
      const beat = 0.5 + 0.5 * Math.sin(this.time * 22);
      g.circle(NECO_X - 40, FLOOR - 210, 150 + beat * 24)
        .stroke({ width: 4 + beat * 4, color: 0xc23fe0, alpha: 0.32 + beat * 0.45 });
    }
    if (this.bomb) {
      const urgency = 1 - Math.max(0, this.bomb.raceT) / (RACE_BASE / this.boss.growth.raceSpeed[this.tier]);
      g.roundRect(W * 0.3, 40, W * 0.4, 10, 5).fill({ color: 0x000000, alpha: 0.5 });
      g.roundRect(W * 0.3, 40, W * 0.4 * urgency, 10, 5).fill(0xc23fe0);
    }
    for (let i = 0; i < this.boss.roundsToWin; i++)
      g.circle(W / 2 - 34 + i * 34, 20, 9).fill({ color: i < this.roundsWon ? 0xaab42a : 0x2a2a30, alpha: 0.95 });
    // dual fuse readout
    for (let i = 0; i < this.boss.fuseTarget; i++) {
      g.roundRect(24 + i * 16, H - 30, 12, 6, 2).fill({ color: i < this.fuse ? 0xf2c53d : 0x2a2a30, alpha: 0.9 });
      g.roundRect(W - 24 - (i + 1) * 16, H - 30, 12, 6, 2).fill({ color: i < this.necoFuse ? 0xc23fe0 : 0x2a2a30, alpha: 0.9 });
    }

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() { return { sizeClass: 6, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
