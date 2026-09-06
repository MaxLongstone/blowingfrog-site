import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, DEFAULT_MODE, readMode, writeMode, usesPaintedArt } from '../core/mode.js';

test('two modes, each with full title-card copy', () => {
  assert.deepEqual(Object.keys(MODES), ['atari', 'modern']);
  for (const m of Object.values(MODES)) {
    assert.ok(m.id && m.kicker && m.title && m.body && m.tag, m.id);
    assert.ok(m.body.length > 80, `${m.id} body should be a real paragraph`);
  }
});
test('painted art is the default now that the sprites exist', () => {
  assert.equal(DEFAULT_MODE, 'modern');
  assert.equal(usesPaintedArt('atari'), false);
  assert.equal(usesPaintedArt('modern'), true);
});
test('reads the default and ignores junk when storage is unavailable', () => {
  assert.equal(readMode(), DEFAULT_MODE);
  writeMode('nonsense');
  assert.equal(readMode(), DEFAULT_MODE);
});
