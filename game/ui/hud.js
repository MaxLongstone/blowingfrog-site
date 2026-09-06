// DOM heads-up display layered over the canvas.
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

export class Hud {
  constructor(root) {
    this.root = root;
    this.node = el('div', 'bf-hud');
    this.left = el('div', 'bf-hud-left');
    this.stage = el('div', 'bf-stage-name');
    this.sub = el('div', 'bf-stage-sub');
    this.left.append(this.stage, this.sub);

    this.mid = el('div', 'bf-hud-mid');
    this.fuseWrap = el('div', 'bf-fuse');
    this.fusePips = [];
    for (let i = 0; i < 5; i++) { const p = el('span', 'bf-pip'); this.fusePips.push(p); this.fuseWrap.append(p); }
    this.fuseLabel = el('div', 'bf-fuse-label', 'FUSE');
    this.mid.append(this.fuseLabel, this.fuseWrap);

    this.right = el('div', 'bf-hud-right');
    this.livesEl = el('div', 'bf-lives');
    this.scoreEl = el('div', 'bf-score', '0');
    this.right.append(this.livesEl, this.scoreEl);

    this.node.append(this.left, this.mid, this.right);
    root.append(this.node);
    this.toast = el('div', 'bf-toast');
    root.append(this.toast);
    this._toastTimer = null;
  }
  setStage(name, sub) { this.stage.textContent = name; this.sub.textContent = sub || ''; }
  setFuse(n) {
    this.fusePips.forEach((p, i) => p.classList.toggle('on', i < n));
    this.fuseWrap.classList.toggle('full', n >= 5);
    this.fuseLabel.textContent = n >= 5 ? 'GO! REACH THE TOP' : 'FUSE';
  }
  setLives(n, kaiju) {
    this.livesEl.innerHTML = '';
    this.livesEl.classList.toggle('hearts', !!kaiju);
    for (let i = 0; i < Math.max(0, n); i++) this.livesEl.append(el('span', 'bf-life', kaiju ? '♥' : '🐸'));
  }
  setScore(n) { this.scoreEl.textContent = String(n).padStart(6, '0'); }
  say(msg, ms = 1400) {
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('show'), ms);
  }
  show(v) { this.node.style.opacity = v ? '1' : '0'; }
  destroy() { this.node.remove(); this.toast.remove(); }
}
