// The seven defeated bosses, each with its own way of coming at the frog.
// No PixiJS in here: every foe is plain state plus update(dt, world) and
// view(), so the level only has to draw them and resolve contact.
//
//   walker    Neco. Patrols. Stomp it.
//   landlord  Walks. Stomp it and he crouches into a shell; touch the shell
//             and you kick it down the road, flattening whatever it hits.
//   chaco     Pops out of a pipe in a puff of powder, like a piranha plant.
//   umma      Stands her ground and throws Crocs at you.
//   ghost     The Sack Man drifts after you -- unless you are looking at him.
//   narrator  Twinkles like a bomb, then dashes. Jump it and it is done for.
//   ufo       Cruises overhead and drops cows.
import { patrolStep, contactVerdict, popOut, twinkleRate } from './hiddenrules.js';

const RIGHT = 1, LEFT = -1;

function base(def, x, level) {
  return { id: def.id, type: def.type, x, level, dir: LEFT, alive: true, deadT: 0, deadLook: 'flat', t: 0, score: 0 };
}
const frames = (t, rate = 4) => 1 + (Math.floor(t * rate) % 2);
const faceFrog = (f, frog) => { f.dir = frog.x >= f.x ? RIGHT : LEFT; };
function verdictAgainst(f, frog, opts) {
  return contactVerdict({ dx: frog.x - f.x, dEl: frog.el - f.level, falling: frog.falling }, opts);
}
function die(f, look = 'flat', points = 0) { f.alive = false; f.deadT = 0.6; f.deadLook = look; f.score += points; }

// ---- Neco: a plain walker ----------------------------------------------
function walker(def, ctx) {
  const f = base(def, def.range[0], ctx.heights[def.range[0]]);
  f.range = def.range; f.dir = RIGHT;
  f.update = (dt) => { const s = patrolStep(f.x, f.dir, f.range, 1.3, dt); f.x = s.x; f.dir = s.dir; f.t += dt; };
  f.view = () => ({ tex: f.alive ? `hm_neco_${frames(f.t)}` : 'hm_neco_flat', elev: f.level, flip: f.dir > 0 });
  f.hit = (frog) => verdictAgainst(f, frog);
  f.stomp = () => { die(f, 'flat', 200); return { points: 200 }; };
  return f;
}

// ---- The Landlord: walks, hides, gets kicked ---------------------------
function landlord(def, ctx) {
  const f = base(def, def.range[0], ctx.heights[def.range[0]]);
  f.range = def.range; f.dir = RIGHT; f.mode = 'walk'; f.modeT = 0; f.grace = 0;
  f.update = (dt, w) => {
    f.t += dt; f.modeT += dt; if (f.grace > 0) f.grace -= dt;
    if (f.mode === 'walk') { const s = patrolStep(f.x, f.dir, f.range, 1.1, dt); f.x = s.x; f.dir = s.dir; }
    else if (f.mode === 'hide' && f.modeT > 5) { f.mode = 'walk'; f.modeT = 0; }
    else if (f.mode === 'kicked') {
      const nx = f.x + f.dir * 7 * dt, col = Math.round(nx);
      if (w.heights(col) !== f.level) { f.mode = 'hide'; f.modeT = 0; f.dir = -f.dir; w.shake(4); }   // wall, gap or edge: stops dead
      else f.x = nx;
    }
  };
  f.view = () => {
    const wobble = f.mode === 'hide' && f.modeT > 3.8 ? Math.sin(f.t * 40) * 0.05 : 0;
    return { tex: !f.alive ? 'hm_landlord_flat' : f.mode === 'walk' ? `hm_landlord_${frames(f.t)}` : 'hm_landlord_hide',
      elev: f.level, flip: f.dir > 0, spin: f.mode === 'kicked' ? f.t * 14 : 0, xOff: wobble };
  };
  f.hit = (frog) => {
    if (f.mode === 'kicked' && f.grace > 0) return 'none';
    return verdictAgainst(f, frog);
  };
  const kick = (frog) => { f.mode = 'kicked'; f.dir = frog.x >= f.x ? LEFT : RIGHT; f.grace = 0.4; f.modeT = 0; return { points: 100, say: 'KICKED' }; };
  f.stomp = (frog) => {
    if (f.mode === 'walk') { f.mode = 'hide'; f.modeT = 0; return { points: 200, bounce: true, say: 'HE CROUCHES' }; }
    if (f.mode === 'hide') return { ...kick(frog), bounce: true };
    f.mode = 'hide'; f.modeT = 0; return { points: 100, bounce: true };          // stomping a sliding one stops it
  };
  f.touch = (frog) => f.mode === 'hide' ? kick(frog) : null;                      // walking into a shell kicks it
  f.lethalToFoes = () => f.mode === 'kicked';
  return f;
}

