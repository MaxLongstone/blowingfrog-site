import test from 'node:test';
import assert from 'node:assert/strict';
import { Spawner, behaviors } from '../systems/spawner.js';
import { Mover } from '../entities/mover.js';
import { getStage } from '../config/stages.js';
import { Grid } from '../core/grid.js';
import { makeRng } from '../core/rng.js';

const grid = new Grid();
const ctxFor = (frog = { col: 6, row: 14, x: 6.5, y: 14.5, isKaiju: false }) => ({ frog, grid, behaviors, rng: makeRng(1), moverWidth: () => 2 });

test('seedPickups places count explosives on distinct lane cells', () => {
  const sp = new Spawner(getStage('1'), grid, makeRng(42));
  const p = sp.seedPickups();
  assert.equal(p.length, 7);
  const keys = new Set(p.map(x => `${x.col},${x.row}`));
  assert.equal(keys.size, 7);
  for (const x of p) { assert.ok(x.row >= 1 && x.row <= 13); assert.equal(x.type, 'explosive'); }
});
test('lanes spawn movers from the correct side roughly every gap seconds', () => {
  const sp = new Spawner(getStage('1'), grid, makeRng(7));
  const ctx = ctxFor();
  const seen = [];
  for (let t = 0; t < 12; t += 0.05) seen.push(...sp.update(0.05, ctx).movers);
  const row13 = seen.filter(m => m.row === 13);
  assert.ok(row13.length >= 3 && row13.length <= 6, `row 13 spawned ${row13.length}`);
  for (const m of row13) assert.ok(m.dir === 1 ? m.x < 0 : m.x > grid.cols);
});
test('attacks fire and aim at the frog column', () => {
  const sp = new Spawner(getStage('K2'), grid, makeRng(3));
  const ctx = ctxFor({ col: 4, row: 9, x: 4.5, y: 9.5, isKaiju: true });
  const shots = [];
  for (let t = 0; t < 10; t += 0.05) shots.push(...sp.update(0.05, ctx).projectiles);
  const missiles = shots.filter(s => s.kind === 'missile');
  assert.ok(missiles.length >= 2);
  for (const m of missiles) { assert.ok(Math.abs(m.x - 4.5) <= 0.61); assert.ok(m.vy > 0); assert.ok(m.explosive); }
  assert.ok(shots.some(s => s.kind === 'bullet' && !s.explosive));
});
test('flee reverses a mover away from a kaiju frog in its lane', () => {
  const m = new Mover({ kind: 'robotaxi', row: 9, dir: 1, speed: 2, x: 4.5, behaviors: ['flee'] });
  const ctx = ctxFor({ col: 6, row: 9, x: 6.5, y: 9.5, isKaiju: true });
  m.update(0.016, ctx);
  assert.equal(m.dir, -1);
  assert.ok(m.speed > 2);
});
test('flee does nothing in act 1', () => {
  const m = new Mover({ kind: 'robotaxi', row: 9, dir: 1, speed: 2, x: 4.5, behaviors: ['flee'] });
  m.update(0.016, ctxFor({ col: 6, row: 9, x: 6.5, y: 9.5, isKaiju: false }));
  assert.equal(m.dir, 1);
});
test('boost speeds a truck when the frog is ahead in its lane', () => {
  const m = new Mover({ kind: 'foodtruck', row: 9, dir: 1, speed: 2, x: 2.5, behaviors: ['boost'] });
  m.update(0.016, ctxFor({ col: 5, row: 9, x: 5.5, y: 9.5, isKaiju: false }));
  assert.ok(m.speed > 3);
});
test('movers die once they leave the grid', () => {
  const m = new Mover({ kind: 'robotaxi', row: 9, dir: 1, speed: 100, x: 12 });
  m.update(1, ctxFor());
  assert.equal(m.alive, false);
});
test('dropFrom makes food behind a food truck and bombs under a bomber', () => {
  const sp = new Spawner(getStage('K3'), grid, makeRng(5));
  const truck = new Mover({ kind: 'foodtruck', row: 9, dir: 1, speed: 1, x: 3.5 });
  const food = sp.dropFrom(truck, ctxFor());
  assert.equal(food.kind, 'food'); assert.equal(food.row, 9);
  const bomber = new Mover({ kind: 'bomber', row: 12, dir: -1, speed: 1, x: 5 });
  const bomb = sp.dropFrom(bomber, ctxFor());
  assert.equal(bomb.kind, 'bomb'); assert.ok(bomb.explosive); assert.ok(bomb.vy > 0);
});
