// Procedural sprite drawings (PixiJS v8 Graphics). Every kind the game uses has a draw(g, W, H)
// that paints centered on (0,0). A PNG at assets/game/<kind>.png overrides the drawing.
const CELL = 64;
const OUT = 0x1c1c1a;

const C = {
  frog: 0xb9c44a, frogDark: 0x7d8a25, belly: 0xefe6c9, eye: 0xffffff, pupil: 0x232323,
  asphalt: 0x2c2c31, steel: 0x9aa0a8, steelDark: 0x5b6169, red: 0xe23c2f, redDark: 0x8c1d17,
  yellow: 0xf2c53d, orange: 0xf08a24, white: 0xf4f2ec, blue: 0x3f7fd4, navy: 0x203a6b,
  glass: 0x7fc7e8, green: 0x4f9a3c, purple: 0x7b3fb4, pink: 0xe86fa7, brown: 0x6f4d2c,
  black: 0x141416, gray: 0x6c6c72, teal: 0x2fb7a6, flesh: 0xf2c9a3,
};

const stroke = (g, w = 3, color = OUT, alpha = 0.85) => g.stroke({ width: w, color, alpha, join: 'round' });
const shine = (g, x, y, rx, ry) => g.ellipse(x, y, rx, ry).fill({ color: 0xffffff, alpha: 0.22 });
const glowDisc = (g, x, y, r, color, a = 0.35) => { g.circle(x, y, r * 1.6).fill({ color, alpha: a * 0.4 }); g.circle(x, y, r * 1.2).fill({ color, alpha: a }); };

function carBody(g, W, H, color, { glassColor = C.glass, wheels = true } = {}) {
  if (wheels) for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    g.roundRect(sx * W * 0.32 - 6, sy * H * 0.5 - 4, 12, 8, 2).fill(C.black);
  g.roundRect(-W / 2, -H / 2, W, H, H * 0.28).fill(color); stroke(g);
  g.roundRect(-W * 0.05, -H * 0.36, W * 0.24, H * 0.72, 5).fill(glassColor);
  g.roundRect(-W * 0.36, -H * 0.36, W * 0.16, H * 0.72, 5).fill(glassColor);
  g.rect(W / 2 - 5, -H * 0.36, 4, H * 0.22).fill(C.yellow);
  g.rect(W / 2 - 5, H * 0.14, 4, H * 0.22).fill(C.yellow);
  g.rect(-W / 2 + 1, -H * 0.36, 4, H * 0.22).fill(C.red);
  g.rect(-W / 2 + 1, H * 0.14, 4, H * 0.22).fill(C.red);
  shine(g, -W * 0.15, -H * 0.2, W * 0.22, H * 0.09);
}

function frog(g, W, H, { angry = 0, tint = C.frog, spikes = false, fire = false } = {}) {
  const r = Math.min(W, H) / 2;
  if (fire) glowDisc(g, 0, 0, r * 1.05, C.orange, 0.45);
  // legs
  for (const s of [-1, 1]) {
    g.ellipse(s * r * 0.78, r * 0.35, r * 0.28, r * 0.42).fill(tint); stroke(g, 2.5);
    g.ellipse(s * r * 0.55, -r * 0.05, r * 0.22, r * 0.3).fill(tint); stroke(g, 2.5);
  }
  g.ellipse(0, r * 0.12, r * 0.72, r * 0.68).fill(tint); stroke(g);
  g.ellipse(0, r * 0.3, r * 0.5, r * 0.42).fill(C.belly);
  // eyes
  for (const s of [-1, 1]) {
    g.circle(s * r * 0.42, -r * 0.5, r * 0.3).fill(tint); stroke(g, 2.5);
    g.circle(s * r * 0.42, -r * 0.5, r * 0.2).fill(C.eye);
    g.circle(s * r * 0.42 + s * r * 0.03, -r * 0.5, r * 0.1 + angry * 0.02 * r).fill(C.pupil);
    if (angry > 0) {
      g.moveTo(s * r * 0.15, -r * 0.85).lineTo(s * r * 0.7, -r * (0.75 - angry * 0.12)).stroke({ width: 4 + angry, color: OUT });
    }
  }
  // spots and mouth
  for (const [x, y] of [[-0.3, -0.1], [0.25, -0.18], [0.05, -0.32]]) g.circle(x * r, y * r, r * 0.05).fill({ color: C.frogDark, alpha: 0.7 });
  g.moveTo(-r * 0.3, -r * 0.08).quadraticCurveTo(0, -r * (0.08 - angry * 0.06), r * 0.3, -r * 0.08).stroke({ width: 3, color: OUT, alpha: 0.7 });
  if (spikes) for (let i = -2; i <= 2; i++) g.poly([i * r * 0.22 - 5, -r * 0.62, i * r * 0.22 + 5, -r * 0.62, i * r * 0.22, -r * 0.95]).fill(C.frogDark);
  shine(g, -r * 0.2, -r * 0.05, r * 0.18, r * 0.09);
}

function missileBody(g, W, H, color = C.steel, tip = C.red, radioactive = false) {
  g.roundRect(-W / 2, -H / 2 + H * 0.2, W, H * 0.8, W * 0.4).fill(color); stroke(g, 2.5);
  g.poly([-W / 2, -H / 2 + H * 0.22, W / 2, -H / 2 + H * 0.22, 0, -H / 2]).fill(tip);
  g.poly([-W / 2, H / 2, -W, H / 2 + 2, -W / 2, H / 2 - H * 0.2]).fill(C.steelDark);
  g.poly([W / 2, H / 2, W, H / 2 + 2, W / 2, H / 2 - H * 0.2]).fill(C.steelDark);
  glowDisc(g, 0, H / 2 + 4, W * 0.45, C.orange, 0.6);
  if (radioactive) { g.circle(0, H * 0.1, W * 0.32).fill(C.yellow); g.circle(0, H * 0.1, W * 0.1).fill(C.black); }
}

