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

export const SPRITE_KINDS = Object.keys(SPRITES);
export { CELL, C as PALETTE };
