// Boot + state machine: title -> play -> cutscene -> next stage -> ... -> ending
import { loadSprites } from './core/assets.js';
import { Input } from './core/input.js';
import { Audio } from './core/audio.js';
import { Hud } from './ui/hud.js';
import { Overlays } from './ui/overlays.js';
import { preloadFrames, playDetonation, playEnding } from './ui/cutscene.js';
import { Play } from './systems/play.js';
import { STAGES, getStage, nextStage, validateStage } from './config/stages.js';

const CELL = 64, ROWS = 15;
// A phone screen is far taller than it is wide, so a 13-wide field would leave the
// playfield floating in dead space. Narrow screens get a 9-column field instead.
const pickCols = () => (window.innerWidth < 700 ? 9 : 13);
const COLS = pickCols();
const LOGICAL_W = COLS * CELL, LOGICAL_H = ROWS * CELL;
const BEST_KEY = 'bf-game-best';

const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const writeBest = (n) => { try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* private mode */ } };

class Game {
  constructor(app, textures, mount, overlayRoot) {
    this.app = app; this.tex = textures; this.mount = mount;
    this.audio = new Audio();
    this.hud = new Hud(overlayRoot);
    this.overlays = new Overlays(overlayRoot);
    this.overlayRoot = overlayRoot;
    this.frames = [];
    this.best = readBest();
    this.play = null;
    this.paused = false;

    this.input = new Input(window, app.canvas);
    this.input.onIntent((i) => { this.audio.unlock(); this.play?.intent(i); });

    app.ticker.add((ticker) => {
      const dt = Math.min(0.05, ticker.deltaMS / 1000);
      if (this.play && !this.paused) this.play.update(dt);
    });

    preloadFrames().then(f => { this.frames = f; });
  }

  clearPlay() { this.play?.destroy(); this.play = null; }

  title() {
    this.clearPlay();
    this.hud.show(false);
    this.overlays.title(() => { this.audio.unlock(); this.overlays.hide(); this.start(this.startStage || '1'); }, this.best);
  }

  start(stageId, carry = null, score = 0) {
    this.clearPlay();
    const stage = getStage(stageId) || STAGES[0];
    this.hud.show(true);
    this.play = new Play({
      app: this.app, stage, textures: this.tex, audio: this.audio, hud: this.hud,
      frogState: carry, score,
      density: carry?.density || 1,
      cols: COLS,
    });
    this.play.on('goal', ({ score }) => this.onGoal(stage, score));
    this.play.on('stillHungry', ({ fuse, score }) => this.onStillHungry(stage, fuse, score));
    this.play.on('dead', ({ score }) => this.onDead(stage, score));
  }

  async onGoal(stage, score) {
    const state = this.play.frogState();
    this.paused = true;
    this.hud.show(false);
    await playDetonation({ frames: this.frames, host: this.mount, audio: this.audio });
    this.clearPlay();
    this.paused = false;
    score += 1000;
    this.saveBest(score);

    const next = nextStage(stage.id);
    if (!next) { await this.finish(score); return; }
    state.sizeClass = next.sizeClass;
    state.lives = Math.max(1, state.lives);
    this.overlays.stageCard(next, next.sizeClass, () => {
      this.overlays.hide();
      this.audio.roar();
      this.start(next.id, state, score);
    });
  }

  onStillHungry(stage, fuse, score) {
    const state = this.play.frogState();
    this.paused = true;
    this.hud.show(false);
    this.overlays.stillHungry(fuse, () => {
      this.overlays.hide();
      this.paused = false;
      state.density = 1.15;
      this.start(stage.id, state, score);
    });
  }

  onDead(stage, score) {
    this.saveBest(score);
    this.paused = true;
    this.hud.show(false);
    this.overlays.gameOver(score, this.best, stage.name,
      () => { this.overlays.hide(); this.paused = false; this.start(stage.id, null, 0); },
      () => { this.overlays.hide(); this.paused = false; this.title(); });
  }

  async finish(score) {
    this.hud.show(false);
    await playEnding({ host: this.mount, audio: this.audio });
    this.saveBest(score);
    this.overlays.ending(score, this.best,
      () => this.share(score),
      () => { this.overlays.hide(); this.start('1', null, 0); });
  }

  share(score) {
    const text = `I ate every bomb on Earth and sat on the planet. ${score} points in Frogpocalypse by Blowing Frog.`;
    const url = location.href.split('?')[0];
    if (navigator.share) navigator.share({ title: 'Frogpocalypse', text, url }).catch(() => {});
    else navigator.clipboard?.writeText(`${text} ${url}`).then(() => this.hud.say('COPIED TO CLIPBOARD', 1800)).catch(() => {});
  }

  saveBest(score) { if (score > this.best) { this.best = score; writeBest(score); } }
}

function fit(app, mount) {
  const navH = 76, pad = 24;
  const availW = Math.min(window.innerWidth - pad, 980);
  const availH = window.innerHeight - navH - pad;
  const scale = Math.min(availW / LOGICAL_W, availH / LOGICAL_H);
  const w = Math.round(LOGICAL_W * scale), h = Math.round(LOGICAL_H * scale);
  app.renderer.resize(LOGICAL_W, LOGICAL_H);
  app.canvas.style.width = w + 'px';
  app.canvas.style.height = h + 'px';
  mount.style.width = w + 'px';
  mount.style.height = h + 'px';
}

async function boot() {
  const mount = document.getElementById('game-mount');
  const overlayRoot = document.getElementById('overlay-root');
  const loading = document.getElementById('game-loading');

  for (const s of STAGES) validateStage(s);

  const app = new PIXI.Application();
  await app.init({
    width: LOGICAL_W, height: LOGICAL_H,
    background: 0x0b0b0b, antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: false,
  });
  mount.append(app.canvas);
  fit(app, mount);
  window.addEventListener('resize', () => fit(app, mount), { passive: true });

  const textures = await loadSprites(app);
  const game = new Game(app, textures, mount, overlayRoot);

  const qs = new URLSearchParams(location.search);
  const jump = qs.get('stage');
  loading?.remove();

  if (jump && getStage(jump)) {
    const st = getStage(jump);
    game.audio.unlock();
    game.start(st.id, { sizeClass: st.sizeClass, lives: 3, hearts: 3 }, 0);
  } else {
    game.title();
  }

  window.__BF_GAME = game;
}

boot().catch((err) => {
  console.error('[bf] boot failed', err);
  const l = document.getElementById('game-loading');
  if (l) l.textContent = 'Could not start the game. Check the console.';
});