export const SPRITES = {
  // ---- frog forms -------------------------------------------------------
  frog_s1: { w: 1, h: 1, draw: (g, W, H) => frog(g, W, H) },
  frog_s2: { w: 1, h: 1, draw: (g, W, H) => frog(g, W, H) },
  frog_s3: { w: 1, h: 1, draw: (g, W, H) => frog(g, W, H, { angry: 0.5 }) },
  frog_s4: { w: 1, h: 1, draw: (g, W, H) => frog(g, W, H, { angry: 1 }) },
  frog_k1: { w: 1.5, h: 1.5, draw: (g, W, H) => frog(g, W, H, { angry: 1.5 }) },
  frog_k2: { w: 1.5, h: 1.5, draw: (g, W, H) => frog(g, W, H, { angry: 2, spikes: true }) },
  frog_k3: { w: 1.5, h: 1.5, draw: (g, W, H) => frog(g, W, H, { angry: 2.5, spikes: true, tint: 0xa9b23a }) },
  frog_k4: { w: 1.5, h: 1.5, draw: (g, W, H) => frog(g, W, H, { angry: 3, spikes: true, tint: 0x9aa030, fire: true }) },
  frog_k5: { w: 1.5, h: 1.5, draw: (g, W, H) => frog(g, W, H, { angry: 3.5, spikes: true, tint: 0x8f9428, fire: true }) },

  // ---- act 1 traffic ----------------------------------------------------
  robotaxi: { w: 1.5, h: 0.8, draw: (g, W, H) => { carBody(g, W, H, C.white); g.roundRect(-W * 0.1, -H * 0.62, W * 0.2, H * 0.14, 3).fill(C.teal); } },
  foodtruck: { w: 2, h: 0.9, draw: (g, W, H) => {
    carBody(g, W, H, C.orange, { glassColor: C.glass });
    g.roundRect(-W * 0.45, -H / 2 - 4, W * 0.62, 8, 2).fill(C.white);
    for (let i = 0; i < 5; i++) g.rect(-W * 0.45 + i * W * 0.124, -H / 2 - 4, W * 0.062, 8).fill(C.red);
    g.circle(-W * 0.15, 0, H * 0.22).fill(C.yellow); g.circle(-W * 0.15, 0, H * 0.12).fill(C.red);
  } },
  semi: { w: 3.2, h: 0.9, draw: (g, W, H) => {
    g.roundRect(-W / 2, -H / 2, W * 0.72, H, 6).fill(C.steel); stroke(g);
    for (let i = 0; i < 3; i++) g.rect(-W / 2 + 6 + i * W * 0.22, -H / 2 + 5, 3, H - 10).fill({ color: C.steelDark, alpha: 0.6 });
    carBody(g, W * 0.26, H * 0.9, C.navy);
    g.roundRect(W * 0.24, -H * 0.45, W * 0.26, H * 0.9, 6).fill(C.navy); stroke(g);
    g.roundRect(W * 0.36, -H * 0.34, W * 0.08, H * 0.68, 4).fill(C.glass);
  } },
  police: { w: 1.6, h: 0.8, draw: (g, W, H) => {
    carBody(g, W, H, C.white); g.rect(-W * 0.34, -H / 2, W * 0.2, H).fill(C.black);
    g.roundRect(-W * 0.1, -H * 0.16, W * 0.1, H * 0.32, 2).fill(C.red); g.roundRect(0, -H * 0.16, W * 0.1, H * 0.32, 2).fill(C.blue);
    glowDisc(g, -W * 0.05, -H * 0.05, H * 0.2, C.red, 0.25); glowDisc(g, W * 0.05, H * 0.05, H * 0.2, C.blue, 0.25);
  } },
  drone: { w: 0.8, h: 0.6, draw: (g, W, H) => {
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.circle(sx * W * 0.36, sy * H * 0.36, H * 0.26).fill({ color: C.gray, alpha: 0.5 }); g.moveTo(0, 0).lineTo(sx * W * 0.36, sy * H * 0.36).stroke({ width: 3, color: C.steelDark }); }
    g.roundRect(-W * 0.2, -H * 0.2, W * 0.4, H * 0.4, 4).fill(C.brown); stroke(g, 2);
    g.circle(0, 0, H * 0.1).fill(C.red);
  } },
  newsdrone: { w: 0.8, h: 0.6, draw: (g, W, H) => { SPRITES.drone.draw(g, W, H); g.roundRect(-W * 0.2, H * 0.2, W * 0.4, H * 0.25, 2).fill(C.white); g.rect(-W * 0.12, H * 0.25, W * 0.24, H * 0.14).fill(C.red); } },
  heli: { w: 1.8, h: 0.9, draw: (g, W, H) => {
    g.rect(-W / 2, -2, W * 0.5, 4).fill(C.steelDark); g.rect(-W / 2, -H * 0.2, 6, H * 0.4).fill(C.steelDark);
    g.ellipse(W * 0.08, 0, W * 0.32, H * 0.42).fill(C.black); stroke(g);
    g.ellipse(W * 0.2, -H * 0.05, W * 0.14, H * 0.22).fill(C.glass);
    g.roundRect(-W * 0.45, -3, W * 0.9, 6, 3).fill({ color: C.gray, alpha: 0.55 });
    g.roundRect(-3, -H * 0.45, 6, H * 0.9, 3).fill({ color: C.gray, alpha: 0.55 });
  } },
  jet: { w: 2, h: 0.8, draw: (g, W, H) => {
    g.poly([W / 2, 0, -W * 0.3, -H * 0.18, -W / 2, -H * 0.12, -W / 2, H * 0.12, -W * 0.3, H * 0.18]).fill(C.steel); stroke(g);
    g.poly([W * 0.05, -H * 0.1, -W * 0.25, -H / 2, -W * 0.4, -H / 2, -W * 0.2, -H * 0.1]).fill(C.steelDark);
    g.poly([W * 0.05, H * 0.1, -W * 0.25, H / 2, -W * 0.4, H / 2, -W * 0.2, H * 0.1]).fill(C.steelDark);
    g.ellipse(W * 0.2, 0, W * 0.1, H * 0.1).fill(C.glass); glowDisc(g, -W / 2, 0, H * 0.18, C.orange, 0.7);
  } },
  tank: { w: 1.6, h: 1, draw: (g, W, H) => {
    g.roundRect(-W / 2, -H / 2, W, H * 0.3, 6).fill(C.black); g.roundRect(-W / 2, H * 0.2, W, H * 0.3, 6).fill(C.black);
    g.roundRect(-W * 0.44, -H * 0.3, W * 0.88, H * 0.6, 6).fill(0x5d6b3a); stroke(g);
    g.circle(-W * 0.05, 0, H * 0.24).fill(0x4a5630); stroke(g, 2);
    g.rect(-W * 0.05, -3, W * 0.55, 6).fill(C.steelDark);
  } },
  swattervan: { w: 1.8, h: 0.9, draw: (g, W, H) => {
    carBody(g, W, H, C.teal); g.rect(-W * 0.42, -H * 0.3, W * 0.5, H * 0.6).fill(C.white);
    g.rect(0, -2, W * 0.5, 4).fill(C.brown);
    g.roundRect(W * 0.3, -H * 0.42, W * 0.28, H * 0.84, 4).fill(C.red); stroke(g, 2);
    for (let i = 1; i < 4; i++) { g.rect(W * 0.3, -H * 0.42 + i * H * 0.21, W * 0.28, 1.5).fill({ color: OUT, alpha: 0.5 }); g.rect(W * 0.3 + i * W * 0.07, -H * 0.42, 1.5, H * 0.84).fill({ color: OUT, alpha: 0.5 }); }
  } },
  tubeman: { w: 0.7, h: 1, draw: (g, W, H) => {
    g.roundRect(-W * 0.22, -H * 0.3, W * 0.44, H * 0.8, 8).fill(C.pink); stroke(g, 2.5);
    g.roundRect(-W * 0.7, -H * 0.3, W * 0.5, 8, 4).fill(C.pink); g.roundRect(W * 0.2, -H * 0.45, 8, H * 0.4, 4).fill(C.pink);
    g.circle(0, -H * 0.4, W * 0.24).fill(C.pink); stroke(g, 2.5);
    g.circle(-W * 0.08, -H * 0.42, 2.5).fill(OUT); g.circle(W * 0.08, -H * 0.42, 2.5).fill(OUT);
    g.ellipse(0, -H * 0.32, W * 0.1, W * 0.14).fill(OUT);
  } },
  heron: { w: 2.6, h: 1.2, draw: (g, W, H) => {
    g.ellipse(-W * 0.15, 0, W * 0.32, H * 0.3).fill(0xb8c4cc); stroke(g);
    g.poly([-W * 0.45, -H * 0.5, W * 0.3, -H * 0.05, -W * 0.3, H * 0.15]).fill(0xa3b0b8);
    g.moveTo(W * 0.1, -H * 0.05).quadraticCurveTo(W * 0.3, -H * 0.5, W * 0.38, -H * 0.3).stroke({ width: 8, color: 0xb8c4cc });
    g.circle(W * 0.38, -H * 0.3, H * 0.13).fill(0xb8c4cc); stroke(g, 2);
    g.poly([W * 0.46, -H * 0.32, W * 0.5 + W * 0.12, -H * 0.26, W * 0.46, -H * 0.2]).fill(C.yellow);
    g.circle(W * 0.4, -H * 0.33, 3).fill(C.red);
  } },
  chef: { w: 1.4, h: 1.4, draw: (g, W, H) => {
    g.ellipse(0, H * 0.2, W * 0.34, H * 0.3).fill(C.white); stroke(g);
    g.circle(0, -H * 0.1, W * 0.2).fill(C.flesh); stroke(g, 2.5);
    g.roundRect(-W * 0.22, -H * 0.5, W * 0.44, H * 0.3, 10).fill(C.white); stroke(g, 2.5);
    g.moveTo(-W * 0.08, -H * 0.02).quadraticCurveTo(0, H * 0.06, W * 0.08, -H * 0.02).stroke({ width: 4, color: OUT });
    g.rect(W * 0.3, -H * 0.5, 4, H * 0.7).fill(C.steel);
    for (let i = -1; i <= 1; i++) g.rect(W * 0.3 + i * 5, -H * 0.5, 2, H * 0.15).fill(C.steel);
    g.rect(-W * 0.36, -H * 0.5, 5, H * 0.7).fill(C.steel); g.poly([-W * 0.38, -H * 0.5, -W * 0.28, -H * 0.5, -W * 0.33, -H * 0.66]).fill(C.steel);
  } },
  flymech: { w: 1.6, h: 1.2, draw: (g, W, H) => {
    g.ellipse(-W * 0.25, -H * 0.15, W * 0.36, H * 0.24).fill({ color: C.glass, alpha: 0.5 }); g.ellipse(W * 0.25, -H * 0.15, W * 0.36, H * 0.24).fill({ color: C.glass, alpha: 0.5 });
    g.roundRect(-W * 0.3, -H * 0.2, W * 0.6, H * 0.5, 10).fill(C.steelDark); stroke(g);
    for (let i = 0; i < 3; i++) g.rect(-W * 0.25 + i * W * 0.18, -H * 0.15, W * 0.14, H * 0.4).fill({ color: C.steel, alpha: 0.6 });
    g.circle(0, -H * 0.3, W * 0.16).fill(C.steel); stroke(g, 2);
    g.circle(-W * 0.06, -H * 0.32, W * 0.06).fill(C.red); g.circle(W * 0.06, -H * 0.32, W * 0.06).fill(C.red);
    g.circle(0, 0, 4).fill(C.yellow);
  } },
  bomber: { w: 2.8, h: 1, draw: (g, W, H) => {
    g.poly([-W / 2, -H * 0.5, W * 0.1, -H * 0.15, W * 0.1, H * 0.15, -W / 2, H * 0.5]).fill(C.steelDark);
    g.roundRect(-W * 0.35, -H * 0.12, W * 0.85, H * 0.24, 8).fill(C.steel); stroke(g);
    g.ellipse(W * 0.4, 0, W * 0.08, H * 0.1).fill(C.glass);
    for (const s of [-1, 1]) glowDisc(g, -W * 0.3, s * H * 0.3, H * 0.12, C.orange, 0.6);
  } },
  carrier: { w: 3.4, h: 1, draw: (g, W, H) => {
    g.roundRect(-W / 2, -H / 2, W, H, 8).fill(C.steelDark); stroke(g);
    g.rect(-W * 0.44, -2, W * 0.88, 3).fill({ color: C.white, alpha: 0.6 });
    for (let i = 0; i < 8; i++) g.rect(-W * 0.42 + i * W * 0.11, -H * 0.3, 3, H * 0.6).fill({ color: C.white, alpha: 0.25 });
    g.roundRect(W * 0.1, -H * 0.5 - 4, W * 0.18, H * 0.4, 3).fill(C.steel); stroke(g, 2);
  } },
  kraken: { w: 2, h: 1.6, draw: (g, W, H) => {
    for (let i = -3; i <= 3; i++) g.moveTo(i * W * 0.12, H * 0.1).quadraticCurveTo(i * W * 0.2, H * 0.5, i * W * 0.28, H * 0.45).stroke({ width: 9, color: C.purple, cap: 'round' });
    g.ellipse(0, -H * 0.1, W * 0.3, H * 0.34).fill(0x8d4cc9); stroke(g);
    g.circle(-W * 0.1, -H * 0.15, W * 0.08).fill(C.yellow); g.circle(W * 0.1, -H * 0.15, W * 0.08).fill(C.yellow);
    g.circle(-W * 0.1, -H * 0.15, W * 0.03).fill(OUT); g.circle(W * 0.1, -H * 0.15, W * 0.03).fill(OUT);
  } },
  hurricane: { w: 2.2, h: 2.2, draw: (g, W, H) => {
    const r = W / 2;
    for (let a = 0; a < 3; a++) for (let t = 0; t < 1; t += 0.05) {
      const ang = a * 2.1 + t * 4.5, rad = r * (0.15 + t * 0.85);
      g.circle(Math.cos(ang) * rad, Math.sin(ang) * rad, 5 + t * 6).fill({ color: 0xd9e4ea, alpha: 0.75 - t * 0.5 });
    }
    g.circle(0, 0, r * 0.22).fill(0xe8f0f4); stroke(g, 2);
    g.circle(-r * 0.08, -r * 0.05, 3).fill(OUT); g.circle(r * 0.08, -r * 0.05, 3).fill(OUT);
    g.moveTo(-r * 0.08, r * 0.08).lineTo(r * 0.08, r * 0.08).stroke({ width: 3, color: OUT });
    g.moveTo(-r * 0.14, -r * 0.14).lineTo(-r * 0.03, -r * 0.1).stroke({ width: 3, color: OUT });
  } },
  liberty: { w: 1.2, h: 1.8, draw: (g, W, H) => {
    g.roundRect(-W * 0.32, -H * 0.1, W * 0.64, H * 0.6, 6).fill(0x5ea07a); stroke(g);
    g.circle(0, -H * 0.25, W * 0.2).fill(0x6fb08a); stroke(g, 2);
    for (let i = -3; i <= 3; i++) g.poly([i * W * 0.1 - 3, -H * 0.4, i * W * 0.1 + 3, -H * 0.4, i * W * 0.1, -H * 0.55]).fill(0x6fb08a);
    g.rect(W * 0.3, -H * 0.5, 5, H * 0.5).fill(0x6fb08a); glowDisc(g, W * 0.32, -H * 0.52, W * 0.14, C.orange, 0.8);
    g.roundRect(-W * 0.45, -H * 0.05, W * 0.18, H * 0.25, 3).fill(0x6fb08a);
  } },
  duck: { w: 1.8, h: 1.2, draw: (g, W, H) => {
    g.ellipse(-W * 0.1, H * 0.1, W * 0.4, H * 0.32).fill(C.yellow); stroke(g);
    g.circle(W * 0.22, -H * 0.15, H * 0.3).fill(C.yellow); stroke(g);
    g.roundRect(W * 0.4, -H * 0.2, W * 0.16, H * 0.16, 4).fill(C.orange);
    g.circle(W * 0.28, -H * 0.24, 4).fill(OUT);
    g.rect(-W * 0.4, -H * 0.15, W * 0.35, 4).fill(C.steelDark); g.circle(-W * 0.4, -H * 0.15, H * 0.1).fill(C.steelDark);
  } },
  moon: { w: 2, h: 2, draw: (g, W, H) => {
    const r = W / 2 - 2;
    g.circle(0, 0, r).fill(0xc9c9c4); stroke(g);
    for (const [x, y, s] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.13], [0.05, 0.4, 0.1], [-0.1, -0.5, 0.08], [0.45, -0.35, 0.09]]) g.circle(x * r, y * r, s * r).fill(0x9f9f9a);
    shine(g, -r * 0.3, -r * 0.35, r * 0.25, r * 0.12);
  } },
  station: { w: 2.6, h: 0.8, draw: (g, W, H) => {
    for (const s of [-1, 1]) { g.roundRect(s * W * 0.46 - W * 0.16, -H / 2, W * 0.32, H, 2).fill(C.navy); stroke(g, 2); for (let i = 0; i < 4; i++) g.rect(s * W * 0.46 - W * 0.16 + i * W * 0.08, -H / 2, 1.5, H).fill({ color: C.glass, alpha: 0.4 }); }
    g.roundRect(-W * 0.3, -H * 0.2, W * 0.6, H * 0.4, 6).fill(C.white); stroke(g, 2);
    g.roundRect(-W * 0.08, -H * 0.36, W * 0.16, H * 0.72, 4).fill(C.steel);
  } },
  alienship: { w: 1.8, h: 0.9, draw: (g, W, H) => {
    g.ellipse(0, H * 0.1, W / 2, H * 0.3).fill(C.steel); stroke(g);
    g.ellipse(0, -H * 0.15, W * 0.24, H * 0.3).fill({ color: C.teal, alpha: 0.7 }); stroke(g, 2);
    g.circle(-W * 0.06, -H * 0.15, 4).fill(OUT); g.circle(W * 0.06, -H * 0.15, 4).fill(OUT);
    for (let i = -2; i <= 2; i++) g.circle(i * W * 0.18, H * 0.16, 3).fill(i % 2 ? C.pink : C.yellow);
  } },

  // ---- pickups --------------------------------------------------------
  dynamite: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 0, W * 0.26, C.red, 0.3);
    for (const x of [-9, 0, 9]) { g.roundRect(x - 5, -14, 10, 28, 3).fill(C.red); stroke(g, 2); }
    g.rect(-16, -3, 32, 6).fill(C.brown);
    g.moveTo(0, -14).quadraticCurveTo(6, -24, 12, -20).stroke({ width: 2, color: OUT }); glowDisc(g, 12, -20, 3, C.yellow, 0.9);
  } },
  mine: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 0, W * 0.24, C.teal, 0.35);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.circle(Math.cos(a) * 15, Math.sin(a) * 15, 3.5).fill(C.steelDark); }
    g.circle(0, 0, 13).fill(C.black); stroke(g, 2); g.circle(0, 0, 4).fill(C.teal);
  } },
  tanker: { w: 1.6, h: 0.8, draw: (g, W, H) => { carBody(g, W, H, C.steel); g.roundRect(-W * 0.45, -H * 0.4, W * 0.6, H * 0.8, H * 0.4).fill(C.white); stroke(g, 2); g.circle(-W * 0.15, 0, H * 0.22).fill(C.red); g.rect(-W * 0.15 - 2, -H * 0.16, 4, H * 0.32).fill(C.white); } },
  gasstation: { w: 1, h: 1, draw: (g, W, H) => {
    g.roundRect(-26, -26, 52, 18, 3).fill(C.red); stroke(g, 2);
    for (const x of [-14, 4]) { g.roundRect(x, -4, 10, 22, 2).fill(C.white); stroke(g, 2); g.rect(x + 2, 0, 6, 6).fill(C.blue); }
    g.rect(-3, -8, 6, 26).fill(C.steelDark); glowDisc(g, 0, 0, 12, C.red, 0.2);
  } },
  propane: { w: 1, h: 1, draw: (g, W, H) => { glowDisc(g, 0, 0, 14, C.orange, 0.25); g.roundRect(-14, -22, 28, 44, 12).fill(C.white); stroke(g, 2); g.roundRect(-8, -28, 16, 8, 3).fill(C.steelDark); g.rect(-10, -2, 20, 10).fill(C.red); } },
  silo: { w: 1, h: 1, draw: (g, W, H) => { g.circle(0, 0, 26).fill(0x7b7b78); stroke(g, 2); g.circle(0, 0, 16).fill(C.black); g.poly([-8, 6, 8, 6, 0, -14]).fill(C.red); g.rect(-8, 6, 16, 6).fill(C.steel); glowDisc(g, 0, 0, 14, C.red, 0.15); } },
  volcano: { w: 1, h: 1, draw: (g, W, H) => { g.poly([-30, 26, 30, 26, 12, -14, -12, -14]).fill(C.brown); stroke(g, 2); glowDisc(g, 0, -14, 12, C.orange, 0.8); g.ellipse(0, -14, 12, 5).fill(C.yellow); g.moveTo(-6, -12).lineTo(-10, 8).stroke({ width: 4, color: C.orange }); } },
  sub: { w: 1.4, h: 0.6, draw: (g, W, H) => { g.roundRect(-W / 2, -H / 2 + 4, W, H - 8, H / 2).fill(C.black); stroke(g, 2); g.roundRect(-W * 0.1, -H / 2 - 4, W * 0.2, H * 0.5, 3).fill(C.black); g.rect(0, -H / 2 - 12, 2, 10).fill(C.steel); glowDisc(g, W * 0.3, 0, 6, C.red, 0.5); } },
  oilrig: { w: 1.2, h: 1.2, draw: (g, W, H) => { for (const x of [-22, 22]) g.rect(x - 4, 0, 8, 30).fill(C.steelDark); g.roundRect(-30, -10, 60, 16, 3).fill(C.yellow); stroke(g, 2); g.rect(-6, -34, 12, 24).fill(C.steelDark); g.poly([-14, -34, 14, -34, 0, -56]).fill(C.steel); glowDisc(g, 0, -58, 8, C.orange, 0.9); } },
  nukesilo: { w: 1, h: 1, draw: (g, W, H) => { SPRITES.silo.draw(g, W, H); g.circle(0, 0, 9).fill(C.yellow); for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 - Math.PI / 2; g.poly([0, 0, Math.cos(a - 0.5) * 9, Math.sin(a - 0.5) * 9, Math.cos(a + 0.5) * 9, Math.sin(a + 0.5) * 9]).fill(C.black); } g.circle(0, 0, 2.5).fill(C.black); } },
  food: { w: 1, h: 1, draw: (g, W, H) => { g.circle(0, -6, 16).fill(C.yellow); stroke(g, 2); g.roundRect(-18, -6, 36, 8, 3).fill(C.green); g.roundRect(-16, 0, 32, 8, 3).fill(C.brown); g.roundRect(-18, 6, 36, 12, 6).fill(C.yellow); stroke(g, 2); g.circle(-6, -10, 2).fill(C.white); g.circle(4, -8, 2).fill(C.white); } },

  // ---- power-ups --------------------------------------------------------
  pw_invuln: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 0, 20, C.glass, 0.55);
    g.circle(0, 0, 19).stroke({ width: 4, color: C.glass, alpha: 0.9 });
    g.poly([0, -18, 15, -8, 15, 8, 0, 20, -15, 8, -15, -8]).fill({ color: C.white, alpha: 0.85 }); stroke(g, 2.5);
    g.poly([0, -11, 9, -5, 9, 5, 0, 12, -9, 5, -9, -5]).fill(C.glass);
    shine(g, -5, -6, 5, 3);
  } },
  pw_freeze: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 0, 18, 0x9fd8ff, 0.5);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      g.moveTo(0, 0).lineTo(Math.cos(a) * 19, Math.sin(a) * 19).stroke({ width: 4, color: 0xe8f6ff, cap: 'round' });
      for (const b of [-0.7, 0.7]) g.moveTo(Math.cos(a) * 11, Math.sin(a) * 11)
        .lineTo(Math.cos(a) * 11 + Math.cos(a + b) * 7, Math.sin(a) * 11 + Math.sin(a + b) * 7)
        .stroke({ width: 3, color: 0xe8f6ff, cap: 'round' });
    }
    g.circle(0, 0, 4.5).fill(C.white);
  } },
  pw_fire: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 2, 18, C.orange, 0.6);
    g.moveTo(0, -22).quadraticCurveTo(14, -4, 10, 8).quadraticCurveTo(8, 20, 0, 21)
      .quadraticCurveTo(-8, 20, -10, 8).quadraticCurveTo(-14, -4, 0, -22).fill(C.orange); stroke(g, 2.5);
    g.moveTo(0, -11).quadraticCurveTo(7, -1, 5, 7).quadraticCurveTo(4, 14, 0, 15)
      .quadraticCurveTo(-4, 14, -5, 7).quadraticCurveTo(-7, -1, 0, -11).fill(C.yellow);
    g.circle(0, 9, 3).fill(C.white);
  } },
  pw_armor: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 0, 17, 0xc0c4cc, 0.35);
    g.moveTo(0, -20).lineTo(16, -13).lineTo(16, 5).quadraticCurveTo(16, 16, 0, 21)
      .quadraticCurveTo(-16, 16, -16, 5).lineTo(-16, -13).fill(0xc0c4cc); stroke(g);
    for (const [x, y, r] of [[-6, -6, 3], [5, 2, 4], [-2, 9, 2.5]]) g.circle(x, y, r).fill({ color: OUT, alpha: 0.45 });
    g.moveTo(-10, -12).lineTo(9, 12).stroke({ width: 3, color: OUT, alpha: 0.5 });
    g.moveTo(9, -10).lineTo(-6, 6).stroke({ width: 2.5, color: OUT, alpha: 0.4 });
    shine(g, -7, -12, 5, 2.5);
  } },
  pw_life: { w: 1, h: 1, draw: (g, W, H) => {
    glowDisc(g, 0, 0, 17, C.red, 0.5);
    g.moveTo(0, 19).quadraticCurveTo(-19, 4, -19, -6).quadraticCurveTo(-19, -19, -9, -19)
      .quadraticCurveTo(-2, -19, 0, -11).quadraticCurveTo(2, -19, 9, -19)
      .quadraticCurveTo(19, -19, 19, -6).quadraticCurveTo(19, 4, 0, 19).fill(C.red); stroke(g);
    shine(g, -8, -9, 5, 3.5);
    g.circle(7, -3, 2.5).fill({ color: C.white, alpha: 0.5 });
  } },

  // ---- projectiles ------------------------------------------------------
  missile: { w: 0.5, h: 1.2, draw: (g, W, H) => missileBody(g, W, H) },
  bomb: { w: 0.6, h: 0.8, draw: (g, W, H) => { g.ellipse(0, H * 0.1, W / 2, H * 0.38).fill(C.black); stroke(g, 2); g.rect(-W * 0.2, -H / 2, W * 0.4, H * 0.25).fill(C.steelDark); shine(g, -W * 0.15, 0, W * 0.15, H * 0.1); } },
  cruise: { w: 1.4, h: 0.5, draw: (g, W, H) => { g.roundRect(-W / 2, -H / 2, W, H, H / 2).fill(C.steel); stroke(g, 2); g.poly([W / 2 - 4, -H / 2, W / 2 + 10, 0, W / 2 - 4, H / 2]).fill(C.red); g.rect(-W * 0.2, -H * 0.9, 4, H * 1.8).fill(C.steelDark); glowDisc(g, -W / 2, 0, H * 0.5, C.orange, 0.7); } },
  torpedo: { w: 1.4, h: 0.5, draw: (g, W, H) => { g.roundRect(-W / 2, -H / 2, W, H, H / 2).fill(C.black); stroke(g, 2); g.circle(W / 2 - H / 2, 0, H / 2 - 2).fill(C.red); for (let i = 0; i < 5; i++) g.circle(-W / 2 - 6 - i * 7, (i % 2 ? 4 : -4), 3 + i).fill({ color: C.white, alpha: 0.5 - i * 0.08 }); } },
  nuke: { w: 0.7, h: 1.4, draw: (g, W, H) => missileBody(g, W, H, C.steelDark, C.yellow, true) },
  bullet: { w: 0.3, h: 0.3, draw: (g, W, H) => { glowDisc(g, 0, 0, W * 0.5, C.yellow, 0.7); g.circle(0, 0, W * 0.35).fill(C.white); } },
  strafe: { w: 0.3, h: 0.7, draw: (g, W, H) => { glowDisc(g, 0, 0, W * 0.5, C.yellow, 0.5); g.roundRect(-W * 0.2, -H / 2, W * 0.4, H, W * 0.2).fill(C.yellow); } },
  fork: { w: 0.5, h: 1.6, draw: (g, W, H) => { g.rect(-3, -H / 2 + H * 0.3, 6, H * 0.7).fill(C.steel); stroke(g, 1.5); for (let i = -1; i <= 1; i++) g.rect(i * (W * 0.35) - 2, -H / 2, 4, H * 0.32).fill(C.steel); g.rect(-W / 2, -H / 2 + H * 0.28, W, 5).fill(C.steel); } },
  jetlaunch: { w: 1.2, h: 0.6, draw: (g, W, H) => SPRITES.jet.draw(g, W, H) },
  laser: { w: 0.6, h: 15, draw: (g, W, H) => { g.rect(-W / 2, -H / 2, W, H).fill({ color: C.red, alpha: 0.35 }); g.rect(-W * 0.25, -H / 2, W * 0.5, H).fill({ color: C.red, alpha: 0.7 }); g.rect(-W * 0.08, -H / 2, W * 0.16, H).fill(C.white); } },
  hand: { w: 2.4, h: 2.4, draw: (g, W, H) => {
    g.roundRect(-W * 0.32, -H * 0.1, W * 0.64, H * 0.55, 18).fill(C.flesh); stroke(g);
    for (let i = 0; i < 4; i++) g.roundRect(-W * 0.3 + i * W * 0.16, -H * 0.42, W * 0.13, H * 0.4, 9).fill(C.flesh);
    g.roundRect(W * 0.3, -H * 0.1, W * 0.14, H * 0.32, 8).fill(C.flesh);
    g.roundRect(-W * 0.5, -H * 0.5, W * 0.36, H * 0.3, 4).fill(C.red); stroke(g, 2);
    for (let i = 1; i < 4; i++) { g.rect(-W * 0.5, -H * 0.5 + i * H * 0.075, W * 0.36, 1.5).fill({ color: OUT, alpha: 0.5 }); g.rect(-W * 0.5 + i * W * 0.09, -H * 0.5, 1.5, H * 0.3).fill({ color: OUT, alpha: 0.5 }); }
    g.rect(-W * 0.34, -H * 0.2, 4, H * 0.14).fill(C.brown);
  } },
  flare: { w: 3, h: 0.8, draw: (g, W, H) => { for (let i = 0; i < 6; i++) g.ellipse(-W / 2 + i * W / 6 + W / 12, 0, W / 10, H * (0.2 + i * 0.06)).fill({ color: i % 2 ? C.orange : C.yellow, alpha: 0.75 }); glowDisc(g, W / 2 - 10, 0, H * 0.5, C.white, 0.8); } },
};


