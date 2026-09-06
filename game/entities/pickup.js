import { PICKUPS } from '../config/stages.js';

export class Pickup {
  constructor({ kind, col, row }) {
    const def = PICKUPS[kind];
    if (!def) throw new Error(`unknown pickup ${kind}`);
    this.kind = kind; this.type = def.type; this.power = def.power || null;
    this.col = col; this.row = row;
    this.alive = true;
    this.age = 0;
  }
  bounds() { return { x: this.col + 0.2, y: this.row + 0.2, w: 0.6, h: 0.6 }; }
  update(dt) { this.age += dt; }
}
