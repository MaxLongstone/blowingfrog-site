// Data-driven stage definitions. Rows: 0 = goal (safe), 14 = start (safe), 1..13 = lanes.
export const FUSE_TARGET = 5;
export const KAIJU_SIZE = 5; // sizeClass >= 5 means Act 2

// Mover kinds. w/h in cells. air = cannot be squashed. harmless = no damage.
// tough = ground but unsquashable (damage). push = shoves frog sideways instead of damage.
export const MOVERS = {
  robotaxi:  { w: 1.5, h: 0.8, air: false },
  foodtruck: { w: 2.0, h: 0.9, air: false, drops: 'food' },
  semi:      { w: 3.2, h: 0.9, air: false },
  police:    { w: 1.6, h: 0.8, air: false },
  drone:     { w: 0.8, h: 0.6, air: true },
  newsdrone: { w: 0.8, h: 0.6, air: true, harmless: true },
  heli:      { w: 1.8, h: 0.9, air: true },
  jet:       { w: 2.0, h: 0.8, air: true },
  tank:      { w: 1.6, h: 1.0, air: false },
  swattervan:{ w: 1.8, h: 0.9, air: false },
  tubeman:   { w: 0.7, h: 1.0, air: false, harmless: true },
  heron:     { w: 2.6, h: 1.2, air: true },
  chef:      { w: 1.4, h: 1.4, air: false, tough: true },
  flymech:   { w: 1.6, h: 1.2, air: false, tough: true },
  bomber:    { w: 2.8, h: 1.0, air: true, drops: 'bomb' },
  carrier:   { w: 3.4, h: 1.0, air: false, drops: 'jetlaunch' },
  kraken:    { w: 2.0, h: 1.6, air: false, tough: true },
  hurricane: { w: 2.2, h: 2.2, air: true, push: true },
  liberty:   { w: 1.2, h: 1.8, air: false, tough: true },
  duck:      { w: 1.8, h: 1.2, air: false },
  moon:      { w: 2.0, h: 2.0, air: true },
  station:   { w: 2.6, h: 0.8, air: true },
  alienship: { w: 1.8, h: 0.9, air: true, drops: 'nuke' },
};

// Pickup kinds. explosive = counts toward the fuse. food = points only.
export const PICKUPS = {
  dynamite:   { type: 'explosive' }, mine:      { type: 'explosive' },
  tanker:     { type: 'explosive' }, gasstation:{ type: 'explosive' },
  propane:    { type: 'explosive' }, silo:      { type: 'explosive' },
  volcano:    { type: 'explosive' }, sub:       { type: 'explosive' },
  oilrig:     { type: 'explosive' }, nukesilo:  { type: 'explosive' },
  food:       { type: 'food' },
};

// Projectile kinds. explosive = edible via tongue. from: top | side | above.
export const PROJECTILES = {
  missile: { w: 0.5, h: 1.2, explosive: true,  speed: 3.2 },
  bomb:    { w: 0.6, h: 0.8, explosive: true,  speed: 2.4 },
  cruise:  { w: 1.4, h: 0.5, explosive: true,  speed: 3.6 },
  torpedo: { w: 1.4, h: 0.5, explosive: true,  speed: 3.0 },
  nuke:    { w: 0.7, h: 1.4, explosive: true,  speed: 2.8 },
  bullet:  { w: 0.3, h: 0.3, explosive: false, speed: 5.0 },
  strafe:  { w: 0.3, h: 0.7, explosive: false, speed: 6.0 },
  fork:    { w: 0.5, h: 1.6, explosive: false, speed: 4.0 },
  jetlaunch:{ w: 1.2, h: 0.6, explosive: false, speed: 4.5 },
  laser:   { w: 0.6, h: 15,  explosive: false, speed: 0, warn: 0.6, active: 0.35 },
  hand:    { w: 2.4, h: 2.4, explosive: false, speed: 0, warn: 1.0, active: 0.4 },
  flare:   { w: 3.0, h: 0.8, explosive: false, speed: 2.2 },
};

const safe = (row) => ({ row, kind: 'safe', movers: [], behaviors: [] });
const lane = (row, movers, o = {}) => ({
  row, kind: o.kind || 'road', dir: o.dir ?? (row % 2 ? 1 : -1),
  speed: o.speed ?? 1.6, gap: o.gap ?? 2.2, movers, behaviors: o.behaviors || [],
});

