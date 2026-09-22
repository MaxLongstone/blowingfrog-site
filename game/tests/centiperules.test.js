import test from 'node:test';
import assert from 'node:assert/strict';
import { nextHeadCell, speedFor, willBurst, biteOutcome, seedPath } from '../systems/centiperules.js';

const DIMS = { cols: 10, rows: 10 };

test('a head keeps going the way it was going', () => {
  assert.deepEqual(nextHeadCell({ col: 3, row: 2, dc: 1 }, DIMS), { col: 4, row: 2, dc: 1 });
  assert.deepEqual(nextHeadCell({ col: 3, row: 2, dc: -1 }, DIMS), { col: 2, row: 2, dc: -1 });
});
test('it turns and drops a row exactly at each edge', () => {
  assert.deepEqual(nextHeadCell({ col: 9, row: 2, dc: 1 }, DIMS), { col: 9, row: 3, dc: -1 });
  assert.deepEqual(nextHeadCell({ col: 0, row: 2, dc: -1 }, DIMS), { col: 0, row: 3, dc: 1 });
});
test('on the bottom row it keeps turning in place instead of running off the grid', () => {
  const a = nextHeadCell({ col: 9, row: 9, dc: 1 }, DIMS);
  assert.deepEqual(a, { col: 9, row: 9, dc: -1 });
  const b = nextHeadCell(a, DIMS);
  assert.deepEqual(b, { col: 8, row: 9, dc: -1 });
});
test('a full zigzag walk never leaves the grid', () => {
  let s = { col: 0, row: 0, dc: 1 };
  for (let i = 0; i < 500; i++) {
    s = nextHeadCell(s, DIMS);
    assert.ok(s.col >= 0 && s.col < DIMS.cols && s.row >= 0 && s.row < DIMS.rows, JSON.stringify(s));
  }
});

test('speed rises with every pod eaten, and is capped', () => {
  const cfg = { base: 2, perEat: 0.1, cap: 2.5 };
  assert.equal(speedFor(0, cfg), 2);
  assert.equal(speedFor(1, cfg), 2.2);
  assert.equal(speedFor(5, cfg), 3);       // 2 * 1.5, under the cap
  assert.equal(speedFor(100, cfg), 5);     // 2 * 2.5, pinned at the cap
});

test('a chain bursts once it has eaten enough, not before', () => {
  assert.equal(willBurst(5, 6), false);
  assert.equal(willBurst(6, 6), true);
  assert.equal(willBurst(9, 6), true);
});

test('biting the head kills the whole chain', () => {
  const path = [{ col: 1, row: 0 }, { col: 0, row: 0 }, { col: 0, row: 1 }];
  assert.deepEqual(biteOutcome(path, 0), { front: [], back: [] });
});
test('biting a body segment splits it: everything ahead survives, everything behind becomes its own chain, the bitten one is gone', () => {
  const path = [{ col: 3, row: 0 }, { col: 2, row: 0 }, { col: 1, row: 0 }, { col: 0, row: 0 }];
  const { front, back } = biteOutcome(path, 2);
  assert.deepEqual(front, [{ col: 3, row: 0 }, { col: 2, row: 0 }]);
  assert.deepEqual(back, [{ col: 0, row: 0 }]);
});
test('biting the tail leaves nothing behind it', () => {
  const path = [{ col: 3, row: 0 }, { col: 2, row: 0 }, { col: 1, row: 0 }];
  const { front, back } = biteOutcome(path, 2);
  assert.deepEqual(front, [{ col: 3, row: 0 }, { col: 2, row: 0 }]);
  assert.deepEqual(back, []);
});

test('a seeded path trails behind the head against its direction of travel, on the grid', () => {
  const path = seedPath(5, 0, 1, 4, 10);
  assert.deepEqual(path, [{ col: 5, row: 0 }, { col: 4, row: 0 }, { col: 3, row: 0 }, { col: 2, row: 0 }]);
});
test('a seeded path near the edge clamps instead of going negative', () => {
  const path = seedPath(1, 0, 1, 4, 10);
  assert.deepEqual(path.map((p) => p.col), [1, 0, 0, 0]);
});
