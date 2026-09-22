import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { STAGES } from '../config/stages.js';
import { BOSSES } from '../config/bosses.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { INFLUENCER, OUTBURSTS } from '../config/influencer.js';
import { INTERRUPTERS, INTERRUPTER_PROPS } from '../config/interrupters.js';
import { BOSS_LINES } from '../config/bossvoices.js';
import {
  url, SFX_NAMES, GAMEPLAY_SFX, CUTSCENE_SFX, DEFEAT_SFX, voiceStage, voiceBossBeat, voiceBossFinale,
  voiceAchievement, voiceInfluencer, voiceBossLine, voiceInterrupter, musicForStage, musicForBoss, MUSIC_TITLE, MUSIC_ENDING,
  cutsceneDetonation, cutsceneBossDefeat, CUTSCENE_TITLE, CUTSCENE_ENDING,
} from '../config/media.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const onDisk = (u) => existsSync(join(ROOT, u.split('?')[0]));
const missing = (list) => list.filter(([, u]) => !onDisk(u)).map(([what, u]) => `${what} -> ${u}`);

test('every stage has its announcer voice, music, and detonation clip', () => {
  const need = [];
  for (const s of STAGES) {
    need.push([`voice stage ${s.id}`, url.voice(voiceStage(s.id))]);
    need.push([`music stage ${s.id}`, url.music(musicForStage(s.id))]);
    need.push([`detonation ${s.id}`, url.cutscene(cutsceneDetonation(s.id))]);
  }
  assert.deepEqual(missing(need), []);
});

test('every boss has each intro beat, a finale line, a theme, a poster, and a defeat clip', () => {
  const need = [];
  for (const b of BOSSES) {
    b.intro.forEach((_, i) => need.push([`${b.id} beat ${i + 1}`, url.voice(voiceBossBeat(b, i))]));
    need.push([`${b.id} finale`, url.voice(voiceBossFinale(b.id))]);
    need.push([`${b.id} music`, url.music(musicForBoss(b.id))]);
    need.push([`${b.id} poster`, url.splash(b.id)]);
    need.push([`${b.id} defeat`, url.cutscene(cutsceneBossDefeat(b.id))]);
  }
  assert.deepEqual(missing(need), []);
});

test("beats that quote the player's own numbers use the generic backup recording", () => {
  const narrator = BOSSES.find((b) => b.id === 'narrator');
  const dynamic = narrator.intro.map((beat, i) => [i, typeof beat.body === 'function']).filter(([, d]) => d).map(([i]) => i);
  assert.ok(dynamic.length >= 1);
  for (const i of dynamic) assert.match(voiceBossBeat(narrator, i), /_backup$/);
  const staticBeat = narrator.intro.findIndex((b) => typeof b.body !== 'function');
  assert.doesNotMatch(voiceBossBeat(narrator, staticBeat), /_backup/);
});

test('every achievement has a voiced callout', () => {
  assert.deepEqual(missing(ACHIEVEMENTS.map((a) => [a.id, url.voice(voiceAchievement(a.id))])), []);
});

test('every boss has all five heads-up lines recorded', () => {
  const need = [];
  for (const id of Object.keys(BOSS_LINES)) for (let n = 1; n <= 5; n++) need.push([`${id} ${n}`, url.voice(voiceBossLine(id, n))]);
  assert.deepEqual(missing(need), []);
});

test('every outburst the Influencer can throw when you try to skip her is recorded', () => {
  const need = OUTBURSTS.map((_, i) => [`outburst ${i + 1}`, url.voice(`voice_influencer_outburst_${String(i + 1).padStart(2, '0')}`)]);
  assert.deepEqual(missing(need), []);
});

test('every interrupter has all twelve lines recorded, a portrait per tier, and every prop image', () => {
  const need = [];
  for (const [id, c] of Object.entries(INTERRUPTERS)) {
    c.tiers.forEach((tier, ti) => tier.forEach((_, li) => need.push([`${id} tier ${ti + 1}.${li + 1}`, url.voice(voiceInterrupter(id, ti + 1, li + 1))])));
    for (let t = 1; t <= 4; t++) need.push([`${id} portrait tier ${t}`, `assets/game/${id}_t${t}.png`]);
    for (const [img] of INTERRUPTER_PROPS[id]) need.push([`${id} prop ${img}`, `assets/game/${img}.png`]);
  }
  assert.deepEqual(missing(need), []);
});

test('all four Influencer tiers have every line recorded, and text to show', () => {
  const need = [];
  INFLUENCER.tiers.forEach((t, ti) => t.lines.forEach((text, li) => {
    assert.ok(text.length > 20, `tier ${ti + 1} line ${li + 1} has no text`);
    need.push([`tier ${ti + 1}.${li + 1}`, url.voice(voiceInfluencer(ti + 1, li + 1))]);
  }));
  assert.equal(INFLUENCER.tiers.length, 4);
  assert.deepEqual(missing(need), []);
});

test('title, ending, and the rest of the fixed clips and tracks exist', () => {
  assert.deepEqual(missing([
    ['title music', url.music(MUSIC_TITLE)], ['ending music', url.music(MUSIC_ENDING)],
    ['opening clip', url.cutscene(CUTSCENE_TITLE)], ['ending clip', url.cutscene(CUTSCENE_ENDING)],
    ['clip manifest', url.cutsceneManifest()],
  ]), []);
});

test('every sound effect the game asks for is on disk, and the layered ones are real names', () => {
  assert.deepEqual(missing(SFX_NAMES.map((n) => [n, url.sfx(n)])), []);
  assert.equal(GAMEPLAY_SFX.length, 12);
  for (const { name } of Object.values(DEFEAT_SFX)) assert.ok(CUTSCENE_SFX.includes(name), name);
});

test('the clip manifest describes every clip, with sane numbers', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'assets/cutscenes/manifest.json'), 'utf8'));
  const ids = [CUTSCENE_TITLE, CUTSCENE_ENDING, ...STAGES.map((s) => cutsceneDetonation(s.id)), ...BOSSES.map((b) => cutsceneBossDefeat(b.id))];
  for (const id of ids) {
    assert.ok(m[id], `no manifest entry for ${id}`);
    assert.ok(m[id].duration > 1 && m[id].duration < 20, `${id} duration`);
    assert.ok(m[id].peak >= 0 && m[id].peak <= m[id].duration, `${id} peak inside the clip`);
  }
});

test('stage ids map to music the way the backdrops do, including upper-case K ids', () => {
  assert.equal(musicForStage('1'), 'music_stage_highway');
  assert.equal(musicForStage('4'), 'music_stage_highway');
  assert.equal(musicForStage('K1'), 'music_stage_kaiju_rampage');
  assert.equal(musicForStage('K5'), 'music_stage_orbit');
  assert.equal(voiceStage('K3'), 'voice_stage_k3');
  assert.equal(cutsceneDetonation('K2'), 'cutscene_detonation_k2');
});

test('urls are versioned so a regenerated file is refetched', () => {
  assert.match(url.voice('x'), /\?v=\d+$/);
  assert.match(url.cutscene('x'), /\?v=\d+$/);
});
