# Frogpocalypse sprite prompt sheet

Sixty sprites. Every one has a working procedural drawing already, so this is an upgrade path,
not a blocker. Do them in any order.

## How to use this sheet

1. Paste the **style block** below, then one **subject line** from the tables.
2. Generate at the listed aspect. Firefly's web app (firefly.adobe.com) is the free route.
3. Cut the background out. The Adobe connector's background remover works on a public URL,
   or use Firefly's own remove-background.
4. Save as `assets/game/<kind>.png` and add `"<kind>"` to the `sprites` array in
   `assets/game/manifest.json`.

Anything not in the manifest keeps its built-in vector drawing, so you can ship one sprite or sixty.

## Style block

Paste this before every subject line so the set stays coherent.

```
Top-down orthographic game sprite viewed from directly above with a slight forward tilt.
Soft 3D felt and clay render, matte fabric texture, thick dark charcoal outline,
warm rim light from the upper left, chunky friendly proportions.
Muted olive, cream and charcoal palette with one saturated accent colour.
Subject centred and facing right, isolated on a flat pure white background,
no cast shadow, no ground plane, no text, no watermark, no logo.
```

## Aspect cheat sheet

Give the generator the closest aspect it supports, then trim. Sprites are drawn on a 64px grid.

| Aspect | Used by |
|---|---|
| 1:1 | frogs, all pickups, all power-ups, hurricane, moon, chef, hand |
| 16:9 | robotaxi, police, heli, jet, duck, alienship, flymech, kraken |
| 21:9 or wider | semi, bomber, carrier, station, heron, foodtruck, flare |
| 9:16 | tubeman, liberty, fork, missile, nuke |

---

## The frog, nine forms

The frog is the brand. Keep the same character across all nine, just bigger and angrier.

| Kind | Subject line |
|---|---|
| `frog_s1` | a small round cartoon frog, huge white bulging eyes with tiny black pupils, wide flat mouth, olive-green felt skin with dark speckles, pale cream belly, sitting alert, cheerful and slightly stupid |
| `frog_s2` | the same olive-green felt frog, slightly larger and stockier, cheeks puffed, eyes narrowing, a faint scorch mark on one shoulder |
| `frog_s3` | the same frog, now muscular and scowling, angry eyebrow ridges, singed patches on its back, cream belly streaked with soot |
| `frog_s4` | the same frog, heavily scarred and furious, jaw set, one eye squinting, smoke curling from its shoulders, cracked charcoal skin between the green |
| `frog_k1` | a monstrous car-sized cartoon frog, snarling, dark spiny ridge down its spine, enormous white eyes, thick armoured olive hide, glowing orange cracks in the skin |
| `frog_k2` | the same monster frog, building-sized, jagged spines along the back, chipped teeth, battle-scarred hide, faint ember glow at the throat |
| `frog_k3` | the same monster frog, mountain-sized, moss and rock crusted on its back, tectonic cracks glowing molten orange, eyes blazing white |
| `frog_k4` | the same monster frog, continent-sized, hide like scorched bark, storm clouds snagged on its spines, molten fissures across the chest |
| `frog_k5` | the same monster frog, planet-sized and apocalyptic, hide black and volcanic, spines like mountain ranges, eyes two blazing white suns, aurora light along the back |

## Act 1 traffic, 2028

| Kind | Subject line |
|---|---|
| `robotaxi` | a small white driverless taxi pod seen from above, rounded bubble body, tinted glass roof, a glowing teal sensor strip on the bonnet, no driver |
| `foodtruck` | a chunky orange hover food truck seen from above, striped red and white awning along one side, a round serving hatch, roof vents |
| `semi` | a long autonomous articulated lorry seen from above, dark blue cab and a ribbed steel trailer, no windscreen, sensor pods on the corners |
| `police` | a white and black police patrol EV seen from above, red and blue light bar glowing on the roof, blocky and official |
| `drone` | a small four-rotor delivery drone seen from above, motion-blurred propellers, a brown cardboard parcel clamped underneath |

## Kaiju act, ground

| Kind | Subject line |
|---|---|
| `tank` | a stubby cartoon battle tank seen from above, olive drab, wide black tracks either side, short turret with the barrel pointing right |
| `swattervan` | a teal utility van seen from above with an enormous red plastic fly swatter mounted on the roof, government markings on the bonnet |
| `tubeman` | an inflatable wacky waving tube man seen from above, hot pink nylon, googly eyes, arms flailing in opposite directions, anchored to a small blower box |
| `chef` | a giant cartoon French chef seen from above, tall white toque, enormous white moustache, white double-breasted jacket, a steel fork in one hand and a knife in the other |
| `flymech` | a military mech built to look like a giant housefly, seen from above, riveted steel plates, translucent hexagonal wing panels, glowing red compound eyes, obviously not a real fly |
| `liberty` | the Statue of Liberty seen from above wading through water, oxidised green copper, spiked crown, torch raised in the right hand, robe folds catching the light |
| `kraken` | a purple cartoon kraken seen from above, bulbous mantle, huge yellow eyes, eight thick tentacles curling outward with pale suckers |
| `duck` | a giant yellow rubber duck refitted as a battleship, seen from above, orange bill, a grey naval deck gun mounted on its back, riveted armour plating on the flanks |
| `carrier` | a grey aircraft carrier seen from above, long flight deck with white centreline markings, island superstructure on the starboard side, jets parked along the edge |

## Kaiju act, air and orbit

