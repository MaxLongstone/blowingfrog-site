import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, COUNTER_KEYS, getAchievement } from '../config/achievements.js';

// Node has no localStorage; the tracker must degrade to memory only.
const { Achievements } = await import('../systems/achievements.js');

test('nine achievements, all with unique ids and a test', () => {
  assert.equal(ACHIEVEMENTS.length, 9);
  assert.equal(new Set(ACHIEVEMENTS.map(a => a.id)).size, 9);
  for (const a of ACHIEVEMENTS) {
    assert.equal(typeof a.test, 'function', a.id);
    assert.ok(a.title && a.blurb && a.hint && a.emoji, a.id);
  }
});
test('starts empty and works without storage', () => {
  const t = new Achievements();
  assert.equal(t.count, 0);
  assert.equal(t.total, 9);
  for (const k of COUNTER_KEYS) assert.equal(t.counts[k], 0);
});
test('a counter unlocks its achievement exactly once and notifies', () => {
  const t = new Achievements();
  const seen = [];
  t.onUnlock(a => seen.push(a.id));
  t.bump('detonations');
  assert.ok(t.has('piggy'));
  assert.deepEqual(seen, ['piggy']);
  t.bump('detonations');
  assert.deepEqual(seen, ['piggy'], 'no duplicate unlock');
});
test('threshold achievements wait for the threshold', () => {
  const t = new Achievements();
  for (let i = 0; i < 24; i++) t.bump('squashes');
  assert.equal(t.has('pest'), false);
  t.bump('squashes');
  assert.ok(t.has('pest'));
});
test('unknown counters are ignored', () => {
  const t = new Achievements();
  t.bump('nonsense');
  assert.equal(t.count, 0);
});
test('shareText lists unlocked achievements and the best score', () => {
  const t = new Achievements();
  t.bump('detonations');
  t.bump('midairEats');
  const text = t.shareText(12400);
  assert.match(text, /2\/9 achievements/);
  assert.match(text, /THIS LITTLE PIGGY WENT BOOM/);
  assert.match(text, /SNACK ON THE WING/);
  assert.match(text, /012400/);
  assert.doesNotMatch(text, /PLANET UNAVAILABLE/, 'locked ones are left out');
});
test('list reports locked and unlocked state, reset clears everything', () => {
  const t = new Achievements();
  t.bump('finishes');
  assert.equal(t.list().filter(a => a.unlocked).length, 1);
  t.reset();
  assert.equal(t.count, 0);
  assert.equal(t.counts.finishes, 0);
});
test('getAchievement looks up by id', () => {
  assert.equal(getAchievement('wing').title, 'SNACK ON THE WING');
  assert.equal(getAchievement('nope'), null);
});
