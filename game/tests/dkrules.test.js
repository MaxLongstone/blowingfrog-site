import test from 'node:test';
import assert from 'node:assert/strict';
import { ladderAt, canClimb, cascadeStep } from '../systems/dkrules.js';

const LADDERS = [{ level: 0, col: 1 }, { level: 1, col: 5 }, { level: 2, col: 1 }, { level: 3, col: 5 }];

test('a ladder only connects at its own column and level', () => {
  assert.equal(ladderAt(LADDERS, 0, 1), true);
  assert.equal(ladderAt(LADDERS, 0, 5), false);
  assert.equal(ladderAt(LADDERS, 1, 1), false);
});
test('climbing up needs a ladder at this level; climbing down needs one at the level below', () => {
  assert.equal(canClimb(LADDERS, 0, 1, 'up'), true);
  assert.equal(canClimb(LADDERS, 0, 5, 'up'), false);
  assert.equal(canClimb(LADDERS, 1, 1, 'down'), true);
  assert.equal(canClimb(LADDERS, 1, 5, 'down'), false);
});
test('no two ladders in a row share a column, which is what makes the climb zigzag', () => {
  for (let i = 1; i < LADDERS.length; i++) assert.notEqual(LADDERS[i].col, LADDERS[i - 1].col);
});

test('a rolling croc keeps going the way it is going', () => {
  assert.deepEqual(cascadeStep({ level: 3, col: 2, dir: 1 }, 7), { level: 3, col: 3, dir: 1 });
  assert.deepEqual(cascadeStep({ level: 3, col: 2, dir: -1 }, 7), { level: 3, col: 1, dir: -1 });
});
test('it tumbles down a level at the edge, same column, same direction', () => {
  assert.deepEqual(cascadeStep({ level: 3, col: 6, dir: 1 }, 7), { level: 2, col: 6, dir: 1 });
  assert.deepEqual(cascadeStep({ level: 3, col: 0, dir: -1 }, 7), { level: 2, col: 0, dir: -1 });
});
test('off the bottom level it is gone', () => {
  assert.equal(cascadeStep({ level: 0, col: 6, dir: 1 }, 7), null);
});
test('a full fall from the top always eventually disappears, never loops', () => {
  let croc = { level: 4, col: 0, dir: 1 };
  let steps = 0;
  while (croc && steps < 500) { croc = cascadeStep(croc, 7); steps++; }
  assert.ok(steps < 500, 'it terminates');
  assert.equal(croc, null);
});
