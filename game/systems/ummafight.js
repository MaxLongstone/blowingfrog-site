// Boss six: UMMA. Side on, same room grammar as Chaco -- frog left, she's
// right, three standing zones between them -- but there is no punch here.
// She throws Crocs and barks orders; the only offense the frog has is eating
// what lands on a plate, which fills the fuse and calms her instead of
// hurting her. She never takes a hit. She trips on her own shoe pile once
// she's too busy being proud of you to watch her feet.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { UMMA } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';

const W = 832, H = 960;
const FLOOR = H * 0.80;
const UMMA_X = W * 0.72;
const ZONE_X = [W * 0.13, W * 0.29, W * 0.45];   // out, mid, in
const OUT = 0, MID = 1, IN = 2;
const STEP_TIME = 0.16;

export class UmmaFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = UMMA; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false; this.frozen = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.layer = new PIXI.Container();
    this.crocLayer = new PIXI.Container();
    this.world.addChild(this.bg, this.layer, this.crocLayer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.ummaSprite = new PIXI.Sprite(this.tex.get('umma_idle'));
    this.ummaSprite.anchor.set(0.5, 1);
    this.frogSprite = new PIXI.Sprite(this.tex.get('ummafrog_guard'));
    this.frogSprite.anchor.set(0.5, 1);
    this.layer.addChild(this.ummaSprite, this.frogSprite);
    this.banchanSprite = null;

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.zone = MID;
    this.x = ZONE_X[MID];
    this.eatT = 0; this.hurtT = 0; this.invuln = 0;

    this.fuse = 0;
    this.outbursts = 0;
    this.banchan = null;
    this.banchanTimer = 1.6;

    this.state = 'intro'; this.stateT = 1.4;
    this.attack = null; this.lockedZone = null; this.doubleSafeZone = null;
    this.command = null; this.commandT = 0; this.freezeBroken = false; this.commandSatisfied = false;

    this.drawRoom();
    this.hud.setStage('UMMA', 'ARROWS move · SPACE eat · listen when she talks');
    this.hud.say('ARROWS MOVE · SPACE EATS · THERE IS NO PUNCH HERE', 4200);
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }
  setState(s, t) { this.state = s; this.stateT = t; }

  drawRoom() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x1b1712);
    g.rect(0, 0, W, FLOOR - 140).fill(0x241d16);
    g.rect(0, FLOOR, W, H - FLOOR).fill(0x8a6a44);
    g.rect(0, FLOOR, W, 6).fill(0xb98f5a);
    for (let i = 0; i < 10; i++) g.rect(i * (W / 10), FLOOR + 6, 2, H - FLOOR - 6).fill({ color: 0x6a4f30, alpha: 0.4 });
    g.roundRect(UMMA_X - 90, FLOOR - 260, 180, 260, 6).fill(0x120e0a);
    g.rect(UMMA_X - 96, FLOOR - 266, 192, 10).fill(0x3a2c1c);
    for (let i = 0; i < 18; i++) g.ellipse(UMMA_X - 70 + (i * 23) % 140, FLOOR - 6 - (i * 7) % 14, 14, 7).fill({ color: 0xffb703, alpha: 0.5 });
    ZONE_X.forEach((zx, i) => g.ellipse(zx, FLOOR + 24, 46, 11).stroke({ width: 3, color: 0xffffff, alpha: i === IN ? 0.2 : 0.1 }));
  }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over || this.frozen || this.hurtT > 0) return;
    if (i.type === 'hop') { this.hop(i.dir); return; }
    if (i.type === 'punch') return;   // no punch in this fight, ever
    this.eat();
  }

  hop(dir) {
    if (dir !== 'left' && dir !== 'right') return;
    if (this.state === 'commandWindow' && this.command === 'freeze' && !this.freezeBroken) {
      this.freezeBroken = true;
      this.hud.say('SHE SAID SIT STILL', 900);
      this.takeHit(1);
      return;
    }
    if (dir === 'left' && this.zone > OUT) { this.zone -= 1; this.audio.hop(); }
    else if (dir === 'right' && this.zone < IN) { this.zone += 1; this.audio.hop(); }
  }

  banchanInReach() {
    return !!this.banchan && this.banchan.zone === this.zone && this.banchan.y > FLOOR - 300;
  }

  eat() {
    if (this.over || this.frozen) return;
    this.eatT = 0.24;
    this.audio.tongue();
    if (!this.banchanInReach()) { this.hud.say('NOTHING TO EAT', 500); return; }
    const wasCommand = this.state === 'commandWindow' && this.command === 'eat';
    this.banchan = null;
    if (wasCommand) this.commandSatisfied = true;
    this.fuse = Math.min(this.boss.fuseTarget, this.fuse + 1);
    this.hud.setFuse(this.fuse);
    this.audio.eat(); this.addScore(wasCommand ? 160 : 140);
    this.ach?.bump('midairEats');
    this.particles.burst(this.x, FLOOR - 90, 0xf2c53d, 16);
    if (this.fuse >= this.boss.fuseTarget) this.clearOutburst();
  }

  clearOutburst() {
    this.fuse = 0; this.hud.setFuse(0);
    this.audio.boom(); this.shake.add(10);
    this.particles.burst(this.x, FLOOR - 90, 0xf2c53d, 30, 340);
    this.addScore(900);
    this.outbursts += 1;
    if (this.outbursts >= this.boss.outburstsToWin) { this.finishSequence(); return; }
    this.hud.say('SHE BEAMS AT YOU. FOR NOW.', 1800);
  }

  finishSequence() {
    this.frozen = true;
    this.audio.win();
    this.setState('trip', 99);
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
    this.particles.burst(this.x, FLOOR - 90, 0xe23c2f, 18);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish();
  }

  finish() {
    this.over = true;
    this.audio.lose();
    setTimeout(() => this.emit('lost', { score: this.score }), 1500);
  }

  startCommand() {
    this.command = this.rng.pick(Object.keys(this.boss.commands));
    const cmd = this.boss.commands[this.command];
    this.commandT = cmd.window;
    this.freezeBroken = false; this.commandSatisfied = false;
    if (this.command === 'eat') this.banchan = { zone: this.zone, y: FLOOR - 260, vy: 0, t: 0 };
    this.audio.warn();
    this.hud.say(cmd.line, Math.round(cmd.window * 1000) + 200);
    this.state = 'commandWindow';
  }

  startAttack() {
    this.attack = this.rng.pick(Object.keys(this.boss.attacks));
    const a = this.boss.attacks[this.attack];
    if (a.reach === 'locked') this.lockedZone = this.zone;
    if (a.reach === 'double') this.doubleSafeZone = this.rng.int(0, 2);
    this.audio.warn();
    this.setState('tell', a.tell);
  }

  resolveCommand() {
    const cmd = this.boss.commands[this.command];
    let ok;
    if (this.command === 'shoes') ok = this.zone === OUT;
    else if (this.command === 'freeze') ok = !this.freezeBroken;
    else ok = this.commandSatisfied;
    if (ok) { this.audio.tick(); this.hud.say('GOOD.', 700); this.addScore(120); }
    else if (this.command !== 'freeze') { this.hud.say(`SHE SAID "${cmd.line}"`, 1200); this.takeHit(1); }
    this.command = null;
    this.setState('recover', 0.4);
  }

  resolveAttack() {
    const a = this.boss.attacks[this.attack];
    let hit;
    if (a.reach === 'double') hit = this.zone !== this.doubleSafeZone;
    else if (a.reach === 'locked') hit = this.zone === this.lockedZone;
    else hit = this.zone === a.zone;
    this.setState('strike', 0.28);
    if (hit) { this.takeHit(a.damage); }
    else { this.audio.tick(); this.hud.say('MISS', 600); this.particles.spark(this.x, FLOOR - 130, 0xffffff, 8); }
  }

  update(dt) {
    if (this.over || this.frozen) { this.render(dt); return; }
    this.time += dt;
    if (this.eatT > 0) this.eatT -= dt;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.invuln > 0) this.invuln -= dt;

    const target = ZONE_X[this.zone];
    this.x += (target - this.x) * Math.min(1, dt / STEP_TIME);

    this.banchanTimer -= dt;
    if (!this.banchan && this.banchanTimer <= 0 && (this.state === 'idle' || this.state === 'recover')) {
      this.banchan = { zone: this.rng.int(0, 2), y: FLOOR - 260, vy: 40, t: 0 };
      this.banchanTimer = this.rng.range(3.0, 4.4);
      this.audio.tick();
    }
    if (this.banchan) {
      this.banchan.t += dt; this.banchan.vy += 260 * dt; this.banchan.y += this.banchan.vy * dt;
      if (this.banchan.y > FLOOR - 20) this.banchan = null;
    }

    if (this.state === 'commandWindow') {
      this.commandT -= dt;
      if (this.commandT <= 0) this.resolveCommand();
      this.render(dt);
      return;
    }

    this.stateT -= dt;
    if (this.stateT > 0) { this.render(dt); return; }

    switch (this.state) {
      case 'intro': case 'recover': case 'strike':
        this.setState('idle', this.rng.range(0.5, 1.1));
        break;
      case 'idle':
        if (this.rng() < 0.45) this.startCommand();
        else this.startAttack();
        break;
      case 'tell':
        this.resolveAttack();
        break;
    }
    this.render(dt);
  }

  ummaTexture() {
    if (this.frozen || this.state === 'trip') return 'umma_trip';
    if (this.state === 'strike') return 'umma_throw';
    if (this.state === 'tell') return 'umma_tell';
    if (this.state === 'commandWindow') return 'umma_scold';
    if (this.outbursts > 0 && this.state === 'recover') return 'umma_pride';
    return 'umma_idle';
  }

  frogTexture() {
    if (this.over) return this.hearts <= 0 ? 'ummafrog_down' : 'ummafrog_win';
    if (this.hurtT > 0) return 'ummafrog_hurt';
    if (this.eatT > 0) return 'ummafrog_eat';
    if (this.zone === IN) return 'ummafrog_right';
    if (this.zone === OUT) return 'ummafrog_left';
    return 'ummafrog_guard';
  }

  render(dt) {
    const us = this.ummaSprite;
    const ut = this.ummaTexture();
    us.texture = this.tex.get(ut);
    const uk = this.tex.scaleFor(ut) * 1.7;
    us.scale.set(-uk, uk);
    us.x = UMMA_X; us.y = FLOOR + 6;

    const fs = this.frogSprite;
    const ft = this.frogTexture();
    fs.texture = this.tex.get(ft);
    const fk = this.tex.scaleFor(ft) * 1.7;
    fs.scale.set(fk, fk);
    fs.x = this.x; fs.y = FLOOR + 6;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.5 : 1) : 1;

    this.crocLayer.removeChildren();
    if ((this.state === 'tell' || this.state === 'strike') && this.attack) {
      const a = this.boss.attacks[this.attack];
      const targets = a.reach === 'double' ? [0, 1, 2].filter(z => z !== this.doubleSafeZone)
        : a.reach === 'locked' ? [this.lockedZone] : [a.zone];
      const p = this.state === 'strike' ? 1 : Math.min(1, 1 - this.stateT / a.tell);
      for (const z of targets) {
        const cs = new PIXI.Sprite(this.tex.get('croc_shoe'));
        cs.anchor.set(0.5);
        cs.x = UMMA_X + (ZONE_X[z] - UMMA_X) * p;
        cs.y = FLOOR - 40 - Math.sin(p * Math.PI) * 60;
        cs.scale.set(this.tex.scaleFor('croc_shoe'));
        cs.rotation = p * 8;
        this.crocLayer.addChild(cs);
      }
    }

    if (this.banchan) {
      if (!this.banchanSprite) {
        this.banchanSprite = new PIXI.Sprite(this.tex.get('climb_dish'));
        this.banchanSprite.anchor.set(0.5);
        this.layer.addChild(this.banchanSprite);
      }
      this.banchanSprite.visible = true;
      this.banchanSprite.x = ZONE_X[this.banchan.zone];
      this.banchanSprite.y = this.banchan.y;
      this.banchanSprite.scale.set(this.tex.scaleFor('climb_dish') * 1.1);
    } else if (this.banchanSprite) this.banchanSprite.visible = false;

    const g = this.fx; g.clear();
    if (this.state === 'commandWindow' && this.command) {
      const cmd = this.boss.commands[this.command];
      const p = Math.max(0, this.commandT / cmd.window);
      g.roundRect(W * 0.2, 40, W * 0.6, 16, 8).fill({ color: 0x000000, alpha: 0.55 });
      g.roundRect(W * 0.2, 40, W * 0.6 * p, 16, 8).fill(0xe8564a);
    }
    if (this.state === 'tell' && this.attack === 'doubleCroc') {
      g.ellipse(ZONE_X[this.doubleSafeZone], FLOOR + 24, 46, 11).stroke({ width: 4, color: 0xaab42a, alpha: 0.7 });
    }
    for (let i = 0; i < this.boss.outburstsToWin; i++)
      g.circle(W / 2 - 34 + i * 34, 26, 10).fill({ color: i < this.outbursts ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  frogState() { return { sizeClass: 9, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
