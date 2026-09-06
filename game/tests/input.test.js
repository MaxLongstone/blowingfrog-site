import test from 'node:test';
import assert from 'node:assert/strict';
import { keyToIntent, swipeToIntent, tapToIntent } from '../core/input.js';

test('arrow keys hop', () => {
  assert.deepEqual(keyToIntent('ArrowUp'), { type: 'hop', dir: 'up' });
  assert.deepEqual(keyToIntent('ArrowRight'), { type: 'hop', dir: 'right' });
});
test('shift snaps the tongue, space still works', () => {
  assert.deepEqual(keyToIntent('Shift'), { type: 'tongue', dir: null });
  assert.deepEqual(keyToIntent(' '), { type: 'tongue', dir: null });
});
test('wasd no longer hops', () => {
  assert.equal(keyToIntent('w'), null);
  assert.equal(keyToIntent('d'), null);
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
