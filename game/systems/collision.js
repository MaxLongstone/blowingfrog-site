// Pure collision rules. Everything is in cell units.
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function cellOf(e) {
  return { col: Math.floor(e.x), row: Math.floor(e.y) };
}

// Returns one of: 'none' | 'eat' | 'food' | 'power' | 'burn' | 'damage' | 'squash' | 'push'
// ctx: { tongueCells: [{col,row}] | null, invulnerable: bool, kaiju: bool, fire: bool }
export function resolve(frog, entity, ctx = {}) {
  const kaiju = !!ctx.kaiju;
  const invuln = !!ctx.invulnerable;
  const fb = frog.bounds ? frog.bounds() : frog;
  const eb = entity.bounds();
  const tongueHit = ctx.tongueCells?.some(c => overlaps({ x: c.col, y: c.row, w: 1, h: 1 }, eb));

  if (entity.type === 'explosive' || entity.type === 'food' || entity.type === 'power') {
    if (!overlaps(fb, eb) && !tongueHit) return 'none';
    if (entity.type === 'explosive') return 'eat';
    return entity.type === 'power' ? 'power' : 'food';
  }

  if ('explosive' in entity && 'vx' in entity) {      // projectile
    if (entity.explosive && tongueHit) return 'eat';
    if (ctx.fire && tongueHit) return 'burn';
    if (!entity.dangerous) return 'none';
    if (!overlaps(fb, eb)) return 'none';
    return invuln ? 'none' : 'damage';
  }

  // mover
  if (ctx.fire && tongueHit) return 'burn';
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
