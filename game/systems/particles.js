// Cheap particle pool drawn as one Graphics per frame.
export class Particles {
  constructor(container, cell = 64) {
    this.g = new PIXI.Graphics();
    container.addChild(this.g);
    this.cell = cell;
    this.items = [];
    this.max = 420;
  }
  _push(p) { if (this.items.length < this.max) this.items.push(p); }

  burst(cx, cy, color = 0xf2c53d, n = 18, speed = 220) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const s = speed * (0.4 + Math.random() * 0.8);
      this._push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, t: 0, r: 3 + Math.random() * 5, color, grav: 240, shape: 'circle' });
    }
  }
  debris(cx, cy, n = 14, color = 0x9aa0a8) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const s = 180 + Math.random() * 260;
      this._push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6 + Math.random() * 0.5, t: 0, r: 3 + Math.random() * 6, color, grav: 700, shape: 'rect', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12 });
    }
  }
  smoke(cx, cy, n = 8) {
    for (let i = 0; i < n; i++) this._push({ x: cx + (Math.random() - 0.5) * 20, y: cy, vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 50, life: 0.8 + Math.random() * 0.6, t: 0, r: 8 + Math.random() * 12, color: 0x8a8a90, grav: -20, shape: 'circle', fade: 0.4 });
  }
  ring(cx, cy, color = 0xffffff) {
    this._push({ x: cx, y: cy, vx: 0, vy: 0, life: 0.45, t: 0, r: 8, color, grav: 0, shape: 'ring', grow: 460 });
  }
  spark(cx, cy, color = 0xf2c53d, n = 6) { this.burst(cx, cy, color, n, 120); }

  update(dt) {
    const g = this.g; g.clear();
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.t += dt;
      if (p.t >= p.life) { this.items.splice(i, 1); continue; }
      p.vy += (p.grav || 0) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.vr) p.rot += p.vr * dt;
      const k = 1 - p.t / p.life;
      const alpha = (p.fade ? p.fade : 1) * k;
      if (p.shape === 'ring') {
        g.circle(p.x, p.y, p.r + (1 - k) * (p.grow || 300) * 0.5).stroke({ width: 3 * k + 0.5, color: p.color, alpha });
      } else if (p.shape === 'rect') {
        const s = p.r * k;
        g.rect(p.x - s, p.y - s, s * 2, s * 2).fill({ color: p.color, alpha });
      } else {
        g.circle(p.x, p.y, p.r * k).fill({ color: p.color, alpha });
      }
    }
  }
  clear() { this.items.length = 0; this.g.clear(); }
}