// ---- boss one: Chaco, the frog boxer, and the ring ----------------------
// One parameterised drawing per character so all twelve poses stay on-model.
function chaco(g, W, H, o = {}) {
  const s = Math.min(W, H) / 100;          // 100-unit design space
  const px = (x, y) => [x * s, y * s];
  const hide = o.wrecked ? 0x6d7566 : 0x7c846f;
  const suit = o.wrecked ? 0xb9b19b : 0xefe9d8;
  const lean = o.lean || 0, arm = o.arm || 0;
  if (o.glow) glowDisc(g, 0, 0, 46 * s, C.red, 0.35);
  // legs
  for (const d of [-1, 1]) {
    g.roundRect(...px(d * 13 - 7, 18), 14 * s, 30 * s, 6 * s).fill(suit); stroke(g, 2.5);
    g.ellipse(...px(d * 13 + lean * 3, 50), 10 * s, 5 * s).fill(0xf6f3ea); stroke(g, 2);
  }
  // torso and open jacket
  g.roundRect(...px(-20 + lean * 2, -18), 40 * s, 40 * s, 8 * s).fill(suit); stroke(g);
  g.poly([...px(-6, -18), ...px(6, -18), ...px(2, 14), ...px(-2, 14)]).fill(hide);
  for (let i = 0; i < 4; i++) g.circle(...px(-2, -8 + i * 7), 1.6 * s).fill(0xc9a227);
  // arms
  const ay = o.armY ?? 0;
  g.roundRect(...px(-34 - arm * 16, -12 + ay), 18 * s, 10 * s, 5 * s).fill(suit); stroke(g, 2.5);
  g.circle(...px(-38 - arm * 20, -7 + ay), 8 * s).fill(C.red); stroke(g, 2.5);
  g.roundRect(...px(16 + arm * 10, -12 - ay), 18 * s, 10 * s, 5 * s).fill(suit); stroke(g, 2.5);
  g.circle(...px(36 + arm * 22, -7 - ay), 8 * s).fill(C.red); stroke(g, 2.5);
  // spines and head
  for (let i = -2; i <= 2; i++) g.poly([...px(i * 7 - 4, -22), ...px(i * 7 + 4, -22), ...px(i * 7, -34)]).fill(hide);
  g.ellipse(...px(lean * 4, -34), 19 * s, 16 * s).fill(hide); stroke(g);
  g.poly([...px(-19, -40), ...px(-9, -34), ...px(-19, -28)]).fill(hide);
  g.poly([...px(19, -40), ...px(9, -34), ...px(19, -28)]).fill(hide);
  if (o.mouth === 'wide') {
    g.ellipse(...px(lean * 4, -27), 12 * s, 11 * s).fill(0x2a0f12);
    for (let i = -2; i <= 2; i++) { g.poly([...px(i * 5 - 2, -36), ...px(i * 5 + 2, -36), ...px(i * 5, -30)]).fill(0xfffaf0);
      g.poly([...px(i * 5 - 2, -18), ...px(i * 5 + 2, -18), ...px(i * 5, -24)]).fill(0xfffaf0); }
    g.ellipse(...px(lean * 4, -22), 7 * s, 5 * s).fill(C.pink);
  } else {
    g.moveTo(...px(-9, -28)).lineTo(...px(9, -28)).stroke({ width: 3 * s, color: OUT });
    if (o.fang !== false) g.poly([...px(4, -28), ...px(8, -28), ...px(6, -22)]).fill(0xd9b430);
  }
  if (o.shades) { g.roundRect(...px(-16, -40), 32 * s, 9 * s, 3 * s).fill(0xc9a227); stroke(g, 2); }
  else { for (const d of [-1, 1]) { g.circle(...px(d * 8, -37), 4 * s).fill(o.dazed ? 0xf3e6c8 : C.red);
    if (o.dazed) { g.moveTo(...px(d * 8 - 3, -40)).lineTo(...px(d * 8 + 3, -34)).stroke({ width: 2 * s, color: OUT });
      g.moveTo(...px(d * 8 + 3, -40)).lineTo(...px(d * 8 - 3, -34)).stroke({ width: 2 * s, color: OUT }); } } }
  if (o.cigar) { g.roundRect(...px(8, -30), 14 * s, 3.5 * s, 1.5 * s).fill(0x6f4d2c); glowDisc(g, ...px(23, -28), 2.5 * s, C.orange, .9); }
  if (o.powder) for (let i = 0; i < 22; i++) g.circle(...px(30 + (i % 7) * 6, -14 + ((i * 5) % 24) - 12), (1 + (i % 3)) * s).fill({ color: 0xffffff, alpha: .85 });
  if (o.dust) for (let i = 0; i < 26; i++) g.circle(...px(-30 + (i * 7) % 62, -46 + ((i * 11) % 26)), (2 + (i % 4)) * s).fill({ color: 0xffffff, alpha: .7 });
}

