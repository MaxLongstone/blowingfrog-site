// Boss two: a vertical climb. You hop between platforms on the face of a tower
// that is falling apart, while he drops things down it. He never speaks. The
// announcer fills the silence by guessing what is in the box.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { LANDLORD } from '../config/bosses.js';
import { FUSE_TARGET } from '../config/stages.js';
import { makeRng } from '../core/rng.js';

const COLS = 13, ROWS = 15, CELL = 64;
const W = COLS * CELL, H = ROWS * CELL;
const GROUND = ROWS - 1;          // row 14, always solid
const LEDGE = 0;                  // row 0, where he sits
const HOP_TIME = 0.13;
const TONGUE_TIME = 0.28;
const PUNCH_TIME = 0.24;
const CATCH_RANGE = 1.3;          // cells
const GUESS_EVERY = 5.5;

const key = (c, r) => `${c},${r}`;

export class ClimbFight {
  constructor({ app, textures, audio, hud, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.boss = LANDLORD; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.plat = new PIXI.Graphics();
    this.layer = new PIXI.Container();
    this.world.addChild(this.bg, this.plat, this.layer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.landlordSprite = new PIXI.Sprite(this.tex.get('landlord_idle'));
    this.landlordSprite.anchor.set(0.5, 1);
    this.boxSprite = new PIXI.Sprite(this.tex.get('boss_box'));
    this.boxSprite.anchor.set(0.5, 1);
    this.frogSprite = new PIXI.Sprite(this.tex.get('climbfrog_hold'));
    this.frogSprite.anchor.set(0.5, 1);
    this.layer.addChild(this.boxSprite, this.landlordSprite, this.frogSprite);

    this.lives = frogState?.lives ?? 5;
    this.hearts = 3;
    this.fuse = 0;
    this.col = 6; this.row = GROUND;
    this.hopAnim = null;
    this.tongueT = 0; this.punchT = 0;
    this.invuln = 0;

    this.ascent = 0;
    this.state = 'intro'; this.stateT = 1.2;
    this.attack = null;
    this.blind = 0;
    this.collapse = null;
    this.hazards = [];
    this.pending = [];          // telegraphed drops waiting to fall
    this.throwT = 0;            // how far he leans into frame
    this.throwKind = null;
    this.plankPool = [];
    this.hazPool = [];
    this.attackTimers = {};
    for (const [k, a] of Object.entries(this.boss.attacks)) this.attackTimers[k] = a.every * this.rng.range(0.5, 1.1);
    this.guessIndex = 0;
    this.guessTimer = 2.0;

    this.buildTower();
    this.drawBackdrop();
    this.hud.setStage('THE LANDLORD', 'ARROWS climb · SPACE tongue · SHIFT glove');
    this.hud.say('NOTHING YOU STAND ON WILL HOLD', 3400);
    this.hud.setFuse(0);
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  // Each ascent thins the tower and shortens how long anything holds. A wandering
  // spine is laid first so there is always a route up: hops are four-way and only
  // reach the next cell, so a purely random scatter is frequently unclimbable.
  buildTower() {
    this.platforms = new Map();
    const add = (c, r) => { if (r >= 1 && r <= ROWS - 2 && c >= 0 && c < COLS) this.platforms.set(key(c, r), { life: 0, resp: 0 }); };

    let c = this.rng.int(3, COLS - 4);
    for (let r = ROWS - 2; r >= 1; r--) {
      add(c, r);
      // step sideways sometimes, and lay the connecting cell so the walk exists
      const move = this.rng.int(-1, 1);
      if (move !== 0) { const nc = Math.max(0, Math.min(COLS - 1, c + move)); add(nc, r); c = nc; }
    }

    const extra = [4, 3, 3][Math.min(2, this.ascent)];
    for (let r = 1; r <= ROWS - 2; r++) {
      let guard = 0, placed = 0;
      while (placed < extra && guard++ < 40) {
        const rc = this.rng.int(0, COLS - 1);
        if (this.platforms.has(key(rc, r))) continue;
        add(rc, r); placed += 1;
      }
    }
  }

  solid(c, r) {
    if (r === GROUND || r === LEDGE) return true;
    const p = this.platforms.get(key(c, r));
    return !!p && p.resp <= 0;
  }

  drawBackdrop() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x121017);
    for (let i = 0; i < 60; i++) {                       // lit windows in the haze
      const x = (i * 97) % W, y = (i * 151) % (H - 120);
      g.roundRect(x, y, 22, 30, 3).fill({ color: 0x2a2536, alpha: 0.55 });
      if (i % 4 === 0) g.roundRect(x + 3, y + 4, 16, 22, 2).fill({ color: 0xffd98a, alpha: 0.10 });
    }
    for (let i = 0; i < 9; i++) {                        // tarpaulin and scaffolding
      g.rect((i * 131) % W, 0, 6, H).fill({ color: 0x3a3448, alpha: 0.35 });
    }
    g.rect(0, GROUND * CELL, W, CELL * 2).fill(0x241f2c);
    g.rect(0, GROUND * CELL, W, 5).fill(0x4a4258);
    g.rect(0, 0, W, CELL).fill(0x1a1622);
    g.rect(0, CELL - 5, W, 5).fill(0x4a4258);
  }

  // ---- input ------------------------------------------------------------
  intent(i) {
    if (this.over) return;
    if (i.type === 'hop') { this.hop(i.dir); return; }
    if (i.type === 'punch') {
      if (i.auto && this.boilerInReach()) this.tongue();
      else this.punch();
      return;
    }
    this.tongue();
  }

  hop(dir) {
    if (this.hopAnim || this.over) return;
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    if (!d) return;
    const nc = this.col + d[0], nr = this.row + d[1];
    if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return;
    if (!this.solid(nc, nr)) { this.hud.say('NOTHING THERE', 500); return; }
    this.hopAnim = { fromC: this.col, fromR: this.row, t: 0 };
    this.col = nc; this.row = nr;
    this.audio.hop();
    const p = this.platforms.get(key(nc, nr));
    if (p && p.life <= 0) p.life = this.boss.platformLife * [1, 0.85, 0.7][Math.min(2, this.ascent)];
    if (nr === LEDGE) this.reachedHim();
  }

  boilerInReach() {
    return this.hazards.some(h => h.explosive && Math.abs(h.col - this.col) <= CATCH_RANGE && Math.abs(h.row - this.row) <= CATCH_RANGE);
  }

  tongue() {
    if (this.over) return;
    this.tongueT = TONGUE_TIME;
    this.audio.tongue();
    const h = this.hazards.find(x => x.explosive && Math.abs(x.col - this.col) <= CATCH_RANGE && Math.abs(x.row - this.row) <= CATCH_RANGE);
    if (!h) { this.hud.say('NOTHING TO CATCH', 600); return; }
    h.alive = false;
    this.fuse = Math.min(FUSE_TARGET, this.fuse + 1);
    this.hud.setFuse(this.fuse);
    this.audio.eat(); this.addScore(150);
    this.ach?.bump('midairEats');
    this.particles.burst((this.col + 0.5) * CELL, (this.row + 0.5) * CELL, 0xf08a24, 16);
    if (this.fuse >= FUSE_TARGET) this.detonate();
  }

  punch() {
    if (this.over) return;
    this.punchT = PUNCH_TIME;
    this.audio.hop();
    // Shore up the platform you are stood on, once, by hitting it back together.
    const p = this.platforms.get(key(this.col, this.row));
    if (p && p.life > 0 && !p.shored) {
      p.shored = true;
      p.life += this.boss.platformLife * 0.9;
      this.audio.squash();
      this.particles.spark((this.col + 0.5) * CELL, (this.row + 0.9) * CELL, 0xc0c4cc, 8);
      this.hud.say('HELD IT TOGETHER. ONCE.', 900);
    } else this.hud.say('NOTHING TO HIT', 600);
  }

  detonate() {
    this.hud.say('YOU WENT OFF IN HIS STAIRWELL', 2000);
    this.audio.boom(); this.shake.add(20);
    this.particles.burst((this.col + 0.5) * CELL, (this.row + 0.5) * CELL, 0xf08a24, 55, 420);
    this.fuse = 0; this.hud.setFuse(0);
    this.addScore(900);
    // Clears everything falling and rebuilds the floor you are on.
    this.hazards.forEach(h => { h.alive = false; });
    for (let c = 0; c < COLS; c++) if (this.platforms.has(key(c, this.row))) this.platforms.get(key(c, this.row)).resp = 0;
    this.reachedHim();
  }

  nextGuess() {
    const g = this.boss.boxGuesses[this.guessIndex % this.boss.boxGuesses.length];
    this.guessIndex += 1;
    this.guessTimer = GUESS_EVERY;
    this.hud.say(`IN THE BOX: ${g.toUpperCase()}`, 4200);
  }

  reachedHim() {
    this.ascent += 1;
    this.addScore(1200);
    this.audio.win();
    this.particles.debris(W / 2, CELL, 26);
    if (this.ascent >= this.boss.ascentsToWin) { this.finish(true); return; }
    this.hud.say(`HE MOVED UP. ${this.boss.ascentsToWin - this.ascent} TO GO.`, 2200);
    setTimeout(() => { if (!this.over) this.nextGuess(); }, 2400);
    this.col = 6; this.row = GROUND; this.hopAnim = null;
    this.hazards = [];
    this.buildTower();
    if (this.ascent === this.boss.ascentsToWin - 1) {
      this.collapse = { row: ROWS + 1, t: 0 };
      this.hud.say('THE BUILDING IS GOING. CLIMB.', 3000);
      this.audio.roar();
    }
  }

  takeHit(dmg) {
    if (this.invuln > 0 || this.over) return;
    this.hearts -= dmg;
    this.invuln = 1.1;
    this.audio.hit(); this.shake.add(12);
    this.particles.burst((this.col + 0.5) * CELL, (this.row + 0.5) * CELL, 0xe23c2f, 20);
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish(false);
  }

  fall() {
    let r = this.row + 1;
    while (r < GROUND && !this.solid(this.col, r)) r += 1;
    this.row = r; this.hopAnim = null;
    this.particles.smoke((this.col + 0.5) * CELL, (r + 0.5) * CELL, 6);
    if (r === GROUND) { this.audio.hit(); this.hud.say('ALL THE WAY DOWN', 1100); this.takeHit(1); }
    else this.audio.hop();
  }

  finish(won) {
    this.over = true;
    if (won) { this.audio.win(); this.ach?.bump('stagesCleared'); }
    else this.audio.lose();
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), 1700);
  }

  spawnHazard(kind, col) {
    const a = this.boss.attacks[kind];
    const n = a.spread || 1;
    for (let i = 0; i < n; i++) {
      const c = Math.max(0, Math.min(COLS - 1, col + (i - (n - 1) / 2) * 2));
      this.hazards.push({
        kind, col: c, row: 0.6, alive: true,
        speed: kind === 'radiator' ? 5.4 : kind === 'notice' ? 1.9 : 3.1,
        drift: kind === 'notice' ? this.rng.range(-0.7, 0.7) : 0,
        explosive: !!a.explosive, damage: a.damage, t: 0,
      });
    }
  }

  update(dt) {
    if (this.over) { this.render(dt); return; }
    this.time += dt;
    if (this.tongueT > 0) this.tongueT -= dt;
    if (this.punchT > 0) this.punchT -= dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.blind > 0) this.blind -= dt;
    if (this.hopAnim) { this.hopAnim.t += dt; if (this.hopAnim.t >= HOP_TIME) this.hopAnim = null; }

    // the announcer keeps guessing
    this.guessTimer -= dt;
    if (this.guessTimer <= 0) this.nextGuess();

    // platforms rot under you
    for (const [k, p] of this.platforms) {
      if (p.resp > 0) { p.resp -= dt; continue; }
      if (p.life > 0) {
        p.life -= dt;
        if (p.life <= 0) {
          p.resp = this.boss.platformRespawn;
          p.shored = false;
          const [c, r] = k.split(',').map(Number);
          this.particles.debris((c + 0.5) * CELL, (r + 0.9) * CELL, 8, 0x6b6070);
          if (c === this.col && r === this.row) this.fall();
        }
      }
    }

    // he drops things
    if (this.state !== 'intro') {
      for (const [k, a] of Object.entries(this.boss.attacks)) {
        this.attackTimers[k] -= dt;
        if (this.attackTimers[k] <= 0) {
          this.attackTimers[k] = a.every * this.rng.range(0.75, 1.3);
          if (k === 'corte') { this.blind = a.blindFor; this.hud.say('HE CUT THE POWER', 1600); this.audio.warn(); this.throwT = 0.55; this.throwKind = 'corte'; }
          else {
            // Warn first. A column lights up, then the thing comes down it.
            const col = a.aimed ? this.col : this.rng.int(0, COLS - 1);
            this.pending.push({ kind: k, col, t: a.tell });
            this.throwT = 0.55; this.throwKind = k;
            this.audio.warn();
          }
        }
      }
    } else if ((this.stateT -= dt) <= 0) this.state = 'climb';

    if (this.throwT > 0) this.throwT -= dt;
    for (const q of this.pending) {
      q.t -= dt;
      if (q.t <= 0) { this.spawnHazard(q.kind, q.col); q.done = true; }
    }
    this.pending = this.pending.filter(q => !q.done);

    for (const h of this.hazards) {
      h.t += dt;
      h.row += h.speed * dt;
      h.col += h.drift * dt;
      if (h.row > ROWS) h.alive = false;
      if (h.alive && this.invuln <= 0 &&
          Math.abs(h.col - this.col) < 0.7 && Math.abs(h.row - this.row) < 0.7) {
        h.alive = false;
        this.takeHit(h.damage);
      }
      // a boiler smashes whatever it lands on
      if (h.alive && h.explosive) {
        const r = Math.round(h.row), c = Math.round(h.col);
        const p = this.platforms.get(key(c, r));
        if (p && p.resp <= 0 && p.life <= 0) { p.life = 0.01; }
      }
    }
    this.hazards = this.hazards.filter(h => h.alive);

    if (this.collapse) {
      this.collapse.t += dt;
      this.collapse.row -= this.boss.collapse.riseSpeed * dt;
      if (this.row >= this.collapse.row) { this.hud.say('IT TOOK YOU', 1400); this.takeHit(3); }
    }

    this.render(dt);
  }

  frogTexture() {
    if (this.over) return this.hearts <= 0 ? 'climbfrog_fall' : 'climbfrog_top';
    if (this.punchT > 0) return 'climbfrog_punch';
    if (this.tongueT > 0) return 'climbfrog_catch';
    if (this.hopAnim) {
      const dc = this.col - this.hopAnim.fromC;
      if (dc < 0) return 'climbfrog_left';
      if (dc > 0) return 'climbfrog_right';
      return this.row < this.hopAnim.fromR ? 'climbfrog_up' : 'climbfrog_fall';
    }
    return 'climbfrog_hold';
  }

  render(dt) {
    // platforms
    const g = this.plat; g.clear();
    let pi = 0;
    for (const [k, p] of this.platforms) {
      if (p.resp > 0) continue;
      const [c, r] = k.split(',').map(Number);
      const rotting = p.life > 0;
      const kind = rotting ? 'climb_plank_rot' : 'climb_plank';
      const sp = this.poolSprite(this.plankPool, pi++, kind, this.plat.parent === this.world ? this.layer : this.layer);
      sp.scale.set(this.tex.scaleFor(kind) * 1.0);
      sp.x = (c + 0.5) * CELL;
      sp.y = r * CELL + CELL * 0.79;
      sp.alpha = rotting ? 0.6 + (p.life / this.boss.platformLife) * 0.4 : 1;
      if (p.shored) g.roundRect(c * CELL + 3, r * CELL + CELL * 0.69, CELL - 6, 3, 2).fill({ color: 0xc0c4cc, alpha: 0.9 });
    }
    this.hidePool(this.plankPool, pi);
    // ground and ledge
    g.roundRect(0, GROUND * CELL + CELL * 0.72, W, 15, 4).fill(0x5a5168);
    g.roundRect(0, LEDGE * CELL + CELL * 0.72, W, 15, 4).fill(0x5a5168);

    // him, and the box he will not let go of
    const ls = this.landlordSprite;
    ls.texture = this.tex.get(this.attackTexture());
    const lk = this.tex.scaleFor(this.attackTexture()) * 2.7;
    const lean = this.throwT > 0 ? Math.sin((1 - this.throwT / 0.55) * Math.PI) * 150 : 0;
    ls.scale.set(lk); ls.x = W * 0.62; ls.y = CELL * 0.80 + lean;
    const bs = this.boxSprite;
    bs.scale.set(this.tex.scaleFor('boss_box') * 1.3);
    bs.x = W * 0.26; bs.y = CELL * 0.80;

    // the frog
    const fs = this.frogSprite;
    const ft = this.frogTexture();
    fs.texture = this.tex.get(ft);
    fs.scale.set(this.tex.scaleFor(ft) * 1.25);
    let fc = this.col, fr = this.row, arc = 0;
    if (this.hopAnim) {
      const t = Math.min(1, this.hopAnim.t / HOP_TIME), e = 1 - Math.pow(1 - t, 3);
      fc = this.hopAnim.fromC + (this.col - this.hopAnim.fromC) * e;
      fr = this.hopAnim.fromR + (this.row - this.hopAnim.fromR) * e;
      arc = Math.sin(t * Math.PI);
    }
    fs.x = (fc + 0.5) * CELL;
    fs.y = (fr + 0.9) * CELL - arc * 14;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.45 : 1) : 1;

    const f = this.fx; f.clear();
    // telegraphs: the column he is about to use lights up
    for (const q of this.pending) {
      const beat = 0.5 + 0.5 * Math.sin(this.time * 22);
      const x = (q.col + 0.5) * CELL;
      f.rect(x - CELL * 0.42, CELL, CELL * 0.84, H - CELL)
        .fill({ color: 0xff5533, alpha: 0.06 + beat * 0.10 });
      f.poly([x - 16, CELL + 6, x + 16, CELL + 6, x, CELL + 34])
        .fill({ color: 0xff5533, alpha: 0.55 + beat * 0.45 });
    }

    // falling things
    let hi = 0;
    for (const h of this.hazards) {
      const kind = { boiler: 'boss_boiler', radiator: 'boss_radiator', notice: 'boss_notice' }[h.kind];
      const sp = this.poolSprite(this.hazPool, hi++, kind, this.layer);
      sp.scale.set(this.tex.scaleFor(kind) * 1.15);
      sp.x = (h.col + 0.5) * CELL;
      sp.y = (h.row + 0.5) * CELL;
      sp.rotation = h.kind === 'notice' ? Math.sin(h.t * 4) * 0.5 : 0;
    }
    this.hidePool(this.hazPool, hi);
    if (this.tongueT > 0) {
      const t = 1 - Math.abs(this.tongueT / TONGUE_TIME - 0.5) * 2;
      f.circle((this.col + 0.5) * CELL, (this.row + 0.2) * CELL - t * 40, 10 * t).fill(0xe86fa7);
    }
    if (this.collapse && this.collapse.row < ROWS + 1) {
      const y = this.collapse.row * CELL;
      f.rect(0, y, W, H - y).fill({ color: 0x2a0f12, alpha: 0.82 });
      f.rect(0, y - 6, W, 10).fill({ color: 0xe23c2f, alpha: 0.9 });
      for (let i = 0; i < 14; i++) f.circle((i * 71) % W, y + 10 + ((i * 37) % 60), 6 + (i % 4) * 3).fill({ color: 0x6b3a1a, alpha: 0.5 });
    }
    if (this.blind > 0) f.rect(0, 0, W, H).fill({ color: 0x000000, alpha: Math.min(0.86, this.blind * 0.34) });
    for (let i = 0; i < this.boss.ascentsToWin; i++)
      f.circle(W / 2 - 34 + i * 34, 26, 10).fill({ color: i < this.ascent ? 0xaab42a : 0x2a2a30, alpha: 0.95 });

    this.particles.update(dt);
    const s = this.shake.update(dt);
    this.world.x = s.x; this.world.y = s.y;
  }

  attackTexture() {
    if (this.over) return this.hearts <= 0 ? 'landlord_sit' : 'landlord_end';
    if (this.collapse) return 'landlord_end';
    if (this.throwT > 0) return {
      boiler: 'landlord_throw', radiator: 'landlord_heft',
      notice: 'landlord_fling', corte: 'landlord_valve',
    }[this.throwKind] || 'landlord_lift';
    return this.pending.length ? 'landlord_lift' : 'landlord_idle';
  }

  // Small sprite pools: reusing sprites keeps the painted art on screen without
  // creating and destroying dozens of objects every frame.
  poolSprite(pool, i, kind, parent) {
    let sp = pool[i];
    if (!sp) { sp = new PIXI.Sprite(); sp.anchor.set(0.5); parent.addChild(sp); pool[i] = sp; }
    sp.texture = this.tex.get(kind);
    sp.visible = true;
    return sp;
  }
  hidePool(pool, from) { for (let i = from; i < pool.length; i++) pool[i].visible = false; }

  frogState() { return { sizeClass: 6, lives: this.lives, hearts: 3 }; }
  destroy() { this.world.destroy({ children: true }); }
}
