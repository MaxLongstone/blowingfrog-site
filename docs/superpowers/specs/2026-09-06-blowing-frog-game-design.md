# Blowing Frog: The Game — Design Spec

Date: 2026-09-06
Status: Approved by Luis (2D sprite route)

## Purpose

A browser game that lives on blowingfrog.com at `/play`. Frogger structure, brand joke payoff:
the frog eats explosives, blows up, and comes back bigger, until it is planet-sized and squashes
the Earth. It doubles as a portfolio piece for the agency (animation, sound, game feel).

## Player-facing summary

- Hop lane by lane from the bottom of the screen to the top.
- Eat 5 explosives during a crossing, reach the top, and you detonate. You return one size larger.
- Reach the top with fewer than 5 and you only score points. No growth.
- Act 1 (Highway, stages 1-4): small frog, 2028 traffic, lives system. A hit resets you to the bottom.
- Act 2 (Kaiju, stages K1-K5): the camera pulls back 10x each stage. 3 hearts per form, refilled on
  growth. Lose all 3 and the current stage restarts.
- Anything explosive thrown at you is food: tongue-snap it and it counts toward your 5.
  Anything non-explosive is damage and must be dodged.
- Ending: top of K5, the frog sits on Earth and squashes it. THE END. Score, credits, share card.

## Controls

- Desktop: Arrow keys / WASD to hop, Space to tongue-snap in the facing direction.
- Mobile: swipe to hop, tap to tongue-snap toward the tap.
- Portrait layout on phones, landscape on desktop. Playfield is a fixed logical grid scaled to fit.

## Stage roster

### Act 1: Highway (frog sizes S1-S4)

| Stage | New traffic | New behavior |
|---|---|---|
| 1 | Robotaxis, hover food trucks | Polite, constant speed |
| 2 | Autonomous semis (2 lanes wide), delivery drones dipping into lanes | Faster, denser |
| 3 | Police EVs | Cars swerve one lane toward the frog when adjacent |
| 4 | Everything | Drones dive-bomb, trucks honk and boost when the frog is in their lane |

Explosives: dynamite bundles and plasma mines sitting in lanes and on medians.
Food trucks drop food (points only).

### Act 2: Kaiju (frog sizes K1-K5)

| Stage | Scale | Lanes are | Ground / rival | Air | Explosives (food) |
|---|---|---|---|---|---|
| K1 | Car-sized | Highway lanes | Traffic (all squashable, panics and flees) | None. News choppers appear at the end | Fuel tankers |
| K2 | Building-sized | Downtown avenues | Tanks, Frog Control van with giant fly swatter, inflatable tube-man mob | Attack helicopters, strafing jets, news drones (block view, no damage) | Gas stations, propane depots, incoming missiles |
| K3 | Mountain-sized | Rivers, highways, mountain ranges | Skyscraper-sized heron, giant French chef with fork and knife, government fly-mech decoy | Bomber squadrons, cruise missiles | Missile silos, volcanoes, bombs |
| K4 | Continent-sized | Shipping lanes and currents | Aircraft carriers, kraken, Statue of Liberty wading out, giant rubber duck battleship | Hurricane with a face | Nuclear subs firing, oil rigs, undersea volcanoes |
| K5 | Planet-sized | Orbital rings | The Moon rolled like a bowling ball, giant hand with flyswatter from above | Satellite lasers, space station ramming, alien fleet | Every nuke on Earth launched at once, solar flares |

Kaiju contact rules: the frog squashes any ground enemy it touches (crunch, shake, debris, points).
Air and rival attacks deal 1 heart of damage on contact unless they are explosive, in which case
they can be eaten.

## Growth and detonation

- Explosive counter 0-5 shown as a fuse on the HUD. At 5 the frog glows and ticks.
- Reaching the top row with 5 triggers the detonation cutscene: the existing explosion frame
  sequence (assets/contact-hero-frames, reused from the contact hero) plays full-screen, then the
  next stage fades in with the frog one size larger.
- Reaching the top with fewer than 5: short "still hungry" card, points awarded, same stage
  replays with slightly denser traffic.

## Architecture

Static page, no build tools, deploys with the existing publish script.

```
play.html                      page shell (site nav, canvas mount, overlays)
game/
  main.js                      boot: Pixi app, resize, state machine, game loop
  config/stages.js             data-driven stage definitions (lanes, spawners, enemies, scale)
  config/sprites.js            sprite manifest + procedural fallback drawings
  core/input.js                keyboard, swipe, tap -> intents
  core/grid.js                 logical grid <-> screen mapping, camera shake
  core/assets.js               loads PNGs, falls back to Pixi.Graphics when missing
  core/audio.js                WebAudio synthesized sfx (no audio files)
  entities/frog.js             hop, tongue, size, hearts/lives, detonation state
  entities/mover.js            anything that travels along a lane (vehicles, ships, moon)
  entities/projectile.js       missiles, bombs, lasers, nets (explosive flag)
  entities/pickup.js           explosives and food
  systems/spawner.js           per-lane spawn timing and behavior hooks
  systems/collision.js         grid + AABB checks, squash vs damage vs eat resolution
  systems/particles.js         debris, smoke, glow, tongue trail
  ui/hud.js                    fuse counter, hearts/lives, score, stage name
  ui/overlays.js               title, still-hungry, game-over, ending, share
  ui/cutscene.js               explosion frame player
assets/game/                   generated sprites (PNG, transparent)
```

Each entity exposes `update(dt)`, `bounds()`, and a `kind` used by collision. Stages are data:
a lane list where each lane names a spawner, a direction, a speed, and a density. Behaviors
(swerve, dive, boost, hunt) are named functions the spawner attaches per stage.

Rendering: PixiJS v8 from a CDN as a global script. Sprites scale with the frog's size class.
Kaiju stages change background and lane sprites; the frog stays roughly constant on screen.

## Art pipeline

All sprites generated in the soft 3D felt/clay style of the reference frog render, top-down
with a slight tilt, then background-removed to transparent PNG. Frog: idle, hop, tongue, and
5 forms (S1 small through K5 planet-sized, increasingly angry). Roughly 45 enemy/hazard sprites
and 9 backgrounds. Every sprite has a procedural Pixi.Graphics fallback so the game runs before
art lands and never shows a missing texture.

## Delivery

- Drop 1: play.html, engine, Act 1 (stages 1-4), K1, K2, detonation cutscene, HUD, title,
  game over. Playable end to end through K2.
- Drop 2: K3, K4, K5, ending cutscene, credits, share card, remaining art.

## Error handling

- Missing sprite: procedural fallback, log once.
- WebGL unavailable: Pixi falls back to canvas renderer automatically.
- Cutscene frames slow to load: they preload during the stage. If not ready at detonation,
  play a 1.5 s procedural flash and shake instead.
- localStorage unavailable: high score kept in memory only.

## Testing

- Pure logic (grid math, collision resolution, stage data validation, growth counter) covered by
  small node tests run with `node --test` under `game/tests/`.
- Play verification in the browser preview at each stage using a debug query param
  `?stage=K3` to jump directly.

## Out of scope

Online leaderboard, accounts, sound files, multiplayer.
