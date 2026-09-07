// Boot + state machine: title -> play -> cutscene -> next stage -> ... -> ending
import { loadSprites, countPaintedSprites } from './core/assets.js';
import { Input } from './core/input.js';
import { Audio } from './core/audio.js';
import { Hud } from './ui/hud.js';
import { Overlays } from './ui/overlays.js';
import { preloadFrames, playDetonation, playEnding } from './ui/cutscene.js';
import { Play } from './systems/play.js';
import { STAGES, getStage, nextStage, validateStage } from './config/stages.js';
import { Achievements } from './systems/achievements.js';
import { MODES, readMode, writeMode, usesPaintedArt } from './core/mode.js';
import { buildShareCard, shareCardNatively, downloadCard } from './ui/sharecard.js';
import { BossFight } from './systems/bossfight.js';
import { bossAfter, getBoss, BOSSES } from './config/bosses.js';

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
  constructor(app, textures, mount, overlayRoot, mode = 'atari', artCount = 0) {
    this.app = app; this.tex = textures; this.mount = mount;
    this.mode = mode;
    this.artCount = artCount;
    this.audio = new Audio();
    this.hud = new Hud(overlayRoot);
    this.overlays = new Overlays(overlayRoot);
    this.overlayRoot = overlayRoot;
    this.frames = [];
    this.best = readBest();
    this.ach = new Achievements();
    this.ach.onUnlock((a) => {
      this.hud.say(`ACHIEVEMENT: ${a.title}`, 2600);
      this.audio.win();
    });
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

  clearPlay() { this.play?.destroy(); this.play = null; document.body.classList.remove('playing'); }

  // Swapping mode rebuilds every texture, so it only happens from the title screen.
  async setMode(mode) {
    if (mode === this.mode || !MODES[mode]) return;
    this.mode = mode;
    writeMode(mode);
    this.tex = await loadSprites(this.app, { usePng: usesPaintedArt(mode) });
    this.title();
  }

  title() {
    this.clearPlay();
    this.hud.show(false);
    this.overlays.title({
      onStart: () => { this.audio.unlock(); this.overlays.hide(); this.start(this.startStage || '1'); },
      best: this.best,
      ach: this.ach,
      onAchievements: () => this.showAchievements(() => this.title()),
      mode: this.mode,
      artCount: this.artCount,
      onMode: (m) => this.setMode(m),
    });
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
      ach: this.ach,
      painted: usesPaintedArt(this.mode),
    });
    document.body.classList.add('playing');
    this.play.on('goal', ({ score }) => this.onGoal(stage, score));
    this.play.on('stillHungry', ({ fuse, score }) => this.onStillHungry(stage, fuse, score));
    this.play.on('dead', ({ score }) => this.onDead(stage, score));
  }

  bossIntro(boss, carry, score, index = 0) {
    this.paused = true;
    this.hud.show(false);
    const start = () => { this.overlays.hide(); this.startBoss(boss, carry, score); };
    if (index >= boss.intro.length) { start(); return; }
    this.overlays.bossIntro(boss, index,
      () => (index === boss.intro.length - 1 ? start() : this.bossIntro(boss, carry, score, index + 1)),
      start);
  }

  startBoss(boss, carry, score) {
    this.overlays.hide();
    this.clearPlay();
    this.paused = false;
    this.hud.show(true);
    document.body.classList.add('playing');
    this.play = new BossFight({
      app: this.app, textures: this.tex, audio: this.audio, hud: this.hud,
      frogState: carry, score, ach: this.ach,
    });
    this.play.on('won', ({ score }) => {
      (this.beaten ||= new Set()).add(boss.id);
      this.clearPlay();
      const next = getStage(boss.after) && nextStage(boss.after);
      this.saveBest(score);
      this.hud.show(false);
      if (!next) { this.title(); return; }
      const st = { sizeClass: next.sizeClass, lives: 5, hearts: 3 };
      this.overlays.stageCard(next, next.sizeClass, () => { this.overlays.hide(); this.start(next.id, st, score); });
    });
    this.play.on('lost', ({ score }) => {
      this.saveBest(score);
      this.ach.bump('deaths');
      this.clearPlay();
      this.hud.show(false);
      this.overlays.gameOver(score, this.best, 'CHACO THE NARCO CHUPACABRA',
        () => { this.overlays.hide(); this.startBoss(boss, carry, 0); },
        () => { this.overlays.hide(); this.title(); },
        () => this.showAchievements(() => this.title()), this.ach);
    });
  }

  async onGoal(stage, score) {
    document.body.classList.remove('playing');
    const state = this.play.frogState();
    this.paused = true;
    this.hud.show(false);
    this.ach.bump('detonations');
    await playDetonation({ frames: this.frames, host: this.mount, audio: this.audio });
    this.clearPlay();
    this.paused = false;
    score += 1000;
    this.saveBest(score);

    const boss = bossAfter(stage.id);
    if (boss && !this.beaten?.has(boss.id)) { this.bossIntro(boss, state, score); return; }

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
    document.body.classList.remove('playing');
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
    document.body.classList.remove('playing');
    this.saveBest(score);
    this.ach.bump('deaths');
    this.paused = true;
    this.hud.show(false);
    this.overlays.gameOver(score, this.best, stage.name,
      () => { this.overlays.hide(); this.paused = false; this.start(stage.id, null, 0); },
      () => { this.overlays.hide(); this.paused = false; this.title(); },
      () => this.showAchievements(() => this.onDead(stage, score)), this.ach);
  }

  async finish(score) {
    this.hud.show(false);
    this.ach.bump('finishes');
    await playEnding({ host: this.mount, audio: this.audio });
    this.saveBest(score);
    this.overlays.ending(score, this.best,
      () => this.share(score),
      () => { this.overlays.hide(); this.start('1', null, 0); },
      () => this.showAchievements(() => this.finishCard(score)), this.ach);
  }

  showAchievements(onBack) {
    this.overlays.achievements(this.ach, this.best,
      () => this.shareAchievements(() => this.showAchievements(onBack)),
      () => { this.overlays.hide(); onBack(); });
  }

  async shareAchievements(onBack) {
    const text = this.ach.shareText(this.best);
    const url = location.href.split('?')[0];
    const open = (previewUrl, blob) => this.overlays.shareSheet({
      previewUrl, text, url,
      canNativeShare: typeof navigator.share === 'function',
      onNative: async () => {
        const ok = await shareCardNatively(blob, text, url);
        if (!ok) this.hud.say('SHARING WAS CANCELLED', 1600);
      },
      onSave: () => { downloadCard(blob); this.hud.say('IMAGE SAVED — NOW POST IT', 2200); },
      onCopy: () => navigator.clipboard?.writeText(`${text}\n${url}`)
        .then(() => this.hud.say('COPIED TO CLIPBOARD', 1800)).catch(() => {}),
      onBack,
    });

    open(null, null);                       // show the sheet while the card renders
    let blob = null;
    try { blob = await buildShareCard(this.ach, this.best); } catch (e) { console.warn('[bf] share card failed', e); }
    if (!blob) { this.hud.say('COULD NOT BUILD THE IMAGE — LINKS STILL WORK', 2600); return; }
    if (this._shareUrl) URL.revokeObjectURL(this._shareUrl);
    this._shareUrl = URL.createObjectURL(blob);
    open(this._shareUrl, blob);
  }

  finishCard(score) {
    this.overlays.ending(score, this.best,
      () => this.share(score),
      () => { this.overlays.hide(); this.start('1', null, 0); },
      () => this.showAchievements(() => this.finishCard(score)), this.ach);
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

  const mode = readMode();
  const [textures, artCount] = await Promise.all([
    loadSprites(app, { usePng: usesPaintedArt(mode) }),
    countPaintedSprites(),
  ]);
  const game = new Game(app, textures, mount, overlayRoot, mode, artCount);

  const qs = new URLSearchParams(location.search);
  const jump = qs.get('stage');
  // ?boss=chaco drops straight into a bout. Add &skip=1 to bypass the monologue.
  const bossParam = qs.get('boss');
  const boss = bossParam && (getBoss(bossParam) || (bossParam === '1' ? BOSSES[0] : null));
  loading?.remove();

  if (boss) {
    game.audio.unlock();
    const carry = { sizeClass: 3, lives: 5, hearts: 3 };
    if (qs.get('skip')) game.startBoss(boss, carry, 0);
    else game.bossIntro(boss, carry, 0);
  } else if (jump && getStage(jump)) {
    const st = getStage(jump);
    game.audio.unlock();
    game.start(st.id, { sizeClass: st.sizeClass, lives: st.lives, hearts: st.hearts }, 0);
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
