import test from 'node:test';
import assert from 'node:assert/strict';
import { socialTargets } from '../ui/sharecard.js';

const TEXT = 'FROGPOCALYPSE — 4/9 achievements\n🐸 BARELY SENTIENT';
const URL_ = 'https://blowingfrog.com/play';

test('offers four web share targets', () => {
  const t = socialTargets(TEXT, URL_);
  assert.deepEqual(t.map(x => x.id), ['facebook', 'x', 'whatsapp', 'reddit']);
  for (const x of t) assert.ok(x.label && x.href.startsWith('https://'), x.id);
});
test('text and url are encoded, so newlines and emoji survive', () => {
  const t = socialTargets(TEXT, URL_);
  for (const x of t) {
    assert.doesNotMatch(x.href, /\n/, `${x.id} must not contain a raw newline`);
    assert.doesNotMatch(x.href, / /, `${x.id} must not contain a raw space`);
  }
  const fb = t.find(x => x.id === 'facebook');
  assert.match(fb.href, /u=https%3A%2F%2Fblowingfrog\.com%2Fplay/);
});
test('whatsapp puts the text and link in one message', () => {
  const wa = socialTargets(TEXT, URL_).find(x => x.id === 'whatsapp');
  assert.match(wa.href, /^https:\/\/wa\.me\/\?text=/);
  assert.ok(decodeURIComponent(wa.href.split('text=')[1]).includes(URL_));
});
