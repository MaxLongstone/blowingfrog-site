# Frogpocalypse sprite sheets

Sixty sprites in **seven generations**, not sixty. Each prompt produces one square sheet of
evenly spaced cells; a script then cuts the sheet, knocks out the white, and files each sprite
under the right name.

Every sprite already has a working procedural drawing, so this is an upgrade path. Do one sheet
or all seven, in any order.

## The workflow

1. Pick a sheet below and paste its whole prompt block into Firefly (firefly.adobe.com, free
   monthly credits). Ask for a **square / 1:1** image at the largest size offered.
2. Check the result: nine subjects, nine cells, nothing touching, no text. If a cell is wrong,
   reroll the sheet rather than fixing it by hand.
3. Download the PNG or JPG, then cut it:

```bash
python3 tools/slice_sheet.py A ~/Downloads/sheet-a.png
```

That writes `assets/game/frog_s1.png` and friends, makes the background transparent, trims each
sprite tight, and adds the names to `assets/game/manifest.json` for you.

4. Reload the game. Anything not in the manifest keeps its built-in drawing, so the game never
   breaks part-way through.

**Why square cells:** the slicer divides the image into an even grid, so the sheet must be square
with equal cells and the subjects must not cross their gutters. That is what the prompt is
engineered to produce.

## A note on rerolling

Generators drift. If a sheet comes back with eight good cells and one bad one, generate that sheet
again rather than accept it. It is one credit, and a mismatched sprite is obvious in play.

---

## Sheet A — the frog, nine forms

3 × 3. Reading order: `frog_s1` `frog_s2` `frog_s3` / `frog_s4` `frog_k1` `frog_k2` / `frog_k3` `frog_k4` `frog_k5`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each subject is centred in its own cell at the
same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines,
no borders, no numbers, no text, no labels, no captions, no watermark.

Art direction for every cell: top-down orthographic game sprite seen from directly above with a
slight forward tilt, soft 3D felt and clay render, matte fabric texture, thick dark charcoal
outline, warm rim light from the upper left, chunky friendly proportions, muted olive and cream
palette, no cast shadow, no ground plane.

The nine cells, left to right, top row first. It is the same frog character in all nine, getting
larger and angrier:
1. a small round frog, huge white bulging eyes with tiny pupils, wide flat mouth, olive-green felt
   skin with dark speckles, pale cream belly, cheerful and slightly stupid
2. the same frog, a little larger and stockier, cheeks puffed, eyes narrowing
3. the same frog, muscular and scowling, angry brow ridges, singed patches on its back
4. the same frog, scarred and furious, jaw set, smoke curling from its shoulders
5. a monstrous car-sized version, snarling, dark spiny ridge down the spine, thick armoured hide,
   faint glowing orange cracks in the skin
6. the same monster, building-sized, jagged back spines, chipped teeth, ember glow at the throat
7. the same monster, mountain-sized, moss and rock crusted on its back, molten orange fissures
8. the same monster, continent-sized, hide like scorched bark, storm clouds snagged on its spines
9. the same monster, planet-sized, black volcanic hide, spines like mountain ranges, eyes two
   blazing white suns
```

## Sheet B — traffic and aircraft

3 × 3. Reading order: `robotaxi` `foodtruck` `semi` / `police` `drone` `newsdrone` / `heli` `jet` `bomber`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each vehicle is centred in its own cell, scaled
to fit that cell, fully separated from its neighbours, nothing touching or overlapping. No grid
lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: top-down orthographic game sprite seen from directly above with a
slight forward tilt, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline,
warm rim light from the upper left, chunky friendly proportions, muted palette with one saturated
accent per vehicle, every vehicle facing right, no cast shadow, no ground plane.

The nine cells, left to right, top row first:
1. a small white driverless taxi pod, rounded bubble body, tinted glass roof, glowing teal sensor
   strip on the bonnet, no driver
2. a chunky orange hover food truck, striped red and white awning along one side, round serving
   hatch, roof vents
3. a long autonomous articulated lorry, dark blue cab and ribbed steel trailer, no windscreen
4. a white and black police patrol car, red and blue light bar glowing on the roof
5. a small four-rotor delivery drone, blurred propellers, brown cardboard parcel slung underneath
6. a small white press drone, four rotors, boxy camera gimbal underneath, red broadcast light
7. a military attack helicopter, dark grey fuselage, spinning main rotor disc, stub wings with
   rocket pods
8. a grey fighter jet, sharp swept delta wings, twin tail fins, bubble canopy, orange afterburner
9. a large grey flying-wing stealth bomber, one continuous swept triangular wing, no tail
```

