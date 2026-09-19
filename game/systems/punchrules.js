// The rules of the Chaco bout, kept free of drawing and timing so they can be
// tested: what a strike does to the frog, and what a punch does to Chaco.

// A hook comes in from one side of the screen; the answer is to lean away from
// it. The jaw lunge (chupada) comes straight down the middle, so either lean
// beats it, but it cannot be blocked.
export function resolveStrike(attack, { lean = 0, blocking = false }) {
  if (attack.from === 0) return lean !== 0 ? 'dodged' : 'hit';
  if (lean === -attack.from) return 'dodged';
  if (blocking) return 'blocked';
  return 'hit';
}

// What a punch does depends entirely on what Chaco is doing when it lands.
//   guard   fists at his face: nothing gets through
//   tell    he is winding up: a counter, which interrupts him and earns a star
//   open    he just missed, or is dazed: full damage
//   anything else: a chip
export function punchOutcome(phase, dmg) {
  switch (phase) {
    case 'guard': return { kind: 'blocked', damage: 0, star: false };
    case 'tell': return { kind: 'counter', damage: dmg.counter, star: true };
    case 'open': case 'dazed': return { kind: 'open', damage: dmg.open, star: false };
    case 'rage': case 'down': case 'getup': case 'berserk': case 'dead': case 'watch':
      return { kind: 'none', damage: 0, star: false };
    default: return { kind: 'chip', damage: dmg.chip, star: false };
  }
}

// The star punch: stronger for every star banked, blocked by a raised guard.
export function starPunchDamage(stars, cfg) {
  return stars > 0 ? cfg.base + cfg.perStar * stars : 0;
}

// Which patterns Chaco may pick in a round (round 2 onward includes round 1's).
export function patternPool(patterns, round) {
  const out = [];
  for (let r = 1; r <= round; r++) out.push(...(patterns[r] || []));
  return out;
}

// Never the same pattern twice running, unless there is only one to pick from.
export function pickPattern(pool, rng, last = null) {
  const options = pool.length > 1 ? pool.filter(p => p !== last) : pool;
  return options[Math.floor(rng() * options.length)];
}
