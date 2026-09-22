import test from 'node:test';
import assert from 'node:assert/strict';
import { CHACO, LANDLORD, NARRATOR, NECO_FROG, SACK_MAN, UMMA, PROBE_ONE, BOSSES, bossAfter, getBoss } from '../config/bosses.js';

function checkIntro(boss) {
  assert.ok(Array.isArray(boss.intro) && boss.intro.length >= 4, boss.id);
  for (const beat of boss.intro) {
    assert.equal(typeof beat.heading, 'string', boss.id);
    assert.ok(['string', 'function'].includes(typeof beat.body), boss.id);
  }
}

test('all three bosses have ids, names and a valid stage to follow', () => {
  for (const b of BOSSES) {
    assert.ok(b.id && b.name && b.after, b.id);
    assert.equal(getBoss(b.id), b);
  }
  assert.equal(new Set(BOSSES.map(b => b.id)).size, BOSSES.length);
});
test('bossAfter resolves each slot to the right boss', () => {
  assert.equal(bossAfter('2'), CHACO);
  assert.equal(bossAfter('K1'), LANDLORD);
  assert.equal(bossAfter('K2'), NECO_FROG);
  assert.equal(bossAfter('K3'), NARRATOR);
  assert.equal(bossAfter('K4'), SACK_MAN);
  assert.equal(bossAfter('K5'), UMMA);
  assert.equal(bossAfter('4'), PROBE_ONE);
});
test('SACK_MAN is a dark fight after K4 with three surges and three attacks', () => {
  assert.equal(SACK_MAN.kind, 'dark');
  assert.equal(SACK_MAN.after, 'K4');
  assert.equal(SACK_MAN.surgesToWin, 3);
  assert.equal(Object.keys(SACK_MAN.attacks).length, 3);
  assert.equal(SACK_MAN.light.max.length, 3);
  assert.equal(SACK_MAN.light.decay.length, 3);
  // it should get harder each time through, not easier
  for (let i = 1; i < 3; i++) {
    assert.ok(SACK_MAN.light.max[i] <= SACK_MAN.light.max[i - 1], `max radius rises at surge ${i}`);
    assert.ok(SACK_MAN.light.decay[i] >= SACK_MAN.light.decay[i - 1], `decay slows at surge ${i}`);
  }
});
test('NECO_FROG is a centipede fight after K2, three rounds of two chains getting longer', () => {
  assert.equal(NECO_FROG.kind, 'centipede');
  assert.equal(NECO_FROG.after, 'K2');
  assert.equal(NECO_FROG.roundsToWin, 3);
  assert.equal(NECO_FROG.rounds.length.length, 3);
  assert.equal(NECO_FROG.rounds.speedMult.length, 3);
  // each round is at least as long and at least as fast as the one before
  for (let i = 1; i < 3; i++) {
    assert.ok(NECO_FROG.rounds.length[i] >= NECO_FROG.rounds.length[i - 1], `round ${i + 1} length`);
    assert.ok(NECO_FROG.rounds.speedMult[i] >= NECO_FROG.rounds.speedMult[i - 1], `round ${i + 1} speed`);
  }
  assert.ok(NECO_FROG.chainSpeed.base > 0 && NECO_FROG.chainSpeed.cap > 1);
  assert.ok(NECO_FROG.overloadAt > 0);
  assert.ok(NECO_FROG.grid.cols > 0 && NECO_FROG.grid.rows > 0);
  for (const k of ['pod', 'bite', 'headKill', 'burst', 'superBite']) assert.ok(NECO_FROG.scoring[k] > 0, k);
});
test('every intro beat has a heading and a string-or-function body', () => {
  for (const b of BOSSES) checkIntro(b);
});
test('UMMA is the final boss after K5: a Donkey Kong climb with no punch reliance and three rounds', () => {
  assert.equal(UMMA.kind, 'umma');
  assert.equal(UMMA.after, 'K5');
  assert.equal(UMMA.outburstsToWin, 3);
  assert.equal(UMMA.fuseTarget, 5);
  assert.ok(UMMA.levels >= 3 && UMMA.cols >= 3);
  // no ladder repeats its column with the one directly below it -- that is the zigzag
  for (let i = 1; i < UMMA.ladders.length; i++) assert.notEqual(UMMA.ladders[i].col, UMMA.ladders[i - 1].col);
  for (const arr of [UMMA.crocSpeed, UMMA.throwEvery, UMMA.soupEvery, UMMA.commandEvery]) {
    assert.equal(arr.length, UMMA.outburstsToWin, 'one entry per round');
  }
  // it should get harder each round, not easier
  for (let i = 1; i < UMMA.outburstsToWin; i++) {
    assert.ok(UMMA.crocSpeed[i] >= UMMA.crocSpeed[i - 1], `crocs are faster by round ${i + 1}`);
    assert.ok(UMMA.throwEvery[i] <= UMMA.throwEvery[i - 1], `thrown more often by round ${i + 1}`);
  }
  const commandKeys = Object.keys(UMMA.commands);
  assert.ok(commandKeys.length >= 3, 'needs a few distinct commands');
  for (const c of Object.values(UMMA.commands)) {
    assert.ok(c.window > 0, c.name);
    assert.ok(c.line && c.line.length > 0, c.name);
    assert.ok(['ladder', 'freeze', 'eat'].includes(c.need), c.name);
  }
  assert.ok(UMMA.finale.card && UMMA.finale.card.length > 10);
});
test('PROBE_ONE is an invader fight after stage 4 with a full formation and no punch reliance', () => {
  assert.equal(PROBE_ONE.kind, 'invader');
  assert.equal(PROBE_ONE.after, '4');
  assert.equal(PROBE_ONE.wavesToWin, 3);
  assert.equal(PROBE_ONE.fuseTarget, 5);
  assert.equal(PROBE_ONE.formation.cols * PROBE_ONE.formation.rows >= PROBE_ONE.loadedPerWave, true);
  assert.equal(PROBE_ONE.formation.speed.length, 3);
  assert.equal(PROBE_ONE.formation.fireEvery.length, 3);
  // it should get harder each wave, not easier
  for (let i = 1; i < 3; i++) {
    assert.ok(PROBE_ONE.formation.speed[i] >= PROBE_ONE.formation.speed[i - 1], `formation speeds up at wave ${i}`);
    assert.ok(PROBE_ONE.formation.fireEvery[i] <= PROBE_ONE.formation.fireEvery[i - 1], `alien fire rate rises at wave ${i}`);
  }
  assert.ok(PROBE_ONE.finale.card && PROBE_ONE.finale.card.length > 10);
});
test("The Narrator's dynamic beats resolve to non-empty text for any stats shape", () => {
  const stats = { daysSinceFirstSeen: 0, sessions: 1, totalPlayMinutes: 0,
    deaths: 0, cleanStages: 0, achCount: 0, achTotal: 9 };
  for (const beat of NARRATOR.intro) {
    const body = typeof beat.body === 'function' ? beat.body(stats) : beat.body;
    assert.ok(body.length > 10, beat.heading);
  }
});
test('NARRATOR is a trial fight after K3 with hearts and proof targets', () => {
  assert.equal(NARRATOR.kind, 'trial');
  assert.equal(NARRATOR.after, 'K3');
  assert.ok(NARRATOR.hearts >= 1);
  assert.ok(NARRATOR.proofToWin > 0 && NARRATOR.proofPhase3 > 0);
  assert.ok(NARRATOR.fakeEnding.title && NARRATOR.fakeEnding.body);
});
