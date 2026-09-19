import test from 'node:test';
import assert from 'node:assert/strict';
import { KINDS, PRINCE, MOD, FIGHTS, EVENTS } from '../config/comments.js';
import { pickKind, eventPool } from '../ui/livechat.js';
import { BOSSES } from '../config/bosses.js';

const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; };

test('every kind of chatter has handles, lines, and a positive weight', () => {
  for (const [name, k] of Object.entries(KINDS)) {
    assert.ok(k.weight > 0 && k.handles.length >= 3 && k.lines.length >= 3, name);
    for (const l of k.lines) assert.ok(typeof l === 'string' && l.length > 0 && l.length <= 200, `${name}: ${l}`);
  }
});
test('the chat has the crowd that was asked for', () => {
  for (const kind of ['fan', 'kermit', 'reaper', 'sweary', 'skeptic', 'troll', 'spam', 'scam']) assert.ok(KINDS[kind], kind);
  assert.ok(PRINCE.lines.length >= 5, 'the prince keeps coming back');
});
test('no line is said twice within one kind, and handles do not repeat between kinds', () => {
  const seen = new Set();
  for (const [, k] of Object.entries(KINDS)) {
    assert.equal(new Set(k.lines).size, k.lines.length);
    for (const h of k.handles) { assert.ok(!seen.has(h), h); seen.add(h); }
  }
});
test('fights are real back-and-forths between at least two people', () => {
  assert.ok(FIGHTS.length >= 5);
  for (const f of FIGHTS) {
    assert.ok(f.length >= 4);
    assert.ok(new Set(f.map(([u]) => u)).size >= 2);
    for (const [u, t] of f) assert.ok(u && t);
  }
});
test('the moderator is only ever the moderator', () => {
  assert.ok(MOD.lines.length && MOD.bans.length);
  assert.ok(FIGHTS.some((f) => f.some(([u]) => u === MOD.handle)));
});
test('weighted picking follows the weights and always returns a real kind', () => {
  assert.ok(KINDS[pickKind(KINDS, seq(0, 0.5, 0.999999))]);
  const counts = {};
  let n = 0; const rng = () => (n = (n * 1103515245 + 12345 + 1) % 2147483648) / 2147483648;
  for (let i = 0; i < 4000; i++) { const k = pickKind(KINDS, rng); counts[k] = (counts[k] || 0) + 1; }
  assert.ok(counts.romance < counts.troll, 'rarer kinds come up less');
});
test('every game event and every boss has something for the chat to say', () => {
  for (const ev of ['death', 'clear', 'bossLose', 'achievement', 'stageStart']) assert.ok(eventPool(EVENTS, ev).length >= 3, ev);
  for (const b of BOSSES) {
    assert.ok(eventPool(EVENTS, 'bossStart', b.id).length > eventPool(EVENTS, 'bossStart', 'nope').length, `${b.id} has its own start lines`);
    assert.ok(eventPool(EVENTS, 'bossWin', b.id).length > eventPool(EVENTS, 'bossWin', 'nope').length, `${b.id} has its own win lines`);
  }
  for (const tier of [1, 2, 3, 4]) assert.ok(eventPool(EVENTS, 'ad', tier).length > eventPool(EVENTS, 'ad', 9).length, `tier ${tier}`);
  assert.deepEqual(eventPool(EVENTS, 'nonsense'), []);
});
