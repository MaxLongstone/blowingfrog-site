import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, overlaps } from '../systems/collision.js';
import { Frog } from '../entities/frog.js';
import { Mover } from '../entities/mover.js';
import { Projectile } from '../entities/projectile.js';
import { Pickup } from '../entities/pickup.js';

const frogAt = (col, row, sizeClass = 1) => new Frog({ col, row, sizeClass });
const moverOn = (kind, col, row) => new Mover({ kind, row, dir: 1, speed: 1, x: col + 0.5 });

test('overlaps is a plain AABB test', () => {
  assert.ok(overlaps({ x: 0, y: 0, w: 1, h: 1 }, { x: 0.5, y: 0.5, w: 1, h: 1 }));
  assert.ok(!overlaps({ x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 }));
});
test('pickups: explosive eats, food scores, distant is none', () => {
  const f = frogAt(3, 5);
  assert.equal(resolve(f, new Pickup({ kind: 'dynamite', col: 3, row: 5 })), 'eat');
  assert.equal(resolve(f, new Pickup({ kind: 'food', col: 3, row: 5 })), 'food');
  assert.equal(resolve(f, new Pickup({ kind: 'dynamite', col: 4, row: 5 })), 'none');
});
test('tongue grabs a pickup two cells away', () => {
  const f = frogAt(3, 5);
  const t = f.startTongue('up');
  assert.equal(resolve(f, new Pickup({ kind: 'mine', col: 3, row: 3 }), { tongueCells: t.cells }), 'eat');
});
test('act 1 movers damage, harmless ones do not, invulnerable ignores', () => {
  const f = frogAt(3, 5);
  assert.equal(resolve(f, moverOn('robotaxi', 3, 5)), 'damage');
  assert.equal(resolve(f, moverOn('newsdrone', 3, 5)), 'none');
  assert.equal(resolve(f, moverOn('robotaxi', 3, 5), { invulnerable: true }), 'none');
  assert.equal(resolve(f, moverOn('robotaxi', 8, 5)), 'none');
});
test('kaiju squashes ground, is hurt by air and tough, ignores harmless air, is pushed by hurricane', () => {
  const f = frogAt(3, 5, 6);
  const k = { kaiju: true };
  assert.equal(resolve(f, moverOn('tank', 3, 5), k), 'squash');
  assert.equal(resolve(f, moverOn('tubeman', 3, 5), k), 'squash');
  assert.equal(resolve(f, moverOn('jet', 3, 5), k), 'damage');
  assert.equal(resolve(f, moverOn('chef', 3, 5), k), 'damage');
  assert.equal(resolve(f, moverOn('newsdrone', 3, 5), k), 'none');
  assert.equal(resolve(f, moverOn('hurricane', 3, 5), k), 'push');
});
test('explosive projectiles are eaten by the tongue, otherwise damage', () => {
  const f = frogAt(3, 5, 6);
  const t = f.startTongue('up');
  const missileAhead = new Projectile({ kind: 'missile', x: 3.5, y: 3.5, vy: 1 });
  assert.equal(resolve(f, missileAhead, { tongueCells: t.cells, kaiju: true }), 'eat');
  const missileOnFrog = new Projectile({ kind: 'missile', x: 3.5, y: 5.5, vy: 1 });
  assert.equal(resolve(f, missileOnFrog, { kaiju: true }), 'damage');
});
test('non-explosive projectiles cannot be eaten', () => {
  const f = frogAt(3, 5, 6);
  const t = f.startTongue('up');
  const bullet = new Projectile({ kind: 'bullet', x: 3.5, y: 3.5, vx: 1 });
  assert.equal(resolve(f, bullet, { tongueCells: t.cells, kaiju: true }), 'none');
  const onFrog = new Projectile({ kind: 'bullet', x: 3.5, y: 5.5, vx: 1 });
  assert.equal(resolve(f, onFrog, { kaiju: true }), 'damage');
});
test('telegraphed strikes are harmless until they fire', () => {
  const f = frogAt(3, 5, 9);
  const hand = new Projectile({ kind: 'hand', x: 3.5, y: 5.5 });
  assert.equal(resolve(f, hand, { kaiju: true }), 'none');
  hand.update(1.05, { grid: { cols: 13, rows: 15 } });
  assert.equal(resolve(f, hand, { kaiju: true }), 'damage');
  hand.update(0.5, { grid: { cols: 13, rows: 15 } });
  assert.equal(hand.alive, false);
});

test('power pickups are collected on contact and by tongue', () => {
  const f = frogAt(3, 5);
  assert.equal(resolve(f, new Pickup({ kind: 'pw_fire', col: 3, row: 5 })), 'power');
  const t = f.startTongue('up');
  assert.equal(resolve(f, new Pickup({ kind: 'pw_life', col: 3, row: 3 }), { tongueCells: t.cells }), 'power');
});
test('fire breath burns whatever the tongue reaches, explosives still feed the fuse', () => {
  const f = frogAt(3, 5, 6);
  const t = f.startTongue('up');
  const ctx = { tongueCells: t.cells, kaiju: true, fire: true };
  assert.equal(resolve(f, moverOn('jet', 3, 3), ctx), 'burn', 'burns an air mover out of reach of a squash');
  assert.equal(resolve(f, new Projectile({ kind: 'bullet', x: 3.5, y: 3.5, vx: 1 }), ctx), 'burn');
  assert.equal(resolve(f, new Projectile({ kind: 'missile', x: 3.5, y: 3.5, vy: 1 }), ctx), 'eat');
});
test('without fire the tongue does not burn', () => {
  const f = frogAt(3, 5, 6);
  const t = f.startTongue('up');
  assert.equal(resolve(f, moverOn('jet', 3, 3), { tongueCells: t.cells, kaiju: true }), 'none');
});
