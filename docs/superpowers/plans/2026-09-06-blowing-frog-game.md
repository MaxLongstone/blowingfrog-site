# Blowing Frog Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Frogger-style browser game at blowingfrog.com/play where the frog eats explosives, detonates, grows through 9 stages, and finally squashes the Earth.

**Architecture:** Static page + ES modules, PixiJS v8 from CDN as a global. Data-driven stages (`game/config/stages.js`), small entity classes with `update(dt)` / `bounds()` / `kind`, pure-function collision resolution, procedural Pixi.Graphics sprites with a PNG override manifest. Pure logic is tested with `node --test`; rendering is verified in the browser preview.

**Tech Stack:** PixiJS 8.20.1 (jsdelivr UMD), vanilla ES modules, WebAudio for synthesized sfx, existing site `shared.css` for chrome, `node --test` (Node 20) for logic tests.

## Global Constraints

- No build tools. Everything runs as static files served by Netlify.
- Pixi loaded from `https://cdn.jsdelivr.net/npm/pixi.js@8.20.1/dist/pixi.min.js` as global `PIXI`.
- Logical playfield: 13 columns x 15 rows, cell = 64 px logical, scaled to fit the viewport; portrait on phones, landscape on desktop.
- 5 explosives per crossing to grow. Act 1 uses 3 lives; Act 2 uses 3 hearts per form, refilled on growth.
- Explosive projectiles are edible via tongue; non-explosive attacks are damage only.
- Every sprite kind has a procedural fallback; missing PNGs never break the game.
- Detonation cutscene reuses `assets/contact-hero-frames/ezgif-frame-NNN.jpg` (283 frames), with a procedural flash fallback if frames are not loaded.
- Debug jump: `play.html?stage=K3` starts on that stage.
- Commit after every task with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File Structure

```
play.html                        page shell: site nav, #game mount, overlay root, script tags
game/main.js                     boot + state machine (title, playing, cutscene, stillHungry, gameOver, ending)
game/config/stages.js            STAGES array (9 entries) + validateStage()
game/config/sprites.js           SPRITE_MANIFEST {kind: {png, draw(gfx, size)}}
game/core/grid.js                Grid: cell<->px, fitToViewport, Shake
game/core/input.js               Input: DOM events -> intents {hop:dir} | {tongue:dir}
game/core/assets.js              loadSprites(manifest) -> textures map with fallbacks
game/core/audio.js               Audio: hop, eat, boom, hit, squash, tick (WebAudio synth)
game/entities/frog.js            Frog: pos, dir, size, fuse, hearts, lives, hop(), tongue(), takeHit(), eat()
game/entities/mover.js           Mover: lane traveler with behavior hook
game/entities/projectile.js      Projectile: velocity, explosive flag, ttl
game/entities/pickup.js          Pickup: explosive | food
game/systems/spawner.js          Spawner: per-lane timers -> new Movers/Projectiles/Pickups
game/systems/collision.js        resolve(frog, entity, ctx) -> 'none'|'eat'|'damage'|'squash'|'food'
game/systems/particles.js        burst(), debris(), tongueTrail()
game/ui/hud.js                   fuse meter, hearts/lives, score, stage label
game/ui/overlays.js              title, stillHungry, gameOver, ending, share
game/ui/cutscene.js              playDetonation(frames) with flash fallback
game/tests/*.test.js             node --test suites for grid, input, stages, frog, collision, spawner
assets/game/                     optional PNG overrides named by sprite kind
docs/superpowers/firefly-prompts.md   prompt sheet for the art drop
```

---

### Task 1: Page shell and Pixi boot

**Files:**
- Create: `play.html`, `game/main.js`
- Modify: nav in `index.html`, `about.html`, `services.html`, `contact.html`, `blog.html`, `mediakit.html` (add Play link)

**Interfaces:**
- Produces: `window.__BF_GAME` debug handle `{app, state}`; `main.js` exports nothing, boots on load.

- [ ] **Step 1:** Create `play.html` copying the nav/cursor/theme markup from `contact.html`, a `<main id="game-root">` with `<div id="game-mount">` and `<div id="overlay-root">`, then `<script src="pixi CDN"></script><script type="module" src="game/main.js"></script>`. Page-level CSS: `#game-root{min-height:100vh;display:grid;place-items:center;background:var(--bg)}`, `#game-mount canvas{display:block;border-radius:14px}`.
- [ ] **Step 2:** `main.js`: create `PIXI.Application`, `await app.init({background:'#0b0b0b', antialias:true, resolution: Math.min(devicePixelRatio,2), autoDensity:true})`, append to mount, set up `resize()` that sizes canvas to fit `13*64 x 15*64` logical into `min(innerWidth-32, innerHeight-nav-32)`, and a ticker loop calling `state.update(dt)`.
- [ ] **Step 3:** Open in browser preview, confirm a dark rounded canvas renders with no console errors.
- [ ] **Step 4:** Add `<a href="play.html" class="nav-link">Play</a>` after Contact in each page nav.
- [ ] **Step 5:** Commit: `feat(game): page shell and Pixi boot`.

