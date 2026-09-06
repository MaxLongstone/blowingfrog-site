import { MOVERS } from '../config/stages.js';

// Anything that travels along a lane. Positions are in cells; x is the center.
export class Mover {
  constructor({ kind, row, dir, speed, x, behaviors = [] }) {
    const def = MOVERS[kind];
    if (!def) throw new Error(`unknown mover ${kind}`);
    this.kind = kind;
    this.def = def;
    this.row = row; this.homeRow = row;
    this.dir = dir; this.baseSpeed = speed; this.speed = speed;
    this.x = x; this.yOff = 0;
    this.w = def.w; this.h = def.h;
    this.air = !!def.air; this.harmless = !!def.harmless; this.tough = !!def.tough; this.push = !!def.push;
    this.behaviors = behaviors;
    this.alive = true;
    this.squashed = false;
    this.mem = {};        // behavior scratch space
    this.warnT = 0;       // seconds of telegraph left before it lunges
    this.age = 0;
    this.dropTimer = 0;
  }
  get y() { return this.row + this.yOff; }
  bounds() {
    return { x: this.x - this.w / 2, y: this.y + 0.5 - this.h / 2, w: this.w, h: this.h };
  }
  update(dt, ctx) {
    this.age += dt;
    for (const b of this.behaviors) ctx.behaviors[b]?.(this, dt, ctx);
    this.x += this.dir * this.speed * dt;
    const margin = this.w + 1;
    if (this.x < -margin || this.x > ctx.grid.cols + margin) this.alive = false;
  }
  squash() { this.alive = false; this.squashed = true; }
}
