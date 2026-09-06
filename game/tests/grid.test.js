import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid, Shake } from '../core/grid.js';

test('toPx returns cell centers', () => {
  const g = new Grid();
  assert.deepEqual(g.toPx(0, 0), { x: 32, y: 32 });
  assert.deepEqual(g.toPx(12, 14), { x: 800, y: 928 });
});
test('toCell floors pixels to cells', () => {
  assert.deepEqual(new Grid().toCell(100, 100), { col: 1, row: 1 });
});
test('clamp keeps cells inside', () => {
  assert.deepEqual(new Grid().clamp(-1, 20), { col: 0, row: 14 });
});
test('shake decays toward zero', () => {
  const s = new Shake(() => 1);
  s.add(10);
  const a = s.update(0.1);
  assert.ok(Math.abs(a.x) <= 16 && Math.abs(a.x) > 0);
  s.update(2);
  const b = s.update(0.1);
  assert.equal(b.x, 0);
});
