// The rules of UMMA rebuilt as a Donkey Kong climb, kept free of PixiJS and
// timing so they can be tested on their own: which column has a ladder between
// two levels, and how a thrown Croc cascades down the girders once it rolls off
// an edge (same direction, one level down, until it rolls off the bottom).

// `ladders` is a list of { level, col }, each meaning "a ladder connects level
// to level + 1 at this column." No two are ever the same column back to back,
// which is what forces the zigzag DK climb is known for.
export function ladderAt(ladders, level, col) {
  return ladders.some((l) => l.level === level && l.col === col);
}

// Whether the frog can climb from `level` in `dir` ('up' or 'down') at `col`.
export function canClimb(ladders, level, col, dir) {
  return dir === 'up' ? ladderAt(ladders, level, col) : ladderAt(ladders, level - 1, col);
}

// One step of a rolling Croc: keep going the way it is going; if that runs it
// off the girder, it tumbles down to the level below at the same column and
// keeps rolling the same direction. Off the bottom level, it is gone --
// returns null so the caller can remove it.
export function cascadeStep(croc, cols) {
  const nc = croc.col + croc.dir;
  if (nc >= 0 && nc < cols) return { level: croc.level, col: nc, dir: croc.dir };
  if (croc.level <= 0) return null;
  return { level: croc.level - 1, col: croc.col, dir: croc.dir };
}
