// The rules of the hidden level, kept free of PixiJS and timing so they can be
// tested on their own. Movement stays exactly as discrete as everywhere else in
// the game: a hop moves one cell, and a jump moves two, skipping over whatever
// sits in the one cell between (a gap, an enemy, either).
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// True when (col, row) is a real standing surface: inside the level and marked
// solid in its tile grid.
export function walkable(level, col, row) {
  if (row < 0 || row >= level.rows || col < 0 || col >= level.cols) return false;
  return !!level.solid[row][col];
}

// A single-cell hop. Returns the destination, or null if it is not walkable.
export function canHop(level, col, row, dir) {
  const d = DIRS[dir]; if (!d) return null;
  const nc = col + d[0], nr = row + d[1];
  return walkable(level, nc, nr) ? { col: nc, row: nr } : null;
}

// The two-cell jump: only left or right, only along the same row, and it does
// not care what is in the cell it skips over -- that is the entire point of it.
export function canJump(level, col, row, dir) {
  if (dir !== 'left' && dir !== 'right') return null;
  const d = dir === 'left' ? -1 : 1;
  const nc = col + d * 2;
  return walkable(level, nc, row) ? { col: nc, row } : null;
}

// After a big frog is hurt (falling, never from touching a squashable enemy),
// it shrinks back down instead of losing the run outright.
export function sizeAfterHit(sizeClass, kaijuSize) {
  return sizeClass >= kaijuSize ? 1 : sizeClass;
}

// One patrol step for a walking enemy: keep going, turn around at the end of
// its patrol range or at the edge of solid ground, whichever comes first.
export function nextPatrolCol(enemy, level) {
  const nc = enemy.col + enemy.dir;
  const inRange = nc >= enemy.range[0] && nc <= enemy.range[1];
  return inRange && walkable(level, nc, enemy.row) ? { col: nc, dir: enemy.dir } : { col: enemy.col, dir: -enemy.dir };
}
