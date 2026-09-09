// Small, honest telemetry: how long this browser has known this game, how many
// times it has been opened, how long it has been played, how long the current
// title screen has been sat on. All of it already lives in this browser and
// never leaves it; it exists so The Narrator has real numbers to use against
// the player instead of inventing them.
const KEY = 'bf-game-telemetry';
const SAVE_EVERY = 4; // seconds between writes, so we are not hitting storage every frame

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      firstSeenAt: typeof raw.firstSeenAt === 'string' ? raw.firstSeenAt : null,
      sessions: Number(raw.sessions) || 0,
      totalPlaySeconds: Number(raw.totalPlaySeconds) || 0,
    };
  } catch { return { firstSeenAt: null, sessions: 0, totalPlaySeconds: 0 }; }
}

export class Telemetry {
  constructor() {
    const saved = load();
    this.firstSeenAt = saved.firstSeenAt || new Date().toISOString();
    this.sessions = saved.sessions + 1;
    this.totalPlaySeconds = saved.totalPlaySeconds;
    this.bootAt = Date.now();
    this.titleShownAt = null;
    this._unsaved = 0;
    this.save();
  }

  markTitleShown() { this.titleShownAt = Date.now(); }

  // Called every frame while a stage or boss is actually running.
  tickPlay(dt) {
    this.totalPlaySeconds += dt;
    this._unsaved += dt;
    if (this._unsaved >= SAVE_EVERY) { this._unsaved = 0; this.save(); }
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        firstSeenAt: this.firstSeenAt,
        sessions: this.sessions,
        totalPlaySeconds: Math.round(this.totalPlaySeconds),
      }));
    } catch { /* storage unavailable */ }
  }

  // A read-only snapshot for anything that wants to quote these numbers back.
  snapshot() {
    const now = Date.now();
    const days = Math.floor((now - new Date(this.firstSeenAt).getTime()) / 86400000);
    return {
      firstSeenAt: this.firstSeenAt,
      daysSinceFirstSeen: Math.max(0, days),
      sessions: this.sessions,
      totalPlaySeconds: Math.round(this.totalPlaySeconds),
      totalPlayMinutes: Math.round(this.totalPlaySeconds / 60),
      sessionSeconds: Math.round((now - this.bootAt) / 1000),
      titleDwellSeconds: this.titleShownAt ? Math.round((now - this.titleShownAt) / 1000) : 0,
    };
  }
}
