// How hard the Influencer fights being closed: how many clicks it takes, and which
// outburst each click gets. Pure, so it can be tested; adcard.js does the showing.
import { RESIST } from '../config/influencer.js';

// Clicks needed before the card closes. Zero below the tier where she starts to
// resist, and never the same number twice running so it cannot be learned.
export function triesFor(tier, rng, last = null, cfg = RESIST) {
  const range = cfg.tries[tier];
  if (!range || tier < cfg.fromTier) return 0;
  const [lo, hi] = range;
  let n = lo + Math.floor(rng() * (hi - lo + 1));
  if (hi > lo && n === last) n = n === hi ? lo : n + 1;
  return n;
}

// An outburst she has not just used.
export function pickOutburst(pool, rng, last = -1) {
  let i = Math.floor(rng() * pool.length);
  if (pool.length > 1 && i === last) i = (i + 1) % pool.length;
  return i;
}
