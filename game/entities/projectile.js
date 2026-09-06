import { PROJECTILES } from '../config/stages.js';

// Free-moving hazards. explosive ones can be eaten by the tongue.
// 'above' projectiles (laser, hand) telegraph for def.warn seconds, then strike for def.active.
export class Projectile {
  constructor({ kind, x, y, vx = 0, vy = 0, ttl = 8 }) {
    const def = PROJECTILES[kind];
    if (!def) throw new Error(`unknown projectile ${kind}`);
    this.kind = kind; this.def = def;
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.w = def.w; this.h = def.h;
    this.explosive = !!def.explosive;
    this.ttl = ttl;
    this.warn = def.warn || 0;
    this.active = def.active || Infinity;
    this.age = 0;
    this.alive = true;
    this.eaten = false;
  }
  get telegraphing() { return this.age < this.warn; }
  get striking() { return this.age >= this.warn && this.age < this.warn + this.active; }
  get dangerous() { return this.warn ? this.striking : true; }
  bounds() { return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h }; }
  update(dt, ctx) {
    this.age += dt;
    if (!this.telegraphing) { this.x += this.vx * dt; this.y += this.vy * dt; }
    if (this.warn && this.age >= this.warn + this.active) this.alive = false;
    if (this.age > this.ttl) this.alive = false;
    const g = ctx.grid;
    if (this.x < -3 || this.x > g.cols + 3 || this.y < -3 || this.y > g.rows + 3) this.alive = false;
  }
}
