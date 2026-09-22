// Boss four, rebuilt: the Neco Frog as a top-down Centipede knock-off. Two
// mirrored chains wind down a grid the way an arcade centipede does -- across,
// then drop a row, then back the other way -- both racing the frog for the
// same scattered pods. A pod a chain reaches first makes it faster; a chain
// that gorges itself bursts on its own; SHIFT bites whatever is adjacent,
// killing the head outright or splitting the body in two. Filling the fuse
// (the universal rule) clears everything left on the board at once.
import { Shake, fitWorld } from '../core/grid.js';
import { Particles } from './particles.js';
import { NECO_FROG } from '../config/bosses.js';
import { makeRng } from '../core/rng.js';
import { nextHeadCell, speedFor, willBurst, biteOutcome, seedPath } from './centiperules.js';

const W = 832, H = 960;
const STEP_TIME = 0.14;        // the frog's own glide between cells
const LERP = 10;                // how fast a segment's drawn position catches up to its logical one
const BITE_FLASH = 0.22;
const FACE = { up: { dc: 0, dr: -1 }, down: { dc: 0, dr: 1 }, left: { dc: -1, dr: 0 }, right: { dc: 1, dr: 0 } };

let nextChainId = 1;

export class CentipedeFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = NECO_FROG; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;

    const { cols, rows, cell } = this.boss.grid;
    this.cols = cols; this.rows = rows; this.cell = cell;
    this.fieldW = cols * cell; this.fieldH = rows * cell;
    this.fieldX = (W - this.fieldW) / 2; this.fieldY = 128;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    const fit = fitWorld(this.app, W, H);
    this.world.scale.set(fit.scale);
    this.baseX = fit.x; this.baseY = fit.y;
    this.bg = new PIXI.Graphics();
    this.plate = new PIXI.Sprite(); this.plate.visible = false;
    this.field = new PIXI.Graphics();
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.plate, this.field, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.frogSprite = new PIXI.Sprite(this.tex.get('frog_s3'));
    this.frogSprite.anchor.set(0.5);
    this.finaleSprite = new PIXI.Sprite(this.tex.get('neco_idle'));
    this.finaleSprite.anchor.set(0.5, 1);
    this.finaleSprite.visible = false;
    this.layer.addChild(this.frogSprite, this.finaleSprite);
    this.segSprites = new Map();
    this.podSprites = new Map();

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.invuln = 0;
    this.fuse = 0;
    this.roundIndex = 0;
    this.chains = [];
    this.pods = [];
    this.podTimer = 0;

    const cx = Math.floor(cols / 2), cy = rows - 3;
    this.frog = { col: cx, row: cy, facing: { dc: 0, dr: -1 } };
    this.frogPix = this.cellPx(cx, cy);

    this.state = 'intro'; this.stateT = 1.1;

    this.drawBackdrop();
    this.hud.setStage('THE NECO FROG', 'Watch the goatee.');
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
    this.startRound(0);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }
  cellPx(col, row) { return { x: this.fieldX + (col + 0.5) * this.cell, y: this.fieldY + (row + 0.5) * this.cell }; }
  inBounds(col, row) { return col >= 0 && col < this.cols && row >= 0 && row < this.rows; }

  // ---- the static parts: the plate (or a drawn fallback) and the field's outline
  drawBackdrop() {
    const t = this.tex.get('cent_bg');
    if (t && t.width > 600) {
      const k = Math.max(W / t.width, H / t.height);
      this.plate.texture = t; this.plate.scale.set(k);
      this.plate.x = (W - t.width * k) / 2; this.plate.y = (H - t.height * k) / 2;
      this.plate.visible = true;
    } else {
      const g = this.bg; g.clear();
      g.rect(0, 0, W, H).fill(0x0a0710);
      for (let i = 0; i < 60; i++) g.circle((i * 53) % W, (i * 97) % H, 1.5 + (i % 3)).fill({ color: 0xc23fe0, alpha: 0.2 + (i % 4) * 0.1 });
    }
    const f = this.field; f.clear();
    f.roundRect(this.fieldX - 8, this.fieldY - 8, this.fieldW + 16, this.fieldH + 16, 14)
      .fill({ color: 0x120a1c, alpha: 0.55 }).stroke({ width: 3, color: 0xc23fe0, alpha: 0.5 });
    for (let c = 1; c < this.cols; c++) f.moveTo(this.fieldX + c * this.cell, this.fieldY).lineTo(this.fieldX + c * this.cell, this.fieldY + this.fieldH).stroke({ width: 1, color: 0xc23fe0, alpha: 0.08 });
    for (let r = 1; r < this.rows; r++) f.moveTo(this.fieldX, this.fieldY + r * this.cell).lineTo(this.fieldX + this.fieldW, this.fieldY + r * this.cell).stroke({ width: 1, color: 0xc23fe0, alpha: 0.08 });
  }

  // ---- a round: two fresh chains, a scattering of pods, the fuse back to zero
  startRound(idx) {
    this.roundIndex = idx;
    this.fuse = 0; this.hud.setFuse(0);
    const len = this.boss.rounds.length[idx];
    const mult = this.boss.rounds.speedMult[idx];
    this.roundMult = mult;
    const startCol = Math.max(2, Math.floor(this.cols * 0.25)), startCol2 = Math.min(this.cols - 3, Math.floor(this.cols * 0.75));
    this.chains = [
      this.makeChain(startCol, 0, 1, len),
      this.makeChain(startCol2, 0, -1, len),
    ];
    this.pods = [];
    for (let i = 0; i < this.boss.minPods + 2; i++) this.spawnPod();
    this.podTimer = this.rng.range(...this.boss.podRespawn);
    this.hud.say(`ROUND ${idx + 1}`, 1400);
  }

  makeChain(col, row, dc, len) {
    return { id: nextChainId++, path: seedPath(col, row, dc, len, this.cols), dc, eaten: 0, moveT: 0.3 };
  }

  chainSpeed(chain) { return speedFor(chain.eaten, this.boss.chainSpeed) * this.roundMult; }

  spawnPod() {
    const occupied = new Set(this.pods.map((p) => `${p.col},${p.row}`));
    for (let tries = 0; tries < 40; tries++) {
      const col = this.rng.int(0, this.cols - 1), row = this.rng.int(0, this.rows - 1);
      const key = `${col},${row}`;
      if (occupied.has(key) || (col === this.frog.col && row === this.frog.row)) continue;
      this.pods.push({ id: nextChainId++, col, row });
      return;
    }
  }

  podAt(col, row) { return this.pods.find((p) => p.col === col && p.row === row) || null; }
  eatPod(pod) { this.pods = this.pods.filter((p) => p !== pod); }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over || this.state === 'finale' || this.state === 'roundwon') return;
    if (i.type === 'hop') { this.moveFrog(i.dir); return; }
    if (i.type === 'punch') { this.bite(); return; }
    this.eat();
  }

  moveFrog(dir) {
    const f = FACE[dir]; if (!f) return;
    this.frog.facing = f;
    const nc = this.frog.col + f.dc, nr = this.frog.row + f.dr;
    if (!this.inBounds(nc, nr)) return;
    this.frog.col = nc; this.frog.row = nr;
    this.audio.hop();
  }

  eat() {
    if (this.over) return;
    const pod = this.podAt(this.frog.col, this.frog.row);
    if (!pod) { this.hud.say('NOTHING TO EAT', 500); this.audio.tongue(); return; }
    this.eatPod(pod);
    this.audio.tongue(); this.audio.eat();
    this.particles.burst(...Object.values(this.cellPx(pod.col, pod.row)), 0xf2c53d, 14);
    this.addScore(this.boss.scoring.pod);
    this.ach?.bump('midairEats');
    this.fuse = Math.min(this.boss.fuseTarget, this.fuse + 1);
    this.hud.setFuse(this.fuse);
    if (this.fuse >= this.boss.fuseTarget) this.superBite();
  }

  bite() {
    if (this.over) return;
    this.biteFlash = BITE_FLASH;
    this.audio.hop();
    const tc = this.frog.col + this.frog.facing.dc, tr = this.frog.row + this.frog.facing.dr;
    for (const chain of this.chains) {
      const idx = chain.path.findIndex((s) => s.col === tc && s.row === tr);
      if (idx === -1) continue;
      this.resolveBite(chain, idx);
      return;
    }
    this.hud.say('NOTHING TO BITE', 500);
  }

  resolveBite(chain, index) {
    const at = chain.path[index];
    this.particles.spark(...Object.values(this.cellPx(at.col, at.row)), 0xffffff, 10);
    this.shake.add(index === 0 ? 8 : 5);
    if (index === 0) {
      this.audio.squash();
      this.particles.burst(...Object.values(this.cellPx(at.col, at.row)), 0xc23fe0, 28);
      this.addScore(this.boss.scoring.headKill);
      this.chains = this.chains.filter((c) => c !== chain);
      this.hud.say('HEAD BITTEN. LINE DEAD.', 1000);
    } else {
      const { front, back } = biteOutcome(chain.path, index);
      chain.path = front;
      this.addScore(this.boss.scoring.bite);
      this.hud.say('BIT IT. IT SPLIT.', 800);
      if (back.length) this.chains.push({ id: nextChainId++, path: back, dc: chain.dc, eaten: chain.eaten, moveT: chain.moveT });
    }
    this.checkRoundClear();
  }

  // Every pod a chain reaches on its own makes it faster; enough of them and it
  // eats one too many and bursts, no biting required.
  chainEats(chain, pod) {
    this.eatPod(pod);
    chain.eaten += 1;
    this.audio.tick();
    this.particles.spark(...Object.values(this.cellPx(pod.col, pod.row)), 0xc23fe0, 8);
    if (willBurst(chain.eaten, this.boss.overloadAt)) {
      const head = chain.path[0];
      this.audio.roar(); this.shake.add(14);
      this.particles.burst(...Object.values(this.cellPx(head.col, head.row)), 0xff4433, 36, 380);
      this.addScore(this.boss.scoring.burst);
      this.hud.say('IT ATE TOO MUCH', 1200);
      this.chains = this.chains.filter((c) => c !== chain);
      this.checkRoundClear();
    }
  }

  superBite() {
    this.fuse = 0; this.hud.setFuse(0);
    this.audio.boom(); this.shake.add(20);
    for (const chain of this.chains) for (const seg of chain.path) this.particles.burst(...Object.values(this.cellPx(seg.col, seg.row)), 0xffffff, 10, 260);
    this.addScore(this.boss.scoring.superBite);
    this.chains = [];
    this.hud.say('SUPER BITE', 1600);
    this.checkRoundClear();
  }

  checkRoundClear() {
    if (this.over || this.chains.length) return;
    if (this.roundIndex + 1 >= this.boss.rounds.length.length) { this.finaleSequence(); return; }
    this.state = 'roundwon'; this.stateT = 1.2;
    this.hud.say(`ROUND CLEARED. ${this.boss.rounds.length.length - this.roundIndex - 1} LEFT.`, 1800);
  }

  finaleSequence() {
    this.over = true;
    this.state = 'finale';
    this.finaleSprite.visible = true;
    this.finaleSprite.texture = this.tex.get('neco_greedy');
    const k = this.tex.scaleFor('neco_greedy') * 2.0;
    this.finaleSprite.scale.set(-k, k);
    this.finaleSprite.x = W / 2; this.finaleSprite.y = this.fieldY + this.fieldH - 20;
    this.audio.warn();
    this.emit('finale', { text: this.boss.finale.card });
    setTimeout(() => {
      this.finaleSprite.texture = this.tex.get('neco_overload');
      this.audio.boom(); this.shake.add(22);
      this.particles.burst(W / 2, this.fieldY + this.fieldH - 140, 0xc23fe0, 60, 460);
    }, 1000);
    setTimeout(() => {
      this.finaleSprite.texture = this.tex.get('neco_dead');
      this.audio.win(); this.ach?.bump('stagesCleared'); this.ach?.bump('necoCleared');
    }, 2200);
    setTimeout(() => this.emit('won', { score: this.score }), 3800);
  }

  takeHit(dmg) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.0;
    this.audio.hit(); this.shake.add(10);
    this.particles.burst(...Object.values(this.frogPix), 0xe23c2f, 18);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish(false);
  }

  finish(won) {
    this.over = true;
    this.audio.lose();
    setTimeout(() => this.emit('lost', { score: this.score }), 1500);
  }

  // ---- the loop -------------------------------------------------------------
  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.biteFlash > 0) this.biteFlash -= dt;

    if (this.state === 'intro') { this.stateT -= dt; if (this.stateT <= 0) this.state = 'idle'; }
    if (this.state === 'roundwon') {
      this.stateT -= dt;
      if (this.stateT <= 0) { this.state = 'idle'; this.startRound(this.roundIndex + 1); }
      this.render(dt); return;
    }

    // pods: keep the minimum topped up
    this.podTimer -= dt;
    if (this.pods.length < this.boss.minPods && this.podTimer <= 0) {
      this.spawnPod();
      this.podTimer = this.rng.range(...this.boss.podRespawn);
    }

    // chains: step, eat, maybe burst -- collected and applied after the walk so
    // splitting or removing one mid-loop cannot skip or double another.
    const bursting = [];
    for (const chain of this.chains) {
      chain.moveT -= dt;
      if (chain.moveT > 0) continue;
      chain.moveT = 1 / this.chainSpeed(chain);
      const head = nextHeadCell({ col: chain.path[0].col, row: chain.path[0].row, dc: chain.dc }, this);
      chain.dc = head.dc;
      chain.path.unshift({ col: head.col, row: head.row });
      chain.path.pop();
      const pod = this.podAt(head.col, head.row);
      if (pod) bursting.push(() => this.chainEats(chain, pod));
    }
    bursting.forEach((fn) => fn());

    // contact: any live segment sharing the frog's cell costs a heart
    for (const chain of this.chains) {
      if (chain.path.some((s) => s.col === this.frog.col && s.row === this.frog.row)) { this.takeHit(1); break; }
    }

    this.render(dt);
  }

  // ---- what to draw -----------------------------------------------------------
  syncSprite(map, key, kind, target, dt) {
    let e = map.get(key);
    let fresh = false;
    if (!e) { e = { sprite: new PIXI.Sprite(), rx: target.x, ry: target.y }; e.sprite.anchor.set(0.5); this.layer.addChild(e.sprite); map.set(key, e); fresh = true; }
    e.sprite.texture = this.tex.get(kind);
    e.sprite.scale.set(this.tex.scaleFor(kind));
    if (fresh) { e.rx = target.x; e.ry = target.y; }
    else { const k = Math.min(1, LERP * dt); e.rx += (target.x - e.rx) * k; e.ry += (target.y - e.ry) * k; }
    e.sprite.x = e.rx; e.sprite.y = e.ry;
    return e.sprite;
  }

  render(dt) {
    // pods
    const podSeen = new Set();
    for (const pod of this.pods) {
      const key = pod.id;
      podSeen.add(key);
      const target = this.cellPx(pod.col, pod.row);
      const sp = this.syncSprite(this.podSprites, key, 'cent_pod', target, dt);
      sp.rotation = Math.sin(this.time * 5 + pod.col) * 0.15;
    }
    for (const [key, e] of this.podSprites) if (!podSeen.has(key)) { e.sprite.destroy(); this.podSprites.delete(key); }

    // chain segments
    const segSeen = new Set();
    for (const chain of this.chains) {
      const oneAway = chain.eaten === this.boss.overloadAt - 1;
      chain.path.forEach((seg, i) => {
        const key = `${chain.id}_${i}`;
        segSeen.add(key);
        const kind = i === 0 ? (oneAway ? 'cent_head_full' : 'cent_head')
          : i === chain.path.length - 1 && chain.path.length > 1 ? 'cent_tail'
          : i % 2 === 0 ? 'cent_body_a' : 'cent_body_b';
        const target = this.cellPx(seg.col, seg.row);
        const sp = this.syncSprite(this.segSprites, key, kind, target, dt);
        sp.rotation = 0;
      });
    }
    for (const [key, e] of this.segSprites) if (!segSeen.has(key)) { e.sprite.destroy(); this.segSprites.delete(key); }

    // the frog
    const target = this.cellPx(this.frog.col, this.frog.row);
    this.frogPix.x += (target.x - this.frogPix.x) * Math.min(1, dt / STEP_TIME);
    this.frogPix.y += (target.y - this.frogPix.y) * Math.min(1, dt / STEP_TIME);
    this.frogSprite.texture = this.tex.get('frog_s3');
    this.frogSprite.scale.set(this.tex.scaleFor('frog_s3') * 1.15);
    this.frogSprite.x = this.frogPix.x; this.frogSprite.y = this.frogPix.y;
    this.frogSprite.visible = this.state !== 'finale';
    this.frogSprite.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.4 : 1) : 1;
    this.frogSprite.rotation = this.frog.facing.dc ? (this.frog.facing.dc > 0 ? Math.PI / 2 : -Math.PI / 2) : (this.frog.facing.dr > 0 ? Math.PI : 0);

    const g = this.fx; g.clear();
    if (this.biteFlash > 0) {
      const tc = this.frog.col + this.frog.facing.dc, tr = this.frog.row + this.frog.facing.dr;
      if (this.inBounds(tc, tr)) {
        const p = this.cellPx(tc, tr);
        g.circle(p.x, p.y, this.cell * 0.45).stroke({ width: 4, color: 0xffffff, alpha: this.biteFlash / BITE_FLASH * 0.8 });
      }
    }
    for (let i = 0; i < this.boss.rounds.length.length; i++)
      g.circle(W / 2 - 30 + i * 30, 26, 8).fill({ color: i < this.roundIndex + (this.chains.length === 0 && !this.over ? 1 : 0) ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = this.baseX + s.x; this.world.y = this.baseY + s.y;
  }

  frogState() { return { sizeClass: 6, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