// ---- Chaco: out of the pipe in a puff of powder ------------------------
function chaco(def, ctx, index) {
  const pipe = ctx.pipes[def.pipe];
  const f = base(def, pipe.col + (pipe.w - 1) / 2, pipe.h);
  f.pipe = pipe; f.phase = 1.1 + index * 1.7; f.r = 0; f.shown = false;
  f.update = (dt, w) => {
    f.t += dt;
    const prev = f.r;
    f.r = popOut(f.t + f.phase);
    if ((prev === 0 && f.r > 0) || (prev > 0 && f.r === 0)) w.puff(f.x, f.level + 0.3);      // a puff each way in and out
    f.dir = w.frog.x >= f.x ? RIGHT : LEFT;
  };
  f.view = () => ({ tex: f.alive ? 'hm_chaco_pop' : 'hm_chaco_flat', elev: f.level - (1 - f.r) * 1.5, flip: f.dir > 0, maskAtPipe: true, hidden: f.r <= 0.02 });
  f.hit = (frog) => {
    if (f.r < 0.45) return 'none';
    return verdictAgainst(f, frog, { reachX: 0.95 }) === 'none' ? 'none' : 'touch';    // never stompable
  };
  f.stomp = () => null;
  return f;
}

// ---- UMMA: throws Crocs -------------------------------------------------
function umma(def, ctx) {
  const f = base(def, def.col, ctx.heights[def.col]);
  f.cool = 1.4; f.throwT = 0;
  f.update = (dt, w) => {
    f.t += dt; faceFrog(f, w.frog);
    if (f.throwT > 0) f.throwT -= dt;
    f.cool -= dt;
    if (f.cool <= 0 && Math.abs(w.frog.x - f.x) < 11) {
      f.cool = 2.3; f.throwT = 0.45;
      w.throwCroc({ x: f.x + f.dir * 0.3, el: f.level + 0.9 }, w.frog.x + (w.frog.facing * 0.4), 0.95);
    }
  };
  f.view = () => ({ tex: !f.alive ? 'hm_umma_flat' : f.throwT > 0 ? 'hm_umma_throw' : `hm_umma_${frames(f.t, 2)}`, elev: f.level, flip: f.dir > 0 });
  f.hit = (frog) => verdictAgainst(f, frog);
  f.stomp = () => { die(f, 'flat', 400); return { points: 400 }; };
  return f;
}

// ---- The Sack Man: shy when looked at ----------------------------------
function ghost(def, ctx) {
  const f = base(def, def.range[1], 0);
  f.range = def.range; f.shy = false; f.el = 2.2;
  f.update = (dt, w) => {
    f.t += dt;
    const toward = (f.x - w.frog.x) * w.frog.facing > 0;               // the frog is facing him
    f.shy = toward && Math.abs(f.x - w.frog.x) < 9;
    if (!f.shy) {
      const dx = w.frog.x - f.x;
      f.x = Math.max(f.range[0], Math.min(f.range[1], f.x + Math.sign(dx) * Math.min(Math.abs(dx), 1.7 * dt)));
      f.dir = dx >= 0 ? RIGHT : LEFT;
    }
    const ground = w.heights(Math.round(f.x));
    f.level = Math.max(ground, 0);
    f.el = f.level + 1.3 + Math.sin(f.t * 2.2) * 0.45;
  };
  f.view = () => ({ tex: f.alive ? `hm_sackman_ghost_${frames(f.t, 3)}` : 'hm_sackman_flat', elev: f.alive ? f.el : f.level, flip: f.dir > 0, alpha: f.alive && f.shy ? 0.5 : 1 });
  f.hit = (frog) => (Math.abs(frog.x - f.x) < 0.65 && Math.abs(frog.el - f.el) < 0.8 ? 'touch' : 'none');
  f.stomp = () => null;
  return f;
}

