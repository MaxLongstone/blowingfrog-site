import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CAST, BOSS_LINES, stripCues } from '../config/bossvoices.js';
import { BOSSES } from '../config/bosses.js';
import { url, voiceBossLine } from '../config/media.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Bosses whose lines have been recorded. Add an id here when its five files land.
const RECORDED = [];

test('every boss has a voice in the cast and exactly five lines', () => {
  for (const b of BOSSES) {
    assert.ok(CAST[b.id], `${b.id} is in the cast`);
    assert.equal(BOSS_LINES[b.id]?.length, 5, `${b.id} has five lines`);
  }
  for (const id of ['system', 'influencer', 'pastor', 'podcaster', 'bossboss']) assert.ok(CAST[id], id);
});
test('every line opens with its accent cue, and the game strips the cues', () => {
  for (const [id, lines] of Object.entries(BOSS_LINES)) {
    for (const l of lines) {
      assert.match(l, /^\[[^\]]+\] \S/, `${id}: ${l.slice(0, 40)}`);
      const shown = stripCues(l);
      assert.ok(!shown.includes('[') && shown.length > 40, `${id}: what is shown`);
    }
    assert.equal(new Set(lines).size, 5);
  }
});
test('recorded bosses have all five files', () => {
  for (const id of RECORDED) for (let n = 1; n <= 5; n++) {
    assert.ok(existsSync(join(root, url.voice(voiceBossLine(id, n)).split('?')[0])), `${id} ${n}`);
  }
});
