// Turns keyboard, swipe and tap events into intents:
//   { type: 'hop', dir }  or  { type: 'tongue', dir }   (dir may be null = "facing")
const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
};
// Two attacks. In a stage they do the same thing, but a boss fight needs to tell
// a glove from a tongue, so they are separate intents everywhere.
const PUNCH_KEYS = ['Shift'];
const TONGUE_KEYS = [' ', 'Spacebar', 'Enter'];

export function keyToIntent(key) {
  if (PUNCH_KEYS.includes(key)) return { type: 'punch', dir: null };
  if (TONGUE_KEYS.includes(key)) return { type: 'tongue', dir: null };
  const dir = KEYS[key];
  return dir ? { type: 'hop', dir } : null;
}

export function swipeToIntent(dx, dy, threshold = 24) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (Math.max(ax, ay) < threshold) return null;
  if (ax > ay) return { type: 'hop', dir: dx > 0 ? 'right' : 'left' };
  return { type: 'hop', dir: dy > 0 ? 'down' : 'up' };
}

// A phone has one tap, so it sends `auto`: the boss fight reads that as "punch,
// unless there is a stick of dynamite worth catching instead".
export function tapToIntent(tapX, tapY, frogX, frogY) {
  const dx = tapX - frogX, dy = tapY - frogY;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return { type: 'punch', dir: null, auto: true };
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  return { type: 'punch', dir, auto: true };
}

export class Input {
  constructor(target = window, canvas = null) {
    this.target = target;
    this.canvas = canvas;
    this.handlers = [];
    this.frogScreen = { x: 0, y: 0 };
    this.enabled = true;
    this._start = null;

    this._onKey = (e) => {
      if (!this.enabled) return;
      const intent = keyToIntent(e.key);
      if (intent) { e.preventDefault(); this.emit(intent); }
    };
    this._onDown = (e) => {
      if (!this.enabled) return;
      this._start = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    this._onUp = (e) => {
      if (!this.enabled || !this._start) return;
      const dx = e.clientX - this._start.x, dy = e.clientY - this._start.y;
      const swipe = swipeToIntent(dx, dy);
      if (swipe) this.emit(swipe);
      else this.emit(tapToIntent(e.clientX, e.clientY, this.frogScreen.x, this.frogScreen.y));
      this._start = null;
    };
    target.addEventListener('keydown', this._onKey);
    const surface = canvas || target;
    surface.addEventListener('pointerdown', this._onDown);
    surface.addEventListener('pointerup', this._onUp);
  }
  setFrogScreenPos(x, y) { this.frogScreen = { x, y }; }
  onIntent(fn) { this.handlers.push(fn); return () => { this.handlers = this.handlers.filter(h => h !== fn); }; }
  emit(intent) { for (const h of this.handlers) h(intent); }
  destroy() {
    this.target.removeEventListener('keydown', this._onKey);
    const surface = this.canvas || this.target;
    surface.removeEventListener('pointerdown', this._onDown);
    surface.removeEventListener('pointerup', this._onUp);
  }
}
