import test from 'node:test';
import assert from 'node:assert/strict';
import { hopTarget, jumpTarget, jumpArc, sizeAfterHit, patrolStep, contactVerdict, popOut, twinkleRate, crocArc } from '../systems/hiddenrules.js';

// columns:   0  1  2   3   4  5  6
const level = { cols: 7, heights: [0, 0, 1, -1, 0, 3, 0] };

test('a hop steps onto level ground, up one block, or down any drop', () => {
  assert.deepEqual(hopTarget(level, 0, 'right'), { kind: 'move', col: 1 });
  assert.deepEqual(hopTarget(level, 1, 'right'), { kind: 'move', col: 2 }, 'up one');
  assert.deepEqual(hopTarget(level, 5, 'right'), { kind: 'move', col: 6 }, 'down three');
});
test('a hop into a gap falls, into a tall wall is blocked, off the map is blocked', () => {
  assert.deepEqual(hopTarget(level, 2, 'right'), { kind: 'fall', col: 3 });
  assert.deepEqual(hopTarget(level, 4, 'right'), { kind: 'blocked' });
  assert.deepEqual(hopTarget(level, 0, 'left'), { kind: 'blocked' });
});
test('a jump clears the column in the middle whatever is in it', () => {
  assert.deepEqual(jumpTarget(level, 2, 'right'), { kind: 'move', col: 4 }, 'over the gap');
  assert.deepEqual(jumpTarget(level, 4, 'right'), { kind: 'move', col: 6 }, 'over the tall wall');
});
test('a jump can climb to the top of a pipe three blocks up, but no higher', () => {
  const l = { cols: 5, heights: [0, 3, 3, 0, 4] };
  assert.deepEqual(jumpTarget(l, 0, 'right'), { kind: 'move', col: 2 });
  assert.deepEqual(jumpTarget({ cols: 4, heights: [0, 1, 4, 0] }, 0, 'right'), { kind: 'blocked' }, 'landing four up is too high');
});
test('jumping onto a gap falls, and off the map is blocked', () => {
  assert.equal(jumpTarget(level, 1, 'right').kind, 'fall');
  assert.equal(jumpTarget(level, 6, 'right').kind, 'blocked');
});
test('a taller obstacle gets a taller arc', () => {
  const flat = { cols: 3, heights: [0, 0, 0] }, wall = { cols: 3, heights: [0, 3, 3] };
  assert.ok(jumpArc(wall, 0, 2) > jumpArc(flat, 0, 2));
});
test('a big frog shrinks when hurt; a small one has nothing left to lose', () => {
  assert.equal(sizeAfterHit(5, 5), 1);
  assert.equal(sizeAfterHit(1, 5), 1);
});
test('a walker turns around at either end of its patrol', () => {
  assert.deepEqual(patrolStep(3, 1, [1, 3], 1, 0.1), { x: 3, dir: -1 });
  assert.deepEqual(patrolStep(1, -1, [1, 3], 1, 0.1), { x: 1, dir: 1 });
  const mid = patrolStep(2, 1, [1, 3], 2, 0.25);
  assert.equal(mid.x, 2.5); assert.equal(mid.dir, 1);
});
test('landing on a foe from above is a stomp; walking into it is a touch; passing over it is nothing', () => {
  assert.equal(contactVerdict({ dx: 0.2, dEl: 0.8, falling: true }), 'stomp');
  assert.equal(contactVerdict({ dx: 0.2, dEl: 0.1, falling: false }), 'touch');
  assert.equal(contactVerdict({ dx: 0.2, dEl: 2.5, falling: true }), 'none', 'still too high');
  assert.equal(contactVerdict({ dx: 1.4, dEl: 0, falling: false }), 'none', 'too far away');
  assert.equal(contactVerdict({ dx: 0.2, dEl: 0.8, falling: false }), 'none', 'rising past it');
});
test('a pop-up foe hides, rises, waits up, and drops back', () => {
  assert.equal(popOut(0), 0);
  assert.ok(Math.abs(popOut(1.8 + 0.2) - 0.5) < 1e-9);
  assert.equal(popOut(1.8 + 0.4 + 0.5), 1);
  assert.ok(popOut(1.8 + 0.4 + 1.4 + 0.2) > 0 && popOut(1.8 + 0.4 + 1.4 + 0.2) < 1);
  assert.equal(popOut(1.8 + 0.4 + 1.4 + 0.4), 0);
});
test('the twinkle speeds up as the fuse burns', () => {
  assert.ok(twinkleRate(1) > twinkleRate(0));
});
test('a thrown croc arcs up and lands on target', () => {
  const a = { x: 10, el: 2 }, b = { x: 5, el: 0 };
  assert.deepEqual(crocArc(a, b, 0), { x: 10, el: 2 });
  assert.deepEqual(crocArc(a, b, 1), { x: 5, el: 0 });
  assert.ok(crocArc(a, b, 0.5).el > 2, 'flies higher than it started');
});