export const STAGES = [
  {
    id: '1', act: 1, sizeClass: 1, bg: 'highway', name: 'Rush Hour 2028', subtitle: 'Eat 5. Cross. Boom.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['robotaxi'], { speed: 1.5, gap: 3.77 }), lane(12, ['robotaxi', 'foodtruck'], { speed: 1.4, gap: 4.35 }),
      lane(11, ['robotaxi'], { speed: 1.7, gap: 3.48 }), safe(10),
      lane(9, ['foodtruck'], { speed: 1.2, gap: 4.93 }), lane(8, ['robotaxi'], { speed: 1.8, gap: 3.19 }),
      safe(7),
      lane(6, ['robotaxi'], { speed: 1.6, gap: 3.33 }), lane(5, ['robotaxi', 'foodtruck'], { speed: 1.5, gap: 4.06 }),
      safe(4),
      lane(3, ['robotaxi'], { speed: 1.9, gap: 2.9 }), lane(2, ['foodtruck'], { speed: 1.3, gap: 4.64 }),
      lane(1, ['robotaxi'], { speed: 2.0, gap: 2.9 }),
    ],
    pickups: { explosive: ['dynamite', 'mine'], count: 7 },
    attacks: [],
  },
  {
    id: '2', act: 1, sizeClass: 2, bg: 'highway', name: 'Autonomous Lane', subtitle: 'Semis take two lanes. Drones dip.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['robotaxi'], { speed: 1.8, gap: 3.3 }), lane(12, ['semi'], { speed: 1.5, gap: 5.1 }),
      lane(11, ['robotaxi', 'foodtruck'], { speed: 1.9, gap: 3.3 }), lane(10, ['drone'], { kind: 'air', speed: 2.2, gap: 3.6, behaviors: ['dive'] }),
      lane(9, ['robotaxi'], { speed: 2.0, gap: 3.0 }), lane(8, ['semi'], { speed: 1.6, gap: 4.8 }),
      safe(7),
      lane(6, ['robotaxi'], { speed: 2.1, gap: 3.0 }), lane(5, ['foodtruck', 'robotaxi'], { speed: 1.7, gap: 3.6 }),
      lane(4, ['drone'], { kind: 'air', speed: 2.4, gap: 3.3, behaviors: ['dive'] }),
      lane(3, ['semi'], { speed: 1.8, gap: 4.5 }), lane(2, ['robotaxi'], { speed: 2.2, gap: 2.86 }),
      lane(1, ['robotaxi'], { speed: 2.3, gap: 2.86 }),
    ],
    pickups: { explosive: ['dynamite', 'mine'], count: 7 },
    attacks: [],
  },
  {
    id: '3', act: 1, sizeClass: 3, bg: 'highway', name: 'Frog Control', subtitle: 'The cops swerve. Everything swerves.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['police', 'robotaxi'], { speed: 2.2, gap: 2.9, behaviors: ['swerve'] }), lane(12, ['semi'], { speed: 1.8, gap: 4.35 }),
      lane(11, ['robotaxi'], { speed: 2.3, gap: 2.75, behaviors: ['swerve'] }), lane(10, ['drone'], { kind: 'air', speed: 2.6, gap: 2.9, behaviors: ['dive'] }),
      lane(9, ['police'], { speed: 2.4, gap: 3.19, behaviors: ['swerve'] }), lane(8, ['foodtruck', 'robotaxi'], { speed: 2.0, gap: 3.19 }),
      safe(7),
      lane(6, ['semi'], { speed: 2.0, gap: 4.06 }), lane(5, ['police', 'robotaxi'], { speed: 2.5, gap: 2.75, behaviors: ['swerve'] }),
      lane(4, ['drone'], { kind: 'air', speed: 2.8, gap: 2.75, behaviors: ['dive'] }),
      lane(3, ['robotaxi'], { speed: 2.6, gap: 2.61, behaviors: ['swerve'] }), lane(2, ['foodtruck'], { speed: 2.0, gap: 3.48 }),
      lane(1, ['police'], { speed: 2.8, gap: 2.61, behaviors: ['swerve'] }),
    ],
    pickups: { explosive: ['dynamite', 'mine'], count: 7 },
    attacks: [],
  },
  {
    id: '4', act: 1, sizeClass: 4, bg: 'highway', name: 'They Hunt Now', subtitle: 'Trucks boost. Drones dive. Good luck.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['police', 'robotaxi'], { speed: 2.6, gap: 2.7, behaviors: ['swerve'] }), lane(12, ['semi', 'foodtruck'], { speed: 2.2, gap: 3.6, behaviors: ['boost'] }),
      lane(11, ['drone'], { kind: 'air', speed: 3.0, gap: 2.55, behaviors: ['dive'] }), lane(10, ['robotaxi', 'police'], { speed: 2.8, gap: 2.55, behaviors: ['swerve'] }),
      lane(9, ['semi'], { speed: 2.4, gap: 3.9, behaviors: ['boost'] }), lane(8, ['foodtruck', 'robotaxi'], { speed: 2.5, gap: 2.85, behaviors: ['boost', 'swerve'] }),
      safe(7),
      lane(6, ['police'], { speed: 3.0, gap: 2.7, behaviors: ['swerve'] }), lane(5, ['drone'], { kind: 'air', speed: 3.2, gap: 2.4, behaviors: ['dive'] }),
      lane(4, ['semi', 'robotaxi'], { speed: 2.6, gap: 3.0, behaviors: ['boost'] }), lane(3, ['robotaxi', 'police'], { speed: 3.1, gap: 2.4, behaviors: ['swerve'] }),
      lane(2, ['foodtruck'], { speed: 2.4, gap: 3.3, behaviors: ['boost'] }), lane(1, ['police', 'robotaxi'], { speed: 3.3, gap: 2.4, behaviors: ['swerve'] }),
    ],
    pickups: { explosive: ['dynamite', 'mine'], count: 7 },
    attacks: [],
  },
  {
    id: 'K1', act: 2, sizeClass: 5, bg: 'highway', name: 'KAIJU I: Rampage', subtitle: 'You are bigger than the cars now.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['robotaxi', 'police'], { speed: 2.4, gap: 2.17, behaviors: ['flee'] }), lane(12, ['semi'], { speed: 2.0, gap: 3.41, behaviors: ['flee'] }),
      lane(11, ['robotaxi', 'foodtruck'], { speed: 2.4, gap: 2.33, behaviors: ['flee'] }), lane(10, ['police'], { speed: 2.8, gap: 2.48, behaviors: ['flee'] }),
      lane(9, ['robotaxi'], { speed: 2.6, gap: 2.02, behaviors: ['flee'] }), lane(8, ['semi', 'robotaxi'], { speed: 2.2, gap: 2.79, behaviors: ['flee'] }),
      safe(7),
      lane(6, ['robotaxi'], { speed: 2.7, gap: 2.02, behaviors: ['flee'] }), lane(5, ['foodtruck', 'police'], { speed: 2.4, gap: 2.48, behaviors: ['flee'] }),
      lane(4, ['semi'], { speed: 2.1, gap: 3.1, behaviors: ['flee'] }), lane(3, ['robotaxi', 'robotaxi'], { speed: 2.9, gap: 1.86, behaviors: ['flee'] }),
      lane(2, ['police'], { speed: 3.0, gap: 2.33, behaviors: ['flee'] }), lane(1, ['robotaxi', 'semi'], { speed: 2.6, gap: 2.17, behaviors: ['flee'] }),
    ],
    pickups: { explosive: ['tanker'], count: 7 },
    attacks: [],
  },
  {
    id: 'K2', act: 2, sizeClass: 6, bg: 'city', name: 'KAIJU II: Downtown', subtitle: 'Now they have air support.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['tank', 'tubeman'], { speed: 1.8, gap: 2.7, behaviors: ['flee'] }), lane(12, ['heli'], { kind: 'air', speed: 2.6, gap: 3.6, behaviors: ['hover'] }),
      lane(11, ['swattervan'], { speed: 2.4, gap: 3.9, behaviors: ['hunt'] }), lane(10, ['tubeman', 'tubeman'], { speed: 1.6, gap: 2.1, behaviors: ['flee'] }),
      lane(9, ['jet'], { kind: 'air', speed: 4.2, gap: 3.3 }), lane(8, ['newsdrone', 'newsdrone'], { kind: 'air', speed: 2.0, gap: 1.8 }),
      safe(7),
      lane(6, ['tank'], { speed: 2.0, gap: 2.7, behaviors: ['flee'] }), lane(5, ['heli'], { kind: 'air', speed: 2.8, gap: 3.3, behaviors: ['hover'] }),
      lane(4, ['swattervan', 'tank'], { speed: 2.4, gap: 3.3, behaviors: ['hunt'] }), lane(3, ['jet'], { kind: 'air', speed: 4.6, gap: 3.0 }),
      lane(2, ['tubeman', 'tubeman'], { speed: 1.4, gap: 1.8 }), lane(1, ['tank', 'swattervan'], { speed: 2.4, gap: 2.7, behaviors: ['hunt'] }),
    ],
    pickups: { explosive: ['gasstation', 'propane'], count: 6 },
    attacks: [
      { kind: 'missile', from: 'top', every: 3.6 },
      { kind: 'bullet', from: 'side', every: 3.0 },
    ],
  },
  {
    id: 'K3', act: 2, sizeClass: 7, bg: 'continent', name: 'KAIJU III: The Continent', subtitle: 'Someone brought a fork.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['tank', 'tank'], { speed: 2.2, gap: 2.48, behaviors: ['flee'] }), lane(12, ['bomber'], { kind: 'air', speed: 2.4, gap: 4.65 }),
      lane(11, ['chef'], { speed: 2.0, gap: 5.27, behaviors: ['hunt'] }), lane(10, ['heron'], { kind: 'air', speed: 3.4, gap: 4.03, behaviors: ['swoop'] }),
      lane(9, ['flymech', 'tank'], { speed: 2.2, gap: 3.41, behaviors: ['hunt'] }), lane(8, ['jet', 'jet'], { kind: 'air', speed: 4.8, gap: 2.79 }),
      safe(7),
      lane(6, ['bomber'], { kind: 'air', speed: 2.6, gap: 4.34 }), lane(5, ['chef', 'flymech'], { speed: 2.2, gap: 4.34, behaviors: ['hunt'] }),
      lane(4, ['heron'], { kind: 'air', speed: 3.8, gap: 3.72, behaviors: ['swoop'] }), lane(3, ['tank', 'tank'], { speed: 2.4, gap: 2.17, behaviors: ['flee'] }),
      lane(2, ['jet'], { kind: 'air', speed: 5.0, gap: 2.79 }), lane(1, ['chef'], { speed: 2.4, gap: 4.65, behaviors: ['hunt'] }),
    ],
    pickups: { explosive: ['silo', 'volcano'], count: 6 },
    attacks: [
      { kind: 'cruise', from: 'side', every: 3.2 },
      { kind: 'fork', from: 'top', every: 4.0 },
      { kind: 'strafe', from: 'top', every: 2.8 },
    ],
  },
  {
    id: 'K4', act: 2, sizeClass: 8, bg: 'ocean', name: 'KAIJU IV: The Ocean', subtitle: 'The weather has opinions.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['carrier'], { kind: 'water', speed: 1.8, gap: 4.96, behaviors: ['flee'] }), lane(12, ['duck', 'duck'], { kind: 'water', speed: 2.4, gap: 2.79, behaviors: ['flee'] }),
      lane(11, ['kraken'], { kind: 'water', speed: 1.6, gap: 5.58, behaviors: ['hunt'] }), lane(10, ['hurricane'], { kind: 'air', speed: 2.2, gap: 5.27 }),
      lane(9, ['liberty'], { kind: 'water', speed: 2.0, gap: 4.65, behaviors: ['hunt'] }), lane(8, ['jet', 'jet'], { kind: 'air', speed: 5.2, gap: 2.48 }),
      safe(7),
      lane(6, ['carrier', 'duck'], { kind: 'water', speed: 2.0, gap: 4.03, behaviors: ['flee'] }), lane(5, ['hurricane'], { kind: 'air', speed: 2.6, gap: 4.65 }),
      lane(4, ['kraken', 'liberty'], { kind: 'water', speed: 2.0, gap: 4.34, behaviors: ['hunt'] }), lane(3, ['duck', 'duck'], { kind: 'water', speed: 2.8, gap: 2.17, behaviors: ['flee'] }),
      lane(2, ['jet'], { kind: 'air', speed: 5.4, gap: 2.48 }), lane(1, ['carrier'], { kind: 'water', speed: 2.2, gap: 4.34, behaviors: ['flee'] }),
    ],
    pickups: { explosive: ['sub', 'oilrig'], count: 6 },
    attacks: [
      { kind: 'torpedo', from: 'side', every: 2.9 },
      { kind: 'strafe', from: 'top', every: 2.6 },
      { kind: 'missile', from: 'top', every: 3.6 },
    ],
  },
  {
    id: 'K5', act: 2, sizeClass: 9, bg: 'orbit', name: 'KAIJU V: Orbit', subtitle: 'Everyone is here to stop you. Everyone.',
    hearts: 3, lives: 3,
    lanes: [
      lane(13, ['station'], { kind: 'air', speed: 3.0, gap: 4.8, behaviors: ['hunt'] }), lane(12, ['alienship', 'alienship'], { kind: 'air', speed: 2.6, gap: 3.2 }),
      lane(11, ['moon'], { kind: 'air', speed: 2.4, gap: 6.4 }), lane(10, ['alienship'], { kind: 'air', speed: 2.8, gap: 3.52 }),
      lane(9, ['station', 'alienship'], { kind: 'air', speed: 3.2, gap: 3.84, behaviors: ['hunt'] }), lane(8, ['moon'], { kind: 'air', speed: 2.8, gap: 5.76 }),
      safe(7),
      lane(6, ['alienship', 'alienship'], { kind: 'air', speed: 3.0, gap: 2.88 }), lane(5, ['station'], { kind: 'air', speed: 3.4, gap: 4.48, behaviors: ['hunt'] }),
      lane(4, ['moon'], { kind: 'air', speed: 3.2, gap: 5.44 }), lane(3, ['alienship'], { kind: 'air', speed: 3.2, gap: 3.2 }),
      lane(2, ['station', 'station'], { kind: 'air', speed: 3.6, gap: 3.52, behaviors: ['hunt'] }), lane(1, ['moon', 'alienship'], { kind: 'air', speed: 3.4, gap: 3.84 }),
    ],
    pickups: { explosive: ['nukesilo'], count: 5 },
    attacks: [
      { kind: 'nuke', from: 'top', every: 2.9 },
      { kind: 'laser', from: 'above', every: 3.4 },
      { kind: 'hand', from: 'above', every: 6.5 },
      { kind: 'flare', from: 'side', every: 4.0 },
    ],
  },
];

