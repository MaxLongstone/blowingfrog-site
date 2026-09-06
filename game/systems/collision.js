// Pure collision rules. Everything is in cell units.
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function cellOf(e) {
  return { col: Math.floor(e.x), row: Math.floor(e.y) };
}

// Returns one of: 'none' | 'eat' | 'food' | 'damage' | 'squash' | 'push'
// ctx: { tongueCells: [{col,row}] | null, invulnerable: bool, kaiju: bool }
export function resolve(frog, entity, ctx = {}) {
  const kaiju = !!ctx.kaiju;
  const invuln = !!ctx.invulnerable;
  const fb = frog.bounds ? frog.bounds() : frog;
  const eb = entity.bounds();
  const tongueHit = ctx.tongueCells?.some(c => overlaps({ x: c.col, y: c.row, w: 1, h: 1 }, eb));

  if (entity.type === 'explosive' || entity.type === 'food') {
    if (!overlaps(fb, eb) && !tongueHit) return 'none';
    return entity.type === 'explosive' ? 'eat' : 'food';
  }

  if ('explosive' in entity && 'vx' in entity) {      // projectile
    if (entity.explosive && tongueHit) return 'eat';
    if (!entity.dangerous) return 'none';
    if (!overlaps(fb, eb)) return 'none';
    return invuln ? 'none' : 'damage';
  }

  // mover
  if (!overlaps(fb, eb)) return 'none';
  if (entity.push) return 'push';
  if (kaiju) {
    if (entity.air) return entity.harmless ? 'none' : (invuln ? 'none' : 'damage');
    if (entity.tough) return invuln ? 'none' : 'damage';
    return 'squash';
  }
  if (entity.harmless) return 'none';
  return invuln ? 'none' : 'damage';
}
