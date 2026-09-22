import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inBlast, powderAlpha, beamCatches, pushBackRow, laneSpeedMultiplier,
  worldFlipTransform, swappedDir, blackoutWindow,
} from '../systems/envfx.js';
import { ENV } from '../config/envfx.js';

test('the powder blast only catches something standing close to it', () => {
  assert.equal(inBlast({ x: 100, y: 100 }, { x: 105, y: 100 }), true);
  assert.equal(inBlast({ x: 100, y: 100 }, { x: 400, y: 100 }), false);
});
test('powder alpha rises, holds, then fades back to nothing', () => {
  assert.equal(powderAlpha(-1), 0);
  assert.ok(powderAlpha(0.1) > 0 && powderAlpha(0.1) < powderAlpha(0.5));
  assert.equal(powderAlpha(1), powderAlpha(2));      // flat during the hold
  assert.equal(powderAlpha(100), 0);
});

test('the beam only catches a column inside its own width', () => {
  assert.equal(beamCatches(2, 2), true);
  assert.equal(beamCatches(2, 4), true);
  assert.equal(beamCatches(2, 5), false);
  assert.equal(beamCatches(2, 1), false);
});
test('being pushed back never runs off the bottom of the road', () => {
  assert.equal(pushBackRow(5, 15), 8);
  assert.equal(pushBackRow(13, 15), 14);
  assert.equal(pushBackRow(14, 15), 14);
});

test('a stamped lane is faster only while it is stamped', () => {
  assert.equal(laneSpeedMultiplier(true), 1.6);
  assert.equal(laneSpeedMultiplier(false), 1);
});

test('the mirror flip offsets by exactly one screen width, and undoes cleanly', () => {
  assert.deepEqual(worldFlipTransform(13, 64, false), { x: 0, scaleX: 1 });
  assert.deepEqual(worldFlipTransform(13, 64, true), { x: 13 * 64, scaleX: -1 });
});

test('left and right swap; nothing else does', () => {
  assert.equal(swappedDir('left'), 'right');
  assert.equal(swappedDir('right'), 'left');
  assert.equal(swappedDir('up'), 'up');
  assert.equal(swappedDir('down'), 'down');
});

test('the blackout window clamps to the road instead of running off it', () => {
  const w = blackoutWindow(10, 10, 50, 800, 900);
  assert.equal(w.x0, 0); assert.equal(w.y0, 0);
  const w2 = blackoutWindow(790, 890, 50, 800, 900);
  assert.equal(w2.x1, 800); assert.equal(w2.y1, 900);
  const w3 = blackoutWindow(400, 450, 50, 800, 900);
  assert.deepEqual(w3, { x0: 350, y0: 400, x1: 450, y1: 500 });
});

test('every boss that leads with a stage has exactly one hazard waiting in it', () => {
  for (const stage of ['2', '4', 'K1', 'K2', 'K3', 'K4', 'K5']) {
    assert.ok(ENV[stage]?.id && ENV[stage]?.boss, stage);
  }
  assert.equal(new Set(Object.values(ENV).map((e) => e.id)).size, Object.keys(ENV).length, 'no two stages share a hazard');
});
