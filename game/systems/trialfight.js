// Boss three: THE NARRATOR. Not a duel, not a climb — the only enemy is content.
// Statements fall through one of three wide lanes; some are true, some are not,
// and there is no telegraph for which. Eat a lie with the tongue before it lands
// and it counts. Stand clear of a truth and let it land untouched and it counts.
// Get either one backwards and it costs a heart. No sprite stands in for the
// Narrator — it never had a body, it only ever had a mouth, so where a boss
// portrait would sit there is a rectangle of pure static instead.
import { Shake } from '../core/grid.js';
import { Particles } from './particles.js';
import { NARRATOR } from '../config/bosses.js';
import { WORLD_STATEMENTS, GAME_STATEMENTS, buildYouStatements } from '../config/narrator-statements.js';
import { makeRng } from '../core/rng.js';

const COLS = 13, ROWS = 15, CELL = 64;
const W = COLS * CELL, H = ROWS * CELL;
const ZONES = 3;
const ZONE_W = Math.floor(W / ZONES) - 28;
const ZONE_X = Array.from({ length: ZONES }, (_, i) => (i + 0.5) * (W / ZONES));
const CATCH_ROW = 11;                 // where an uneaten tile is judged
const SPAWN_ROW = 1.4;
const REACH_ROWS = 1.35;              // how close to CATCH_ROW the tongue can reach
const GLITCH_MS = 520;                // how long a mutated tile stays corrupted
const SWAP_WARN = 0.45;
const SWAP_DURATION = 2.6;

export class TrialFight {
  constructor({ app, textures, audio, hud, overlays, telem, frogState, score = 0, ach = null }) {
    this.app = app; this.tex = textures; this.audio = audio; this.hud = hud;
    this.overlays = overlays; this.telem = telem;
    this.boss = NARRATOR; this.ach = ach;
    this.rng = makeRng();
    this.shake = new Shake(Math.random);
    this.score = score;
    this.listeners = {};
    this.time = 0; this.over = false;
    this.frozen = false;               // true while the fake-win card is up

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    this.bg = new PIXI.Graphics();
    this.staticBox = new PIXI.Graphics();   // the Narrator's "portrait": pure noise
    this.tileLayer = new PIXI.Container();
    this.charLayer = new PIXI.Container();
    this.world.addChild(this.bg, this.staticBox, this.tileLayer, this.charLayer);
    this.particles = new Particles(this.world);
    this.fx = new PIXI.Graphics();
    this.world.addChild(this.fx);

    this.frogSprite = new PIXI.Sprite(this.tex.get('climbfrog_hold'));
    this.frogSprite.anchor.set(0.5, 1);
    this.charLayer.addChild(this.frogSprite);

    this.lives = frogState?.lives ?? 5;
    this.hearts = this.boss.hearts;
    this.zone = 1;
    this.x = ZONE_X[1];
    this.tongueT = 0; this.invuln = 0;

    // A stats snapshot the content bank draws from, frozen at fight start so
    // the numbers it quotes don't drift mid-fight while it accuses you with them.
    const a = this.ach;
    const t = this.telem?.snapshot() || { daysSinceFirstSeen: 0, sessions: 1, totalPlayMinutes: 0 };
    this.stats = {
      ...t,
      deaths: a?.counts.deaths ?? 0, cleanStages: a?.counts.cleanStages ?? 0,
      midairEats: a?.counts.midairEats ?? 0, squashes: a?.counts.squashes ?? 0,
      achCount: a?.count ?? 0, achTotal: a?.total ?? 9,
      best: frogState?.best ?? 0,
    };
    this.mindMinutes = this.stats.totalPlayMinutes;

    this.pool = this.shufflePool();
    this.tile = null;
    this.spawnTimer = 1.0;

    this.phase = 'intro'; this.phaseT = 1.1;
    this.proof = 0; this.proof3 = 0;
    this.swap = null;                 // { warnT, activeT }
    this.swapScheduled = false;

    this.drawBackdrop();
    this.hud.setStage('THE NARRATOR', 'ARROWS pick a lane · SPACE tongue the lies');
    this.hud.setFuse(0);              // unused here; keep the pip row dark
    this.hud.setLives(this.hearts, true);
    this.hud.setScore(this.score);
  }

