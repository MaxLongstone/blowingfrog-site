// The hidden level: one long crossing with Mario-style stacks. Columns have
// heights in blocks; the seven defeated bosses each have their own way of
// coming at you. Unlocked once every other achievement is earned.
export const HIDDEN = {
  cols: 58,
  startCol: 1,
  goalCol: 56,
  gaps: [4, 15, 27, 43],
  // Solid stacks of blocks, one column each.
  blocks: [
    { col: 6, h: 1 }, { col: 7, h: 2 }, { col: 8, h: 2 }, { col: 9, h: 1 },
    { col: 35, h: 2 }, { col: 36, h: 2 }, { col: 37, h: 2 }, { col: 38, h: 2 },
    { col: 50, h: 1 }, { col: 51, h: 2 }, { col: 52, h: 3 }, { col: 53, h: 4 }, { col: 54, h: 4 },
  ],
  // Wide pipes: `col` is the left column, `w` how many columns, `h` blocks tall.
  pipes: [
    { col: 11, w: 2, h: 3 },
    { col: 23, w: 2, h: 2 },
    { col: 40, w: 2, h: 3 },
  ],
  // Every one of them behaves differently -- see systems/hiddenfoes.js.
  foes: [
    { id: 'chaco1',   type: 'chaco',    pipe: 0 },
    { id: 'landlord', type: 'landlord', range: [17, 21] },
    { id: 'chaco2',   type: 'chaco',    pipe: 1 },
    { id: 'neco',     type: 'walker',   range: [29, 33] },
    { id: 'umma',     type: 'umma',     col: 37 },
    { id: 'sackman',  type: 'ghost',    range: [29, 47] },
    { id: 'narrator', type: 'narrator', col: 47 },
    { id: 'ufo',      type: 'ufo',      range: [39, 53] },
  ],
  tnt: [{ col: 2 }, { col: 31 }],
  beaker: [{ col: 24 }],                 // on top of the second pipe, past the piranha
  nuke: [{ col: 45 }],
  burgers: [{ col: 3 }, { col: 8 }, { col: 19 }, { col: 20 }, { col: 33 }, { col: 37 }, { col: 41 }, { col: 49 }],
};

// heights[col]: -1 for a gap, else how many blocks tall the column is.
export function buildHeights(cfg = HIDDEN) {
  const h = new Array(cfg.cols).fill(0);
  for (const c of cfg.gaps) h[c] = -1;
  for (const b of cfg.blocks) h[b.col] = b.h;
  for (const p of cfg.pipes) for (let i = 0; i < p.w; i++) h[p.col + i] = p.h;
  return h;
}
