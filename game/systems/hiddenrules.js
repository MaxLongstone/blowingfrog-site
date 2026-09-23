// The rules of the hidden level, kept free of PixiJS and timing so they can be
// tested on their own. The world is a strip of columns, each with a height in
// blocks (0 is the ground, a gap is -1). An arrow hops one column and can step
// up one block; SPACE jumps two columns, clears whatever sits in the middle and
// can land up to three blocks higher -- enough for the top of a pipe.
export const GAP = -1;
export const HOP_RISE = 1;
export const JUMP_RISE = 3;

export function heightAt(level, col) {
  if (col < 0 || col >= level.cols) return null;      // off the map
  return level.heights[col];
}

// One column left or right. { kind: 'move', col } | { kind: 'fall', col } (the
// column is a gap) | { kind: 'blocked' } (a wall too tall to step onto, or the
// edge of the map).
export function hopTarget(level, col, dir) {
  const nc = col + (dir === 'left' ? -1 : 1);
  const h = heightAt(level, nc);
  if (h === null) return { kind: 'blocked' };
  if (h === GAP) return { kind: 'fall', col: nc };
  if (h - level.heights[col] > HOP_RISE) return { kind: 'blocked' };
  return { kind: 'move', col: nc };
}

// Two columns, skipping the one in the middle whatever is in it.
export function jumpTarget(level, col, dir) {
  const d = dir === 'left' ? -1 : 1;
  const here = level.heights[col];
  const mid = heightAt(level, col + d), nc = col + d * 2, h = heightAt(level, nc);
  if (mid === null || h === null) return { kind: 'blocked' };
  if (mid - here > JUMP_RISE) return { kind: 'blocked' };      // the wall in the way is too tall to clear
  if (h === GAP) return { kind: 'fall', col: nc };
  if (h - here > JUMP_RISE) return { kind: 'blocked' };
  return { kind: 'move', col: nc };
}

// How high the frog flies above a straight line between takeoff and landing,
// in blocks. A tall pipe in the way gets a taller arc so it visibly clears it.
export function jumpArc(level, from, to) {
  const d = to > from ? 1 : -1;
  const tallest = Math.max(heightAt(level, from + d) ?? 0, level.heights[to], level.heights[from]);
  return 1.2 + 0.5 * Math.max(0, tallest - level.heights[from]);
}

// After a big frog is hurt (falling), it shrinks back down instead of losing
// the run outright.
export function sizeAfterHit(sizeClass, kaijuSize) {
  return sizeClass >= kaijuSize ? 1 : sizeClass;
}

// A walker keeps going until the end of its patrol, then turns around.
export function patrolStep(x, dir, range, speed, dt) {
  let nx = x + dir * speed * dt, nd = dir;
  if (nx <= range[0]) { nx = range[0]; nd = 1; }
  else if (nx >= range[1]) { nx = range[1]; nd = -1; }
  return { x: nx, dir: nd };
}

// What happens when the frog and a foe overlap. `dx` is the horizontal gap in
// columns, `dEl` the frog's height above the foe's feet in blocks, `falling`
// whether the frog is on its way down. Landing on a foe from above is a stomp;
// anything else at its own height is a touch.
export function contactVerdict({ dx, dEl, falling }, { reachX = 0.7, stompFrom = 0.25, stompTo = 1.4, hurtBelow = 0.6 } = {}) {
  if (Math.abs(dx) >= reachX) return 'none';
  if (falling && dEl >= stompFrom && dEl <= stompTo) return 'stomp';
  if (dEl < hurtBelow && dEl > -1) return 'touch';
  return 'none';
}

// The cycle of a piranha-style pop-up: how far out of its pipe (0..1) at time t.
export function popOut(t, { down = 1.8, rise = 0.4, up = 1.4, fall = 0.4 } = {}) {
  const total = down + rise + up + fall;
  const u = ((t % total) + total) % total;
  if (u < down) return 0;
  if (u < down + rise) return (u - down) / rise;
  if (u < down + rise + up) return 1;
  return 1 - (u - down - rise - up) / fall;
}

// The bomb-omb flash: how fast the twinkle runs as the fuse burns down (0..1).
export function twinkleRate(progress) {
  return 4 + 14 * Math.max(0, Math.min(1, progress));   // flashes per second
}

// A thrown croc: position along an arc from thrower to target over its flight.
export function crocArc(from, to, k, peak = 2.4) {
  const c = Math.max(0, Math.min(1, k));
  return { x: from.x + (to.x - from.x) * c, el: from.el + (to.el - from.el) * c + 4 * peak * c * (1 - c) };
}
