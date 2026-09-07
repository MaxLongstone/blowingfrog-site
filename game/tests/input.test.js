import test from 'node:test';
import assert from 'node:assert/strict';
import { keyToIntent, swipeToIntent, tapToIntent } from '../core/input.js';

test('arrow keys hop', () => {
  assert.deepEqual(keyToIntent('ArrowUp'), { type: 'hop', dir: 'up' });
  assert.deepEqual(keyToIntent('ArrowRight'), { type: 'hop', dir: 'right' });
});
test('shift punches and space licks, as separate intents', () => {
  assert.deepEqual(keyToIntent('Shift'), { type: 'punch', dir: null });
  assert.deepEqual(keyToIntent(' '), { type: 'tongue', dir: null });
  assert.deepEqual(keyToIntent('Enter'), { type: 'tongue', dir: null });
});
test('a tap is a punch that may fall back to a lick', () => {
  const t = tapToIntent(100, 50, 50, 50);
  assert.equal(t.type, 'punch');
  assert.equal(t.auto, true);
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
test('tap still reports which way it was aimed', () => {
  assert.equal(tapToIntent(100, 50, 50, 50).dir, 'right');
  assert.equal(tapToIntent(50, 0, 50, 50).dir, 'up');
});
