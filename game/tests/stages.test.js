import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, validateStage, getStage, nextStage, FUSE_TARGET } from '../config/stages.js';

test('nine stages in order', () => {
  assert.deepEqual(STAGES.map(s => s.id), ['1', '2', '3', '4', 'K1', 'K2', 'K3', 'K4', 'K5']);
});
test('every stage validates', () => {
  for (const s of STAGES) assert.equal(validateStage(s), true, s.id);
});
test('kaiju stages are act 2 with sizeClass >= 5', () => {
  for (const s of STAGES.filter(s => s.id.startsWith('K'))) {
    assert.equal(s.act, 2); assert.ok(s.sizeClass >= 5);
  }
});
test('fuse target is 5', () => { assert.equal(FUSE_TARGET, 5); });
test('getStage and nextStage', () => {
  assert.equal(getStage('K2').name, 'KAIJU II: Downtown');
  assert.equal(nextStage('4').id, 'K1');
  assert.equal(nextStage('K5'), null);
  assert.equal(getStage('nope'), null);
});
test('validateStage rejects bad lane coverage', () => {
  const bad = { ...STAGES[0], lanes: STAGES[0].lanes.slice(1) };
  assert.throws(() => validateStage(bad), /rows 1\.\.13/);
});
