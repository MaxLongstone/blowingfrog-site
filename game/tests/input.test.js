import test from 'node:test';
import assert from 'node:assert/strict';
import { keyToIntent, swipeToIntent, tapToIntent } from '../core/input.js';

test('arrow and wasd keys hop', () => {
  assert.deepEqual(keyToIntent('ArrowUp'), { type: 'hop', dir: 'up' });
  assert.deepEqual(keyToIntent('w'), { type: 'hop', dir: 'up' });
  assert.deepEqual(keyToIntent('d'), { type: 'hop', dir: 'right' });
});
test('space is tongue in facing direction', () => {
  assert.deepEqual(keyToIntent(' '), { type: 'tongue', dir: null });
});
test('unknown keys are null', () => { assert.equal(keyToIntent('q'), null); });
test('swipes map to hops, tiny moves are null', () => {
  assert.deepEqual(swipeToIntent(5, -40), { type: 'hop', dir: 'up' });
  assert.deepEqual(swipeToIntent(50, 10), { type: 'hop', dir: 'right' });
  assert.equal(swipeToIntent(3, 4), null);
});
test('tap aims tongue toward tap relative to frog', () => {
  assert.deepEqual(tapToIntent(100, 50, 50, 50), { type: 'tongue', dir: 'right' });
  assert.deepEqual(tapToIntent(50, 0, 50, 50), { type: 'tongue', dir: 'up' });
});
