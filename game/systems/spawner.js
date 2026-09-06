import { Mover } from '../entities/mover.js';
import { Projectile } from '../entities/projectile.js';
import { Pickup } from '../entities/pickup.js';
import { PROJECTILES } from '../config/stages.js';

// ---- Behaviors: (mover, dt, ctx) ----------------------------------------
// ctx: { frog:{col,row,x,y,isKaiju}, grid, time, rng }
const dist = (m, ctx) => Math.abs(m.x - ctx.frog.x);

export const behaviors = {
  // Adjacent-lane cars nudge half a cell toward the frog, then return.
  swerve(m, dt, ctx) {
    const rowDiff = ctx.frog.row - m.homeRow;
    if (!m.mem.swerve && Math.abs(rowDiff) === 1 && dist(m, ctx) < 2.5 && !m.mem.swerved) {
      m.mem.swerve = { t: 0, sign: Math.sign(rowDiff) }; m.mem.swerved = true;
    }
    if (m.mem.swerve) {
      const s = m.mem.swerve; s.t += dt;
      const k = s.t < 0.35 ? s.t / 0.35 : Math.max(0, 1 - (s.t - 0.35) / 0.35);
      m.yOff = s.sign * 0.55 * k;
      if (s.t > 0.7) { m.mem.swerve = null; m.yOff = 0; }
    }
  },
  // Drones drop a full row toward the frog when close, then climb back.
  dive(m, dt, ctx) {
    const below = ctx.frog.row - m.homeRow;
    if (!m.mem.dive && !m.mem.dived && below >= 1 && below <= 2 && dist(m, ctx) < 2.5) {
      m.mem.dive = { t: 0, sign: Math.sign(below) }; m.mem.dived = true;
    }
    if (m.mem.dive) {
      const d = m.mem.dive; d.t += dt;
      const k = d.t < 0.3 ? d.t / 0.3 : d.t < 0.9 ? 1 : Math.max(0, 1 - (d.t - 0.9) / 0.3);
      m.yOff = d.sign * 1.0 * k;
      if (d.t > 1.2) { m.mem.dive = null; m.yOff = 0; }
    }
  },
  // Trucks punch it when the frog is ahead in their lane.
  boost(m, dt, ctx) {
    m.mem.cool = Math.max(0, (m.mem.cool || 0) - dt);
    const ahead = (ctx.frog.x - m.x) * m.dir;
    if (!m.mem.boost && !m.mem.cool && ctx.frog.row === m.homeRow && ahead > 0 && ahead < 5) {
      m.mem.boost = 0.8; m.mem.cool = 3;
    }
    if (m.mem.boost) { m.mem.boost -= dt; m.speed = m.baseSpeed * 1.8; if (m.mem.boost <= 0) { m.mem.boost = 0; m.speed = m.baseSpeed; } }
  },
  // Steer toward the frog's column while crossing (ground hunters walk into the squash; tough ones are the threat).
  hunt(m, dt, ctx) {
    const towards = Math.sign(ctx.frog.x - m.x);
    if (towards !== 0 && towards !== m.dir && dist(m, ctx) < 4 && Math.abs(ctx.frog.row - m.homeRow) <= 1) {
      m.speed = Math.max(0.6, m.baseSpeed * 0.4);
    } else m.speed = m.baseSpeed;
    if (Math.abs(ctx.frog.row - m.homeRow) === 1 && dist(m, ctx) < 1.5) {
      m.yOff += Math.sign(ctx.frog.row - m.homeRow) * dt * 1.2;
      m.yOff = Math.max(-0.8, Math.min(0.8, m.yOff));
    } else m.yOff *= Math.max(0, 1 - dt * 4);
  },
  // Kaiju act: traffic reverses away from the frog and floors it.
  flee(m, dt, ctx) {
    if (!ctx.frog.isKaiju || m.mem.fled) return;
    if (ctx.frog.row === m.homeRow && dist(m, ctx) < 3) {
      m.mem.fled = true;
      m.dir = m.x < ctx.frog.x ? -1 : 1;
      m.speed = m.baseSpeed * 1.6;
    }
  },
  // Helicopters bob and pause near the frog's column to line up a shot.
  hover(m, dt, ctx) {
    m.yOff = Math.sin(m.age * 4) * 0.15;
    m.speed = dist(m, ctx) < 1.2 ? m.baseSpeed * 0.35 : m.baseSpeed;
  },
  // Heron dips its beak a row toward the frog as it passes.
  swoop(m, dt, ctx) {
    const d = ctx.frog.row - m.homeRow;
    if (!m.mem.swoop && Math.abs(d) === 1 && dist(m, ctx) < 3) m.mem.swoop = { t: 0, sign: Math.sign(d) };
    if (m.mem.swoop) {
      const s = m.mem.swoop; s.t += dt;
      m.yOff = s.sign * 0.9 * Math.sin(Math.min(1, s.t / 0.8) * Math.PI);
      if (s.t > 0.8) { m.mem.swoop = null; m.yOff = 0; }
    }
  },
};