### Task 2: Grid math

**Files:** Create `game/core/grid.js`, `game/tests/grid.test.js`

**Interfaces:**
- Produces: `class Grid { constructor(cols=13, rows=15, cell=64); toPx(col,row)->{x,y}; toCell(x,y)->{col,row}; width; height; clamp(col,row)->{col,row} }`, `class Shake { add(amount); update(dt)->{x,y} }`.

- [ ] **Step 1:** Test: `toPx(0,0)` is `{x:32,y:32}` (cell centers); `toCell(100,100)` is `{col:1,row:1}`; `clamp(-1,20)` is `{col:0,row:14}`; `Shake.add(10)` then `update(1)` returns magnitude <= 10 and decays toward 0 after `update(2)`.
- [ ] **Step 2:** Run `node --test game/tests/` and see failures.
- [ ] **Step 3:** Implement. Shake: `trauma = min(1, trauma+amount/20)`, offset = `trauma^2 * 16 * (rand-0.5)`, `trauma -= dt*1.5`.
- [ ] **Step 4:** Tests pass. Commit: `feat(game): grid and shake`.

### Task 3: Input

**Files:** Create `game/core/input.js`, `game/tests/input.test.js`

**Interfaces:**
- Produces: `class Input { constructor(target); onIntent(fn); destroy() }` plus pure `keyToIntent(key)->intent|null` and `swipeToIntent(dx,dy,threshold=24)->intent|null`. Intent shape: `{type:'hop'|'tongue', dir:'up'|'down'|'left'|'right'}`.

- [ ] **Step 1:** Tests: `keyToIntent('ArrowUp')` = hop up; `'w'` = hop up; `' '` = `{type:'tongue',dir:null}`; `swipeToIntent(5,-40)` = hop up; `swipeToIntent(3,4)` = null.
- [ ] **Step 2:** Fail, implement, pass. DOM part: keydown, pointerdown/up for swipe vs tap (tap = movement under threshold -> tongue toward tap side relative to frog, provided via `setFrogScreenPos(x,y)`).
- [ ] **Step 3:** Commit: `feat(game): input intents`.

### Task 4: Stage data

**Files:** Create `game/config/stages.js`, `game/tests/stages.test.js`

**Interfaces:**
- Produces: `STAGES` array. Each: `{id:'1'|'2'|'3'|'4'|'K1'..'K5', act:1|2, name, subtitle, sizeClass:1..9, bg:'highway'|'city'|'continent'|'ocean'|'orbit', lanes:[{row, kind:'road'|'safe'|'water'|'air', dir:1|-1, speed, gap, movers:[kind...], behaviors:[name...]}], pickups:{explosive:[kind...], food:[kind...], count}, attacks:[{kind, explosive:bool, every, from:'top'|'side'|'above'}], hearts:3, lives:3}`; `validateStage(s)` throws on bad data; `getStage(id)`.
- Row 14 = start (safe), row 0 = goal (safe). Rows 1..13 are lanes.

- [ ] **Step 1:** Tests: 9 stages, ids in order `1,2,3,4,K1,K2,K3,K4,K5`; every stage validates; each has rows 1..13 covered exactly once; K stages have `act:2`; explosives eaten requirement constant 5 exported as `FUSE_TARGET`.
- [ ] **Step 2:** Author data per spec roster (traffic, behaviors, attacks per stage). Speeds: stage 1 base 1.6 cells/s rising ~18% per stage; K stages 2.0 to 3.2.
- [ ] **Step 3:** Pass, commit: `feat(game): stage data`.

### Task 5: Frog entity

**Files:** Create `game/entities/frog.js`, `game/tests/frog.test.js`