function boxfrog(g, W, H, o = {}) {
  const s = Math.min(W, H) / 100;
  const px = (x, y) => [x * s, y * s];
  const lean = o.lean || 0, squat = o.squat || 0;
  for (const d of [-1, 1]) g.ellipse(...px(d * 20, 34 - squat * 4), 9 * s, 6 * s).fill(C.frog), stroke(g, 2);
  g.ellipse(...px(lean * 8, 8 + squat * 10), 30 * s, (28 - squat * 6) * s).fill(C.frog); stroke(g);
  g.ellipse(...px(lean * 8, 16 + squat * 8), 20 * s, 15 * s).fill(C.belly);
  for (const [x, y] of [[-14, -4], [12, -8], [2, -14]]) g.circle(...px(x + lean * 8, y), 2.2 * s).fill({ color: C.frogDark, alpha: .7 });
  // gloves
  const gy = o.gloveY ?? 0;
  for (const d of [-1, 1]) {
    const gx = o.punch && d === 1 ? 40 : d * 30;
    g.circle(...px(gx + lean * 6, -4 + gy + (o.up ? -26 : 0)), 11 * s).fill(C.red); stroke(g, 2.5);
  }
  // head
  const hy = -20 + squat * 8;
  g.ellipse(...px(lean * 9, hy), 22 * s, 18 * s).fill(C.frog); stroke(g);
  for (const d of [-1, 1]) {
    g.circle(...px(d * 11 + lean * 9, hy - 12), 9 * s).fill(C.frog); stroke(g, 2.5);
    g.circle(...px(d * 11 + lean * 9, hy - 12), 6.5 * s).fill(C.eye);
    if (o.dazed) { g.moveTo(...px(d * 11 + lean * 9 - 4, hy - 16)).lineTo(...px(d * 11 + lean * 9 + 4, hy - 8)).stroke({ width: 2.5 * s, color: OUT });
      g.moveTo(...px(d * 11 + lean * 9 + 4, hy - 16)).lineTo(...px(d * 11 + lean * 9 - 4, hy - 8)).stroke({ width: 2.5 * s, color: OUT }); }
    else if (o.shut) g.moveTo(...px(d * 11 + lean * 9 - 5, hy - 12)).lineTo(...px(d * 11 + lean * 9 + 5, hy - 12)).stroke({ width: 3 * s, color: OUT });
    else g.circle(...px(d * 11 + lean * 9 + (o.lean ? lean * 2 : 0), hy - 12), 3 * s).fill(C.pupil);
  }
  if (o.tongue) { g.roundRect(...px(lean * 9, hy - 3), 46 * s, 7 * s, 3.5 * s).fill(C.pink); stroke(g, 2); g.circle(...px(lean * 9 + 46, hy + 0.5), 6 * s).fill(C.pink); }
  else if (o.open) { g.ellipse(...px(lean * 9, hy + 2), 11 * s, 8 * s).fill(0x7d2130); g.ellipse(...px(lean * 9, hy + 5), 7 * s, 4 * s).fill(C.pink); }
  else g.moveTo(...px(lean * 9 - 9, hy + 2)).quadraticCurveTo(...px(lean * 9, hy + (o.happy ? 7 : 4)), ...px(lean * 9 + 9, hy + 2)).stroke({ width: 3 * s, color: OUT, alpha: .8 });
  if (o.stars) for (let i = 0; i < 5; i++) { const a = i * 1.26; g.poly([...px(Math.cos(a) * 30, hy - 26 + Math.sin(a) * 9), ...px(Math.cos(a) * 30 + 5, hy - 20 + Math.sin(a) * 9), ...px(Math.cos(a) * 30 - 5, hy - 20 + Math.sin(a) * 9)]).fill(C.yellow); }
  if (o.dyn) { g.roundRect(...px(lean * 9 + 4, hy - 4), 22 * s, 7 * s, 3 * s).fill(C.red); stroke(g, 2); glowDisc(g, ...px(lean * 9 + 28, hy - 1), 3 * s, C.yellow, .9); }
}