// ---- Spawner -------------------------------------------------------------
export class Spawner {
  constructor(stage, grid, rng, { density = 1 } = {}) {
    this.stage = stage; this.grid = grid; this.rng = rng; this.density = density;
    this.laneTimers = new Map();
    for (const l of stage.lanes) if (l.kind !== 'safe') this.laneTimers.set(l.row, rng.range(0.2, l.gap));
    this.attackTimers = stage.attacks.map(a => a.every * rng.range(0.6, 1.2));
    this.time = 0;
  }

  // Place `count` explosives on distinct lane cells (rows 1..13).
  seedPickups() {
    const out = [];
    const used = new Set();
    const { count, explosive } = this.stage.pickups;
    let guard = 0;
    while (out.length < count && guard++ < 500) {
      const col = this.rng.int(0, this.grid.cols - 1);
      const row = this.rng.int(1, this.grid.rows - 2);
      const key = `${col},${row}`;
      if (used.has(key)) continue;
      used.add(key);
      out.push(new Pickup({ kind: this.rng.pick(explosive), col, row }));
    }
    return out;
  }

  // Power-ups sit on lane cells too, away from the explosives already placed.
  seedPowers(taken = []) {
    const out = [];
    const used = new Set(taken.map(t => `${t.col},${t.row}`));
    const { pool, count } = this.stage.powers;
    let guard = 0;
    while (out.length < count && guard++ < 500) {
      const col = this.rng.int(0, this.grid.cols - 1);
      const row = this.rng.int(1, this.grid.rows - 2);
      const key = `${col},${row}`;
      if (used.has(key)) continue;
      used.add(key);
      out.push(new Pickup({ kind: `pw_${this.rng.pick(pool)}`, col, row }));
    }
    return out;
  }

  // Pre-warm lanes so the road is not empty at stage start.
  prewarm() {
    const movers = [];
    for (const l of this.stage.lanes) {
      if (l.kind === 'safe') continue;
      let x = l.dir > 0 ? this.rng.range(-2, 1) : this.grid.cols - this.rng.range(-2, 1);
      const step = l.speed * l.gap / this.density;
      for (let i = 0; i < 3; i++) {
        x += l.dir * step * this.rng.range(0.95, 1.25);
        if (x < -1 || x > this.grid.cols + 1) break;
        movers.push(this._mover(l, x));
      }
    }
    return movers;
  }

  _mover(l, x) {
    return new Mover({ kind: this.rng.pick(l.movers), row: l.row, dir: l.dir, speed: l.speed, x, behaviors: l.behaviors });
  }

  // Returns newly created entities this tick.
  update(dt, ctx) {
    this.time += dt;
    const movers = [], projectiles = [];
    for (const l of this.stage.lanes) {
      if (l.kind === 'safe') continue;
      let t = this.laneTimers.get(l.row) - dt;
      if (t <= 0) {
        const w = Math.max(...l.movers.map(k => ctx.moverWidth?.(k) ?? 2));
        const x = l.dir > 0 ? -w : this.grid.cols + w;
        movers.push(this._mover(l, x));
        t = (l.gap / this.density) * this.rng.range(0.75, 1.3);
      }
      this.laneTimers.set(l.row, t);
    }
    this.stage.attacks.forEach((a, i) => {
      this.attackTimers[i] -= dt;
      if (this.attackTimers[i] <= 0) {
        projectiles.push(this.makeAttack(a, ctx));
        this.attackTimers[i] = (a.every / this.density) * this.rng.range(0.7, 1.3);
      }
    });
    return { movers, projectiles };
  }

  makeAttack(a, ctx) {
    const def = PROJECTILES[a.kind];
    const fx = ctx.frog.x, fy = ctx.frog.y;
    if (a.from === 'top') {
      const x = fx + this.rng.range(-0.6, 0.6);
      return new Projectile({ kind: a.kind, x, y: -1, vx: 0, vy: def.speed });
    }
    if (a.from === 'side') {
      const dir = this.rng() < 0.5 ? 1 : -1;
      const row = Math.max(1, Math.min(this.grid.rows - 2, Math.round(fy - 0.5) + this.rng.int(-1, 1)));
      return new Projectile({ kind: a.kind, x: dir > 0 ? -2 : this.grid.cols + 2, y: row + 0.5, vx: dir * def.speed, vy: 0 });
    }
    // 'above': strike the frog's current cell after a telegraph
    const col = Math.max(0, Math.min(this.grid.cols - 1, Math.round(fx - 0.5)));
    const row = Math.max(0, Math.min(this.grid.rows - 1, Math.round(fy - 0.5)));
    const y = a.kind === 'laser' ? this.grid.rows / 2 : row + 0.5;
    return new Projectile({ kind: a.kind, x: col + 0.5, y, ttl: 20 });
  }

  // Drops from movers (food trucks, bombers, carriers, alien ships).
  dropFrom(m, ctx) {
    const what = m.def.drops;
    if (!what) return null;
    if (what === 'food') return new Pickup({ kind: 'food', col: Math.round(m.x - 0.5), row: m.homeRow });
    if (what === 'jetlaunch') return new Projectile({ kind: 'jetlaunch', x: m.x, y: m.y + 0.5, vx: m.dir * PROJECTILES.jetlaunch.speed, vy: 0, ttl: 3 });
    const def = PROJECTILES[what];
    return new Projectile({ kind: what, x: m.x, y: m.y + 0.5, vx: m.dir * 0.4, vy: def.speed });
  }
}
