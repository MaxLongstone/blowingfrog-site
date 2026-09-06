import { FUSE_TARGET, KAIJU_SIZE, POWERS } from '../config/stages.js';

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const HOP_TIME = 0.14;
export const TONGUE_TIME = 0.12;
export const TONGUE_REACH = 2;
export const FIRE_REACH = 4;
export const INVULN_TIME = 1.0;

export class Frog {
  constructor({ sizeClass = 1, lives = 5, hearts = 3, col = 6, row = 14 } = {}) {
    // col/row default to the classic 13x15 field; Play passes the live grid's center.
    this.sizeClass = sizeClass;
    this.lives = lives;
    this.hearts = hearts;
    this.maxHearts = hearts;
    this.col = col; this.row = row;
    this.startCol = col; this.startRow = row;
    this.dir = 'up';
    this.fuse = 0;
    this.hopAnim = null;  // {fromCol, fromRow, t}
    this.tongue = null;   // {cells:[{col,row}], t, dir}
    this.invuln = 0;
    this.dead = false;
    this.shield = 0;                      // battle-damage hits left
    this.powers = { invuln: 0, freeze: 0, fire: 0 };
  }

  // Timed powers only; armor and life resolve immediately.
  gainPower(name) {
    const def = POWERS[name];
    if (!def) return null;
    if (name === 'life') { if (this.act === 1) this.lives += 1; else this.hearts += 1; return 'life'; }
    if (name === 'armor') { this.shield = def.hits; return 'armor'; }
    this.powers[name] = def.duration;
    if (name === 'invuln') this.invuln = Math.max(this.invuln, def.duration);
    return name;
  }
  hasPower(name) { return (this.powers[name] || 0) > 0; }
  get frozen() { return this.powers.freeze > 0; }
  get breathingFire() { return this.powers.fire > 0; }
  get act() { return this.sizeClass >= KAIJU_SIZE ? 2 : 1; }
  isKaiju() { return this.act === 2; }
  get hopProgress() { return this.hopAnim ? Math.min(1, this.hopAnim.t / HOP_TIME) : 1; }
  get isHopping() { return !!this.hopAnim; }
  get isTonguing() { return !!this.tongue; }
  get fuseFull() { return this.fuse >= FUSE_TARGET; }

  // Visual scale factor by size class (act 1 grows within a cell, act 2 fills it).
  get scale() {
    return this.sizeClass < KAIJU_SIZE ? 0.55 + 0.12 * (this.sizeClass - 1) : 1.0;
  }

  hop(dir, grid) {
    if (this.hopAnim || this.tongue || this.dead) return false;
    const d = DIRS[dir]; if (!d) return false;
    this.dir = dir;
    const nc = this.col + d[0], nr = this.row + d[1];
    if (!grid.inside(nc, nr)) return false;
    this.hopAnim = { fromCol: this.col, fromRow: this.row, t: 0 };
    this.col = nc; this.row = nr;
    return true;
  }

  startTongue(dir) {
    if (this.hopAnim || this.tongue || this.dead) return null;
    const useDir = dir || this.dir;
    this.dir = useDir;
    const d = DIRS[useDir];
    const reach = this.breathingFire ? FIRE_REACH : TONGUE_REACH;
    const cells = [];
    for (let i = 1; i <= reach; i++) cells.push({ col: this.col + d[0] * i, row: this.row + d[1] * i });
    this.tongue = { cells, t: 0, dir: useDir };
    return this.tongue;
  }

  eat() { this.fuse = Math.min(FUSE_TARGET, this.fuse + 1); return this.fuse; }

  // Returns 'none' | 'reset' | 'hurt' | 'dead'
  takeHit() {
    if (this.invuln > 0 || this.dead) return 'none';
    if (this.shield > 0) {
      this.shield -= 1;
      this.invuln = INVULN_TIME;
      return 'shielded';
    }
    if (this.act === 1) {
      this.lives -= 1;
      if (this.lives <= 0) { this.dead = true; return 'dead'; }
      this.col = this.startCol; this.row = this.startRow; this.hopAnim = null; this.tongue = null;
      this.invuln = INVULN_TIME;
      return 'reset';
    }
    this.hearts -= 1;
    if (this.hearts <= 0) { this.dead = true; return 'dead'; }
    this.invuln = INVULN_TIME;
    return 'hurt';
  }

  grow() {
    this.sizeClass += 1;
    this.fuse = 0;
    this.hearts = this.maxHearts;
    return this.sizeClass;
  }

  // Longest-running timed power, for the HUD.
  activePower() {
    let best = null;
    for (const [name, t] of Object.entries(this.powers)) if (t > 0 && (!best || t > best.time)) best = { name, time: t };
    if (!best && this.shield > 0) return { name: 'armor', hits: this.shield };
    return best;
  }

  resetForStage() {
    this.col = this.startCol; this.row = this.startRow;
    this.fuse = 0; this.hopAnim = null; this.tongue = null; this.invuln = 0; this.dead = false;
    this.shield = 0; this.powers = { invuln: 0, freeze: 0, fire: 0 };
    this.dir = 'up';
  }

  reachedGoal() { return this.row === 0 && !this.hopAnim; }

  // Interpolated logical position in cells (col,row as floats) with hop arc height 0..1
  position() {
    if (!this.hopAnim) return { col: this.col, row: this.row, arc: 0 };
    const p = this.hopProgress;
    const e = 1 - Math.pow(1 - p, 3);
    return {
      col: this.hopAnim.fromCol + (this.col - this.hopAnim.fromCol) * e,
      row: this.hopAnim.fromRow + (this.row - this.hopAnim.fromRow) * e,
      arc: Math.sin(p * Math.PI),
    };
  }

  // Axis-aligned bounds in cells (centered on interpolated position)
  bounds(hitScale = 0.6) {
    const p = this.position();
    const s = this.act === 2 ? 0.9 : hitScale;
    return { x: p.col + 0.5 - s / 2, y: p.row + 0.5 - s / 2, w: s, h: s };
  }

  update(dt) {
    if (this.hopAnim) { this.hopAnim.t += dt; if (this.hopAnim.t >= HOP_TIME) this.hopAnim = null; }
    if (this.tongue) { this.tongue.t += dt; if (this.tongue.t >= TONGUE_TIME) this.tongue = null; }
    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    for (const k of Object.keys(this.powers)) if (this.powers[k] > 0) this.powers[k] = Math.max(0, this.powers[k] - dt);
  }
}