Object.assign(SPRITES, {
  chaco_idle:    { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, cigar: true }) },
  chaco_tell_jab:{ w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, cigar: true, lean: -0.6, armY: 6 }) },
  chaco_jab:     { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, arm: 0.9, lean: 0.5 }) },
  chaco_tell_hay:{ w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, lean: -1, arm: -0.5, armY: -8 }) },
  chaco_hay:     { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { arm: 1.3, lean: 1 }) },
  chaco_chupada: { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { mouth: 'wide', arm: 0.5, lean: 0.4 }) },
  chaco_stunned: { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { dazed: true, lean: -0.3, armY: 14, wrecked: true }) },
  chaco_polvo:   { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, powder: true, arm: 0.6 }) },
  chaco_down:    { w: 3.4, h: 2.2, draw: (g, W, H) => chaco(g, W, H, { dazed: true, wrecked: true, armY: 20 }) },
  chaco_intro:   { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, cigar: true, arm: -0.6 }) },
  chaco_taunt:   { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { shades: true, cigar: true, arm: 0.3, armY: -6 }) },
  chaco_hurt:    { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { lean: -0.7, armY: 8 }) },
  chaco_stagger: { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { dazed: true, lean: -1, armY: -12, wrecked: true }) },
  chaco_belt:    { w: 3.2, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { wrecked: true, arm: -0.8, armY: -18, mouth: 'wide' }) },
  chaco_berserk: { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { wrecked: true, dust: true, glow: true, mouth: 'wide' }) },
  chaco_rage:    { w: 3.2, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { wrecked: true, glow: true, arm: 1.2, mouth: 'wide' }) },
  chaco_dead:    { w: 3.4, h: 2.2, draw: (g, W, H) => chaco(g, W, H, { wrecked: true, dazed: true, armY: 22 }) },
  chaco_win:     { w: 3, h: 3.4, draw: (g, W, H) => chaco(g, W, H, { wrecked: true, arm: -0.9, armY: -20, mouth: 'wide' }) },

  boxfrog_guard: { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, {}) },
  boxfrog_left:  { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { lean: -1 }) },
  boxfrog_right: { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { lean: 1 }) },
  boxfrog_duck:  { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { squat: 1, shut: true, up: true }) },
  boxfrog_tongue:{ w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { tongue: true, punch: true }) },
  boxfrog_eat:   { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { open: true, dyn: true }) },
  boxfrog_hurt:  { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { dazed: true, lean: -0.6, open: true }) },
  boxfrog_down:  { w: 1.8, h: 1.4, draw: (g, W, H) => boxfrog(g, W, H, { dazed: true, stars: true, squat: 1 }) },
  boxfrog_win:   { w: 1.6, h: 1.6, draw: (g, W, H) => boxfrog(g, W, H, { up: true, open: true, happy: true }) },

  ring_canvas: { w: 1, h: 1, draw: (g, W, H) => { g.rect(-W / 2, -H / 2, W, H).fill(0x8a7f6a);
    for (let i = 0; i < 14; i++) g.circle((i * 37 % W) - W / 2, (i * 53 % H) - H / 2, 3 + (i % 3)).fill({ color: 0x6d6353, alpha: .5 }); } },
  ring_fence: { w: 2, h: 2, draw: (g, W, H) => { for (let i = -6; i <= 6; i++) { g.moveTo(i * 16 - W / 2, -H / 2).lineTo(i * 16 + H - W / 2, H / 2).stroke({ width: 2, color: 0x8f95a0, alpha: .55 });
    g.moveTo(i * 16 - W / 2, H / 2).lineTo(i * 16 + H - W / 2, -H / 2).stroke({ width: 2, color: 0x8f95a0, alpha: .55 }); } } },
  ring_light: { w: 1.4, h: 2, draw: (g, W, H) => { g.rect(-3, -H * 0.1, 6, H * 0.6).fill(C.steelDark);
    g.poly([-W * 0.3, -H * 0.5, W * 0.3, -H * 0.5, W * 0.22, -H * 0.16, -W * 0.22, -H * 0.16]).fill(C.steel); stroke(g, 2);
    glowDisc(g, 0, -H * 0.32, W * 0.22, C.yellow, .95); } },
  ring_crowd: { w: 4, h: 1, draw: (g, W, H) => { for (let i = 0; i < 18; i++) { const x = -W / 2 + i * (W / 17), h = H * (0.5 + (i % 4) * 0.1);
    g.ellipse(x, H / 2 - h, 9, 11).fill(0x111114); g.roundRect(x - 11, H / 2 - h + 8, 22, h, 6).fill(0x111114); } } },
  boss_dynamite: { w: 1, h: 1, draw: (g, W, H) => SPRITES.dynamite.draw(g, W, H) },
  boss_bag: { w: 1, h: 1, draw: (g, W, H) => { g.roundRect(-W * 0.22, -H * 0.26, W * 0.44, H * 0.52, 6).fill({ color: 0xfdfdfd, alpha: .95 }); stroke(g, 2.5);
    g.roundRect(-W * 0.1, -H * 0.34, W * 0.2, H * 0.1, 3).fill(0xd8d8d8); for (let i = 0; i < 9; i++) g.circle(-W * 0.14 + (i % 3) * W * 0.14, -H * 0.1 + Math.floor(i / 3) * H * 0.14, 3).fill({ color: 0xe6e6e6, alpha: .9 }); } },
  boss_belt: { w: 2, h: 1, draw: (g, W, H) => { g.roundRect(-W / 2, -H * 0.18, W, H * 0.36, 5).fill(0x7a3d1d); stroke(g, 2);
    g.ellipse(0, 0, W * 0.26, H * 0.46).fill(0xd9b430); stroke(g); g.ellipse(0, 0, W * 0.16, H * 0.3).fill(0xf0d878); } },
  ring_post: { w: 1, h: 2.4, draw: (g, W, H) => { g.roundRect(-W * 0.16, -H / 2, W * 0.32, H, 5).fill(0x9b1f28); stroke(g);
    for (let i = 0; i < 3; i++) g.roundRect(W * 0.1, -H * 0.34 + i * H * 0.28, W * 0.9, 6, 3).fill(0xe8e4d8); } },
  boss_stars: { w: 1.6, h: 1.6, draw: (g, W, H) => { for (let i = 0; i < 6; i++) { const a = i * 1.05, r = Math.min(W, H) * 0.32;
    g.poly([Math.cos(a) * r, Math.sin(a) * r - 8, Math.cos(a) * r + 7, Math.sin(a) * r + 5, Math.cos(a) * r - 7, Math.sin(a) * r + 5]).fill(C.yellow); } } },
});


