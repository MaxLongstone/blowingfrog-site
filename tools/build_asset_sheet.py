#!/usr/bin/env python3
"""Writes docs/asset-build-sheet.md: every image, sound and voice still to be made, each as a
complete copy-paste prompt (nothing refers to another block).  python3 tools/build_asset_sheet.py"""
from pathlib import Path

GRID = ("A single square sprite sheet on a pure white background, arranged as a clean 3 by 3 grid of nine equal "
        "square cells with wide even white gutters. Each subject is centred in its own cell at the same scale, fully "
        "separated from its neighbours, nothing touching or overlapping. No grid lines, no borders, no numbers, no "
        "labels, no watermark. NO readable words or letters anywhere: any labels or logos are abstract shapes and symbols.")

def sheet(art, subjects, note=""):
    lines = "\n".join(f"{i+1}. {s}" for i, s in enumerate(subjects))
    return f"{GRID}\n\n{art}\n\nThe nine cells, left to right, top row first:\n{lines}"

PROP_ART = ("Art direction for every cell: a single object seen straight on, soft 3D felt and clay render, matte surfaces, "
            "thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon proportions, "
            "no cast shadow, no background scenery. {mood}")
SIDE_ART = ("Art direction for every cell: the same character in strict side view, facing right, full body, soft 3D felt and "
            "clay puppet render, matte fabric texture, thick dark charcoal outline, warm rim light from the upper left, "
            "chunky friendly proportions, no cast shadow, no ground, no background.")

def hero(desc, extra):
    return (f"A satirical caricature of {desc}, head and shoulders. Soft 3D felt and clay puppet render, matte fabric "
            f"texture, thick dark charcoal outline, warm rim light from the upper left, chunky exaggerated cartoon "
            f"proportions: an oversized head on a small body. {extra} A satire of a type, human, not any real person. "
            f"Plain pure white background, no shadow, no text, no logos, no watermark, centred, square image.")

def edit(state):
    return ("Same character as the attached image, same soft 3D felt and clay puppet style, same framing, same size, "
            "plain pure white background, no shadow, no text, no watermark. Change only their state: " + state)

def block(t): return "```\n" + t + "\n```\n"

out = []
w = out.append
w("# Asset build sheet\n")
w("""Every image, sound and voice still to be made before the wiring starts. **Each prompt is complete: paste it as it
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
2. Voices, sound effects and music (the ElevenLabs master sheet). Recordings can arrive any time; captions cover the gap.
3. Neco and UMMA art (Parts B and C).
4. The hidden level (Part D), the biggest set.
5. The Google Play art (Part F).

""")