| Kind | Subject line |
|---|---|
| `newsdrone` | a small white press drone seen from above, four rotors, a boxy camera gimbal underneath, a red broadcast light, a network logo panel on top |
| `heli` | a military attack helicopter seen from above, dark grey fuselage, spinning main rotor disc, stub wings with rocket pods, tail boom pointing left |
| `jet` | a grey fighter jet seen from above, sharp delta wings swept back, twin tail fins, a bubble canopy, orange afterburner glow at the tail |
| `bomber` | a large grey flying-wing stealth bomber seen from above, one continuous swept triangular wing, no tail, open bomb bay doors on the underside |
| `heron` | an enormous grey heron seen from above in flight, long spear-like yellow beak, wings fully spread, slate and white plumage, legs trailing behind |
| `hurricane` | a cartoon hurricane seen from above, tight white and pale blue spiral cloud bands, a clear round eye at the centre with a scowling angry face in it |
| `moon` | the Moon seen from above, pale grey cratered sphere, a few large dark maria, soft chalky texture, lit from the upper left |
| `station` | a space station seen from above, central white cylindrical module, two enormous dark blue solar wing arrays either side, gold foil detailing |
| `alienship` | a classic flying saucer seen from above, brushed silver disc hull, a glowing teal glass dome on top with two dark eyes inside, coloured lights around the rim |

## Explosives, the things you eat

These are the whole point. Make them read as edible and dangerous at a glance.

| Kind | Subject line |
|---|---|
| `dynamite` | a bundle of three red dynamite sticks bound with brown tape, seen from above, a curling fuse with a bright spark at the tip |
| `mine` | a round black naval mine seen from above, blunt detonator spikes around the rim, a glowing teal indicator light in the centre |
| `tanker` | a fuel tanker truck seen from above, polished chrome cylindrical tank, a red flammable diamond placard on the side |
| `gasstation` | a small petrol station seen from above, red canopy roof, two white fuel pumps underneath, a spilled puddle catching the light |
| `propane` | a fat white propane cylinder lying on its side, seen from above, a red warning band around the middle, a brass valve at one end |
| `silo` | an open missile silo hatch seen from above, thick concrete ring, blast doors swung apart, a red missile nose cone visible in the shaft |
| `volcano` | a small volcano seen from above, dark brown rocky cone, a glowing molten orange crater at the summit, thin smoke |
| `sub` | a black nuclear submarine seen from above surfaced, long teardrop hull, a conning tower with a raised periscope, a red running light |
| `oilrig` | an offshore oil rig seen from above, yellow steel platform on four legs, a central derrick tower, a burning orange flare stack |
| `nukesilo` | an open nuclear missile silo seen from above, concrete ring, blast doors apart, a black and yellow radiation trefoil painted on the hatch |
| `food` | a fat cartoon cheeseburger seen from above, sesame seed bun, melted cheese, lettuce and tomato peeking out, glossy and appetising |

## Power-ups

Make these unmistakably different from the explosives. Bright, clean, glowing.

| Kind | Subject line |
|---|---|
| `pw_invuln` | a glowing pale blue crystal hexagonal shield floating above the ground, seen from above, translucent, a soft cyan halo around it |
| `pw_freeze` | a six-pointed ice crystal snowflake seen from above, pale blue and white, sharp branching arms, a soft frost glow, a few loose ice shards |
| `pw_fire` | a single stylised flame seen from above, orange outer body with a bright yellow core and a white-hot centre, curling to a point |
| `pw_armor` | a battered steel shield plate seen from above, scratched and dented brushed metal, three rivets, one deep gouge across the face, cold grey highlight |
| `pw_life` | a plump glossy red heart seen from above, soft rounded lobes, a bright white highlight on the upper left, a warm red glow beneath |

## Projectiles

| Kind | Subject line |
|---|---|
| `missile` | a slim guided missile seen from above pointing up, grey body, red nose cone, four tail fins, orange exhaust flare at the base |
| `bomb` | a classic round black cartoon bomb seen from above, a short steel fin collar at the top, a glossy highlight on the shell |
| `cruise` | a cruise missile seen from above flying right, long grey tube body, a red pointed nose, short stub wings mid-body, a blue exhaust flame at the tail |
| `torpedo` | a black torpedo seen from above travelling right, blunt red nose, a trail of white bubbles behind it |
| `nuke` | a large nuclear warhead missile seen from above pointing up, dark steel body, a yellow and black radiation trefoil on the flank, four fins, orange exhaust |
| `bullet` | a single glowing yellow tracer round seen from above, bright hot core with a soft golden halo, small |
| `strafe` | a short vertical yellow energy bolt seen from above, bright core, tapered ends, a soft warm glow |
| `fork` | a large steel dinner fork seen from above pointing up, three tines, a polished handle, cold metallic highlights |
| `jetlaunch` | a small grey fighter jet seen from above launching right, swept wings, bright orange afterburner |
| `laser` | a vertical orbital laser beam seen from above, intense white core with a translucent red outer beam, sharp edges, no source visible |
| `hand` | an enormous human hand seen from directly above descending palm-down, fingers spread, holding a red plastic fly swatter, warm skin tones, thick dark outline |
| `flare` | a horizontal solar flare streak seen from above travelling right, a chain of overlapping orange and yellow plasma blobs, brightest at the leading edge |

## Backgrounds

These are drawn as lane bands in code, not sprites. If you want painted backdrops instead,
generate a seamless tile per environment and it can be wired in as a separate step: `highway`
(night motorway asphalt), `city` (downtown avenues from above), `continent` (rivers and mountain
ranges), `ocean` (open water with currents), `orbit` (starfield with orbital rings).
