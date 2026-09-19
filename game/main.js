// Boot + state machine: title -> play -> cutscene -> next stage -> ... -> ending
import { loadSprites, countPaintedSprites } from './core/assets.js';
import { Input } from './core/input.js';
import { Audio } from './core/audio.js';
import { Hud } from './ui/hud.js';
import { Overlays } from './ui/overlays.js';
import { preloadFrames, playDetonation, playEnding, playBossDefeat, playOpening, prefetchCutscene } from './ui/cutscene.js';
import {
  url, SFX_NAMES, ATARI_USES_REAL_SFX, MUSIC_TITLE, MUSIC_ENDING, CUTSCENE_TITLE,
  voiceStage, voiceBossBeat, voiceBossFinale, voiceAchievement, voiceInfluencer,
  musicForStage, musicForBoss, cutsceneDetonation,
} from './config/media.js';
import { INFLUENCER } from './config/influencer.js';
import { InfluencerSchedule } from './systems/influencer.js';
import { showAd } from './ui/adcard.js';
import { Play } from './systems/play.js';
import { STAGES, getStage, nextStage, validateStage } from './config/stages.js';
import { Achievements } from './systems/achievements.js';
import { MODES, readMode, writeMode, usesPaintedArt } from './core/mode.js';
import { buildShareCard, shareCardNatively, downloadCard } from './ui/sharecard.js';
import { BossFight } from './systems/bossfight.js';
import { ClimbFight } from './systems/climbfight.js';
import { TrialFight } from './systems/trialfight.js';
import { MirrorFight } from './systems/mirrorfight.js';
import { DarkFight } from './systems/darkfight.js';
import { UmmaFight } from './systems/ummafight.js';
import { InvaderFight } from './systems/invaderfight.js';
import { Telemetry } from './systems/telemetry.js';
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
    this.audio.useRealSfx(usesPaintedArt(mode) || ATARI_USES_REAL_SFX);
    this.audio.loadSfx(SFX_NAMES, (n) => url.sfx(n));
    this.hud = new Hud(overlayRoot);
    this.overlays = new Overlays(overlayRoot);
    this.overlayRoot = overlayRoot;
    this.frames = [];
    this.best = readBest();
    this.ach = new Achievements();
    this.ach.onUnlock((a) => {
      this.hud.say(`ACHIEVEMENT: ${a.title}`, 2600);
      this.audio.win();
      // Let the sting land first, then read it out -- waiting its turn behind any story line.
      setTimeout(() => this.speak(voiceAchievement(a.id), { caption: `${a.title} — ${a.blurb}`, policy: 'queue' }), 900);
    });
    // After the handler exists, so opening the game announces itself the first time.
    this.ach.bump('boots');
    this.telem = new Telemetry();
    this.play = null;
    this.paused = false;
    this.inBoss = false;
    this.openingSeen = false;
    this.influencer = new InfluencerSchedule();
    this.ad = null;

    this.input = new Input(window, app.canvas);
    // Z is the star punch and only means something in the Chaco bout.
    this.input.onIntent((i) => {
      this.audio.unlock();
      if (i.type === 'star' && !this.play?.acceptsStar) return;
      this.play?.intent(i);
    });

    app.ticker.add((ticker) => {
      const dt = Math.min(0.05, ticker.deltaMS / 1000);
      if (this.play && !this.paused) {
        this.play.update(dt); this.telem.tickPlay(dt);
        if (!this.inBoss) this.tickInfluencer(dt);
      }
    });

    preloadFrames().then(f => { this.frames = f; });
  }

  clearPlay() {
    this.play?.destroy(); this.play = null;
    this.influencer.cancel(); this.dismissAd();
    document.body.classList.remove('playing');
  }

  // Say a recorded line. `caption` shows it as a subtitle for as long as it plays
  // (for lines whose words aren't already on screen).
  speak(id, { caption = null, policy = 'interrupt' } = {}) {
    if (policy === 'interrupt') this.hud.clearCaption();
    if (caption && !this.audio.ctx) {           // no sound available at all: still show the words
      this.hud.caption(caption);
      setTimeout(() => this.hud.clearCaption(), 6000);
      return;
    }
    this.audio.playVoice(url.voice(id), {
      policy,
      onstart: () => { if (caption) this.hud.caption(caption); },
      onend: () => { if (caption) this.hud.clearCaption(); },
    });
  }
  stopSpeaking() { this.audio.stopVoice(); this.hud.clearCaption(); }

  showStageCard(stage, size, onGo) {
    this.overlays.stageCard(stage, size, () => { this.stopSpeaking(); onGo(); });
    this.speak(voiceStage(stage.id));
  }

  // ---- the Influencer: a rare ad break in ordinary stages ------------------
  tickInfluencer(dt) {
    if (this.ad && !this.ad.closed) return;
    const canFire = !this.audio.voiceBusy && this.overlays.node.style.display === 'none';
    const pick = this.influencer.tick(dt, canFire);
    if (pick) this.showInfluencer(pick);
  }
  showInfluencer({ tier, index }) {
    const cfg = INFLUENCER.tiers[tier - 1];
    const ad = showAd({ root: this.overlayRoot, tier, cfg, text: cfg.lines[index], onSkip: () => this.audio.stopVoice() });
    this.ad = ad;
    let started = false;
    this.audio.playVoice(url.voice(voiceInfluencer(tier, index + 1)), {
      onstart: (seconds) => { started = true; ad.start(seconds); },
      onend: () => {
        if (started) { ad.close(1.0); return; }
        ad.start(6); ad.close(6.5);             // the recording never loaded: show her words anyway
      },
    });
  }
  dismissAd() {
    if (this.ad && !this.ad.closed) { this.ad.close(); this.audio.stopVoice(); }
    this.ad = null;
  }

  // Swapping mode rebuilds every texture, so it only happens from the title screen.
  async setMode(mode) {
    if (mode === this.mode || !MODES[mode]) return;
    this.mode = mode;
    writeMode(mode);
    this.audio.useRealSfx(usesPaintedArt(mode) || ATARI_USES_REAL_SFX);
    this.tex = await loadSprites(this.app, { usePng: usesPaintedArt(mode) });
    this.title();
  }

  title() {
    this.clearPlay();
    this.hud.show(false);
    this.telem.markTitleShown();
    this.audio.playMusic(url.music(MUSIC_TITLE));
    if (usesPaintedArt(this.mode)) prefetchCutscene(CUTSCENE_TITLE);
    this.overlays.title({
      onStart: () => this.beginRun(),
      best: this.best,
      ach: this.ach,
      onAchievements: () => this.showAchievements(() => this.title()),
      mode: this.mode,
      artCount: this.artCount,
      onMode: (m) => this.setMode(m),
    });
  }

  // Pressing play: the opening (first time this visit, painted mode), then the
  // announcer's card for stage one, then the road.
  async beginRun() {
    this.audio.unlock();
    this.overlays.hide();
    const painted = usesPaintedArt(this.mode);
    if (painted && !this.openingSeen) {
      this.openingSeen = true;
      await playOpening({ host: this.mount, audio: this.audio, painted });
    }
    const first = getStage(this.startStage || '1') || STAGES[0];
    this.showStageCard(first, first.sizeClass, () => { this.overlays.hide(); this.start(first.id); });
  }

  start(stageId, carry = null, score = 0) {
    this.clearPlay();
    const stage = getStage(stageId) || STAGES[0];
    this.inBoss = false;
    this.audio.playMusic(url.music(musicForStage(stage.id)));
    if (usesPaintedArt(this.mode)) {
      prefetchCutscene(cutsceneDetonation(stage.id));           // ready before the frog pops
      const boss = bossAfter(stage.id);
      if (boss) new Image().src = url.splash(boss.id);
    }
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
    this.influencer.arm(stage.id);
  }

  bossIntro(boss, carry, score, index = 0, stats = null) {
    this.paused = true;
    this.hud.show(false);
    // Computed once per intro sequence, so a boss like The Narrator can quote
    // real numbers back at the player without them drifting beat to beat.
    if (stats === null) stats = this.buildNarratorStats(carry);
    const begin = async () => {
      this.stopSpeaking();
      this.overlays.hide();
      await this.showSplash(boss);
      this.startBoss(boss, carry, score);
    };
    if (index >= boss.intro.length) { begin(); return; }
    this.overlays.bossIntro(boss, index,
      () => {
        this.stopSpeaking();
        if (index === boss.intro.length - 1) begin();
        else this.bossIntro(boss, carry, score, index + 1, stats);
      },
      begin, stats);
    this.speak(voiceBossBeat(boss, index));
    if (index + 1 < boss.intro.length) this.audio.prefetch(url.voice(voiceBossBeat(boss, index + 1)));
    if (index === 0 && usesPaintedArt(this.mode)) new Image().src = url.splash(boss.id);
  }

  // The movie poster on the brick wall, with the boss's own theme kicking in.
  // ATARI mode has no painted art, so it goes straight to the fight.
  async showSplash(boss) {
    this.audio.playMusic(url.music(musicForBoss(boss.id)), { fade: 0.8 });
    if (!usesPaintedArt(this.mode)) return;
    await new Promise((resolve) => this.overlays.splash(boss, url.splash(boss.id), resolve));
    this.overlays.hide();
  }

  // Real, local numbers only: achievement counts merged with telemetry. Used
  // by The Narrator's intro beats and by the fight itself.
  buildNarratorStats(carry) {
    const t = this.telem.snapshot();
    return {
      ...t,
      deaths: this.ach.counts.deaths, cleanStages: this.ach.counts.cleanStages,
      midairEats: this.ach.counts.midairEats, squashes: this.ach.counts.squashes,
      achCount: this.ach.count, achTotal: this.ach.total,
      best: this.best,
    };
  }

  startBoss(boss, carry, score) {
    this.overlays.hide();
    this.clearPlay();
    this.inBoss = true;
    this.audio.playMusic(url.music(musicForBoss(boss.id)));
    this.paused = false;
    this.hud.show(true);
    document.body.classList.add('playing');
    const Fight = boss.kind === 'climb' ? ClimbFight
      : boss.kind === 'trial' ? TrialFight
      : boss.kind === 'mirror' ? MirrorFight
      : boss.kind === 'dark' ? DarkFight
      : boss.kind === 'umma' ? UmmaFight
      : boss.kind === 'invader' ? InvaderFight
      : BossFight;
    this.play = new Fight({
      app: this.app, textures: this.tex, audio: this.audio, hud: this.hud,
      frogState: { ...carry, best: this.best }, score, ach: this.ach,
      overlays: this.overlays, telem: this.telem,
    });
    // The line about how this one ended, said at the moment it's true: as Chaco's
    // rage begins, as the Landlord's tower starts to go, as the Narrator's trick
    // screen appears, or as the others are finished off.
    this.play.on('finale', ({ text }) => this.speak(voiceBossFinale(boss.id), { caption: text }));
    this.play.on('won', async ({ score }) => {
      (this.beaten ||= new Set()).add(boss.id);
      this.clearPlay();
      const next = getStage(boss.after) && nextStage(boss.after);
      this.saveBest(score);
      this.hud.show(false);
      await playBossDefeat({ host: this.mount, audio: this.audio, bossId: boss.id, painted: usesPaintedArt(this.mode) });
      this.hud.clearCaption();
      // A boss placed after the very last ladder stage IS the final boss --
      // beating it should roll into the planet-sitting ending, not bounce
      // back to the title screen.
      if (!next) { this.finish(score); return; }
      const st = { sizeClass: next.sizeClass, lives: 5, hearts: 3 };
      this.showStageCard(next, next.sizeClass, () => { this.overlays.hide(); this.start(next.id, st, score); });
    });
    this.play.on('lost', ({ score }) => {
      this.saveBest(score);
      this.ach.bump('deaths');
      this.clearPlay();
      this.hud.show(false);
      this.stopSpeaking();
      this.audio.stopMusic({ fade: 0.8 });
      this.overlays.gameOver(score, this.best, boss.name,
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
    this.dismissAd();
    this.ach.bump('detonations');
    await playDetonation({
      frames: this.frames, host: this.mount, audio: this.audio,
      stageId: stage.id, painted: usesPaintedArt(this.mode),
    });
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
    this.showStageCard(next, next.sizeClass, () => {
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
    this.dismissAd();
    this.audio.stopMusic({ fade: 0.8 });
    this.overlays.gameOver(score, this.best, stage.name,
      () => { this.overlays.hide(); this.paused = false; this.start(stage.id, null, 0); },
      () => { this.overlays.hide(); this.paused = false; this.title(); },
      () => this.showAchievements(() => this.onDead(stage, score)), this.ach);
  }

  async finish(score) {
    this.hud.show(false);
    this.ach.bump('finishes');
    this.stopSpeaking();
    await playEnding({ host: this.mount, audio: this.audio, painted: usesPaintedArt(this.mode) });
    this.saveBest(score);
    this.audio.playMusic(url.music(MUSIC_ENDING), { fade: 1.5 });
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