# ---- Part A
w("# Part A. The interrupters\n")
chars = [
 ("Pastor Dale Hollis", "pastor", "PR",
  hero("a hyper-groomed televangelist pastor", "A stout, glossy, middle-aged man with an enormous sprayed pompadour, a blinding white smile, a powder-blue three-piece suit, a big gold cross on a chain, heavy gold rings, a sheen of holy sweat and a gold microphone held near his mouth. Radiating warm, total confidence, as if a spotlight has followed him his whole life."),
  ["his smile is still huge but now fixed, sweat beads on his forehead, his tie is loosened, one eyebrow lifted defensively, and a tiny gold jet-shaped tie pin catches the light. He looks like someone explaining himself.",
   "wide-eyed and sweating heavily, his pompadour starting to slip sideways, dark sunglasses pushed up on his forehead, a faint lipstick smudge on his white collar, his hand pressed to his chest in wounded innocence.",
   "completely unravelled: his pompadour has collapsed into a limp mess, his suit is rumpled, his tie is knotted around his forehead like a headband, tears and sweat streak his face, his hands are clasped in a desperate prayer, and he is screaming toward the sky."],
  [("a tall donation thermometer with the red level barely off the bottom and a tiny cartoon frown", "prop_pastor_thermometer"),
   ("a retro telephone with a halo above it and a glowing heart on the dial", "prop_pastor_hotline"),
   ("a folded white prayer cloth with a gold tassel and a price tag tied on with a ribbon", "prop_pastor_cloth"),
   ("a rolled parchment deed tied with a ribbon, with a tiny fluffy cloud drawn on it", "prop_pastor_deed"),
   ("a small glossy white private jet with a wooden pulpit built onto its roof", "prop_pastor_jet"),
   ("a round bubbling hot tub with a tiny cross on its rim, foam spilling over", "prop_pastor_hottub"),
   ("an ornate solid-gold microphone with a jewelled band", "prop_pastor_mic"),
   ("a thick gold-plated Bible with a ribbon bookmark and a glowing edge", "prop_pastor_bible"),
   ("a tiny dream house with a lake dock, sitting on a puffy cloud, with a flag reading nothing", "prop_pastor_estate")],
  "gold, cream, powder blue and sacred-looking glow, slightly too shiny and slightly too smug"),
 ("Buck Mallory", "podcaster", "PO",
  hero("a paranoid conspiracy podcaster", "A wiry man in his fifties with a wild grey beard, wide bloodshot eyes, a camouflage vest over a plaid shirt, a trucker cap wrapped in tinfoil, a headset with a microphone in front of his mouth, and a pop-filter screen. He is pointing a finger at us with total, righteous confidence, like a man who has just revealed everything."),
  ["angry and furious, veins standing on his temple, his finger jabbing forward, spit flying, and behind him a corkboard of photos joined by red string, all of it in a wild tangle.",
   "feverish and grinning, holding up a green tub of supplement with a frog on the label, a green stain around his mouth, one eye wider than the other, the tinfoil on his cap crinkled and bent.",
   "in a bunker: a single hanging bulb lights him, the walls behind are covered in crinkled foil, he clutches his microphone with both hands, eyes bugging, whispering, sweat everywhere, the tinfoil hat now enormous and lopsided."],
  [("a studio microphone with a pop filter and a small glowing red on-air light", "prop_pod_mic"),
   ("a tall crinkled tinfoil hat", "prop_pod_foilhat"),
   ("a round steel bunker hatch with a big wheel and a warning symbol", "prop_pod_bunker"),
   ("a green tub of Frog Bile Vitality supplement with a smug frog face on the label", "prop_pod_supplement"),
   ("a cork board covered in photos and red string, with a single pushpin glowing", "prop_pod_corkboard"),
   ("a giant staring eye inside a triangle, glowing", "prop_pod_eye"),
   ("a camouflage trucker cap with a bent piece of tinfoil sticking out", "prop_pod_cap"),
   ("a cheeseburger with a tiny camera lens hidden in the bun and a pickle antenna", "prop_pod_burger"),
   ("a grey pigeon with a tiny propeller and a camera lens on its chest", "prop_pod_pigeon")],
  "camouflage green, olive, warning red, rusty orange, tinfoil silver, slightly grimy and paranoid"),
 ("Gregory Pemberton", "bossboss", "BB",
  hero("a corporate Vice President of Synergy", "A sleek man in his forties with slicked side-parted hair, unnaturally white teeth, a tailored navy suit, a lanyard with a badge, a coffee mug in one hand and a tablet in the other, and a wireless headset. He is giving an enormous, totally fake friendly thumbs-up, radiating false warmth."),
  ["his smile is still there but tight, one eye twitching, his tie pulled a little too tight, three small calendar invite pop-ups floating around his head, and a coffee stain on his shirt.",
   "his tie is loosened and his hair has a strand out of place, he is mid-sentence with his mouth half open, sweating, holding three phones at once, papers flying around him, eyes darting.",
   "serenely smiling and totally blank, eyes unfocused, hair exploded upward, his tie tied around his head like a headband, and sticky notes, chart arrows and calendar icons orbiting around his head in a spiral."],
  [("a calendar invite pop-up with a bell, a tiny clock and a big green accept button", "prop_boss_invite"),
   ("a bar chart with all the bars going steeply downward and a small smiling arrow pointing up", "prop_boss_chart"),
   ("a wall of neat yellow sticky notes covered in arrows and squiggles", "prop_boss_notes"),
   ("a white coffee mug with a small gold crown and a steaming swirl", "prop_boss_mug"),
   ("a spreadsheet pivot table grid with a tiny spinning arrow in the corner", "prop_boss_pivot"),
   ("an alarm clock with two circular arrows around it and a tiny wilted flower on top", "prop_boss_clock"),
   ("a laptop showing a pie chart with a tiny stack of hundreds of slides beside it", "prop_boss_laptop"),
   ("an access badge on a lanyard with a golden star", "prop_boss_badge"),
   ("an organisation chart tree with a tiny stick figure alone at the very bottom", "prop_boss_orgchart")],
  "navy, steel grey, corporate teal and one flat bright accent, slightly sterile and trying too hard"),
]
for name, cid, key, h, edits, props, mood in chars:
    w(f"## {name}\n")
    w(f"**Portraits.** Save as `{cid}_t1.png` to `{cid}_t4.png`. Tier 1 is the hero. Attach it for tiers 2 to 4.\n")
    w("**Tier 1, the hero**\n"); w(block(h))
    for i, e in enumerate(edits, start=2):
        w(f"**Tier {i}** (attach the tier 1 image)\n"); w(block(edit(e)))
    w(f"**Props, sheet `{key}`.** Slice with `python3 tools/slice_sheet.py {key} <file>`.\n")
    w(block(sheet(PROP_ART.format(mood=f"Palette: {mood}. Everything is a satirical parody, and every brand is fictional.").replace("Palette:", "Palette:"), [p for p, _ in props])))
    w("Reading order: " + " ".join(f"`{n}`" for _, n in props) + "\n")

