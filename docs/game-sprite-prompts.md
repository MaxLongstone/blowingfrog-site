# Frogpocalypse sprite sheets

One hundred and five sprites in **twelve generations**. Sheets A to H are the main game; I, J, K and L are boss one. Each prompt produces one square sheet of
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

## Sheet H — achievement badges

3 × 3. Reading order: `ach_sentient` `ach_piggy` `ach_wing` / `ach_breach` `ach_pest` `ach_revolting` / `ach_untouched` `ach_daddy` `ach_unavailable`

These are UI badges, not game sprites. They appear in the achievements panel and want a different
treatment: enamel-pin style, readable at 46 pixels, one clear silhouette each. Until this sheet
exists the panel falls back to emoji, so it is safe to leave for last.

```
A single square sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal
square cells with wide even white gutters. Each badge is centred in its own cell at the same
scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no
borders, no numbers, no text, no lettering, no labels, no watermark.

Art direction for every cell: a circular enamel achievement pin seen straight on, glossy hard
enamel fill inside a thick dark charcoal metal rim, one bold simple symbol per badge, high
contrast, readable when very small, soft specular highlight in the upper left, muted olive and
cream palette with one saturated accent per badge, no cast shadow, no background scenery.

The nine badges, left to right, top row first:
1. a small cheerful olive-green frog head facing forward, huge white eyes
2. an orange and yellow comic explosion burst, jagged star shape
3. a small missile caught in mid-air with a pink tongue curled around it
4. a snarling dark green monster frog silhouette with a spiny back, red accent
5. a heavy olive boot print stamped over a flattened crumpled car
6. a bright orange flame with a curling tongue shape inside it
7. a clean white four-pointed sparkle over a pale blue shield
8. a tipped-over amber beer bottle with a single drip falling from the neck
9. a small blue and green planet Earth with a flat dent pressed into the top of it
```

## Boss one: Chaco the Narco Chupacabra

These three sheets are **side-on character art**, not top-down, so they use a different art
direction block from sheets A to H. Keep Chaco identical across all twelve of his poses: that
consistency is what sells a boxing fight.

**Chaco, in one line, to reuse in every cell:** a gaunt leathery chupacabra in a cream white
linen suit worn over a bare grey-green chest, bony dorsal spines pushing through the back of the
jacket, red eyes behind gold aviator sunglasses, an oversized fanged jaw with one gold fang, heavy
gold chains and rings, white loafers with no socks, and hands wrapped in red boxing tape over the
linen cuffs. He never takes the jacket off, and it gets progressively destroyed across the poses.

### Sheet I — Chaco, the fight

3 × 3. Reading order: `chaco_idle` `chaco_tell_jab` `chaco_jab` / `chaco_tell_hay` `chaco_hay` `chaco_chupada` / `chaco_stunned` `chaco_polvo` `chaco_down`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each pose is centred in its own cell at the same
scale and the same distance from camera, fully separated from its neighbours, nothing touching or
overlapping. No grid lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: a full-body character pose seen from the front in three-quarter
view, soft 3D felt and clay render, matte fabric texture, thick dark charcoal outline, warm rim
light from the upper left, chunky cartoon proportions, muted palette with saturated gold accents,
no cast shadow, no ground plane, no background scenery.

The same character in all nine cells: a gaunt leathery chupacabra in a cream white linen suit worn
over a bare grey-green chest, bony dorsal spines pushing through the back of the jacket, red eyes
behind gold aviator sunglasses, an oversized fanged jaw with one gold fang, heavy gold chains and
rings, white loafers with no socks, hands wrapped in red boxing tape over the linen cuffs. He is a
Miami cartel boss who has not changed clothes to fight. The suit gets worse as the poses go on.

The nine poses, left to right, top row first:
1. standing in a lazy boxing guard, taped fists half raised, a fat cigar clamped in his fangs,
   suit immaculate, utterly unbothered
2. winding up a jab, left shoulder dipped low, the linen jacket falling open across his chest,
   clearly telegraphing
3. throwing a straight jab, left arm fully extended toward the viewer, cigar ash flying, snarling
4. winding up a haymaker, stepped back with his right arm cocked far behind him, gold chains and
   jacket flaring out wide, red eyes blazing behind the sunglasses
5. throwing the haymaker, right arm swung all the way across in a huge hook, body twisted through,
   the gold sunglasses flying off and his bare red eyes showing for the first time
6. lunging forward with his jaw open impossibly wide, fangs bared, long tongue out, linen pulled
   tight across his shoulders, arms spread
