import test from 'node:test';
import assert from 'node:assert/strict';
import { InterrupterSchedule, InterrupterManager } from '../systems/interruptermgr.js';

const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; };

test('nobody fires until someone is unlocked', () => {
  const m = new InterrupterManager({ rng: () => 0 });
  m.arm();
  assert.equal(m.pending, null);
  for (let i = 0; i < 100; i++) assert.equal(m.tick(1), null);
});

test('a freshly unlocked character is guaranteed their first appearance', () => {
  const m = new InterrupterManager({ rng: () => 0.99, chance: 0 });   // chance 0: only the "unmet" path can arm
  m.unlock('landlord');
  m.arm();
  assert.ok(m.pending, 'pastor is armed even though the coin flip failed');
  let fired = null;
  for (let i = 0; i < 200 && !fired; i++) fired = m.tick(0.2);
  assert.equal(fired.id, 'pastor');
  assert.equal(fired.tier, 1);
});

test('once everyone has been met once, arming goes back to the coin flip', () => {
  const m = new InterrupterManager({ rng: seq(0, 0.01) });
  m.unlock('landlord');
  m.schedules.pastor.timesSeen = 1;                    // already met
  m.arm();
  assert.ok(m.pending);
});

test('tier is how many times you have seen them, capped at four', () => {
  const s = new InterrupterSchedule('pastor', { rng: () => 0 });
  const tiers = [];
  for (let i = 0; i < 6; i++) tiers.push(s.show().tier);
  assert.deepEqual(tiers, [1, 2, 3, 4, 4, 4]);
});

test('a line is never repeated back to back within one tier', () => {
  const s = new InterrupterSchedule('podcaster', { rng: () => 0.999 });
  s.timesSeen = 3;                                     // stay on tier 4 for this run
  let last = null;
  for (let i = 0; i < 20; i++) { const { index } = s.show(); assert.notEqual(index, last); last = index; s.timesSeen = 3; }
});

test('unlock only adds the character whose boss matches', () => {
  const m = new InterrupterManager();
  m.unlock('narrator');
  assert.deepEqual([...m.unlocked], ['bossboss']);
  m.unlock('neco');
  assert.deepEqual([...m.unlocked].sort(), ['bossboss', 'podcaster']);
});

test('two in a stage, never closer than the gap, never a third', () => {
  const m = new InterrupterManager({ rng: () => 0.01, gap: 5, window: [1, 1], chance: 1 });
  m.unlock('landlord'); m.unlock('neco'); m.unlock('narrator');
  m.arm();
  const fires = [];
  let t = 0;
  for (let i = 0; i < 4000; i++) { t += 0.05; const f = m.tick(0.05); if (f) fires.push(t); }
  assert.ok(fires.length <= 2, `at most two, got ${fires.length}`);
  if (fires.length === 2) assert.ok(fires[1] - fires[0] >= 5 - 1e-6);
});

test('nothing fires while canFire is false', () => {
  const m = new InterrupterManager({ rng: () => 0, window: [0, 0] });
  m.unlock('landlord');
  m.arm();
  for (let i = 0; i < 50; i++) assert.equal(m.tick(1, false), null);
  assert.ok(m.tick(0.1, true));
});