**Interfaces:**
- Produces: `class Frog { col,row,dir,sizeClass,fuse,hearts,lives,act; hop(dir,grid)->bool; startTongue(dir)->{cells:[{col,row}], until}; eat()->fuse; takeHit()->'reset'|'dead'|'hurt'; grow()->sizeClass; reachedGoal()->bool; isKaiju()->bool; hopProgress (0..1) for animation; update(dt) }`.
- Rules: `eat()` caps at 5. `takeHit()` in act 1: lives--, returns 'dead' at 0 else 'reset' (row=14, fuse kept). In act 2: hearts--, 'dead' at 0 else 'hurt' with 1 s invulnerability. `grow()` increments sizeClass, resets fuse, refills hearts, sets act 2 when sizeClass>=5.

- [ ] **Step 1:** Tests for each rule above, including invulnerability window ignoring a second hit.
- [ ] **Step 2:** Implement, pass, commit: `feat(game): frog entity`.

### Task 6: Movers, projectiles, pickups, spawner

**Files:** Create `game/entities/mover.js`, `game/entities/projectile.js`, `game/entities/pickup.js`, `game/systems/spawner.js`, `game/tests/spawner.test.js`

**Interfaces:**
- `class Mover { kind, row, x (px), dir, speed, widthCells, behavior, alive; update(dt, ctx); bounds() }`
- `class Projectile { kind, x,y,vx,vy, explosive, ttl, alive; update(dt); bounds() }`
- `class Pickup { kind, col,row, type:'explosive'|'food', alive; bounds() }`
- `class Spawner { constructor(stage, grid, rng); update(dt, ctx)->{movers:[],projectiles:[],pickups:[]}; seedPickups() }`
- Behaviors registry in `spawner.js`: `swerve`, `dive`, `boost`, `hunt`, `flee` as `(mover, dt, ctx)`; ctx has `frog`, `grid`, `time`.

- [ ] **Step 1:** Tests with seeded rng: lane gap timing spawns one mover per `gap` seconds; movers leave from the correct side; `seedPickups()` places `count` explosives on distinct lane cells not on rows 0/14; `flee` reverses a mover's dir away from frog when frog is kaiju.
- [ ] **Step 2:** Implement, pass, commit: `feat(game): spawner and lane entities`.

### Task 7: Collision resolution

**Files:** Create `game/systems/collision.js`, `game/tests/collision.test.js`

**Interfaces:**
- `resolve(frog, entity, ctx)->'none'|'eat'|'food'|'damage'|'squash'` and `overlaps(a,b)` AABB.
- Rules: no overlap -> none. Pickup explosive -> eat; Pickup food -> food. Mover in act 1 -> damage. Mover in act 2 with `ground:true` -> squash; air mover -> damage. Projectile explosive: if `ctx.tongueCells` contains its cell -> eat, else on frog -> damage. Non-explosive projectile -> damage. Frog invulnerable -> none for damage cases.

- [ ] **Step 1:** Table test covering every rule.
- [ ] **Step 2:** Implement, pass, commit: `feat(game): collision rules`.

### Task 8: Procedural sprites and asset loader

**Files:** Create `game/config/sprites.js`, `game/core/assets.js`

**Interfaces:**
- `SPRITE_MANIFEST[kind] = {png:'assets/game/<kind>.png', w,h (cells), draw(g:PIXI.Graphics, wPx,hPx)}`
- `await loadSprites(app)->{get(kind)->Texture}`; PNG present -> texture; otherwise render `draw` into a `RenderTexture` once.
- Kinds: frog_s1..s4, frog_k1..k5, robotaxi, foodtruck, semi, drone, police, tanker, tank, swattervan, tubeman, heli, jet, newsdrone, missile, heron, chef, flymech, bomber, cruise, carrier, kraken, hurricane, liberty, duck, sub, oilrig, volcano, silo, moon, hand, satellite, station, alienship, nuke, flare, dynamite, mine, gasstation, propane, food, plus backgrounds highway, city, continent, ocean, orbit.

- [ ] **Step 1:** Implement drawings: soft rounded shapes, 2-tone shading, dark outline, glow for explosives. Keep each `draw` under 25 lines.
- [ ] **Step 2:** Browser check: `?stage=K3` renders every sprite for that stage; no missing textures.
- [ ] **Step 3:** Commit: `feat(game): procedural sprites and loader`.

### Task 9: Particles, shake, audio

**Files:** Create `game/systems/particles.js`, `game/core/audio.js`

**Interfaces:**
- `class Particles { constructor(container); burst(x,y,color,n); debris(x,y,n); glow(x,y); update(dt) }`
- `class Audio { unlock(); hop(); eat(); tick(); boom(); hit(); squash(); }` all WebAudio oscillators/noise, no files.

- [ ] Implement, verify in browser, commit: `feat(game): particles and synth audio`.

### Task 10: Play state and HUD

