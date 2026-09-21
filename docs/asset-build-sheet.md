# Asset build sheet

Every image, sound and voice still to be made before the wiring starts. **Each prompt is complete: paste it as it
is.** Names in `code` are the file names to save as. Sheets go through `python3 tools/slice_sheet.py <KEY> <file>`.

**Ground rules that came out of the last rounds**
- Characters: make the **hero image first**, check it, then make the other tiers as **edits of the hero**.
- If a sheet comes back with a few wrong cells, fix just those with a one-object prompt. Do not reroll the whole sheet.
- All art is the same soft 3D felt-and-clay puppet look as the rest of the game.
- Voices: use the ElevenLabs voice named on each block. The bracket at the start of each line is the accent and
  delivery cue, so keep it in.

**Decisions these prompts assume (say so if any is wrong)**
- **Neco** becomes a top-down Centipede: two chains of Neco segments crawl toward explosives; each one they eat makes
  them 10% faster; they overload if they eat too many.
- **UMMA** becomes a Donkey Kong girder climb: she throws Crocs that tumble down the girders; the frog climbs with the
  side-view climbing frog that already exists.
- **The hidden level** is a Super Mario Bros. style side-scroller. The frog is shown side-on, small and big. The
  explosives replace the mushroom, flower and star.

## Order to make things (biggest payoff first)
1. The three interrupters: portraits, then props (Part A). They are the most visible new thing and unblock the most wiring.
2. Voices for them, the bosses and the AI (Part E). Recordings can arrive any time; captions cover the gap.
3. Neco and UMMA art (Parts B and C).
4. The hidden level (Part D), the biggest set.
5. Audio (Part F), then the Google Play art (Part G).


# Part A. The interrupters

## Pastor Dale Hollis

**Portraits.** Save as `pastor_t1.png` to `pastor_t4.png`. Tier 1 is the hero. Attach it for tiers 2 to 4.

**Tier 1, the hero**

```
A satirical caricature of a hyper-groomed televangelist pastor, head and shoulders. Soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions: an oversized head on a small body. A stout, glossy, middle-aged man with an enormous sprayed pompadour, a blinding white smile, a powder-blue three-piece suit, a big gold cross on a chain, heavy gold rings, a sheen of holy sweat and a gold microphone held near his mouth. Radiating warm, total confidence, as if a spotlight has followed him his whole life. A satire of a type, human, not any real person. Plain pure white background, no shadow, no text, no logos, no watermark, centred, square image.
```

**Tier 2** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: his smile is still huge but now fixed, sweat beads on his forehead, his tie is loosened, one eyebrow lifted defensively, and a tiny gold jet-shaped tie pin catches the light. He looks like someone explaining himself.
```

**Tier 3** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: wide-eyed and sweating heavily, his pompadour starting to slip sideways, dark sunglasses pushed up on his forehead, a faint lipstick smudge on his white collar, his hand pressed to his chest in wounded innocence.
```

**Tier 4** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: completely unravelled: his pompadour has collapsed into a limp mess, his suit is rumpled, his tie is knotted around his forehead like a headband, tears and sweat streak his face, his hands are clasped in a desperate prayer, and he is screaming toward the sky.
```

**Props, sheet `PR`.** Slice with `python3 tools/slice_sheet.py PR <file>`.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a single object seen straight on, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions, no cast shadow, no background scenery. Palette: gold, cream, powder blue and sacred-looking glow, slightly too shiny and slightly too smug. Everything is a satirical parody, and every brand is fictional.

The nine cells, left to right, top row first:
1. a tall donation thermometer with the red level barely off the bottom and a tiny cartoon frown
2. a retro telephone with a halo above it and a glowing heart on the dial
3. a folded white prayer cloth with a gold tassel and a price tag tied on with a ribbon
4. a rolled parchment deed tied with a ribbon, with a tiny fluffy cloud drawn on it
5. a small glossy white private jet with a wooden pulpit built onto its roof
6. a round bubbling hot tub with a tiny cross on its rim, foam spilling over
7. an ornate solid-gold microphone with a jewelled band
8. a thick gold-plated Bible with a ribbon bookmark and a glowing edge
9. a tiny dream house with a lake dock, sitting on a puffy cloud, with a flag reading nothing
```