// ---- boss two: the Landlord ---------------------------------------------
function landlord(g, W, H, o = {}) {
  const s = Math.min(W, H) / 100;
  const px = (x, y) => [x * s, y * s];
  const vest = o.grim ? 0xb9b3a4 : 0xe6e1d2;
  const skin = 0xd7a882;
  for (const d of [-1, 1]) {                       // legs, socks, sandals
    g.roundRect(...px(d * 13 - 8, 16), 16 * s, 30 * s, 5 * s).fill(0x5b6069); stroke(g, 2.5);
    g.roundRect(...px(d * 13 - 9, 44), 18 * s, 7 * s, 3 * s).fill(0xf0ece0);
    g.roundRect(...px(d * 13 - 11, 49), 22 * s, 6 * s, 3 * s).fill(0x8a6a44); stroke(g, 2);
  }
  g.ellipse(...px(0, 2), 30 * s, 26 * s).fill(skin); stroke(g);   // belly
  g.roundRect(...px(-24, -22), 48 * s, 44 * s, 7 * s).fill(vest); stroke(g);
  g.rect(...px(-7, -22), 14 * s, 44 * s).fill(skin);
  for (const [x, y, r] of [[-12, -6, 3], [9, 4, 4], [-3, 12, 2.5]]) g.circle(...px(x, y), r * s).fill({ color: 0x9a8f7a, alpha: 0.5 });
  const ay = o.armY ?? 0;
  g.roundRect(...px(-42, -18 + ay), 20 * s, 11 * s, 5 * s).fill(skin); stroke(g, 2.5);
  g.roundRect(...px(22, -18 - ay), 20 * s, 11 * s, 5 * s).fill(skin); stroke(g, 2.5);
  g.ellipse(...px(0, -34), 19 * s, 17 * s).fill(skin); stroke(g);  // head
  g.ellipse(...px(0, -46), 19 * s, 7 * s).fill(0x6d6255);
  g.roundRect(...px(-16, -38), 32 * s, 8 * s, 3 * s).fill({ color: 0xdfe6ef, alpha: 0.75 }); stroke(g, 2);
  for (const d of [-1, 1]) g.circle(...px(d * 8, -35), 2.6 * s).fill(OUT);
  g.moveTo(...px(-8, -25)).quadraticCurveTo(...px(0, o.grim ? -28 : -23), ...px(8, -25)).stroke({ width: 3 * s, color: OUT, alpha: .8 });
  g.roundRect(...px(-30, 6), 9 * s, 12 * s, 2 * s).fill(0xc9a227);  // keys on the belt
  for (let i = 0; i < 3; i++) g.rect(...px(-28 + i * 3, 16), 2 * s, 7 * s).fill(0xc9a227);
  if (o.clipboard) { g.roundRect(...px(28, -14), 16 * s, 22 * s, 2 * s).fill(0xa9743f); stroke(g, 2);
    for (let i = 0; i < 4; i++) g.rect(...px(31, -9 + i * 5), 10 * s, 1.6 * s).fill({ color: OUT, alpha: .45 }); }
  if (o.dust) for (let i = 0; i < 22; i++) g.circle(...px(-34 + (i * 7) % 70, -48 + ((i * 13) % 30)), (2 + i % 3) * s).fill({ color: 0x8a8078, alpha: .5 });
}

