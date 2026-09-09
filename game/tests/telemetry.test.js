import test from 'node:test';
import assert from 'node:assert/strict';

// Node has no localStorage; the tracker must degrade to memory only, exactly
// like Achievements does.
const { Telemetry } = await import('../systems/telemetry.js');

test('boots with sane defaults when nothing is stored', () => {
  const t = new Telemetry();
  const snap = t.snapshot();
  assert.equal(snap.sessions, 1);
  assert.equal(snap.totalPlaySeconds, 0);
  assert.equal(snap.daysSinceFirstSeen, 0);
  assert.ok(snap.firstSeenAt);
});
test('tickPlay accumulates in memory even without storage', () => {
  const t = new Telemetry();
  t.tickPlay(30); t.tickPlay(45);
  const snap = t.snapshot();
  assert.equal(snap.totalPlaySeconds, 75);
  assert.equal(snap.totalPlayMinutes, 1);
});
test('title dwell is zero until markTitleShown is called', () => {
  const t = new Telemetry();
  assert.equal(t.snapshot().titleDwellSeconds, 0);
  t.markTitleShown();
  assert.equal(t.snapshot().titleDwellSeconds, 0); // no time has passed yet
});
test('save never throws even though storage is unavailable', () => {
  const t = new Telemetry();
  assert.doesNotThrow(() => t.save());
});