Reading order: `prop_pastor_thermometer` `prop_pastor_hotline` `prop_pastor_cloth` `prop_pastor_deed` `prop_pastor_jet` `prop_pastor_hottub` `prop_pastor_mic` `prop_pastor_bible` `prop_pastor_estate`

## Buck Mallory

**Portraits.** Save as `podcaster_t1.png` to `podcaster_t4.png`. Tier 1 is the hero. Attach it for tiers 2 to 4.

**Tier 1, the hero**

```
A satirical caricature of a paranoid conspiracy podcaster, head and shoulders. Soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions: an oversized head on a small body. A wiry man in his fifties with a wild grey beard, wide bloodshot eyes, a camouflage vest over a plaid shirt, a trucker cap wrapped in tinfoil, a headset with a microphone in front of his mouth, and a pop-filter screen. He is pointing a finger at us with total, righteous confidence, like a man who has just revealed everything. A satire of a type, human, not any real person. Plain pure white background, no shadow, no text, no logos, no watermark, centred, square image.
```

**Tier 2** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: angry and furious, veins standing on his temple, his finger jabbing forward, spit flying, and behind him a corkboard of photos joined by red string, all of it in a wild tangle.
```

**Tier 3** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: feverish and grinning, holding up a green tub of supplement with a frog on the label, a green stain around his mouth, one eye wider than the other, the tinfoil on his cap crinkled and bent.
```

**Tier 4** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: in a bunker: a single hanging bulb lights him, the walls behind are covered in crinkled foil, he clutches his microphone with both hands, eyes bugging, whispering, sweat everywhere, the tinfoil hat now enormous and lopsided.
```

**Props, sheet `PO`.** Slice with `python3 tools/slice_sheet.py PO <file>`.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a single object seen straight on, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions, no cast shadow, no background scenery. Palette: camouflage green, olive, warning red, rusty orange, tinfoil silver, slightly grimy and paranoid. Everything is a satirical parody, and every brand is fictional.

The nine cells, left to right, top row first:
1. a studio microphone with a pop filter and a small glowing red on-air light
2. a tall crinkled tinfoil hat
3. a round steel bunker hatch with a big wheel and a warning symbol
4. a green tub of Frog Bile Vitality supplement with a smug frog face on the label
5. a cork board covered in photos and red string, with a single pushpin glowing
6. a giant staring eye inside a triangle, glowing
7. a camouflage trucker cap with a bent piece of tinfoil sticking out
8. a cheeseburger with a tiny camera lens hidden in the bun and a pickle antenna
9. a grey pigeon with a tiny propeller and a camera lens on its chest
```

Reading order: `prop_pod_mic` `prop_pod_foilhat` `prop_pod_bunker` `prop_pod_supplement` `prop_pod_corkboard` `prop_pod_eye` `prop_pod_cap` `prop_pod_burger` `prop_pod_pigeon`

## Gregory Pemberton

**Portraits.** Save as `bossboss_t1.png` to `bossboss_t4.png`. Tier 1 is the hero. Attach it for tiers 2 to 4.

**Tier 1, the hero**

```
A satirical caricature of a corporate Vice President of Synergy, head and shoulders. Soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions: an oversized head on a small body. A sleek man in his forties with slicked side-parted hair, unnaturally white teeth, a tailored navy suit, a lanyard with a badge, a coffee mug in one hand and a tablet in the other, and a wireless headset. He is giving an enormous, totally fake friendly thumbs-up, radiating false warmth. A satire of a type, human, not any real person. Plain pure white background, no shadow, no text, no logos, no watermark, centred, square image.
```