// ---- The Narrator: twinkle, then dash ----------------------------------
function narrator(def, ctx) {
  const f = base(def, def.col, ctx.heights[def.col]);
  f.state = 'idle'; f.stateT = 0; f.dashDir = LEFT; f.travelled = 0; f.flash = false;
  f.update = (dt, w) => {
    f.t += dt; f.stateT += dt;
    if (f.state === 'idle') {
      faceFrog(f, w.frog);
      if (Math.abs(w.frog.x - f.x) < 9 && Math.abs(w.frog.el - f.level) < 1.3) { f.state = 'twinkle'; f.stateT = 0; w.say('THE NARRATOR HAS A FUSE'); }
    } else if (f.state === 'twinkle') {
      faceFrog(f, w.frog);
      const p = f.stateT / 1.5;
      f.flash = Math.sin(f.stateT * twinkleRate(p) * Math.PI * 2) > 0;
      if (p >= 1) { f.state = 'dash'; f.stateT = 0; f.dashDir = w.frog.x >= f.x ? RIGHT : LEFT; f.dir = f.dashDir; f.flash = true; }
    } else if (f.state === 'dash') {
      const step = 9 * dt, nx = f.x + f.dashDir * step;
      if (w.heights(Math.round(nx)) !== f.level || (f.travelled += step) > 15) { die(f, 'flat', 0); w.puff(f.x, f.level + 0.4); w.shake(5); }
      else f.x = nx;
    }
  };
  f.view = () => ({
    tex: !f.alive ? 'hm_narrator_flat' : f.state === 'dash' ? 'hm_narrator_dash' : `hm_narrator_${frames(f.t, 2)}`,
    elev: f.level, flip: f.dir > 0, tint: f.alive && f.flash ? 0xff3a2a : 0xffffff,
  });
  f.hit = (frog) => {
    if (f.state === 'dash') {
      if (Math.abs(frog.x - f.x) >= 0.8) return 'none';
      return frog.el - f.level >= 0.6 ? 'jumped' : 'touch';                    // clearing it is enough to beat it
    }
    return verdictAgainst(f, frog);
  };
  f.jumped = () => { die(f, 'flat', 500); return { points: 500, say: 'OUTRUN' }; };
  f.stomp = () => { die(f, 'flat', 400); return { points: 400 }; };
  return f;
}

// ---- The UFO: drops cows -------------------------------------------------
function ufo(def, ctx) {
  const f = base(def, def.range[0], 0);
  f.range = def.range; f.el = 4.6; f.level = 0; f.cool = 2; f.open = 0;
  f.update = (dt, w) => {
    f.t += dt; f.cool -= dt; if (f.open > 0) f.open -= dt;
    const dx = w.frog.x - f.x;
    f.x = Math.max(f.range[0], Math.min(f.range[1], f.x + Math.sign(dx) * Math.min(Math.abs(dx), 2.1 * dt)));
    f.el = 4.6 + Math.sin(f.t * 1.6) * 0.25;
    if (f.cool <= 0 && Math.abs(dx) < 0.8) { f.cool = 2.8; f.open = 0.6; w.dropCow(f.x, f.el - 0.4); }
  };
  f.view = () => ({ tex: !f.alive ? 'hm_probe_flat' : f.open > 0 ? 'hm_ufo_drop' : 'hm_probe_1', elev: f.alive ? f.el : 0, flip: false });
  f.hit = () => 'none';                                                          // the saucer itself is harmless; its cargo is not
  f.stomp = () => null;
  f.fireReach = 6;
  return f;
}

const MAKERS = { walker, landlord, chaco, umma, ghost, narrator, ufo };

export function createFoes(cfg, ctx) {
  let chacoIndex = 0;
  return cfg.foes.map((def) => MAKERS[def.type](def, ctx, def.type === 'chaco' ? chacoIndex++ : 0));
}
