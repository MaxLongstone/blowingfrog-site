# Frogpocalypse art drop

The game ships fully playable with procedural vector sprites. Every sprite can be replaced
with real art, one file at a time, with no code changes.

## How to drop in art

1. Generate or draw the sprite. Save as a transparent PNG.
2. Name it exactly `<kind>.png` and put it in `assets/game/`.
3. Add that kind to the `sprites` array in `assets/game/manifest.json`.
4. Commit and push. That is it. Anything not listed keeps its procedural drawing.

Only kinds listed in the manifest are fetched, so unlisted art costs zero requests.

## Sizing

Sprites are drawn centred, facing right, top-down with a slight tilt. One grid cell is 64 px.
Export at 2x for crispness. The `cells` column below gives the intended footprint.

| Kind | Cells (w x h) | Export px | What it is |
|---|---|---|---|
| `frog_s1`..`frog_s4` | 1 x 1 | 128 x 128 | Act 1 frog, progressively angrier |
| `frog_k1`..`frog_k5` | 1.5 x 1.5 | 192 x 192 | Kaiju frog, K5 is the planet-sized one |
| `robotaxi` | 1.5 x 0.8 | 192 x 102 | Driverless 2028 taxi |
| `foodtruck` | 2 x 0.9 | 256 x 115 | Hover food truck with striped awning |
| `semi` | 3.2 x 0.9 | 410 x 115 | Autonomous articulated lorry |
| `police` | 1.6 x 0.8 | 205 x 102 | Police EV with light bar |
| `drone` | 0.8 x 0.6 | 102 x 77 | Delivery quadcopter |
| `newsdrone` | 0.8 x 0.6 | 102 x 77 | Camera drone, harmless |
| `heli` | 1.8 x 0.9 | 230 x 115 | Attack helicopter |
| `jet` | 2 x 0.8 | 256 x 102 | Fighter jet |
| `tank` | 1.6 x 1 | 205 x 128 | Battle tank |
| `swattervan` | 1.8 x 0.9 | 230 x 115 | Frog Control van with a giant fly swatter |
| `tubeman` | 0.7 x 1 | 90 x 128 | Inflatable wacky waving tube man |
| `heron` | 2.6 x 1.2 | 333 x 154 | Skyscraper-sized heron |
| `chef` | 1.4 x 1.4 | 179 x 179 | Giant French chef, fork and knife |
| `flymech` | 1.6 x 1.2 | 205 x 154 | Government mech disguised as a fly |
| `bomber` | 2.8 x 1 | 358 x 128 | Flying-wing bomber |
| `carrier` | 3.4 x 1 | 435 x 128 | Aircraft carrier |
| `kraken` | 2 x 1.6 | 256 x 205 | Kraken, tentacles down |
| `hurricane` | 2.2 x 2.2 | 282 x 282 | Hurricane with a face |
| `liberty` | 1.2 x 1.8 | 154 x 230 | Statue of Liberty wading |
| `duck` | 1.8 x 1.2 | 230 x 154 | Giant rubber duck battleship |
| `moon` | 2 x 2 | 256 x 256 | The Moon, bowling-ball style |
| `station` | 2.6 x 0.8 | 333 x 102 | Space station with solar wings |
| `alienship` | 1.8 x 0.9 | 230 x 115 | Flying saucer |
| `dynamite` `mine` `tanker` `gasstation` `propane` `silo` `volcano` `sub` `oilrig` `nukesilo` | ~1 x 1 | 128 x 128 | Edible explosives |
| `food` | 1 x 1 | 128 x 128 | Burger, points only |
| `missile` `bomb` `cruise` `torpedo` `nuke` | see code | 2x cells | Edible incoming ordnance |
| `bullet` `strafe` `fork` `jetlaunch` `laser` `hand` `flare` | see code | 2x cells | Non-edible, dodge only |

> Per-sprite prompts for all 60 kinds live in `game-sprite-prompts.md`.

## Style prompt

Use this prefix on every generation so the set stays coherent:

```
Top-down orthographic game sprite, slight tilt, soft 3D felt and clay render,
matte fabric texture, thick dark outline, warm rim light from upper left,
chunky friendly proportions, muted olive and cream palette with one saturated accent,
centred, facing right, isolated on a plain white background, no shadow on the ground,
no text, no logo.
```

Then append the subject, for example:

- `frog_k3` — `an enormous furious cartoon frog, mountain-sized, bulging white eyes with tiny pupils, wide toothless grin, spiky ridge down the back, olive green felt skin with dark spots, cream belly`
- `swattervan` — `a teal utility van seen from above with a huge red plastic fly swatter mounted on the roof`
- `chef` — `a giant cartoon French chef seen from above, tall white toque, big white moustache, holding a steel fork and knife`
- `hurricane` — `a cartoon hurricane spiral seen from above with an angry face in the eye, white and pale blue cloud bands`
- `duck` — `a giant yellow rubber duck battleship seen from above with a deck gun on its back`

## Generating the art

The Adobe connector attached to this repo exposes editing tools only. Its own docs state that
text-to-image and generative fill are not available in this environment, so Firefly cannot be
driven from here. Two working routes:

1. **Firefly web app**, at firefly.adobe.com. Free monthly generative credits. Paste the style
   prefix plus a subject, download the PNG, then use the connector's `image_remove_background`
   tool on it to get a clean transparent cutout.
2. **Higgsfield connector**, which does generate from here but bills credits. The account had
   2.5 credits at last check and a single image costs 2, so it can produce one sprite.

Either way the file naming and manifest step above is identical.