**Tier 2** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: his smile is still there but tight, one eye twitching, his tie pulled a little too tight, three small calendar invite pop-ups floating around his head, and a coffee stain on his shirt.
```

**Tier 3** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: his tie is loosened and his hair has a strand out of place, he is mid-sentence with his mouth half open, sweating, holding three phones at once, papers flying around him, eyes darting.
```

**Tier 4** (attach the tier 1 image)

```
Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, plain pure white background, no shadow, no text, no watermark. Change only their state: serenely smiling and totally blank, eyes unfocused, hair exploded upward, his tie tied around his head like a headband, and sticky notes, chart arrows and calendar icons orbiting around his head in a spiral.
```

**Props, sheet `BB`.** Slice with `python3 tools/slice_sheet.py BB <file>`.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a single object seen straight on, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions, no cast shadow, no background scenery. Palette: navy, steel grey, corporate teal and one flat bright accent, slightly sterile and trying too hard. Everything is a satirical parody, and every brand is fictional.

The nine cells, left to right, top row first:
1. a calendar invite pop-up with a bell, a tiny clock and a big green accept button
2. a bar chart with all the bars going steeply downward and a small smiling arrow pointing up
3. a wall of neat yellow sticky notes covered in arrows and squiggles
4. a white coffee mug with a small gold crown and a steaming swirl
5. a spreadsheet pivot table grid with a tiny spinning arrow in the corner
6. an alarm clock with two circular arrows around it and a tiny wilted flower on top
7. a laptop showing a pie chart with a tiny stack of hundreds of slides beside it
8. an access badge on a lanyard with a golden star
9. an organisation chart tree with a tiny stick figure alone at the very bottom
```

Reading order: `prop_boss_invite` `prop_boss_chart` `prop_boss_notes` `prop_boss_mug` `prop_boss_pivot` `prop_boss_clock` `prop_boss_laptop` `prop_boss_badge` `prop_boss_orgchart`

# Part B. Neco, the Centipede

**Sheet `CN`.** Everything seen from above, the way an arcade centipede is.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: seen from directly above like a classic arcade game, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, deep violet and magenta palette with glowing red accents, no cast shadow, no background. Each cell is one game object.

The nine cells, left to right, top row first:
1. the head of a centipede made of a menacing frog: a round violet frog head seen from above with two glowing red greedy eyes and a wide grinning mouth, tiny front legs
2. the same frog head with its cheeks swollen and glowing, eyes bulging, cracks of orange light across its skin, about to burst
3. a round violet centipede body segment seen from above, with two tiny legs on each side and a faint mirror-like sheen
4. a round magenta centipede body segment seen from above, the same size and shape, with two tiny legs on each side
5. the tail segment: a smaller tapered violet segment with a little curl and two tiny legs
6. a body segment bloated with swallowed explosives, glowing orange cracks, dynamite fuses poking out of its skin
7. a burst of purple and gold sparks and fragments in a starburst, an overloaded centipede popping
8. a cluster of three red dynamite sticks bound together with a small glowing fuse, like a mushroom, seen from above
9. an empty cracked husk of a body segment, dull and grey-violet, lifeless
```

Reading order: `cent_head` `cent_head_full` `cent_body_a` `cent_body_b` `cent_tail` `cent_body_swollen` `cent_burst` `cent_pod` `cent_husk`

**Backdrop** (`cent_bg.png`, one 4:5 portrait image, no slicing)

```
A portrait illustration of a mirror-dimension arena seen from directly above: a dark violet glassy floor marked with a faint grid, framed all around by jagged shards of cracked mirror that reflect distorted purple light, a glowing red crack running across the floor, soft fog at the edges. The centre and lower half are open and uncluttered because game pieces move across it. Soft 3D felt and clay look, matte surfaces, muted violet and magenta palette. No characters, no text, no watermark.
```

# Part C. UMMA, the girder climb

The frog climbs with the existing climbing frog sprites; UMMA and the Croc are already made (sheet T). What is missing is the set.

**Sheet `UD`**

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a game object seen straight from the side, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, warm kitchen palette of butter yellow, red-orange steel and kimchi red, no cast shadow, no background.

