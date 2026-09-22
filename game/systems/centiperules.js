// The rules of the Neco Centipede rebuild, kept free of PixiJS and timing so they
// can be tested on their own. Two mirrored chains wind down a grid the way the
// arcade centipede does (across, then drop a row, then back the other way), both
// racing the frog for the same scattered pods. A pod a chain reaches makes it
// faster; a chain that gorges itself bursts on its own; a bitten body segment
// splits the chain in two; a bitten head kills the whole thing.

// One zigzag step of a head: keep going the way it is going, and only turn
// (drop one row, reverse) when the next cell would run off the side. Once it
// is already on the bottom row it has nowhere left to drop, so it just keeps
// turning in place there -- which is exactly how it becomes a standing hazard.
export function nextHeadCell({ col, row, dc }, { cols, rows }) {
  const nc = col + dc;
  if (nc < 0 || nc >= cols) return { col, row: Math.min(rows - 1, row + 1), dc: -dc };
  return { col: nc, row, dc };
}

// How much faster a chain is for having eaten `eaten` pods. Compounds, but caps,
// so an early lucky streak can't make one uncatchable for the whole round.
export function speedFor(eaten, { base, perEat = 0.10, cap = 2.5 } = {}) {
  return base * Math.min(cap, 1 + perEat * eaten);
}

// True the moment a chain has eaten enough to go off on its own -- the next
// mouthful is its last, with nobody else needing to touch it.
export function willBurst(eaten, threshold = 6) {
  return eaten >= threshold;
}

// Biting segment `index` of a chain's path (0 is the head). Biting the head ends
// the whole thing; biting a body segment splits it in two, the bitten segment
// itself gone. Returns { front, back } where each is a path array (empty means
// nothing survives on that side) so the caller can replace/add chains from it.
export function biteOutcome(path, index) {
  if (index <= 0) return { front: [], back: [] };
  return { front: path.slice(0, index), back: path.slice(index + 1) };
}

// A fresh chain's starting trail: the head at (col, row0), with `len` segments
// laid out behind it against the direction it is about to move, clamped to the
// grid so a chain spawned near the edge does not run off it.
export function seedPath(col, row0, dc, len, cols) {
  const path = [];
  for (let i = 0; i < len; i++) path.push({ col: Math.max(0, Math.min(cols - 1, col - dc * i)), row: row0 });
  return path;
}
