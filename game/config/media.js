// The single place that says which recording, track or clip belongs to which
// moment in the game. Everything here is a pure function of ids, so it can be
// tested in Node -- including a check that every file it names actually exists.
//
// Files come from tools/prepare_media.py.

// Bump when any generated file is replaced, so browsers refetch instead of
// serving the old copy from cache.
export const MEDIA_VERSION = 1;
const v = (path) => `${path}?v=${MEDIA_VERSION}`;

export const url = {
  voice: (id) => v(`assets/voice/${id}.mp3`),
  music: (id) => v(`assets/music/${id}.mp3`),
  sfx: (name) => v(`assets/sfx/sfx_${name}.mp3`),
  cutscene: (id) => v(`assets/cutscenes/${id}.mp4`),
  splash: (bossId) => v(`assets/splash/splash_${bossId}.jpg`),
  cutsceneManifest: () => v('assets/cutscenes/manifest.json'),
};

const norm = (id) => String(id).toLowerCase();
const pad = (n) => String(n).padStart(2, '0');

// ---- sound effects ------------------------------------------------------
// Gameplay sounds replace the synthesized bleeps in game/core/audio.js; the
// synthesized version stays as the fallback (and as ATARI mode's sound).
export const GAMEPLAY_SFX = ['hop', 'eat', 'food', 'tick', 'tongue', 'hit', 'squash', 'boom', 'roar', 'warn', 'win', 'lose'];
export const CUTSCENE_SFX = ['glass_shatter', 'broadcast_squeal', 'rising_drone', 'comedic_clatter', 'electrical_overload'];
export const SFX_NAMES = [...GAMEPLAY_SFX, ...CUTSCENE_SFX];

// ---- voice --------------------------------------------------------------
export const voiceStage = (stageId) => `voice_stage_${norm(stageId)}`;

// The Narrator's beats that quote your own numbers are built at runtime, so
// they can't be pre-recorded; a generic "_backup" take stands in for them.
export function voiceBossBeat(boss, index) {
  const beat = boss.intro[index];
  const id = `voice_boss_${boss.id}_${pad(index + 1)}`;
  return typeof beat?.body === 'function' ? `${id}_backup` : id;
}
export const voiceBossFinale = (bossId) => `voice_boss_${bossId}_finale`;
export const voiceAchievement = (achId) => `voice_ach_${achId}`;
export const voiceInfluencer = (tier, line) => `voice_influencer_tier${tier}_${pad(line)}`;

// ---- music --------------------------------------------------------------
export const MUSIC_TITLE = 'music_title';
export const MUSIC_ENDING = 'music_ending';
const STAGE_MUSIC = {
  '1': 'highway', '2': 'highway', '3': 'highway', '4': 'highway',
  k1: 'kaiju_rampage', k2: 'city', k3: 'continent', k4: 'ocean', k5: 'orbit',
};
export const musicForStage = (stageId) => `music_stage_${STAGE_MUSIC[norm(stageId)] || 'highway'}`;
export const musicForBoss = (bossId) => `music_boss_${bossId}`;

// ---- cutscenes ----------------------------------------------------------
export const CUTSCENE_TITLE = 'cutscene_title';
export const CUTSCENE_ENDING = 'cutscene_ending';
export const cutsceneDetonation = (stageId) => `cutscene_detonation_${norm(stageId)}`;
export const cutsceneBossDefeat = (bossId) => `cutscene_boss_${bossId}_defeat`;

// One extra sound layered over a boss-defeat clip. `at` is seconds into the
// clip, or 'peak' to line it up with the loudest moment of the clip's own
// audio (measured at import time, see cutscenes/manifest.json).
export const DEFEAT_SFX = {
  neco: { name: 'glass_shatter', at: 'peak' },
  narrator: { name: 'broadcast_squeal', at: 'peak' },
  sackman: { name: 'rising_drone', at: 0.2 },
  umma: { name: 'comedic_clatter', at: 'peak' },
  probe: { name: 'electrical_overload', at: 'peak' },
};

// ---- mix ----------------------------------------------------------------
// Voice and music were both levelled at import (voice about -17.5 LUFS, music
// about -15.5), so music has to sit well under speech, and drops further while
// anyone is talking.
export const LEVELS = { synth: 0.28, sfx: 1.0, voice: 1.0, music: 0.34, musicDucked: 0.13, cutscene: 0.85 };

// ATARI mode keeps its chiptune bleeps; only the painted 2026 mode gets the
// real sound effects. Flip to true to use the recordings in both.
export const ATARI_USES_REAL_SFX = false;