## Sheet C — kaiju ground units

3 × 3. Reading order: `tank` `swattervan` `tubeman` / `chef` `flymech` `liberty` / `kraken` `duck` `carrier`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each subject is centred in its own cell, scaled
to fit that cell, fully separated from its neighbours, nothing touching or overlapping. No grid
lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: top-down orthographic game sprite seen from directly above with a
slight forward tilt, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline,
warm rim light from the upper left, chunky cartoon proportions, muted palette with one saturated
accent, no cast shadow, no ground plane.

The nine cells, left to right, top row first:
1. a stubby cartoon battle tank, olive drab, wide black tracks either side, short turret
2. a teal utility van with an enormous red plastic fly swatter mounted on its roof
3. an inflatable wacky waving tube man, hot pink nylon, googly eyes, arms flailing in opposite
   directions, anchored to a small blower box
4. a giant cartoon French chef, tall white toque, enormous white moustache, white double-breasted
   jacket, a steel fork in one hand and a knife in the other
5. a military mech built to look like a giant housefly, riveted steel plates, translucent hexagonal
   wing panels, glowing red compound eyes, obviously not a real fly
6. the Statue of Liberty wading through water, oxidised green copper, spiked crown, torch raised
7. a purple cartoon kraken, bulbous mantle, huge yellow eyes, eight thick tentacles curling outward
8. a giant yellow rubber duck refitted as a battleship, orange bill, grey naval deck gun on its back
9. a grey aircraft carrier, long flight deck with white centreline markings, island superstructure
```

## Sheet D — titans, orbit, and the first explosives

3 × 3. Reading order: `heron` `hurricane` `moon` / `station` `alienship` `dynamite` / `mine` `tanker` `gasstation`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each subject is centred in its own cell, scaled
to fit that cell, fully separated from its neighbours, nothing touching or overlapping. No grid
lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: top-down orthographic game sprite seen from directly above with a
slight forward tilt, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline,
warm rim light from the upper left, chunky cartoon proportions, no cast shadow, no ground plane.

The nine cells, left to right, top row first:
1. an enormous grey heron in flight, long spear-like yellow beak, wings fully spread, slate and
   white plumage, legs trailing behind
2. a cartoon hurricane, tight white and pale blue spiral cloud bands, a clear round eye at the
   centre with a scowling angry face in it
3. the Moon, pale grey cratered sphere, a few large dark maria, soft chalky texture
4. a space station, central white cylindrical module, two enormous dark blue solar wing arrays
5. a classic flying saucer, brushed silver disc hull, glowing teal glass dome on top with two dark
   eyes inside, coloured lights around the rim
6. a bundle of three red dynamite sticks bound with brown tape, curling fuse with a bright spark
7. a round black naval mine, blunt detonator spikes around the rim, glowing teal light in the centre
8. a fuel tanker truck, polished chrome cylindrical tank, red flammable diamond placard on the side
9. a small petrol station, red canopy roof, two white fuel pumps underneath
```

## Sheet E — explosives and ordnance

3 × 3. Reading order: `propane` `silo` `volcano` / `sub` `oilrig` `nukesilo` / `missile` `bomb` `cruise`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each subject is centred in its own cell, scaled
to fit that cell, fully separated from its neighbours, nothing touching or overlapping. No grid
lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: top-down orthographic game sprite seen from directly above with a
slight forward tilt, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline,
warm rim light from the upper left, chunky cartoon proportions, every subject reading as dangerous
and explosive, no cast shadow, no ground plane.