# ---- Part B
w("# Part B. Neco, the Centipede\n")
w("**Sheet `CN`.** Everything seen from above, the way an arcade centipede is.\n")
w(block(sheet("Art direction for every cell: seen from directly above like a classic arcade game, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, deep violet and magenta palette with glowing red accents, no cast shadow, no background. Each cell is one game object.", [
 "the head of a centipede made of a menacing frog: a round violet frog head seen from above with two glowing red greedy eyes and a wide grinning mouth, tiny front legs",
 "the same frog head with its cheeks swollen and glowing, eyes bulging, cracks of orange light across its skin, about to burst",
 "a round violet centipede body segment seen from above, with two tiny legs on each side and a faint mirror-like sheen",
 "a round magenta centipede body segment seen from above, the same size and shape, with two tiny legs on each side",
 "the tail segment: a smaller tapered violet segment with a little curl and two tiny legs",
 "a body segment bloated with swallowed explosives, glowing orange cracks, dynamite fuses poking out of its skin",
 "a burst of purple and gold sparks and fragments in a starburst, an overloaded centipede popping",
 "a cluster of three red dynamite sticks bound together with a small glowing fuse, like a mushroom, seen from above",
 "an empty cracked husk of a body segment, dull and grey-violet, lifeless"])))
w("Reading order: `cent_head` `cent_head_full` `cent_body_a` `cent_body_b` `cent_tail` `cent_body_swollen` `cent_burst` `cent_pod` `cent_husk`\n")
w("**Backdrop** (`cent_bg.png`, one 4:5 portrait image, no slicing)\n")
w(block("A portrait illustration of a mirror-dimension arena seen from directly above: a dark violet glassy floor marked with a faint grid, framed all around by jagged shards of cracked mirror that reflect distorted purple light, a glowing red crack running across the floor, soft fog at the edges. The centre and lower half are open and uncluttered because game pieces move across it. Soft 3D felt and clay look, matte surfaces, muted violet and magenta palette. No characters, no text, no watermark."))

# ---- Part C
w("# Part C. UMMA, the girder climb\n")
w("The frog climbs with the existing climbing frog sprites; UMMA and the Croc are already made (sheet T). What is missing is the set.\n")
w("**Sheet `UD`**\n")
w(block(sheet("Art direction for every cell: a game object seen straight from the side, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, warm kitchen palette of butter yellow, red-orange steel and kimchi red, no cast shadow, no background.", [
 "a long horizontal steel construction girder with a row of rivets and a slightly sloping look, red-orange, seamless left and right",
 "a girder with a broken, jagged hole in the middle and bent metal at the edges",
 "a tall vertical steel ladder with rungs, red-orange, straight",
 "a ladder with a broken rung and a bent side rail",
 "a big round ceramic kimchi jar with a wooden lid, bubbling and glowing with red fire inside, a hot splash at the rim",
 "a tall tumbling stack of colourful plastic clog shoes piled up like a small hill",
 "a cheerful little electric rice cooker with a steaming lid and a glowing heart on it, the prize at the top",
 "a puff of white kitchen steam curling upward",
 "a small bowl of banchan side dishes with colourful vegetables and a pair of chopsticks, worth bonus points"])))