  on(e, fn) { (this.listeners[e] ||= []).push(fn); return this; }
  emit(e, p) { (this.listeners[e] || []).forEach(f => f(p)); }
  addScore(n) { this.score += n; this.hud.setScore(this.score); }

  shufflePool() {
    const pool = [
      ...WORLD_STATEMENTS.map(s => ({ ...s, cat: 'world' })),
      ...GAME_STATEMENTS.map(s => ({ ...s, cat: 'game' })),
      ...buildYouStatements(this.stats).map(s => ({ ...s, cat: 'you' })),
    ];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = this.rng.int(0, i);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  drawBackdrop() {
    const g = this.bg; g.clear();
    g.rect(0, 0, W, H).fill(0x0a0a0e);
    for (let i = 0; i < ZONES - 1; i++) {
      const x = (i + 1) * (W / ZONES);
      g.rect(x, 0, 2, H).fill({ color: 0x2a2a34, alpha: 0.6 });
    }
    g.rect(0, CATCH_ROW * CELL, W, 4).fill({ color: 0x3a3a46, alpha: 0.7 });
  }

  // ---- input --------------------------------------------------------------
  intent(i) {
    if (this.over || this.frozen) return;
    const swapped = !!(this.swap && this.swap.activeT > 0);
    if (i.type === 'hop') {
      const dir = i.dir === 'left' ? -1 : i.dir === 'right' ? 1 : 0;
      if (!dir) return;
      if (swapped) { this.tongue(); return; }
      this.zone = Math.max(0, Math.min(ZONES - 1, this.zone + dir));
      this.audio.hop();
      return;
    }
    if (swapped) { this.zone = Math.min(ZONES - 1, this.zone + 1); this.audio.hop(); return; }
    this.tongue();
  }

  tongue() {
    if (this.over || this.frozen) return;
    this.tongueT = 0.24;
    this.audio.tongue();
    const t = this.tile;
    if (!t || t.zone !== this.zone || Math.abs(t.row - CATCH_ROW) > REACH_ROWS) {
      this.hud.say('NOTHING THERE TO CATCH', 600);
      return;
    }
    this.resolve(t, true);
  }

  // consumed = true if the tongue reached it; false if it fell to the catch
  // row on its own and is being judged by whether the frog was standing there.
  resolve(tile, consumed) {
    tile.alive = false;
    const correct = consumed ? tile.isLie : !tile.isLie;
    const cx = ZONE_X[tile.zone], cy = CATCH_ROW * CELL;
    if (correct) {
      this.audio.eat();
      this.particles.spark(cx, cy, tile.isLie ? 0xf08a24 : 0x7fc7e8, 14);
      this.addScore(120);
      if (tile.special === 'contradiction') { this.finish(true); return; }
      if (this.phase === 'phase3') this.proof3 += 1; else this.proof += 1;
    } else {
      this.audio.hit();
      this.particles.burst(cx, cy, 0xe23c2f, 18);
      this.shake.add(9);
      this.hud.say(tile.isLie ? 'THAT ONE WAS FALSE' : 'THAT ONE WAS TRUE', 1200);
      this.takeHit();
      // Missing the contradiction is not a dead end: it costs a heart and one
      // more correct judgment earns it another shot, rather than leaving the
      // fight with nothing left to spawn.
      if (tile.special === 'contradiction' && !this.over) {
        this.contradictionSpawned = false;
        this.proof3 = Math.max(0, this.proof3 - 1);
      }
    }
    this.destroyTile();
    if (this.over) return;
    if (this.phase === 'phase1' && this.proof >= this.boss.proofToWin) this.triggerFakeEnding();
    else if (this.phase === 'phase3' && !this.contradictionSpawned && this.proof3 >= this.boss.proofPhase3) this.spawnContradiction();
    else if (this.phase === 'phase3' && !this.contradictionSpawned && !this.tile) this.spawnTimer = this.rng.range(0.7, 1.2);
  }

  takeHit() {
    if (this.invuln > 0) return;
    this.hearts -= 1;
    this.invuln = 1.0;
    this.hud.setLives(Math.max(0, this.hearts), true);
    if (this.hearts <= 0) this.finish(false);
  }

  finish(won) {
    this.over = true;
    if (won) { this.audio.win(); this.ach?.bump('stagesCleared'); }
    else this.audio.lose();
    setTimeout(() => this.emit(won ? 'won' : 'lost', { score: this.score }), 1600);
  }

  // ---- the trick screen -----------------------------------------------------
  triggerFakeEnding() {
    this.frozen = true;
    this.hud.show(false);
    this.overlays.fakeWin(this.boss.fakeEnding, this.score, () => this.collapseFakeEnding());
  }

  collapseFakeEnding() {
    this.overlays.hide();
    this.hud.show(true);
    this.frozen = false;
    this.phase = 'phase3'; this.phaseT = 0.8;
    this.hud.say("YOU ALREADY KNEW THAT WASN'T REAL", 2600);
    this.audio.roar();
    this.swapScheduled = false;
    this.spawnTimer = 1.2;
  }

  spawnContradiction() {
    this.contradictionSpawned = true;
    // Always a demonstrably different number from what beat two actually said,
    // even at very low real playtime, where a naive discount can round back to
    // the same value it started from.
    const diff = Math.max(3, Math.round(this.mindMinutes * 0.4));
    let shown = this.mindMinutes - diff;
    if (shown < 0 || shown === this.mindMinutes) shown = this.mindMinutes + diff;
    this.destroyTile();
    this.tile = this.makeTileSprite({
      text: `You have spent ${shown} minute${shown === 1 ? '' : 's'} of your life on a cartoon frog.`,
      isLie: true, cat: 'contradiction', special: 'contradiction',
    }, this.rng.int(0, ZONES - 1));
    this.spawnTimer = Infinity;
  }

  // ---- spawning -------------------------------------------------------------
  nextStatement() {
    if (!this.pool.length) this.pool = this.shufflePool();
    return this.pool.shift();
  }

  makeTileSprite(data, zone) {
    const wrap = new PIXI.Container();
    const bg = new PIXI.Graphics();
    const style = { fontFamily: 'Barlow, system-ui, sans-serif', fontSize: 16, fill: 0xffffff,
      wordWrap: true, wordWrapWidth: ZONE_W - 24, align: 'center', lineHeight: 20 };
    const label = new PIXI.Text({ text: data.text, style });
    label.anchor.set(0.5);
    wrap.addChild(bg, label);
    this.tileLayer.addChild(wrap);
    const tile = {
      ...data, zone, row: SPAWN_ROW, alive: true, wrap, bg, label,
      speed: this.phase === 'phase3' ? 5.0 : 3.0,
      mutateAt: this.rng.range(0.4, 0.7), mutated: false, mutateT: 0,
      original: data.text,
    };
    this.redrawTile(tile);
    return tile;
  }

  redrawTile(tile) {
    const b = tile.bg; b.clear();
    const h = tile.label.height + 16;
    b.roundRect(-ZONE_W / 2, -h / 2, ZONE_W, h, 10).fill({ color: 0x121017, alpha: 0.92 });
    b.roundRect(-ZONE_W / 2, -h / 2, ZONE_W, h, 10).stroke({ width: 2, color: 0x3a3a46, alpha: 0.8 });
  }

  destroyTile() {
    if (this.tile) { this.tile.wrap.destroy({ children: true }); this.tile = null; }
  }

  update(dt) {
    if (this.over || this.frozen) { this.render(dt); return; }
    this.time += dt;
    if (this.tongueT > 0) this.tongueT -= dt;
    if (this.invuln > 0) this.invuln -= dt;
    this.phaseT -= dt;

    if (this.phase === 'intro' && this.phaseT <= 0) this.phase = 'phase1';

    // schedule one control-swap glitch partway through phase three
    if (this.phase === 'phase3' && !this.swapScheduled && !this.contradictionSpawned) {
      this.swapScheduled = true;
      this.swapAt = this.time + this.rng.range(3, 5.5);
    }
    if (this.swapScheduled && !this.swap && this.time >= this.swapAt) {
      this.swap = { warnT: SWAP_WARN, activeT: 0 };
      this.hud.setStage('THE NARRATOR', 'S̸P̸A̸C̸E̸ ̸ ̸↚↛');
    }
    if (this.swap) {
      if (this.swap.warnT > 0) {
        this.swap.warnT -= dt;
        if (this.swap.warnT <= 0) {
          this.swap.activeT = SWAP_DURATION;
          this.audio.warn();
          this.hud.say('THE CONTROLS ARE LYING NOW', 1400);
        }
      } else if (this.swap.activeT > 0) {
        this.swap.activeT -= dt;
        if (this.swap.activeT <= 0) {
          this.swap = null;
          this.hud.setStage('THE NARRATOR', 'ARROWS pick a lane · SPACE tongue the lies');
        }
      }
    }

    if (this.phase !== 'intro' && !this.contradictionSpawned) {
      this.spawnTimer -= dt;
      if (!this.tile && this.spawnTimer <= 0) {
        const data = this.nextStatement();
        this.tile = this.makeTileSprite(data, this.rng.int(0, ZONES - 1));
      }
    }

    if (this.tile) {
      const tile = this.tile;
      tile.row += tile.speed * dt;
      tile.mutateT += dt;
      if (!tile.mutated && tile.mutateT >= tile.mutateAt * (CATCH_ROW - SPAWN_ROW) / tile.speed && tile.special !== 'contradiction') {
        tile.mutated = true;
        tile.label.text = '// SIGNAL LOST //';
        this.redrawTile(tile);
        setTimeout(() => {
          if (tile.alive) { tile.label.text = tile.original; this.redrawTile(tile); }
        }, GLITCH_MS);
      }
      if (tile.row >= CATCH_ROW) {
        const touched = tile.zone === this.zone;
        this.resolve(tile, touched);
        if (!this.tile && !this.contradictionSpawned) this.spawnTimer = this.rng.range(0.7, 1.2);
      }
    }

    this.render(dt);
  }

  render(dt) {
    // the Narrator's "portrait": a box of TV static, redrawn as coarse noise
    const s = this.staticBox; s.clear();
    const boxW = 180, boxH = 90, bx = W / 2 - boxW / 2, by = 14;
    s.roundRect(bx, by, boxW, boxH, 6).fill(0x050506);
    for (let i = 0; i < 90; i++) {
      const x = bx + this.rng() * boxW, y = by + this.rng() * boxH;
      const v = this.rng() > 0.5 ? 0xdadada : 0x3a3a3a;
      s.rect(x, y, 3, 3).fill({ color: v, alpha: 0.5 + this.rng() * 0.4 });
    }
    s.roundRect(bx, by, boxW, boxH, 6).stroke({ width: 2, color: 0x2a2a34 });

    if (this.tile) {
      const t = this.tile;
      t.wrap.x = ZONE_X[t.zone];
      t.wrap.y = t.row * CELL;
      t.wrap.alpha = t.special === 'contradiction' ? 1 : 0.96;
    }

    const fs = this.frogSprite;
    fs.texture = this.tex.get('climbfrog_hold');
    fs.scale.set(this.tex.scaleFor('climbfrog_hold') * 1.05);
    this.x += (ZONE_X[this.zone] - this.x) * Math.min(1, dt / 0.14);
    fs.x = this.x; fs.y = (CATCH_ROW + 1.6) * CELL;
    fs.alpha = this.invuln > 0 ? (Math.sin(this.time * 30) > 0 ? 0.45 : 1) : 1;

    const g = this.fx; g.clear();
    // the two proof meters, whichever is current
    const target = this.phase === 'phase3' ? this.boss.proofPhase3 : this.boss.proofToWin;
    const have = this.phase === 'phase3' ? this.proof3 : this.proof;
    const segW = Math.min(22, (W * 0.5) / target);
    const startX = W / 2 - (segW * target) / 2;
    for (let i = 0; i < target; i++) {
      g.roundRect(startX + i * segW, H - 22, segW - 3, 8, 2)
        .fill({ color: i < have ? 0xaab42a : 0x2a2a30, alpha: 0.95 });
    }
    if (this.contradictionSpawned && !this.over) {
      g.rect(0, 0, W, H).fill({ color: 0xaab42a, alpha: 0.04 + 0.03 * Math.sin(this.time * 6) });
    }

    this.particles.update(dt);
    const sh = this.shake.update(dt);
    this.world.x = sh.x; this.world.y = sh.y;
  }

  frogState() { return { sizeClass: 7, lives: this.lives, hearts: 3 }; }
  destroy() { this.destroyTile(); this.world.destroy({ children: true }); }
}
