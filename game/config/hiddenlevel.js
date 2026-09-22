// The hidden level: one long single-row crossing (everything sits on the same
// row, exactly like every other stage in this game -- the jump just clears a
// column instead of a lane). Unlocked once every other achievement is earned.
export const HIDDEN = {
  cols: 40,
  row: 6,                 // the only row anything stands on
  // Columns with nothing to stand on. A gap is empty air; a pipe is drawn as
  // an obstacle. Both work exactly the same way: jump over them.
  gaps: [4, 16, 28],
  pipes: [10, 22, 35],
  // The seven defeated bosses, each patrolling a short stretch of ground.
  enemies: [
    { id: 'chaco',    sprite: 'hm_chaco',    range: [6, 8] },
    { id: 'landlord', sprite: 'hm_landlord', range: [13, 15] },
    { id: 'neco',     sprite: 'hm_neco',     range: [18, 20] },
    { id: 'probe',    sprite: 'hm_probe',    range: [24, 26] },
    { id: 'narrator', sprite: 'hm_narrator', range: [30, 31] },
    { id: 'sackman',  sprite: 'hm_sackman',  range: [33, 34] },
    { id: 'umma',     sprite: 'hm_umma',     range: [37, 38] },
  ],
  // The three power-ups from the brief, plus a handful of burgers for score.
  tnt: [{ col: 2 }, { col: 20 }],
  beaker: [{ col: 26 }],
  nuke: [{ col: 32 }],
  burgers: [{ col: 8 }, { col: 14 }, { col: 19 }, { col: 25 }, { col: 33 }],
  startCol: 1,
  goalCol: 39,
};
