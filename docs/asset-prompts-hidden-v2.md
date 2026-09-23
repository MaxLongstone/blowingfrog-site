# Missing art: the hidden level's villain moves, and the pre-boss environmentals

Two sheets. Each is a 3 by 3 grid. Slice with `python3 tools/slice_sheet.py H7 <file>` and `python3 tools/slice_sheet.py V1 <file>`. Save the images anywhere; the reading order under each prompt is the order the slicer expects (left to right, top row first).

The new Landlord (bald, glasses, stained tank top, keys, steel toolbox) is already installed from your sheet.

# Sheet H7: the villains' special poses

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: strict side view, facing left, chibi squat proportions, soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky friendly proportions, no cast shadow, no ground, no background.

The nine cells, left to right, top row first:
1. a tiny grumpy bald landlord with round glasses, a stained cream tank top, grey work trousers, sandals and a ring of keys on his belt, crouched into a tight defensive ball: knees pulled up, arms hugging his shins, his tank top stretched over his knees like a shell, head ducked low so only his glasses and frowning eyebrows peek out, a small steel toolbox tucked beside him
2. a tiny Korean mom in a floral apron and curly perm, mid-throw: one arm cocked high behind her head gripping a beige Croc shoe, the other arm stretched forward for balance, one foot lifted, mouth open in a shout, fierce and comedic
3. a tiny walking vintage broadcast microphone with two stubby legs and a smug painted mouth, sprinting flat out: leaning far forward, legs stretched mid-stride, glowing hot cherry red all over, a coiled cable streaming behind it, small motion streaks, furious squinting face
4. a tiny burlap-sack ghost floating in the air with no legs, two glowing yellow eyes peering from the dark opening, tattered fabric wisps trailing beneath it, two stubby arms stretched out in front, the opening tilted wide, spooky but friendly, frame one
5. the same tiny burlap-sack ghost floating in the air with no legs, two glowing yellow eyes peering from the dark opening, tattered fabric wisps trailing beneath it, two stubby arms stretched out in front, the tattered wisps swaying the other way and the opening a little narrower, frame two
6. a cartoon black-and-white dairy cow falling through the air, legs splayed out stiffly, eyes wide and panicked, mouth open in a silent moo, a little cowbell, side view
7. a tiny chupacabra in a cream linen suit with gold aviator sunglasses, a gold fang and red boxing tape on his fists, only his top half visible, cut off cleanly and flat at the waist as if rising out of a hole, both fists thrown up in triumph, a dusting of white powder on his snout and shoulders
8. a big soft puff of white powder, a round billowing cloud with three or four overlapping lobes, fine dust drifting off its edges, no character, no face, a slightly translucent look
9. a small silver flying saucer seen from the side, its belly hatch swung open with a soft glow inside, a little green alien leaning out and looking down mischievously, blue glass dome, a ring of coloured lights
```

Reading order: `hm_landlord_hide` `hm_umma_throw` `hm_narrator_dash` `hm_sackman_ghost_1` `hm_sackman_ghost_2` `hi_cow` `hm_chaco_pop` `hi_puff` `hm_ufo_drop`

# Sheet V1: the environmental hazards

These replace the plain shapes the pre-boss hazards are drawn with today.

```
A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.

Art direction for every cell: a single object seen straight from the side, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions, no cast shadow, no background.

