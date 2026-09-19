// The live comment section under the game: a fake stream chat that starts once
// the first boss is down and never stops being a distraction. It reacts to what
// happens in the game (deaths, bosses, the Influencer) and otherwise talks to
// itself. Everything it shows is set with textContent, never HTML.
import { KINDS, PRINCE, MOD, FIGHTS, EVENTS } from '../config/comments.js';

const KEEP = 60;                 // rows held in the panel
const REMEMBER = 45;             // lines not repeated until this many others have gone by
const HIDDEN_KEY = 'bf-chat-hidden';

// Pure helpers, split out so they can be tested without a page.
export function pickKind(kinds, rng) {
  const entries = Object.entries(kinds);
  const total = entries.reduce((n, [, k]) => n + k.weight, 0);
  let r = rng() * total;
  for (const [name, k] of entries) { r -= k.weight; if (r < 0) return name; }
  return entries[entries.length - 1][0];
}

// The lines the chat has for one kind of event. `detail` narrows it (a boss id, a tier).
export function eventPool(events, kind, detail = null) {
  const e = events[kind];
  if (!e) return [];
  if (Array.isArray(e)) return e;
  const specific = e[detail] || [];
  return [...specific, ...specific, ...(e.default || [])];      // the specific ones count double
}

const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 360; };
const rand = (rng, lo, hi) => lo + rng() * (hi - lo);
const between = (rng, list) => list[Math.floor(rng() * list.length)];

export class LiveChat {
  constructor({ el, rng = Math.random }) {
    this.el = el; this.rng = rng;
    this.on = false;
    this.timers = new Set();
    this.recent = [];
    this.princeAt = 0; this.modAt = 0;
    this.viewers = 8000 + Math.floor(rng() * 6000);

    this.head = document.createElement('div'); this.head.className = 'lc-head';
    const live = document.createElement('b'); live.className = 'lc-live'; live.textContent = 'LIVE';
    this.count = document.createElement('span'); this.count.className = 'lc-count';
    this.title = document.createElement('span'); this.title.className = 'lc-title'; this.title.textContent = 'CHAT';
    this.toggle = document.createElement('button');
    this.toggle.type = 'button'; this.toggle.className = 'lc-toggle';
    this.toggle.addEventListener('click', () => this.setHidden(!this.hidden));
    this.head.append(live, this.count, this.title, this.toggle);
    this.list = document.createElement('div'); this.list.className = 'lc-list';
    this.el.replaceChildren(this.head, this.list);
    try { this.hidden = localStorage.getItem(HIDDEN_KEY) === '1'; } catch { this.hidden = false; }
    this.paint();
  }

  // ---- lifecycle --------------------------------------------------------
  enable() {
    if (this.on) return;
    this.on = true;
    this.list.replaceChildren();
    document.body.classList.add('chat-on');
    this.paint();
    this.refit();
    this.system('Welcome to chat. Be nice. (Nobody will be nice.)');
    this.later(600, () => this.chatter());
    this.later(1500, () => this.chatter());
    this.schedule();
    this.viewerLoop();
  }

  disable() {
    if (!this.on) return;
    this.on = false;
    this.timers.forEach(clearTimeout); this.timers.clear();
    document.body.classList.remove('chat-on');
    this.list.replaceChildren();
    this.refit();
  }

  setHidden(v) {
    this.hidden = v;
    try { localStorage.setItem(HIDDEN_KEY, v ? '1' : '0'); } catch { /* private mode */ }
    this.paint(); this.refit();
  }

  paint() {
    this.el.classList.toggle('collapsed', this.hidden);
    this.toggle.textContent = this.hidden ? 'SHOW' : 'HIDE';
    this.count.textContent = `${this.viewers.toLocaleString('en-US')} watching`;
  }

  // The game sizes itself around the panel, so tell it when the panel changes.
  refit() { window.dispatchEvent(new Event('resize')); }

  later(ms, fn) {
    const id = setTimeout(() => { this.timers.delete(id); if (this.on) fn(); }, ms);
    this.timers.add(id);
  }

  // ---- the stream of talk -----------------------------------------------
  schedule() {
    this.later(rand(this.rng, 1300, 3300), () => { this.tick(); this.schedule(); });
  }

  viewerLoop() {
    this.later(3000, () => {
      this.viewers = Math.max(1200, this.viewers + Math.round((this.rng() - 0.42) * 260));
      this.count.textContent = `${this.viewers.toLocaleString('en-US')} watching`;
      this.viewerLoop();
    });
  }

  tick() {
    const r = this.rng();
    if (r < 0.09) this.fight();
    else if (r < 0.15) this.prince();
    else if (r < 0.20) this.mod();
    else if (r < 0.24) this.system(between(this.rng, MOD.bans));
    else this.chatter();
  }

  fresh(lines) {
    const pool = lines.filter((l) => !this.recent.includes(l));
    const line = between(this.rng, pool.length ? pool : lines);
    this.recent.push(line);
    if (this.recent.length > REMEMBER) this.recent.shift();
    return line;
  }

  chatter() {
    const kind = KINDS[pickKind(KINDS, this.rng)];
    this.post({ u: between(this.rng, kind.handles), t: this.fresh(kind.lines) });
  }

  prince() {
    this.post({ u: PRINCE.handle, t: PRINCE.lines[this.princeAt++ % PRINCE.lines.length], badge: PRINCE.badge });
  }

  mod() {
    this.post({ u: MOD.handle, t: MOD.lines[this.modAt++ % MOD.lines.length], badge: MOD.badge });
  }

  fight() {
    const scene = between(this.rng, FIGHTS);
    scene.forEach(([u, t], i) => this.later(i * 1500, () => {
      this.post({ u, t, badge: u === MOD.handle ? MOD.badge : u === PRINCE.handle ? PRINCE.badge : '' });
    }));
  }

  // Something happened in the game: a few people react, a beat apart.
  react(kind, detail = null) {
    if (!this.on) return;
    const pool = eventPool(EVENTS, kind, detail);
    if (!pool.length) return;
    const n = 2 + Math.floor(this.rng() * 3);
    const anyone = Object.values(KINDS).flatMap((k) => k.handles);
    for (let i = 0; i < n; i++) {
      this.later(250 + i * rand(this.rng, 350, 900), () => this.post({ u: between(this.rng, anyone), t: this.fresh(pool) }));
    }
  }

  // ---- drawing --------------------------------------------------------------
  system(text) { this.row(null, text, '', true); }
  post({ u, t, badge = '' }) { this.row(u, t, badge, false); }

  row(user, text, badge, system) {
    const row = document.createElement('div');
    row.className = system ? 'lc-row lc-sys' : 'lc-row';
    if (!system) {
      if (badge) { const b = document.createElement('em'); b.className = `lc-badge ${badge.toLowerCase()}`; b.textContent = badge; row.append(b); }
      const name = document.createElement('b');
      name.textContent = user;
      name.style.color = `hsl(${hue(user)} 72% 68%)`;
      row.append(name, document.createTextNode(' '));
    }
    const msg = document.createElement('span'); msg.textContent = text;
    row.append(msg);
    this.list.append(row);
    while (this.list.children.length > KEEP) this.list.firstChild.remove();
    this.list.scrollTop = this.list.scrollHeight;
  }
}