The nine cells, left to right, top row first:
1. a long horizontal steel construction girder with a row of rivets and a slightly sloping look, red-orange, seamless left and right
2. a girder with a broken, jagged hole in the middle and bent metal at the edges
3. a tall vertical steel ladder with rungs, red-orange, straight
4. a ladder with a broken rung and a bent side rail
5. a big round ceramic kimchi jar with a wooden lid, bubbling and glowing with red fire inside, a hot splash at the rim
6. a tall tumbling stack of colourful plastic clog shoes piled up like a small hill
7. a cheerful little electric rice cooker with a steaming lid and a glowing heart on it, the prize at the top
8. a puff of white kitchen steam curling upward
9. a small bowl of banchan side dishes with colourful vegetables and a pair of chopsticks, worth bonus points
```

Reading order: `dk_girder` `dk_girder_broken` `dk_ladder` `dk_ladder_broken` `dk_jar` `dk_crocs` `dk_ricecooker` `dk_steam` `dk_banchan`

**Backdrop** (`dk_bg.png`, one 4:5 portrait image)

```
A portrait illustration of a huge steel scaffold rising through a giant Korean family kitchen: butter-yellow patterned wallpaper, a fridge covered in magnets far in the background, hanging cooking pots, a tall shelf of jars, warm yellow lamplight, everything slightly too large as if seen from a frog's height. The centre of the picture is open and uncluttered because the platforms are drawn over it. Soft 3D felt and clay look, matte surfaces, warm butter yellow and kimchi red palette. No characters, no text, no watermark.
```

# Part D. The hidden level

Seven defeated bosses, shrunk to walking size, plus the frog, the tiles and the explosives.

**Tiles, sheet `H1`**

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a game tile seen straight on, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm light from the upper left, chunky cartoon proportions, bright cheerful sunny palette, no cast shadow, no background.

The nine cells, left to right, top row first:
1. a grassy-topped dirt ground block with a chunky cartoon texture, a perfect square, seamless left and right
2. a cracked stone brick block with a chunky cartoon texture, a perfect square
3. a yellow explosive crate block with a glowing red starburst on its face, a perfect square, an item block
4. the same crate block used up, dull brown and empty with the starburst gone, a perfect square
5. the top rim of a green sewer pipe, wide and round, with a little slime drip
6. the body of a green sewer pipe, a plain section that repeats vertically
7. a round fluffy white cloud with a smiling shape, side view
8. a round green bush with a few small round berries, side view
9. a small rounded green hill with two little eye-like spots, side view
```

Reading order: `hl_ground` `hl_brick` `hl_crate` `hl_crate_used` `hl_pipe_top` `hl_pipe_body` `hl_cloud` `hl_bush` `hl_hill`

**The frog, small, sheet `H2`**

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: the same character in strict side view, facing right, full body, soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground, no background. The character: a small round cartoon frog with olive-green felt skin and dark speckles, a pale cream belly, huge white bulging eyes with tiny black pupils, no clothes, no gloves.

The nine cells, left to right, top row first:
1. standing idle, relaxed, blinking
2. running, first stride, one leg forward
3. running, second stride, the other leg forward
4. jumping, legs tucked, mouth open in effort
5. defeated, flat on its back with its eyes as crosses, tongue out
6. skidding to a stop, leaning back, dust at its feet
7. crouched low, ducking, eyes squeezed shut
8. shooting its long pink tongue straight forward
9. victory pose, both arms up, huge open smile
```

Reading order: `hf_small_idle` `hf_small_run1` `hf_small_run2` `hf_small_jump` `hf_small_dead` `hf_small_skid` `hf_small_duck` `hf_small_tongue` `hf_small_win`

**The frog, big, sheet `H3`** (after the TNT: larger and wearing a vest of dynamite)

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: the same character in strict side view, facing right, full body, soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground, no background. The character: the same round olive-green speckled cartoon frog with a cream belly and huge bulging eyes, now larger and stockier, wearing a canvas vest strapped with red dynamite sticks with tiny sparkling fuses.

The nine cells, left to right, top row first:
1. standing idle, chest puffed
2. running, first stride
3. running, second stride
4. jumping, legs tucked, vest sparks flying
5. hit and shrinking, the vest flying off, eyes wide
6. breathing a big jet of orange fire straight forward from its open mouth, standing
7. breathing fire while running, flames trailing
8. crouched low, ducking
9. victory pose, both arms up, fire coming from its mouth upward
```

