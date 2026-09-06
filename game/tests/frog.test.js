import test from 'node:test';
import assert from 'node:assert/strict';
import { Frog, HOP_TIME, INVULN_TIME } from '../entities/frog.js';
import { Grid } from '../core/grid.js';

const grid = new Grid();

test('hop moves one cell and animates', () => {
  const f = new Frog();
  assert.equal(f.hop('up', grid), true);
  assert.equal(f.row, 13);
  assert.ok(f.isHopping);
  assert.equal(f.hop('up', grid), false, 'cannot hop mid-hop');
  f.update(HOP_TIME);
  assert.ok(!f.isHopping);
  assert.equal(f.hop('up', grid), true);
});
test('hop respects grid edges', () => {
  const f = new Frog({ col: 0 });
  assert.equal(f.hop('left', grid), false);
  assert.equal(f.hop('down', grid), false);
});
test('eat caps the fuse at 5', () => {
  const f = new Frog();
  for (let i = 0; i < 7; i++) f.eat();
  assert.equal(f.fuse, 5);
  assert.ok(f.fuseFull);
});
test('act 1 hit costs a life and resets position, keeps fuse', () => {
  const f = new Frog();
  f.hop('up', grid); f.update(1); f.eat();
  assert.equal(f.takeHit(), 'reset');
  assert.equal(f.lives, 2); assert.equal(f.row, 14); assert.equal(f.fuse, 1);
  assert.equal(f.takeHit(), 'none', 'invulnerable right after a hit');
  f.update(INVULN_TIME);
  assert.equal(f.takeHit(), 'reset');
  assert.equal(f.takeHit(), 'none');
  f.update(INVULN_TIME);
  assert.equal(f.takeHit(), 'dead');
  assert.ok(f.dead);
});
test('act 2 hit costs a heart, no reset, dead at zero', () => {
  const f = new Frog({ sizeClass: 5 });
  assert.ok(f.isKaiju());
  f.hop('up', grid); f.update(1);
  assert.equal(f.takeHit(), 'hurt');
  assert.equal(f.row, 13);
  f.update(INVULN_TIME); f.takeHit(); f.update(INVULN_TIME);
  assert.equal(f.takeHit(), 'dead');
});
test('grow bumps size, resets fuse, refills hearts, flips to kaiju at 5', () => {
  const f = new Frog({ sizeClass: 4 });
  f.eat(); f.hearts = 1;
  assert.equal(f.grow(), 5);
  assert.equal(f.fuse, 0); assert.equal(f.hearts, 3);
  assert.equal(f.act, 2);
});
test('tongue reaches two cells in the facing direction', () => {
  const f = new Frog({ col: 6, row: 10 });
  const t = f.startTongue(null);
  assert.deepEqual(t.cells, [{ col: 6, row: 9 }, { col: 6, row: 8 }]);
  assert.equal(f.startTongue('left'), null, 'busy');
  f.update(1);
  assert.deepEqual(f.startTongue('left').cells, [{ col: 5, row: 10 }, { col: 4, row: 10 }]);
});
test('reachedGoal only when landed on row 0', () => {
  const f = new Frog({ row: 1 });
  f.hop('up', grid);
  assert.equal(f.reachedGoal(), false);
  f.update(HOP_TIME);
  assert.equal(f.reachedGoal(), true);
});