The nine cells, left to right, top row first:
1. a fat white propane cylinder lying on its side, red warning band around the middle, brass valve
2. an open missile silo hatch, thick concrete ring, blast doors swung apart, red nose cone visible
3. a small volcano, dark brown rocky cone, glowing molten orange crater at the summit, thin smoke
4. a black nuclear submarine surfaced, long teardrop hull, conning tower with a raised periscope
5. an offshore oil rig, yellow steel platform on four legs, central derrick, burning orange flare
6. an open nuclear missile silo, concrete ring, blast doors apart, a black and yellow radiation
   trefoil painted on the hatch
7. a slim guided missile pointing up, grey body, red nose cone, four tail fins, orange exhaust
8. a classic round black cartoon bomb, short steel fin collar at the top, glossy highlight
9. a cruise missile flying right, long grey tube body, red pointed nose, stub wings, blue exhaust
```

## Sheet F — power-ups

3 × 2, six cells. Reading order: `pw_invuln` `pw_freeze` `pw_fire` / `pw_armor` `pw_life` `food`

These must read as *good to touch*, unmistakably different from the explosives. Bright, clean, glowing.

```
A single sprite sheet on a pure white background, arranged as a clean grid of 3 columns and 2 rows,
six equal square cells with wide even white gutters. Each object is centred in its own cell at the
same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines,
no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: top-down orthographic game pickup icon seen from directly above,
soft 3D felt and clay render, thick dark charcoal outline, bright saturated colour, a clean glow
around each object, glossy highlight, chunky friendly proportions, obviously a collectable reward,
no cast shadow, no ground plane.

The six cells, left to right, top row first:
1. a glowing pale blue translucent hexagonal crystal shield, soft cyan halo
2. a six-pointed ice crystal snowflake, pale blue and white, sharp branching arms, frost glow
3. a single stylised flame, orange outer body, bright yellow core, white-hot centre
4. a battered steel shield plate, scratched brushed metal, three rivets, one deep gouge across it
5. a plump glossy red heart, soft rounded lobes, bright white highlight on the upper left, red glow
6. a fat cartoon cheeseburger, sesame seed bun, melted cheese, lettuce and tomato peeking out
```

## Sheet G — projectiles

3 × 3. Reading order: `torpedo` `nuke` `bullet` / `strafe` `fork` `jetlaunch` / `laser` `hand` `flare`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each object is centred in its own cell, scaled to
fit that cell, fully separated from its neighbours, nothing touching or overlapping. No grid lines,
no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: top-down orthographic game sprite seen from directly above, soft 3D
felt and clay render, thick dark charcoal outline, warm rim light from the upper left, chunky
cartoon proportions, no cast shadow, no ground plane.

The nine cells, left to right, top row first:
1. a black torpedo travelling right, blunt red nose, a trail of white bubbles behind it
2. a large nuclear warhead missile pointing up, dark steel body, a yellow and black radiation
   trefoil on the flank, four fins, orange exhaust
3. a single glowing yellow tracer round, bright hot core with a soft golden halo, small
4. a short vertical yellow energy bolt, bright core, tapered ends, warm glow
5. a large steel dinner fork pointing up, three tines, polished handle, cold metallic highlights
6. a small grey fighter jet launching right, swept wings, bright orange afterburner
7. a vertical orbital laser beam, intense white core inside a translucent red outer beam, sharp
   edges, no source visible
8. an enormous human hand descending palm-down, fingers spread, holding a red plastic fly swatter
9. a horizontal solar flare streak travelling right, a chain of overlapping orange and yellow
   plasma blobs, brightest at the leading edge
```

---

## If a sprite comes out too big or too small

The slicer trims each sprite to its own edges, and the game scales it to the footprint the code
expects, so exact pixel size does not matter. What matters is that subjects stay inside their
cells. If one bleeds into its neighbour, the slicer will cut it in half.

## Cutting a sheet by hand instead

The grid is even, so in any editor: divide the canvas into 3 columns and 3 rows (3 × 2 for
Sheet F), export each cell, remove the white, and save as `assets/game/<kind>.png` using the
reading order listed under each sheet. Then add those names to `assets/game/manifest.json`.