Reading order: `hf_big_idle` `hf_big_run1` `hf_big_run2` `hf_big_jump` `hf_big_hurt` `hf_big_fire` `hf_big_firerun` `hf_big_duck` `hf_big_win`

**The defeated bosses, small. Sheet `H4`: Chaco, the Landlord, Neco.** They are chibi, squat, walking toward the left.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: each character in strict side view, facing left, full body, chibi squat proportions, about as tall as they are wide, soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground, no background. Each row is a different character with three poses.

The nine cells, left to right, top row first:
1. a tiny chupacabra in a cream linen suit with gold aviator sunglasses, a gold fang and red boxing tape on his fists, walking, first step
2. a tiny chupacabra in a cream linen suit with gold aviator sunglasses, a gold fang and red boxing tape on his fists, walking, second step with the other foot forward
3. a tiny chupacabra in a cream linen suit with gold aviator sunglasses, a gold fang and red boxing tape on his fists, squashed flat and dazed like a stomped pancake with tiny stars
4. a tiny grumpy landlord with a rumpled brown suit, a comb-over, a ring of keys on his belt and a boiler-shaped briefcase, walking, first step
5. a tiny grumpy landlord with a rumpled brown suit, a comb-over, a ring of keys on his belt and a boiler-shaped briefcase, walking, second step with the other foot forward
6. a tiny grumpy landlord with a rumpled brown suit, a comb-over, a ring of keys on his belt and a boiler-shaped briefcase, squashed flat and dazed like a stomped pancake with tiny stars
7. a tiny grinning mirror-frog with purple skin, glowing red eyes and a cracked-glass sheen, walking, first step
8. a tiny grinning mirror-frog with purple skin, glowing red eyes and a cracked-glass sheen, walking, second step with the other foot forward
9. a tiny grinning mirror-frog with purple skin, glowing red eyes and a cracked-glass sheen, squashed flat and dazed like a stomped pancake with tiny stars
```

Reading order: `hm_chaco_1` `hm_chaco_2` `hm_chaco_flat` `hm_landlord_1` `hm_landlord_2` `hm_landlord_flat` `hm_neco_1` `hm_neco_2` `hm_neco_flat`

**Sheet `H5`: the Narrator, the Sack Man, UMMA**

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: each character in strict side view, facing left, full body, chibi squat proportions, about as tall as they are wide, soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground, no background. Each row is a different character with three poses.

The nine cells, left to right, top row first:
1. a tiny walking vintage broadcast microphone with two stubby legs and a smug painted mouth, walking, first step
2. a tiny walking vintage broadcast microphone with two stubby legs and a smug painted mouth, walking, second step with the other foot forward
3. a tiny walking vintage broadcast microphone with two stubby legs and a smug painted mouth, squashed flat and dazed like a stomped pancake with tiny stars
4. a tiny walking burlap sack with two stubby legs and two glowing eyes peeking from the opening, walking, first step
5. a tiny walking burlap sack with two stubby legs and two glowing eyes peeking from the opening, walking, second step with the other foot forward
6. a tiny walking burlap sack with two stubby legs and two glowing eyes peeking from the opening, squashed flat and dazed like a stomped pancake with tiny stars
7. a tiny Korean mom in a floral apron and curly perm, carrying a Croc in one hand, walking, first step
8. a tiny Korean mom in a floral apron and curly perm, carrying a Croc in one hand, walking, second step with the other foot forward
9. a tiny Korean mom in a floral apron and curly perm, carrying a Croc in one hand, squashed flat and dazed like a stomped pancake with tiny stars
```

