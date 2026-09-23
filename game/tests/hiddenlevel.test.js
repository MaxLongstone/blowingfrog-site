import test from 'node:test';
import assert from 'node:assert/strict';
import { HIDDEN, buildHeights } from '../config/hiddenlevel.js';
import { hopTarget, jumpTarget } from '../systems/hiddenrules.js';

const level = { cols: HIDDEN.cols, heights: buildHeights() };

test('the level has the seven bosses, each with a distinct way of attacking', () => {
  const kinds = new Set(HIDDEN.foes.map((f) => f.type));
  for (const t of ['chaco', 'landlord', 'walker', 'umma', 'ghost', 'narrator', 'ufo']) assert.ok(kinds.has(t), t);
  assert.equal(new Set(HIDDEN.foes.map((f) => f.id)).size, HIDDEN.foes.length);
});
test('walkers patrol flat ground only', () => {
  for (const f of HIDDEN.foes.filter((x) => x.range && ['walker', 'landlord'].includes(x.type))) {
    const hs = new Set(); for (let c = f.range[0]; c <= f.range[1]; c++) hs.add(level.heights[c]);
    assert.equal(hs.size, 1, f.id + ' patrols one height');
    assert.ok(!hs.has(-1), f.id + ' patrols solid ground');
  }
});
test('every pipe is wider than one column and taller than a hop can climb', () => {
  for (const p of HIDDEN.pipes) { assert.ok(p.w >= 2); assert.ok(p.h >= 2); }
});
test('piranha pipes exist for every pop-up foe', () => {
  for (const f of HIDDEN.foes.filter((x) => x.type === 'chaco')) assert.ok(HIDDEN.pipes[f.pipe], f.id);
});
test('pickups stand on solid ground, inside the level, before the goal', () => {
  for (const list of [HIDDEN.tnt, HIDDEN.beaker, HIDDEN.nuke, HIDDEN.burgers]) {
    for (const p of list) { assert.ok(p.col > 0 && p.col < HIDDEN.goalCol, p.col); assert.ok(level.heights[p.col] >= 0, 'not on a gap: ' + p.col); }
  }
});
test('the level can actually be finished: every gap and every wall has a way past', () => {
  // walk it with the same rules the player has, preferring a jump whenever a hop is not enough
  let col = HIDDEN.startCol, guard = 0;
  while (col < HIDDEN.goalCol && guard++ < 500) {
    const hop = hopTarget(level, col, 'right');
    if (hop.kind === 'move') { col = hop.col; continue; }
    const jump = jumpTarget(level, col, 'right');
    assert.equal(jump.kind, 'move', 'stuck at column ' + col);
    col = jump.col;
  }
  assert.ok(col >= HIDDEN.goalCol);
});
test('the goal is past everything else', () => {
  assert.ok(HIDDEN.goalCol > Math.max(...HIDDEN.blocks.map((b) => b.col)));
});