w("Reading order: `dk_girder` `dk_girder_broken` `dk_ladder` `dk_ladder_broken` `dk_jar` `dk_crocs` `dk_ricecooker` `dk_steam` `dk_banchan`\n")
w("**Backdrop** (`dk_bg.png`, one 4:5 portrait image)\n")
w(block("A portrait illustration of a huge steel scaffold rising through a giant Korean family kitchen: butter-yellow patterned wallpaper, a fridge covered in magnets far in the background, hanging cooking pots, a tall shelf of jars, warm yellow lamplight, everything slightly too large as if seen from a frog's height. The centre of the picture is open and uncluttered because the platforms are drawn over it. Soft 3D felt and clay look, matte surfaces, warm butter yellow and kimchi red palette. No characters, no text, no watermark."))

# ---- Part D
w("# Part D. The hidden level\n")
w("Seven defeated bosses, shrunk to walking size, plus the frog, the tiles and the explosives.\n")
tiles = ["a grassy-topped dirt ground block with a chunky cartoon texture, a perfect square, seamless left and right",
 "a cracked stone brick block with a chunky cartoon texture, a perfect square",
 "a yellow explosive crate block with a glowing red starburst on its face, a perfect square, an item block",
 "the same crate block used up, dull brown and empty with the starburst gone, a perfect square",
 "the top rim of a green sewer pipe, wide and round, with a little slime drip",
 "the body of a green sewer pipe, a plain section that repeats vertically",
 "a round fluffy white cloud with a smiling shape, side view",
 "a round green bush with a few small round berries, side view",
 "a small rounded green hill with two little eye-like spots, side view"]
w("**Tiles, sheet `H1`**\n")
w(block(sheet("Art direction for every cell: a game tile seen straight on, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm light from the upper left, chunky cartoon proportions, bright cheerful sunny palette, no cast shadow, no background.", tiles)))
w("Reading order: `hl_ground` `hl_brick` `hl_crate` `hl_crate_used` `hl_pipe_top` `hl_pipe_body` `hl_cloud` `hl_bush` `hl_hill`\n")
w("**The frog, small, sheet `H2`**\n")
w(block(sheet(SIDE_ART + " The character: a small round cartoon frog with olive-green felt skin and dark speckles, a pale cream belly, huge white bulging eyes with tiny black pupils, no clothes, no gloves.", [
 "standing idle, relaxed, blinking", "running, first stride, one leg forward", "running, second stride, the other leg forward",
 "jumping, legs tucked, mouth open in effort", "defeated, flat on its back with its eyes as crosses, tongue out", "skidding to a stop, leaning back, dust at its feet",
 "crouched low, ducking, eyes squeezed shut", "shooting its long pink tongue straight forward", "victory pose, both arms up, huge open smile"])))
w("Reading order: `hf_small_idle` `hf_small_run1` `hf_small_run2` `hf_small_jump` `hf_small_dead` `hf_small_skid` `hf_small_duck` `hf_small_tongue` `hf_small_win`\n")
w("**The frog, big, sheet `H3`** (after the TNT: larger and wearing a vest of dynamite)\n")
w(block(sheet(SIDE_ART + " The character: the same round olive-green speckled cartoon frog with a cream belly and huge bulging eyes, now larger and stockier, wearing a canvas vest strapped with red dynamite sticks with tiny sparkling fuses.", [
 "standing idle, chest puffed", "running, first stride", "running, second stride", "jumping, legs tucked, vest sparks flying",
 "hit and shrinking, the vest flying off, eyes wide", "breathing a big jet of orange fire straight forward from its open mouth, standing",
 "breathing fire while running, flames trailing", "crouched low, ducking", "victory pose, both arms up, fire coming from its mouth upward"])))
w("Reading order: `hf_big_idle` `hf_big_run1` `hf_big_run2` `hf_big_jump` `hf_big_hurt` `hf_big_fire` `hf_big_firerun` `hf_big_duck` `hf_big_win`\n")
mini = lambda who, desc="": [f"{who}, walking, first step", f"{who}, walking, second step with the other foot forward", f"{who}, squashed flat and dazed like a stomped pancake with tiny stars"]
w("**The defeated bosses, small. Sheet `H4`: Chaco, the Landlord, Neco.** They are chibi, squat, walking toward the left.\n")
w(block(sheet(SIDE_ART.replace("the same character", "each character").replace("facing right", "facing left").replace("full body", "full body, chibi squat proportions, about as tall as they are wide") + " Each row is a different character with three poses.",
 [*mini("a tiny chupacabra in a cream linen suit with gold aviator sunglasses, a gold fang and red boxing tape on his fists", ""),
  *mini("a tiny grumpy landlord with a rumpled brown suit, a comb-over, a ring of keys on his belt and a boiler-shaped briefcase", ""),
  *mini("a tiny grinning mirror-frog with purple skin, glowing red eyes and a cracked-glass sheen", "")])))