Reading order: `hm_narrator_1` `hm_narrator_2` `hm_narrator_flat` `hm_sackman_1` `hm_sackman_2` `hm_sackman_flat` `hm_umma_1` `hm_umma_2` `hm_umma_flat`

**Sheet `H6`: Probe One and the explosives**

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a game object seen from the side, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, bright cheerful palette, no cast shadow, no background.

The nine cells, left to right, top row first:
1. a small chibi flying saucer with a green alien dome and blinking lights, hovering, first frame
2. the same flying saucer, second frame, tilted and lights on the other side
3. the same flying saucer squashed flat and dazed with tiny stars
4. a glass beaker of bright green foaming chemicals overflowing with bubbles, a game power-up
5. a compact glowing nuclear bomb with a radiation symbol, a shine and a pulsing halo, a game power-up
6. a bundle of three red TNT sticks tied with twine and a sparkling fuse, a game power-up
7. a juicy cheeseburger with a gold shine, a game coin
8. a big detonator plunger box with a red T-handle, the goal at the end of the level
9. a small gold starburst, a score pop
```

Reading order: `hm_probe_1` `hm_probe_2` `hm_probe_flat` `hi_beaker` `hi_nuke` `hi_tnt` `hi_burger` `hi_detonator` `hi_star`

**Backdrop** (`hl_bg.png`, one wide 2:1 image that repeats sideways)

```
A wide 2 to 1 landscape illustration, seamless so that its left and right edges join, of a sunny cartoon skyline of a ruined but cheerful city at golden hour: soft distant hills, toppled billboards, leaning towers, puffy clouds, and warm haze. Soft 3D felt and clay look, matte surfaces, bright cheerful palette. The lower quarter is quiet and low-contrast because tiles are drawn over it. No characters, no text, no watermark.
```

# Part E. Voices to record

Everything is in `docs/voice-cast.md`, generated from the game's own files so the words match. In brief:

| Who | Voice | What | Files |
|---|---|---|---|
| The seven bosses | Spaniard, Tarantula, Murray, The Crocodile Reaper, System, Ghost Daddy, Olivia 2 | Five lines each | `voice_boss_<id>_01` to `05` (35) |
| Pastor Dale | Preacher | 12 lines | `voice_pastor_tier<T>_<NN>` |
| Buck Mallory | Nixon | 12 lines | `voice_podcaster_tier<T>_<NN>` |
| Gregory Pemberton | Protagonist | 12 lines | `voice_bossboss_tier<T>_<NN>` |
| The Influencer | Influencer | 22 outbursts for when you try to skip her | listed in the doc |
| The System | System | SACK LICKED and 15 new achievements, three hidden-level lines | `voice_ach_<id>`, `voice_hidden_*` |

# Part F. Audio (ElevenLabs music and sound effects)

**Music.** Each loops. Save as `music_<name>.mp3`.

`music_boss_neco`

```
An eerie arcade chase in a mirror dimension: pulsing analogue synth bass, reversed reverb swells, insect-skitter percussion, warped melody that repeats and detunes, tension building, 130 bpm, seamless loop, no vocals.
```

`music_boss_umma`

```
A clanky, cheerful arcade construction-site march with kitchen percussion: pots and pans, a cleaver on a wooden block, a rice-cooker steam whistle, bouncy chiptune bass, 120 bpm, playful but relentless, seamless loop, no vocals.
```

`music_hidden`

```
A bright, bouncy platformer theme in fat 8-bit chiptune with a slightly unhinged orchestral sparkle: jumpy bass, cheeky lead melody, marimba fills, 140 bpm, sunny and mischievous, seamless loop, no vocals.
```

`music_star`

```
A frantic invincibility theme in urgent 8-bit style: racing arpeggios, siren-like leads, hammering kick, 170 bpm, thirty seconds, seamless loop, no vocals.
```

`sting_pastor`

```
A four second church-organ sting: a big pompous major chord with a cheesy tremolo and a tiny cash-register ding at the end.
```

`sting_podcaster`

```
A four second radio sting: a burst of static, a stretched airhorn, a paranoid low synth drone, and a sharp click.
```

`sting_bossboss`

```
A three second corporate notification sting: a bright inoffensive marimba chime followed by a slightly sinister second chime.
```

**Sound effects.** Short, dry, no music. Save as `<name>.mp3`.

`sfx_plane_flyby`

```
A small propeller plane flying past low overhead, a Doppler whoosh from left to right, three seconds.
```

`sfx_package_whistle`

```
A falling bomb whistle, a pitch dropping from high to low, one second and a half.
```

`sfx_powder_burst`

```
A big soft burst of white powder: a deep thump followed by a long airy hiss and a cough, two seconds.
```

`sfx_skip_scream`

```
A comedic short scream of panic, cut off, then a strangled sob, cartoonish and dry, one second.
```

`sfx_hl_jump`

```
A cartoon frog hop: a springy boing with a wet slap, half a second.
```

`sfx_hl_stomp`

```
A squishy stomp on a small enemy: a wet crunch and a rubbery squeak, half a second.
```

`sfx_hl_powerup`

```
A rising cartoon power-up: bubbling whoosh and a fat happy chime, one second.
```

`sfx_hl_fire`

```
A short fire breath: a whoosh of flame with a crackle, one second.
```

`sfx_hl_nuke`

```
A radioactive pickup: a dramatic rising siren swell and a glassy shimmer, one and a half seconds.
```

`sfx_hl_shrink`

```
A sad deflating shrink: a downward squeal and a soft pop, one second.
```

`sfx_hl_win`

```
A triumphant cartoon victory fanfare with a big detonator plunger click and an explosion, three seconds.
```

`sfx_croc_bounce`

```
A plastic clog shoe bouncing on a metal girder: a hollow clonk with a rubbery squeak, half a second.
```

`sfx_jar_smash`

```
A ceramic jar smashing with a hiss of hot steam and a bubbling splash, one second.
```

`sfx_cent_skitter`

```
A many-legged insect skittering rapidly over glass, tiny fast ticks, one second.
```

`sfx_cent_overload`

```
A creature swelling and popping: a rising squeal, a glassy crack, a wet burst and sparkling fragments, two seconds.
```

`sfx_beam_hum`

```
A sci-fi tractor beam: a rising warbling hum with a gentle lifting whoosh, two seconds.
```

`sfx_stamp`

```
A heavy rubber stamp slamming onto paper, a single dull thud and a paper slap, half a second.
```

`sfx_mirror_flip`

```
A mirror flipping: a glassy swish with a soft reversed chime, one second.
```

`sfx_blackout`

```
A power cut: a descending electrical whine into a heavy click and silence, one second.
```

`sfx_card_pop`

```
A cheap notification pop: a bubbly blip with a tiny sparkle, a third of a second.
```

# Part G. Google Play art

**App icon** (`play_icon.png`, square, 512 px at least)

```
A bold app icon: a happy olive-green cartoon frog face with huge bulging eyes, cheeks puffed, holding a lit stick of dynamite in its mouth with a sparkling fuse, on a deep purple background with a bright orange explosion glow behind it. Soft 3D felt and clay look, thick dark outline, centred, simple and readable at small sizes, no text, no border.
```

**Feature graphic** (`play_feature.png`, 2:1, at least 1024 by 500)

```
A wide 2 to 1 banner illustration: a giant olive-green cartoon frog standing on a cracked highway at sunset, a city skyline exploding behind it, cars and flying burgers scattering, a lit dynamite stick in its mouth, a purple and orange sky. Soft 3D felt and clay look, thick dark outline, dramatic and funny. Leave the centre-left quarter calm because the title will be added there. No text, no watermark.
```

**Screenshots** are taken from the game itself once the assets are wired in.