export function validateStage(s) {
  const fail = (m) => { throw new Error(`Stage ${s && s.id}: ${m}`); };
  if (!s || !s.id) fail('missing id');
  if (![1, 2].includes(s.act)) fail('act must be 1 or 2');
  if (!Number.isInteger(s.sizeClass) || s.sizeClass < 1 || s.sizeClass > 9) fail('bad sizeClass');
  if ((s.act === 2) !== (s.sizeClass >= KAIJU_SIZE)) fail('act does not match sizeClass');
  const rows = s.lanes.map(l => l.row).sort((a, b) => a - b);
  const expected = Array.from({ length: 13 }, (_, i) => i + 1);
  if (rows.join() !== expected.join()) fail(`lanes must cover rows 1..13 exactly once, got ${rows}`);
  for (const l of s.lanes) {
    if (!['road', 'safe', 'water', 'air'].includes(l.kind)) fail(`bad lane kind ${l.kind}`);
    if (l.kind === 'safe') continue;
    if (![1, -1].includes(l.dir)) fail(`lane ${l.row} bad dir`);
    if (!(l.speed > 0) || !(l.gap > 0)) fail(`lane ${l.row} bad speed/gap`);
    if (!l.movers.length) fail(`lane ${l.row} has no movers`);
    for (const m of l.movers) if (!MOVERS[m]) fail(`unknown mover ${m}`);
    for (const b of l.behaviors) if (!BEHAVIOR_NAMES.includes(b)) fail(`unknown behavior ${b}`);
  }
  if (!s.pickups || !s.pickups.explosive.length || !(s.pickups.count >= FUSE_TARGET)) fail('need at least 5 explosive pickups');
  for (const p of s.pickups.explosive) if (!PICKUPS[p] || PICKUPS[p].type !== 'explosive') fail(`bad explosive pickup ${p}`);
  for (const a of s.attacks) {
    if (!PROJECTILES[a.kind]) fail(`unknown projectile ${a.kind}`);
    if (!['top', 'side', 'above'].includes(a.from)) fail(`bad attack origin ${a.from}`);
    if (!(a.every > 0)) fail('attack every must be > 0');
  }
  return true;
}

export const BEHAVIOR_NAMES = ['swerve', 'dive', 'boost', 'hunt', 'flee', 'hover', 'swoop'];

export function getStage(id) {
  return STAGES.find(s => s.id === String(id)) || null;
}
export function nextStage(id) {
  const i = STAGES.findIndex(s => s.id === String(id));
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
}