w("Reading order: `hm_chaco_1` `hm_chaco_2` `hm_chaco_flat` `hm_landlord_1` `hm_landlord_2` `hm_landlord_flat` `hm_neco_1` `hm_neco_2` `hm_neco_flat`\n")
w("**Sheet `H5`: the Narrator, the Sack Man, UMMA**\n")
w(block(sheet(SIDE_ART.replace("the same character", "each character").replace("facing right", "facing left").replace("full body", "full body, chibi squat proportions, about as tall as they are wide") + " Each row is a different character with three poses.",
 [*mini("a tiny walking vintage broadcast microphone with two stubby legs and a smug painted mouth", ""),
  *mini("a tiny walking burlap sack with two stubby legs and two glowing eyes peeking from the opening", ""),
  *mini("a tiny Korean mom in a floral apron and curly perm, carrying a Croc in one hand", "")])))
w("Reading order: `hm_narrator_1` `hm_narrator_2` `hm_narrator_flat` `hm_sackman_1` `hm_sackman_2` `hm_sackman_flat` `hm_umma_1` `hm_umma_2` `hm_umma_flat`\n")
w("**Sheet `H6`: Probe One and the explosives**\n")
w(block(sheet("Art direction for every cell: a game object seen from the side, soft 3D felt and clay render, matte surfaces, thick dark charcoal outline, warm rim light from the upper left, chunky cartoon proportions, bright cheerful palette, no cast shadow, no background.", [
 "a small chibi flying saucer with a green alien dome and blinking lights, hovering, first frame", "the same flying saucer, second frame, tilted and lights on the other side",
 "the same flying saucer squashed flat and dazed with tiny stars", "a glass beaker of bright green foaming chemicals overflowing with bubbles, a game power-up",
 "a compact glowing nuclear bomb with a radiation symbol, a shine and a pulsing halo, a game power-up", "a bundle of three red TNT sticks tied with twine and a sparkling fuse, a game power-up",
 "a juicy cheeseburger with a gold shine, a game coin", "a big detonator plunger box with a red T-handle, the goal at the end of the level", "a small gold starburst, a score pop"])))
w("Reading order: `hm_probe_1` `hm_probe_2` `hm_probe_flat` `hi_beaker` `hi_nuke` `hi_tnt` `hi_burger` `hi_detonator` `hi_star`\n")
w("**Backdrop** (`hl_bg.png`, one wide 2:1 image that repeats sideways)\n")
w(block("A wide 2 to 1 landscape illustration, seamless so that its left and right edges join, of a sunny cartoon skyline of a ruined but cheerful city at golden hour: soft distant hills, toppled billboards, leaning towers, puffy clouds, and warm haze. Soft 3D felt and clay look, matte surfaces, bright cheerful palette. The lower quarter is quiet and low-contrast because tiles are drawn over it. No characters, no text, no watermark."))

# ---- Part E
w("# Part E. Voices, sound effects and music\n")
w("All of it is in the separate **ElevenLabs master sheet** (`docs/elevenlabs-master.md`): every voice line with its accent and delivery cues, every sound effect and every piece of music, each as a complete prompt.\n")

# ---- Part G
w("# Part F. Google Play art\n")
w("**App icon** (`play_icon.png`, square, 512 px at least)\n")
w(block("A bold app icon: a happy olive-green cartoon frog face with huge bulging eyes, cheeks puffed, holding a lit stick of dynamite in its mouth with a sparkling fuse, on a deep purple background with a bright orange explosion glow behind it. Soft 3D felt and clay look, thick dark outline, centred, simple and readable at small sizes, no text, no border."))
w("**Feature graphic** (`play_feature.png`, 2:1, at least 1024 by 500)\n")
w(block("A wide 2 to 1 banner illustration: a giant olive-green cartoon frog standing on a cracked highway at sunset, a city skyline exploding behind it, cars and flying burgers scattering, a lit dynamite stick in its mouth, a purple and orange sky. Soft 3D felt and clay look, thick dark outline, dramatic and funny. Leave the centre-left quarter calm because the title will be added there. No text, no watermark."))
w("**Screenshots** are taken from the game itself once the assets are wired in.\n")

Path("docs/asset-build-sheet.md").write_text("\n".join(out))
print("wrote docs/asset-build-sheet.md", sum(len(x) for x in out), "chars")
