// Per-stage background: lane bands plus a parallax skyline/horizon strip.
const BG = {
  highway:   { sky: 0x14161c, road: 0x2c2c31, safe: 0x22331f, line: 0xf2c53d, accent: 0x3a3a42 },
  city:      { sky: 0x101827, road: 0x343a46, safe: 0x24303a, line: 0xf2c53d, accent: 0x4a5566 },
  continent: { sky: 0x1a1410, road: 0x3d3529, safe: 0x2b3a22, line: 0xc9a227, accent: 0x54452f },
  ocean:     { sky: 0x081826, road: 0x123449, safe: 0x1d4a3a, line: 0x7fc7e8, accent: 0x1b4a63 },
  orbit:     { sky: 0x05060f, road: 0x101326, safe: 0x191d38, line: 0x7b3fb4, accent: 0x232a52 },
};

export class Backdrop {
  constructor(container, grid, stage) {
    this.grid = grid;
    this.stage = stage;
    this.pal = BG[stage.bg] || BG.highway;
    this.g = new PIXI.Graphics();
    this.fx = new PIXI.Graphics();
    container.addChild(this.g, this.fx);
    this.t = 0;
    this.stars = stage.bg === 'orbit'
      ? Array.from({ length: 70 }, () => ({ x: Math.random() * grid.width, y: Math.random() * grid.height, r: Math.random() * 1.8 + 0.4, s: Math.random() }))
      : null;
    this.draw();
  }
  draw() {
    const { grid, pal } = this;
    const C = grid.cell;
    const g = this.g;
    g.clear();
    g.rect(0, 0, grid.width, grid.height).fill(pal.sky);

    const laneByRow = new Map(this.stage.lanes.map(l => [l.row, l]));
    for (let row = 0; row < grid.rows; row++) {
      const lane = laneByRow.get(row);
      const y = row * C;
      if (!lane || lane.kind === 'safe') {
        g.rect(0, y, grid.width, C).fill(row === 0 ? 0x2c4a26 : pal.safe);
        for (let x = 0; x < grid.width; x += 26) g.circle(x + (row % 2 ? 13 : 0), y + C * 0.5 + Math.sin(x) * 6, 4).fill({ color: 0x000000, alpha: 0.12 });
        continue;
      }
      if (lane.kind === 'air') {
        g.rect(0, y, grid.width, C).fill({ color: pal.sky, alpha: 1 });
        g.rect(0, y, grid.width, C).fill({ color: pal.accent, alpha: 0.18 });
      } else if (lane.kind === 'water') {
        g.rect(0, y, grid.width, C).fill(pal.road);
        for (let x = 0; x < grid.width; x += 34) g.roundRect(x + (row % 2 ? 10 : 0), y + C * 0.42, 20, 4, 2).fill({ color: 0xffffff, alpha: 0.1 });
      } else {
        g.rect(0, y, grid.width, C).fill(pal.road);
        for (let x = 6; x < grid.width; x += 42) g.rect(x, y + C * 0.5 - 2, 22, 4).fill({ color: pal.line, alpha: 0.35 });
      }
      g.rect(0, y, grid.width, 1.5).fill({ color: 0xffffff, alpha: 0.06 });
    }
    // goal band
    g.rect(0, 0, grid.width, C).fill({ color: 0x000000, alpha: 0.18 });
    for (let x = 0; x < grid.width; x += C / 2) g.rect(x, 0, C / 4, 8).fill({ color: 0xf4f2ec, alpha: 0.5 });
  }
  update(dt) {
    this.t += dt;
    const f = this.fx; f.clear();
    if (this.stars) {
      for (const s of this.stars) f.circle(s.x, s.y, s.r).fill({ color: 0xffffff, alpha: 0.3 + Math.sin(this.t * 2 + s.s * 8) * 0.25 });
    }
    if (this.stage.bg === 'ocean') {
      for (let y = 0; y < this.grid.height; y += 40) {
        const off = Math.sin(this.t * 1.2 + y * 0.05) * 14;
        f.roundRect(off + 20, y + 18, 40, 3, 2).fill({ color: 0xffffff, alpha: 0.07 });
      }
    }
  }
  destroy() { this.g.destroy(); this.fx.destroy(); }
}
