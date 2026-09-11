import test from 'node:test';
import assert from 'node:assert/strict';
import { CHACO, LANDLORD, NARRATOR, NECO_FROG, SACK_MAN, UMMA, BOSSES, bossAfter, getBoss } from '../config/bosses.js';

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
  assert.equal(bossAfter('4'), null);
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
test('NECO_FROG is a mirror fight after K2 with three attacks and three rounds', () => {
  assert.equal(NECO_FROG.kind, 'mirror');
  assert.equal(NECO_FROG.after, 'K2');
  assert.equal(NECO_FROG.roundsToWin, 3);
  assert.equal(Object.keys(NECO_FROG.attacks).length, 3);
  for (const a of Object.values(NECO_FROG.attacks)) {
    assert.ok(['out', 'mid', 'in'].includes(a.reach), a.name);
    assert.ok(a.tell > 0 && a.damage >= 0, a.name);
  }
  assert.equal(NECO_FROG.growth.raceSpeed.length, 3);
  assert.equal(NECO_FROG.growth.attackEvery.length, 3);
});
test('every intro beat has a heading and a string-or-function body', () => {
  for (const b of BOSSES) checkIntro(b);
});
test('UMMA is the final boss after K5, with no punch reliance and three outbursts to win', () => {
  assert.equal(UMMA.kind, 'umma');
  assert.equal(UMMA.after, 'K5');
  assert.equal(UMMA.outburstsToWin, 3);
  assert.equal(UMMA.fuseTarget, 5);
  const attackKeys = Object.keys(UMMA.attacks);
  assert.ok(attackKeys.length >= 3, 'needs a few distinct attacks');
  for (const a of Object.values(UMMA.attacks)) {
    assert.ok(['zone', 'double', 'locked'].includes(a.reach), a.name);
    assert.ok(a.tell > 0 && a.damage >= 0, a.name);
    if (a.reach === 'zone') assert.ok([0, 1, 2].includes(a.zone), a.name);
  }
  const commandKeys = Object.keys(UMMA.commands);
  assert.ok(commandKeys.length >= 3, 'needs a few distinct commands');
  for (const c of Object.values(UMMA.commands)) {
    assert.ok(c.window > 0, c.name);
    assert.ok(c.line && c.line.length > 0, c.name);
    assert.ok(['zoneOut', 'freeze', 'eat'].includes(c.need), c.name);
  }
  assert.ok(UMMA.finale.card && UMMA.finale.card.length > 10);
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
