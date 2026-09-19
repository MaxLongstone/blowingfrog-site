import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStrike, punchOutcome, starPunchDamage, patternPool, pickPattern } from '../systems/punchrules.js';
import { CHACO } from '../config/bosses.js';

const { attacks, damage, starPunch, patterns } = CHACO;

test('a hook from the left is dodged by leaning right, and hits if you lean into it', () => {
  assert.equal(resolveStrike(attacks.hookL, { lean: 1 }), 'dodged');
  assert.equal(resolveStrike(attacks.hookL, { lean: -1 }), 'hit');
  assert.equal(resolveStrike(attacks.hookL, { lean: 0 }), 'hit');
  assert.equal(resolveStrike(attacks.hookR, { lean: -1 }), 'dodged');
  assert.equal(resolveStrike(attacks.hookR, { lean: 1 }), 'hit');
});
test('a block stops a hook but is not a dodge', () => {
  assert.equal(resolveStrike(attacks.hookL, { lean: 0, blocking: true }), 'blocked');
  assert.equal(resolveStrike(attacks.hookR, { lean: 0, blocking: true }), 'blocked');
});
test('the jaw lunge is dodged either way and cannot be blocked', () => {
  assert.equal(resolveStrike(attacks.chupada, { lean: 1 }), 'dodged');
  assert.equal(resolveStrike(attacks.chupada, { lean: -1 }), 'dodged');
  assert.equal(resolveStrike(attacks.chupada, { lean: 0, blocking: true }), 'hit');
});
test('a punch does what Chaco is doing when it lands', () => {
  assert.equal(punchOutcome('guard', damage).damage, 0);
  assert.equal(punchOutcome('tell', damage).kind, 'counter');
  assert.equal(punchOutcome('tell', damage).star, true);
  assert.equal(punchOutcome('open', damage).damage, damage.open);
  assert.equal(punchOutcome('dazed', damage).damage, damage.open);
  assert.equal(punchOutcome('idle', damage).damage, damage.chip);
  assert.equal(punchOutcome('rage', damage).damage, 0);
  assert.equal(punchOutcome('down', damage).damage, 0);
});
test('counters beat open hits beat chips, and only counters give stars', () => {
  assert.ok(damage.counter > damage.open && damage.open > damage.chip && damage.chip > 0);
  for (const p of ['guard', 'open', 'dazed', 'idle', 'strike']) assert.equal(punchOutcome(p, damage).star, false, p);
});
test('the star punch grows with stars and is nothing without them', () => {
  assert.equal(starPunchDamage(0, starPunch), 0);
  assert.ok(starPunchDamage(3, starPunch) > starPunchDamage(1, starPunch));
  assert.ok(starPunchDamage(1, starPunch) > damage.counter, 'a star punch is worth saving for');
});
test('every pattern only names attacks that exist, and later rounds add to earlier ones', () => {
  for (const list of Object.values(patterns)) for (const p of list) for (const a of p) assert.ok(attacks[a], a);
  assert.ok(patternPool(patterns, 2).length > patternPool(patterns, 1).length);
  assert.ok(patternPool(patterns, 1).every(p => !p.includes('chupada')), 'round one teaches hooks only');
});
test('a pattern is never picked twice in a row when there is a choice', () => {
  const pool = patternPool(patterns, 2);
  let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let last = null;
  for (let i = 0; i < 200; i++) { const p = pickPattern(pool, rng, last); assert.notEqual(p, last); last = p; }
  assert.equal(pickPattern([pool[0]], rng, pool[0]), pool[0]);
});
test('a full bar takes several dodges to empty, not one lucky combo', () => {
  const perOpening = Math.floor(CHACO.openWindow[1] / 0.2) * damage.open;
  assert.ok(perOpening < 100, 'one opening should not knock him down');
  assert.ok(perOpening * 4 >= 100, 'four openings should');
});
test('the fight is three knockdowns, the rage bag comes on the second, and the frog can go down twice before the third ends it', () => {
  assert.equal(CHACO.knockdownsToWin, 3);
  assert.ok(CHACO.ultimaRaya.duration > 5);
  assert.equal(CHACO.frog.downsToLose, 3);
  assert.equal(CHACO.frog.getUpPresses.length, CHACO.frog.downsToLose);
});