7. stunned and dazed, arms hanging loose, head lolling, jacket sliding off one shoulder,
   sunglasses gone, knees buckling
8. flinging a spray of fine white powder forward with one hand while the other pulls back from
   inside his jacket, powder settling on the white linen
9. knocked flat on his back, limbs splayed, the suit sweat-stained and filthy, chains across his
   chest, cigar still smouldering beside him
```

### Sheet J — Chaco: reactions and the finale

3 × 3. Reading order: `chaco_intro` `chaco_taunt` `chaco_hurt` / `chaco_stagger` `chaco_belt` `chaco_berserk` / `chaco_rage` `chaco_dead` `chaco_win`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each pose is centred in its own cell at the same scale and the same distance from camera, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: a full-body character pose seen from the front in three-quarter view, soft 3D felt and clay render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, muted palette with saturated gold accents, no cast shadow, no ground plane, no background scenery.

The same character in all nine cells: a gaunt leathery chupacabra in a cream white linen suit worn over a bare grey-green chest, bony dorsal spines pushing through the back of the jacket, red eyes behind gold aviator sunglasses, an oversized fanged jaw with one gold fang, heavy gold chains and rings, white loafers with no socks, hands wrapped in red boxing tape over the linen cuffs. He is a Miami cartel boss who has not changed clothes to fight. His suit is destroyed progressively across the nine poses, from immaculate in the first to ruined in the last.

The nine poses, left to right, top row first:
1. swaggering in with both arms spread wide, a gold championship belt slung over one shoulder, cigar in his fangs, suit immaculate, grinning
2. taunting, beckoning the viewer in with one taped hand, head tilted back, jeering, suit still clean
3. head snapped back and to one side from a hit, gold sunglasses knocked askew, spit flying, jacket rumpled
4. badly hurt and stumbling backward, arms windmilling for balance, sunglasses gone, jacket sliding off one shoulder
5. swinging a gaudy gold championship belt overhead like a flail, feral and wild, the jacket hanging off him in tatters
6. a burst bag of white powder smashed against his own face, white dust billowing, eyes bloodshot and bulging, veins standing out on his neck, feral snarl, the linen filthy with sweat and powder and his spines fully through the shredded jacket
7. mid-rage, throwing a wild blurred flurry of punches with both arms, mouth wide open roaring, powder still on his snout, suit destroyed
8. collapsed face-down and motionless, tongue lolling out, white powder still on his snout, one arm folded under him, the ruined suit soaked through
9. standing in triumph with both arms raised and one white loafer resting on something small and defeated, chest heaving, filthy suit, jubilant
```

### Sheet K — the ring and its props

3 × 3. Reading order: `ring_canvas` `ring_fence` `ring_light` / `ring_crowd` `boss_dynamite` `boss_bag` / `boss_belt` `ring_post` `boss_stars`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine
equal square cells with wide even white gutters. Each object is centred in its own cell, fully
separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no
numbers, no text, no labels, no watermark.

Art direction for every cell: a game asset seen straight on, soft 3D felt and clay render, matte
surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon
proportions, grimy underground venue mood, muted palette with one saturated accent, no cast
shadow, no background scenery.

The nine cells, left to right, top row first:
1. a square patch of worn stained boxing ring canvas, flat and seamless, scuffed and blood-flecked
2. a rectangular panel of grey chain-link fencing, slightly bent, seen face on
3. a battered industrial floodlight on a tripod stand, one bright bulb, cables trailing
4. a horizontal row of flat black crowd silhouettes, heads and raised arms, no faces
5. a single red stick of dynamite with a lit fuse and a bright spark
6. a small clear plastic bag of white powder, taped shut, one corner split open
7. a gaudy oversized gold championship belt with a huge ornate buckle and a red leather strap
8. a boxing ring corner post wrapped in tape with three sagging ropes attached
9. a burst of cartoon knockout stars, yellow and white, arranged in a ring
```

### Sheet L — the frog boxer

3 × 3. Reading order: `boxfrog_guard` `boxfrog_left` `boxfrog_right` / `boxfrog_duck` `boxfrog_tongue` `boxfrog_eat` / `boxfrog_hurt` `boxfrog_down` `boxfrog_win`

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each pose is centred in its own cell at the same scale and the same distance from camera, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no text, no labels, no watermark.

Art direction for every cell: a full-body character pose seen from the front in three-quarter view, soft 3D felt and clay render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground plane, no background scenery.

The same character in all nine cells: a small round cartoon frog, olive-green felt skin with dark speckles, a pale cream belly, huge white bulging eyes with tiny black pupils, and tiny red boxing gloves that are comically too big for its arms. It is the underdog and it knows it.

The nine poses, left to right, top row first:
1. standing square in a boxing guard, both gloves raised by its face, small and determined
2. leaning hard to its own left, dodging, gloves still up, eyes wide
3. leaning hard to its own right, dodging, gloves still up, eyes wide
4. crouched right down, ducking under a punch, eyes squeezed shut, gloves over its head
5. snapping its long pink tongue straight forward in a counter attack, one glove cocked back
6. catching a lit red stick of dynamite in its wide open mouth, fuse still sparking, cheeks bulging, delighted
7. reeling from a hit, head snapped back, one glove flung wide, eyes crossed
8. knocked flat on its back, dazed, gloves splayed out, little stars circling its head
9. standing in triumph with both gloves thrown up in the air, mouth wide open cheering, chest puffed out
```

