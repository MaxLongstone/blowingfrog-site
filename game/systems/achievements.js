// Tracks cumulative counters, unlocks achievements, and persists both.
// Storage is best-effort: a private window just means nothing is remembered.
import { ACHIEVEMENTS, COUNTER_KEYS } from '../config/achievements.js';

const KEY = 'bf-game-achievements';

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      unlocked: Array.isArray(raw.unlocked) ? raw.unlocked : [],
      counts: raw.counts && typeof raw.counts === 'object' ? raw.counts : {},
    };
  } catch { return { unlocked: [], counts: {} }; }
}

export class Achievements {
  constructor() {
    const saved = load();
    this.unlocked = new Set(saved.unlocked);
    this.counts = {};
    for (const k of COUNTER_KEYS) this.counts[k] = Number(saved.counts[k]) || 0;
    this.listeners = [];
  }

  onUnlock(fn) { this.listeners.push(fn); return this; }

  has(id) { return this.unlocked.has(id); }
  get total() { return ACHIEVEMENTS.length; }
  get count() { return this.unlocked.size; }

  // Every achievement is driven by a counter, so one entry point covers them all.
  bump(key, n = 1) {
    if (!COUNTER_KEYS.includes(key)) return;
    this.counts[key] += n;
    this.evaluate();
  }

  evaluate() {
    let changed = false;
    for (const a of ACHIEVEMENTS) {
      if (this.unlocked.has(a.id)) continue;
      let ok = false;
      try { ok = !!a.test(this.counts); } catch { ok = false; }
      if (!ok) continue;
      this.unlocked.add(a.id);
      changed = true;
      for (const fn of this.listeners) fn(a);
    }
    if (changed) this.save();
    else this.save();
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        unlocked: [...this.unlocked], counts: this.counts,
      }));
    } catch { /* storage unavailable */ }
  }

  reset() {
    this.unlocked.clear();
    for (const k of COUNTER_KEYS) this.counts[k] = 0;
    this.save();
  }

  list() {
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: this.unlocked.has(a.id) }));
  }

  shareText(best = 0) {
    const got = ACHIEVEMENTS.filter(a => this.unlocked.has(a.id));
    const lines = got.map(a => `${a.emoji} ${a.title}`);
    const head = `FROGPOCALYPSE — ${got.length}/${ACHIEVEMENTS.length} achievements`;
    const tail = best ? `Best score ${String(best).padStart(6, '0')}.` : '';
    return [head, ...lines, tail].filter(Boolean).join('\n');
  }
}
