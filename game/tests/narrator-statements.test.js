import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_STATEMENTS, GAME_STATEMENTS, buildYouStatements } from '../config/narrator-statements.js';

test('every fixed statement has text and a boolean isLie', () => {
  for (const s of [...WORLD_STATEMENTS, ...GAME_STATEMENTS]) {
    assert.equal(typeof s.text, 'string', s.text);
    assert.ok(s.text.length > 5);
    assert.equal(typeof s.isLie, 'boolean', s.text);
  }
});
test('the world bank has a real mix of true and false, not all one way', () => {
  const lies = WORLD_STATEMENTS.filter(s => s.isLie).length;
  const frac = lies / WORLD_STATEMENTS.length;
  assert.ok(frac > 0.3 && frac < 0.7, `${lies}/${WORLD_STATEMENTS.length} lean too far one way`);
});
test('no duplicate statement text within a bank', () => {
  for (const bank of [WORLD_STATEMENTS, GAME_STATEMENTS]) {
    assert.equal(new Set(bank.map(s => s.text)).size, bank.length);
  }
});
test('buildYouStatements: at zero stats, only the "all achievements" claim is a lie', () => {
  const stats = { deaths: 0, cleanStages: 0, midairEats: 0, squashes: 0, sessions: 1,
    daysSinceFirstSeen: 0, totalPlayMinutes: 0, best: 0, achCount: 0, achTotal: 9 };
  const out = buildYouStatements(stats);
  const lies = out.filter(s => s.isLie);
  assert.equal(lies.length, 1);
  assert.ok(lies[0].text.includes('unlocked all'));
  assert.ok(out.some(s => s.text.includes('0 times') && !s.isLie));
});
test('buildYouStatements includes the flattering lies only when they would be lies', () => {
  const allNine = buildYouStatements({ deaths: 2, cleanStages: 0, midairEats: 0, squashes: 0,
    sessions: 1, daysSinceFirstSeen: 0, totalPlayMinutes: 0, best: 0, achCount: 9, achTotal: 9 });
  assert.ok(!allNine.some(s => s.text.includes('unlocked all')), 'true at 9/9, so it must not appear as a lie');
  const short = buildYouStatements({ deaths: 2, cleanStages: 0, midairEats: 0, squashes: 0,
    sessions: 1, daysSinceFirstSeen: 0, totalPlayMinutes: 0, best: 0, achCount: 3, achTotal: 9 });
  const claim = short.find(s => s.text.includes('unlocked all'));
  assert.ok(claim && claim.isLie === true);
});
test('singular and plural phrasing agree with the count', () => {
  const out = buildYouStatements({ deaths: 1, cleanStages: 2, midairEats: 0, squashes: 0,
    sessions: 1, daysSinceFirstSeen: 1, totalPlayMinutes: 1, best: 0, achCount: 0, achTotal: 9 });
  assert.ok(out.some(s => s.text.includes('1 time.') && !s.text.includes('1 times')));
  assert.ok(out.some(s => s.text.includes('2 times')));
});
