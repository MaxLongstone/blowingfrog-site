// Scheduling for the three new interrupters (the Preacher, the Podcaster, the
// Boss's Boss). The Influencer keeps her own system (systems/influencer.js); this
// one arbitrates the newer three so they share the single ad slot sensibly:
// unlock by the boss that was beaten, a guaranteed first appearance, up to two a
// stage, and never closer together than the gap.
import { INTERRUPTERS } from '../config/interrupters.js';

const GAP = 20;                 // seconds between any two of these in one stage
const MAX_PER_STAGE = 2;
const CHANCE = 0.4;
const WINDOW = [10, 35];

// One character's own memory: how many times seen (which is also their tier,
// capped at 4), and the last line picked per tier so it is never repeated back
// to back.
export class InterrupterSchedule {
  constructor(id, { rng = Math.random } = {}) {
    this.id = id; this.rng = rng;
    this.cfg = INTERRUPTERS[id];
    this.timesSeen = 0;
    this.lastLine = {};
  }
  get nextTier() { return Math.min(4, this.timesSeen + 1); }
  pickLine(tier) {
    const lines = this.cfg.tiers[tier - 1];
    let i = Math.floor(this.rng() * lines.length);
    if (lines.length > 1 && i === this.lastLine[tier]) i = (i + 1) % lines.length;
    this.lastLine[tier] = i;
    return i;
  }
  // Called the moment this character is actually shown.
  show() {
    const tier = this.nextTier;
    const index = this.pickLine(tier);
    this.timesSeen += 1;
    return { id: this.id, tier, index };
  }
}

export class InterrupterManager {
  constructor({ rng = Math.random, gap = GAP, maxPerStage = MAX_PER_STAGE, chance = CHANCE, window = WINDOW } = {}) {
    this.rng = rng; this.gap = gap; this.maxPerStage = maxPerStage; this.chance = chance; this.window = window;
    this.schedules = Object.fromEntries(Object.keys(INTERRUPTERS).map((id) => [id, new InterrupterSchedule(id, { rng })]));
    this.unlocked = new Set();
    this.pending = null; this.elapsed = 0; this.stageCount = 0; this.sinceLast = Infinity;
  }

  // A boss went down: whoever unlocks after it joins the roster.
  unlock(bossId) {
    for (const [id, cfg] of Object.entries(INTERRUPTERS)) if (cfg.unlocksAfter === bossId) this.unlocked.add(id);
  }

  roll() { return this.window[0] + this.rng() * (this.window[1] - this.window[0]); }

  // Called when an ordinary stage begins.
  arm() {
    this.pending = null; this.elapsed = 0; this.stageCount = 0; this.sinceLast = Infinity;
    if (!this.unlocked.size) return;
    // Whoever has never been seen gets a guaranteed appearance the first
    // ordinary stage after they unlock, so the player actually meets them.
    const unmet = [...this.unlocked].filter((id) => this.schedules[id].timesSeen === 0);
    const pool = unmet.length ? unmet : (this.rng() < this.chance ? [...this.unlocked] : []);
    if (pool.length) this.pending = { id: pool[Math.floor(this.rng() * pool.length)], at: this.roll() };
  }

  tick(dt, canFire = true) {
    this.elapsed += dt;
    this.sinceLast += dt;
    if (!this.pending || this.elapsed < this.pending.at) return null;
    if (!canFire || this.sinceLast < this.gap) return null;
    const { id } = this.pending;
    this.pending = null;
    this.stageCount += 1;
    this.sinceLast = 0;
    const result = this.schedules[id].show();
    if (this.stageCount < this.maxPerStage && this.unlocked.size && this.rng() < this.chance) {
      const id2 = [...this.unlocked][Math.floor(this.rng() * this.unlocked.size)];
      this.pending = { id: id2, at: this.elapsed + this.gap + this.roll() };
    }
    return result;
  }
}