---

### Sheet T — UMMA, and the Croc she throws

3 × 3. Reading order: `umma_idle` `umma_tell` `umma_throw` / `umma_scold` `umma_pride` `umma_trip` / `croc_shoe` — the last two cells are blank and ignored.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale and the same distance from camera, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no text, no labels, no watermark. The final two cells, bottom row, are empty white space.

Art direction for every character cell: a full-body pose seen from the front in three-quarter view, soft 3D felt and clay render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, no cast shadow, no ground plane, no background scenery.

The same character in the first six cells: a warm, sturdy Korean mother in her fifties, a tight rounded perm of dark hair, thin wire-frame glasses, a bright pink floral house dress with a white apron trim, and a pair of bright yellow Crocs on her own feet. She is not a villain, she is a mother who has been up the whole time, and her expression should read as loving and exasperated at once, never cruel.

The six poses, left to right, top row first:
1. standing at ease in a doorway, arms relaxed at her sides, watching, patient
2. winding up to throw, one arm cocked back high with a yellow Croc in her raised hand, eyebrows drawn together
3. mid-throw, arm snapped fully forward, the Croc just leaving her hand, dress swinging with the motion
4. scolding, one hand on her hip, the other pointing straight at the viewer, mouth open mid-sentence
5. beaming with pride, both hands clasped together at her chest, eyes crinkled shut with a wide happy smile
6. stumbling backward off balance, arms pinwheeling, one Croc-clad foot slipping out from under her, startled expression

Cell 7, bottom left, is a single object, not a character: one bright yellow rubber clog-style shoe (a Croc), seen from the side in mid-air as if thrown, a few small ventilation holes visible, the heel strap flared out behind it, tumbling.
```

### Sheet U — the bare-handed frog

3 × 3. Reading order: `ummafrog_guard` `ummafrog_left` `ummafrog_right` / `ummafrog_eat` `ummafrog_hurt` `ummafrog_down` / `ummafrog_win` — the last two cells are blank and ignored.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each pose is centred in its own cell at the same scale and the same distance from camera, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no text, no labels, no watermark. The final two cells, bottom row, are empty white space.

Art direction for every cell: a full-body character pose seen from the front in three-quarter view, soft 3D felt and clay render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground plane, no background scenery.

The same character in all seven cells: the same small round cartoon frog used throughout this game, olive-green felt skin with dark speckles, a pale cream belly, huge white bulging eyes with tiny black pupils. Bare frog hands and feet only, no gloves, no props, no weapons of any kind -- this frog never throws a punch.

The seven poses, left to right, top row first:
1. standing square and alert, both bare hands raised loosely by its chest, watching and ready
2. leaning hard to its own left, dodging, bare hands still up, eyes wide
3. leaning hard to its own right, dodging, bare hands still up, eyes wide
4. mouth wide open catching something, tongue not visible yet, delighted anticipation
5. reeling from a hit, head snapped back, both hands flung wide, eyes crossed
6. knocked flat on its back, dazed, arms splayed out, little stars circling its head
7. standing in triumph with both bare hands thrown up in the air, mouth wide open cheering, chest puffed out
```

## If a sprite comes out too big or too small

The slicer trims each sprite to its own edges, and the game scales it to the footprint the code
expects, so exact pixel size does not matter. What matters is that subjects stay inside their
cells. If one bleeds into its neighbour, the slicer will cut it in half.

## Cutting a sheet by hand instead

The grid is even, so in any editor: divide the canvas into 3 columns and 3 rows (3 × 2 for
Sheet F), export each cell, remove the white, and save as `assets/game/<kind>.png` using the
reading order listed under each sheet. Then add those names to `assets/game/manifest.json`.
