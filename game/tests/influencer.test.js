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

// Her portrait and every product she holds up must exist on disk, or the card would silently lose them.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
test('every portrait and product image the Influencer uses exists', () => {
  INFLUENCER.tiers.forEach((t, i) => {
    assert.ok(t.art && existsSync(join(root, t.art)), `tier ${i + 1} portrait`);
    assert.ok(t.products.length >= 4, `tier ${i + 1} has things to sell`);
    for (const p of t.products) {
      assert.ok(existsSync(join(root, p.img)), p.img);
      assert.ok(p.label && p.label.length <= 34, `label fits the sticker: ${p.label}`);
    }
  });
});

import { triesFor, pickOutburst } from '../systems/skipresist.js';
import { OUTBURSTS, RESIST, SKIP_LABELS } from '../config/influencer.js';
test('she lets you go straight away early on, and fights later', () => {
  assert.equal(triesFor(1, () => 0.5), 0);
  for (const tier of [2, 3, 4]) {
    const [lo, hi] = RESIST.tries[tier];
    const seen = new Set();
    let n = 0; const rng = () => (n = (n * 1103515245 + 12345 + 1) % 2147483648) / 2147483648;
    for (let i = 0; i < 300; i++) { const t = triesFor(tier, rng); assert.ok(t >= lo && t <= hi); seen.add(t); }
    assert.ok(seen.size > 1, `tier ${tier} varies`);
  }
});
test('it is never the same number of clicks twice in a row', () => {
  let last = null; let n = 5; const rng = () => (n = (n * 1103515245 + 12345 + 1) % 2147483648) / 2147483648;
  for (let i = 0; i < 300; i++) { const t = triesFor(4, rng, last); assert.notEqual(t, last); last = t; }
});
test('outbursts never repeat back to back, and the pool holds the ones that matter', () => {
  assert.ok(OUTBURSTS.length >= 20 && SKIP_LABELS.length >= 5);
  assert.ok(OUTBURSTS.some((t) => t.includes('OnlyFans')), 'the piggies one is in');
  let last = -1; const rng = () => 0.5;
  for (let i = 0; i < 20; i++) { const j = pickOutburst(OUTBURSTS, rng, last); assert.notEqual(j, last); last = j; }
});