Object.assign(SPRITES, {
  landlord_idle: { w: 3.2, h: 3.4, draw: (g, W, H) => landlord(g, W, H, { clipboard: true }) },
  landlord_end:  { w: 3.2, h: 3.4, draw: (g, W, H) => landlord(g, W, H, { grim: true, dust: true, armY: -10 }) },
  landlord_win:  { w: 3.2, h: 3.4, draw: (g, W, H) => landlord(g, W, H, { clipboard: true, armY: -14 }) },
  boss_box: { w: 1.8, h: 1.6, draw: (g, W, H) => {
    g.roundRect(-W * 0.4, -H * 0.55, W * 0.8, H * 0.55, 5).fill(0x171519); stroke(g);
    g.roundRect(-W * 0.4, -H * 0.62, W * 0.8, W * 0.09, 3).fill(0x24212a);
    g.rect(-W * 0.05, -H * 0.55, W * 0.1, H * 0.55).fill({ color: 0x3a3540, alpha: .8 });
    g.circle(0, -H * 0.30, W * 0.07).fill(0xc9a227);
    shine(g, -W * 0.2, -H * 0.46, W * 0.12, H * 0.05);
  } },
});


// ---- the climber: this fight happens after the first kaiju stage, so the frog
// scaling this tower is the building-sized monster, not the boxer.
const CLIMB_POSES = {
  climbfrog_hold:  { angry: 2, spikes: true },
  climbfrog_up:    { angry: 2.2, spikes: true },
  climbfrog_left:  { angry: 2, spikes: true },
  climbfrog_right: { angry: 2, spikes: true },
  climbfrog_catch: { angry: 1.6, spikes: true },
  climbfrog_punch: { angry: 2.6, spikes: true },
  climbfrog_hurt:  { angry: 1.2, spikes: true, tint: 0xa9b23a },
  climbfrog_fall:  { angry: 1, spikes: true, tint: 0xa9b23a },
  climbfrog_top:   { angry: 3, spikes: true, fire: true },
};
for (const [kind, opts] of Object.entries(CLIMB_POSES)) {
  SPRITES[kind] = { w: 1.7, h: 1.7, draw: (g, W, H) => frog(g, W, H, opts) };
}

export const SPRITE_KINDS = Object.keys(SPRITES);
export { CELL, C as PALETTE };