**Files:** Modify `game/main.js`; create `game/ui/hud.js`

**Interfaces:**
- `class PlayState { constructor(stageId, save); enter(); update(dt); exit(); on('goal'|'dead'|'stillHungry', fn) }`
- `class Hud { setFuse(n); setHearts(n)|setLives(n); setScore(n); setStage(name, subtitle) }` DOM elements inside `#overlay-root`.

- [ ] Wire frog, spawner, collision, particles, audio, camera shake, score. Hop animation = 140 ms arc. Tongue = 120 ms line to 2 cells. Goal reached with fuse 5 -> emit goal; fuse < 5 -> stillHungry.
- [ ] Browser verify stage 1 full loop. Commit: `feat(game): play state and HUD`.

### Task 11: Overlays and cutscene

**Files:** Create `game/ui/overlays.js`, `game/ui/cutscene.js`; modify `main.js`

**Interfaces:**
- `overlays.title(onStart)`, `overlays.stillHungry(onContinue)`, `overlays.gameOver(score, best, onRetry)`, `overlays.ending(score, onShare, onReplay)`, `overlays.hide()`.
- `playDetonation({frames, container})->Promise` draws frames at 30 fps over 2.4 s (every 4th frame) then resolves; if `frames.length<50` do flash+shake 1.5 s.
- `preloadFrames(onProgress)->Promise<HTMLImageElement[]>` starts at title screen, non-blocking.

- [ ] Implement; state machine: title -> play -> (goal: cutscene -> next stage | stillHungry -> replay) | (dead: gameOver). Best score in `localStorage['bf-game-best']` guarded by try/catch.
- [ ] Commit: `feat(game): overlays and detonation cutscene`.

### Task 12: Act 1 behaviors and tuning

- [ ] Implement `swerve` (stage 3+: when frog adjacent lane and within 2 cells, shift toward frog's column over 0.4 s), `dive` (drones: drop one row toward frog when within 3 cells, return after 1 s), `boost` (trucks: 1.8x speed for 0.8 s when frog in same lane ahead), food truck drops `food` pickup behind it every 4 s.
- [ ] Playtest stages 1-4 via `?stage=`. Commit: `feat(game): act 1 behaviors`.

### Task 13: Kaiju K1 and K2

- [ ] Role flip in PlayState when `frog.isKaiju()`: ground movers get `ground:true` and `flee` behavior, squash spawns debris + shake + score. K1 has no attacks; on goal, spawn 3 `newsdrone` movers as the transition. K2 adds attacks: heli (side, non-explosive bullets), jet (top strafing, non-explosive), missile (explosive, edible), tank (ground), swattervan (ground, hunts), tubeman mob (ground, harmless obstacles).
- [ ] Playtest. Commit: `feat(game): kaiju K1 K2`.

### Task 14: K3 to K5 and ending

- [ ] K3: heron (air, sweeps a row), chef (ground, fork jab projectile non-explosive), flymech (ground decoy: touching it is damage), bomber (top, drops explosive bombs), cruise missiles (edible). K4: carrier (ground, launches jets), kraken (rises from water lane, tentacle non-explosive), hurricane (air, pushes frog one cell sideways), liberty (ground, torch swing), duck (ground). K5: moon (rolls across a row, non-explosive, 2 cells wide), hand (from above: descends on frog's column after a 1 s shadow warning), satellite lasers (vertical beams warned 0.6 s), station (rams along a row), alienship (air, drops nukes that are edible), flare (side, non-explosive).
- [ ] Ending: after K5 goal, cutscene: camera zooms out, frog sprite scales up, Earth sprite shrinks under it, squash, black, "THE END", then `overlays.ending`. Share uses `navigator.share` if present else copies text.
- [ ] Commit: `feat(game): K3 K5 and ending`.

### Task 15: Art drop pipeline and docs

- [ ] Write `docs/superpowers/firefly-prompts.md`: one prompt per sprite kind with style prefix, aspect, and file name to save as.
- [ ] Confirm `assets/game/*.png` override works by dropping one test PNG.
- [ ] Commit and push: `feat(game): art drop docs`. Netlify deploys.

---

## Self-review

- Spec coverage: controls (T3), stages (T4, T12-14), growth/hearts (T5), edible attacks (T7), cutscene reuse and fallback (T11), procedural fallback (T8), debug jump (T10), localStorage guard (T11), nav link (T1), delivery drops (T13 boundary = Drop 1).
- Names used consistently: `Frog.fuse`, `FUSE_TARGET`, `resolve()`, `Spawner.update()`, `loadSprites()`, `playDetonation()`.
