import test from 'node:test';
import assert from 'node:assert/strict';
import { INTERRUPTERS, INTERRUPTER_PROPS } from '../config/interrupters.js';
import { PLANNED_ACHIEVEMENTS } from '../config/plannedachievements.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { stripCues } from '../config/bossvoices.js';

test('each new interrupter has four tiers of three cued lines, all different', () => {
  for (const [id, c] of Object.entries(INTERRUPTERS)) {
    assert.equal(c.tiers.length, 4, id);
    const all = c.tiers.flat();
    assert.equal(all.length, 12, id);
    assert.equal(new Set(all).size, 12, id);
    for (const l of all) { assert.match(l, /^\[[^\]]+\] \S/, id); assert.ok(stripCues(l).length > 60, id); }
  }
});
test('they arrive in the order agreed: Preacher, Podcaster, Boss’s Boss', () => {
  assert.deepEqual(['pastor', 'podcaster', 'bossboss'].map((k) => INTERRUPTERS[k].firstStage), ['K2', 'K3', 'K4']);
  assert.deepEqual(['pastor', 'podcaster', 'bossboss'].map((k) => INTERRUPTERS[k].unlocksAfter), ['landlord', 'neco', 'narrator']);
});
test('each has nine props with sticker labels that fit', () => {
  for (const [id, list] of Object.entries(INTERRUPTER_PROPS)) {
    assert.equal(list.length, 9, id);
    assert.equal(new Set(list.map(([n]) => n)).size, 9, id);
    for (const [, label] of list) assert.ok(label.length <= 34, label);
  }
});
test('planned achievements are fifteen, unique, and do not collide with the live ones', () => {
  assert.equal(PLANNED_ACHIEVEMENTS.length, 15);
  const ids = new Set([...ACHIEVEMENTS.map((a) => a.id), ...PLANNED_ACHIEVEMENTS.map((a) => a.id)]);
  assert.equal(ids.size, ACHIEVEMENTS.length + 15);
});
