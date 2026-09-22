import test from 'node:test';
import assert from 'node:assert/strict';
import { walkable, canHop, canJump, sizeAfterHit, nextPatrolCol } from '../systems/hiddenrules.js';

// A tiny 2-row, 6-column level: solid ground on row 1 except a gap at col 3,
// and one solid platform cell on row 0 at col 4.
const LEVEL = {
  rows: 2, cols: 6,
  solid: [
    [false, false, false, false, true, false],
    [true, true, true, false, true, true],
  ],
};

test('a cell is only walkable inside the grid and marked solid', () => {
  assert.equal(walkable(LEVEL, 0, 1), true);
  assert.equal(walkable(LEVEL, 3, 1), false, 'the gap');
  assert.equal(walkable(LEVEL, -1, 1), false, 'off the left edge');
  assert.equal(walkable(LEVEL, 6, 1), false, 'off the right edge');
  assert.equal(walkable(LEVEL, 4, 0), true, 'the platform');
});

test('a hop only succeeds onto a walkable cell', () => {
  assert.deepEqual(canHop(LEVEL, 2, 1, 'right'), null, 'walking straight into the gap fails');
  assert.deepEqual(canHop(LEVEL, 0, 1, 'right'), { col: 1, row: 1 });
  assert.deepEqual(canHop(LEVEL, 4, 1, 'up'), { col: 4, row: 0 }, 'climbing onto the platform');
});

test('a jump clears exactly one cell regardless of what is in it', () => {
  assert.deepEqual(canJump(LEVEL, 2, 1, 'right'), { col: 4, row: 1 }, 'clears the gap at col 3');
  assert.deepEqual(canJump(LEVEL, 5, 1, 'right'), null, 'nowhere to land off the far edge');
});
test('a jump only ever goes left or right', () => {
  assert.equal(canJump(LEVEL, 2, 1, 'up'), null);
  assert.equal(canJump(LEVEL, 2, 1, 'down'), null);
});

test('a big frog shrinks when hurt; a small one has nothing left to lose', () => {
  assert.equal(sizeAfterHit(5, 5), 1);
  assert.equal(sizeAfterHit(9, 5), 1);
  assert.equal(sizeAfterHit(1, 5), 1);
});

test('a patrol keeps going until the end of its range or the ground runs out', () => {
  const e = { col: 0, dir: 1, row: 1, range: [0, 2] };
  const a = nextPatrolCol(e, LEVEL);
  assert.deepEqual(a, { col: 1, dir: 1 });
  const b = nextPatrolCol({ ...e, col: 2 }, LEVEL);           // range end
  assert.deepEqual(b, { col: 2, dir: -1 });
});
test('a patrol turns around at a gap even inside its range', () => {
  const e = { col: 2, dir: 1, row: 1, range: [0, 5] };        // would walk into the gap at 3
  assert.deepEqual(nextPatrolCol(e, LEVEL), { col: 2, dir: -1 });
});