The nine cells, left to right, top row first:
1. a small vintage cargo propeller plane in side view, facing right, cream fuselage with a red nose and a spinning propeller blur, a round cockpit window, a cargo door hanging open, cheerful and slightly overloaded
2. a rough wooden supply crate bound with rope, one corner split open with fine white powder trickling out, a small stencil-like abstract symbol on the side (not letters), slightly dented from a fall
3. a big soft explosion of white powder, a wide billowing cloud with many overlapping lobes and a few drifting motes, no character, a little translucent, no dark outline (a soft edge only)
4. a grey metal flying saucer in side view, a glassy cyan dome on top, a glowing cyan emitter lens on its underside, rivets and a ring of small lights, menacing but toy-like
5. a cartoon black-and-white dairy cow floating helplessly upward with all four legs dangling, eyes wide and startled, mouth in a small round O, tail curled, tinted faintly cyan by a glow around it
6. a single sheet of crumpled cream paper (an eviction notice) with a torn top edge, abstract grey squiggles instead of text, a smudged red rectangle at the bottom, one folded corner
7. a large circular red rubber-stamp impression, distressed and slightly crooked, with a bold abstract star in the middle instead of any lettering, rough uneven ink edges
8. a glowing cyan ring of light seen at a slight angle, like a tractor-beam ripple, soft glow, a pale translucent look, no character
9. a single bare lightbulb hanging from a short frayed cord, glass slightly cracked, the filament dimming and flickering, a faint warm glow around it
```

Reading order: `env_plane` `env_package` `env_powder_puff` `env_saucer` `env_cow` `env_notice` `env_stamp` `env_beam_ring` `env_sack_lightbulb`

# Sheet H7, one character at a time

Use these instead of the grid prompt when you want each pose consistent with its character. For each one, attach the reference image named in brackets. Save each result under the file name shown, as a square image on plain white, and slice by hand or drop it straight into `assets/game/` (the loader only needs the file name and a transparent background).

Shared style, already inside every prompt: soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chibi squat proportions, strict side view facing left, full body, plain pure white background, no shadow, no text, no watermark, centred, square image.

**1. `hm_landlord_hide`** (attach the Landlord walking pose from the new H4 sheet)

```
Same character as the attached image: the tiny grumpy bald landlord with round glasses, a stained cream tank top, grey work trousers, sandals and a ring of keys on his belt. Same soft 3D felt and clay puppet style, same outline, same size, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only his pose: crouched into a tight defensive ball, knees pulled up to his chest, arms hugging his shins, his tank top stretched over his knees like a turtle shell, head ducked low so only his glasses and frowning eyebrows peek out, the ring of keys dangling, the small steel toolbox tucked beside him. He should read as a compact shell shape.
```

**2. `hm_umma_throw`** (attach UMMA walking, from the H5 sheet)

```
Same character as the attached image: the tiny Korean mom in a floral apron and curly perm. Same soft 3D felt and clay puppet style, same outline, same size, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only her pose: mid-throw, one arm cocked high behind her head gripping a beige Croc shoe, the other arm stretched forward for balance, her front foot lifted, her mouth open in a fierce comedic shout, leaning slightly back like a baseball pitcher just before the release.
```

**3. `hm_narrator_dash`** (attach the Narrator walking, from the H5 sheet)

```
Same character as the attached image: the tiny walking vintage broadcast microphone with two stubby legs and a smug painted mouth. Same soft 3D felt and clay puppet style, same outline, same size, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only his state: sprinting flat out, leaning far forward, legs stretched mid-stride, the whole body glowing hot cherry red like a fuse about to blow, a coiled cable streaming behind him, three short motion streaks trailing off his back, a furious squinting face with the smug mouth now a snarl.
```

**4. `hm_sackman_ghost_1`** (attach the Sack Man walking, from the H5 sheet)

```
Same character as the attached image: the tiny burlap sack with two glowing yellow eyes peeking from the dark opening. Same soft 3D felt and clay puppet style, same outline, same size, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only his state: floating in mid-air like a ghost, no legs at all, the bottom of the sack dissolving into tattered fabric wisps that trail beneath him, two stubby arms stretched out in front, the opening tilted wide and glowing, spooky but friendly, frame one of a two-frame float.
```

**5. `hm_sackman_ghost_2`** (attach the image from step 4)

```
Same character as the attached image, the floating burlap-sack ghost. Same soft 3D felt and clay puppet style, same outline, same size, same framing, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only the float frame: the tattered wisps now swaying the opposite way, the opening a little narrower, the arms a touch lower, as if he has drifted half a beat further along.
```

**6. `hi_cow`** (no reference needed; this is a new object)

```
A cartoon black-and-white dairy cow falling through the air, legs splayed out stiffly, eyes wide and panicked, mouth open in a silent moo, a little brass cowbell on a red collar, pink udder, strict side view. Soft 3D felt and clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions, plain pure white background, no shadow, no text, no watermark, centred, square image.
```

**7. `hm_chaco_pop`** (attach Chaco walking, from the H4 sheet)

```
Same character as the attached image: the tiny chupacabra in a cream linen suit with gold aviator sunglasses, a gold fang and red boxing tape on his fists. Same soft 3D felt and clay puppet style, same outline, same size, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only what is visible and his pose: only his top half is shown, cut off cleanly and perfectly flat at the waist as if he is rising out of a hole in the ground, both fists thrown up in triumph, a cheeky grin, a dusting of fine white powder on his snout and shoulders.
```

**8. `hi_puff`** (no reference needed)

```
A big soft puff of white powder, a round billowing cloud made of three or four overlapping lobes, fine dust drifting off its edges, no character, no face, a slightly translucent look with a soft edge rather than a hard outline. Soft 3D felt and clay render, matte, warm rim light from the upper left, plain pure white background, no shadow, no text, no watermark, centred, square image.
```

**9. `hm_ufo_drop`** (attach Probe One, the saucer with the green alien, from the H6 sheet)

```
Same object as the attached image: the small silver flying saucer with a blue glass dome and a ring of coloured lights. Same soft 3D felt and clay puppet style, same outline, same size, side view, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only one thing: a hatch on the belly is swung open with a warm glow spilling out, and the little green alien is leaning out of it and looking down mischievously, one hand raised as if about to let something go.
```

# Neco: swells, then goes off in black

Neco no longer flattens. He swells for about half a second, then bursts in a cloud of black and the screen goes dark for three seconds. Two images. Save each and install with `python3 tools/slice_sheet.py ONE <name> <file>` (it strips the white background and registers the sprite).

**`hm_neco_swell`** (attach Neco walking, from the H4 sheet)

```
Same character as the attached image: the tiny grinning mirror-frog with purple skin, glowing red eyes and a cracked-glass sheen. Same soft 3D felt and clay puppet style, same outline, strict side view facing left, plain pure white background, no shadow, no text, no watermark, centred, square image. Change only his state: swollen up like a balloon about to pop, his body puffed to almost twice the width, the cracks in his glass-like skin glowing violet and leaking wisps of black smoke, his red eyes bulging, his tiny feet just leaving the ground, a wide, panicked, guilty grin.
```

**`hi_blackcloud`** (no reference needed)

```
A huge billowing cloud of pitch-black smoke from an explosion, a round mushrooming shape made of many overlapping lobes, thick dense inky-black with faint deep-violet highlights on the edges, a few cracked glass-like purple shards flying out of it, no character, no face. Soft 3D felt and clay render, matte, thick dark outline, plain pure white background, no shadow, no text, no watermark, centred, square image.
```
