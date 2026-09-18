// When the Influencer interrupts. Pure scheduling logic, no DOM or audio, so it
// can be tested: each stage rolls once for whether she shows up and how many
// seconds in, then waits for a moment when nobody else is talking.
import { INFLUENCER, tierForStage } from '../config/influencer.js';

export class InfluencerSchedule {
  constructor({ rng = Math.random, chance = 0.4, earliest = 10, latest = 35 } = {}) {
    this.rng = rng; this.chance = chance; this.earliest = earliest; this.latest = latest;
    this.tier = 1; this.at = null; this.elapsed = 0;
    this.seen = [new Set(), new Set(), new Set(), new Set()];
    this.last = null;                     // { tier, index }, never repeated back to back
  }

  // Called when an ordinary stage begins.
  arm(stageId) {
    this.tier = tierForStage(stageId);
    this.elapsed = 0;
    this.at = this.rng() < this.chance ? this.earliest + this.rng() * (this.latest - this.earliest) : null;
  }

  cancel() { this.at = null; }
  get armed() { return this.at !== null; }

  // Advance by dt seconds of real play. Returns { tier, index } the moment she
  // should appear, otherwise null. `canFire` is false while something else
  // owns the moment; she just waits a little longer.
  tick(dt, canFire = true) {
    if (this.at === null) return null;
    this.elapsed += dt;
    if (this.elapsed < this.at) return null;
    if (!canFire) return null;
    this.at = null;
    return this.pick();
  }

  // A line she hasn't said yet this session, and never the same one twice in a row.
  pick() {
    const tier = this.tier;
    const count = INFLUENCER.tiers[tier - 1].lines.length;
    let pool = [...Array(count).keys()].filter((i) => !this.seen[tier - 1].has(i));
    if (!pool.length) { this.seen[tier - 1].clear(); pool = [...Array(count).keys()]; }
    if (pool.length > 1 && this.last?.tier === tier) pool = pool.filter((i) => i !== this.last.index);
    const index = pool[Math.floor(this.rng() * pool.length)];
    this.seen[tier - 1].add(index);
    this.last = { tier, index };
    return { tier, index };
  }
}
