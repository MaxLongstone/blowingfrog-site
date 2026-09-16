// Logical playfield grid. Row 0 is the goal (top), row rows-1 is the start (bottom).
export class Grid {
  constructor(cols = 13, rows = 15, cell = 64) {
    this.cols = cols; this.rows = rows; this.cell = cell;
  }
  get width()  { return this.cols * this.cell; }
  get height() { return this.rows * this.cell; }
  toPx(col, row) {
    return { x: (col + 0.5) * this.cell, y: (row + 0.5) * this.cell };
  }
  toCell(x, y) {
    return { col: Math.floor(x / this.cell), row: Math.floor(y / this.cell) };
  }
  clamp(col, row) {
    return {
      col: Math.max(0, Math.min(this.cols - 1, col)),
      row: Math.max(0, Math.min(this.rows - 1, row)),
    };
  }
  inside(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }
}

// Boss fights are hand-composed at one fixed design resolution (W x H) so
// every hardcoded position lines up, but the renderer's actual screen is
// only that wide on desktop -- narrower viewports get a smaller COLS and a
// narrower renderer, which clipped every boss off the right edge. This
// letterboxes the fight's world container to fit and centers it, the same
// way the page's own canvas-fit already scales the whole game to the
// available space.
export function fitWorld(app, W, H) {
  const scale = Math.min(app.screen.width / W, app.screen.height / H);
  return {
    scale,
    x: (app.screen.width - W * scale) / 2,
    y: (app.screen.height - H * scale) / 2,
  };
}

// Trauma-based screen shake. add() raises trauma, update() decays it and returns an offset.
export class Shake {
  constructor(rng = Math.random) { this.trauma = 0; this.rng = rng; this.max = 16; }
  add(amount) { this.trauma = Math.min(1, this.trauma + amount / 20); }
  update(dt) {
    const mag = this.trauma * this.trauma * this.max;
    const out = { x: mag * (this.rng() - 0.5) * 2, y: mag * (this.rng() - 0.5) * 2 };
    this.trauma = Math.max(0, this.trauma - dt * 1.5);
    return out;
  }
}
