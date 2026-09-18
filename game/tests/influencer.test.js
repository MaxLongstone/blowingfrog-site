import test from 'node:test';
import assert from 'node:assert/strict';
import { InfluencerSchedule } from '../systems/influencer.js';
import { INFLUENCER, tierForStage } from '../config/influencer.js';

// A deterministic stand-in for Math.random that walks through fixed values.
const seq = (...vals) => { let i = 0; return () => vals[i++ % vals.length]; };

test('stages map onto her four tiers', () => {
  assert.deepEqual(['1', '2', '3', '4'].map(tierForStage), [1, 1, 1, 1]);
  assert.deepEqual(['K1', 'K2'].map(tierForStage), [2, 2]);
  assert.deepEqual(['K3', 'k4'].map(tierForStage), [3, 3]);
  assert.equal(tierForStage('K5'), 4);
});

test('a stage that rolls high never gets an ad', () => {
  const s = new InfluencerSchedule({ rng: seq(0.99), chance: 0.4 });
  s.arm('1');
  assert.equal(s.armed, false);
  for (let i = 0; i < 100; i++) assert.equal(s.tick(1), null);
});

test('a stage that rolls low gets one, no earlier than the window opens', () => {
  const s = new InfluencerSchedule({ rng: seq(0.1, 0.0, 0.5), chance: 0.4, earliest: 10, latest: 35 });
  s.arm('K3');
  assert.equal(s.armed, true);
  assert.equal(s.tick(9.9), null);
  const pick = s.tick(0.2);
  assert.equal(pick.tier, 3);
  assert.equal(s.armed, false, 'only once per stage');
  assert.equal(s.tick(100), null);
});

test('she waits for a quiet moment instead of talking over someone', () => {
  const s = new InfluencerSchedule({ rng: seq(0.1, 0), chance: 0.4, earliest: 5, latest: 5 });
  s.arm('1');
  assert.equal(s.tick(6, false), null);
  assert.equal(s.tick(1, false), null);
  assert.ok(s.tick(1, true), 'fires the moment it is quiet');
});

test('cancelling drops the pending ad', () => {
  const s = new InfluencerSchedule({ rng: seq(0), chance: 1, earliest: 1, latest: 1 });
  s.arm('2'); s.cancel();
  assert.equal(s.tick(50), null);
});

test('she cycles through every line before repeating, and never repeats back to back', () => {
  const s = new InfluencerSchedule({ rng: Math.random });
  s.tier = 2;
  const n = INFLUENCER.tiers[1].lines.length;
  const first = Array.from({ length: n }, () => s.pick().index);
  assert.equal(new Set(first).size, n, 'each line once before any repeats');
  let prev = first[n - 1];
  for (let i = 0; i < 40; i++) {
    const { index } = s.pick();
    assert.notEqual(index, prev, 'no immediate repeat');
    prev = index;
  }
});
