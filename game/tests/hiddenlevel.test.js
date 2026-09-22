import test from 'node:test';
import assert from 'node:assert/strict';
import { HIDDEN } from '../config/hiddenlevel.js';

test('the hidden level has seven distinct defeated bosses patrolling it', () => {
  assert.equal(HIDDEN.enemies.length, 7);
  assert.equal(new Set(HIDDEN.enemies.map((e) => e.id)).size, 7);
  for (const e of HIDDEN.enemies) {
    assert.ok(e.range[0] <= e.range[1], e.id);
    assert.ok(e.range[1] < HIDDEN.cols, e.id);
  }
});
test('gaps and pipes never land on the same column, and never on the start or the goal', () => {
  const blocked = new Set([...HIDDEN.gaps, ...HIDDEN.pipes]);
  assert.equal(blocked.size, HIDDEN.gaps.length + HIDDEN.pipes.length, 'no column is both a gap and a pipe');
  assert.ok(!blocked.has(HIDDEN.startCol) && !blocked.has(HIDDEN.goalCol));
});
test('every pickup sits on solid ground, inside the level, before the goal', () => {
  const blocked = new Set([...HIDDEN.gaps, ...HIDDEN.pipes]);
  for (const list of [HIDDEN.tnt, HIDDEN.beaker, HIDDEN.nuke, HIDDEN.burgers]) {
    for (const p of list) {
      assert.ok(p.col >= 0 && p.col < HIDDEN.goalCol, p.col);
      assert.ok(!blocked.has(p.col), `pickup on a gap/pipe at ${p.col}`);
    }
  }
});
test('the goal is the furthest thing in the level', () => {
  const furthest = Math.max(...HIDDEN.enemies.map((e) => e.range[1]), ...HIDDEN.gaps, ...HIDDEN.pipes);
  assert.ok(HIDDEN.goalCol > furthest);
});
