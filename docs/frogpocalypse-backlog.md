# Frogpocalypse backlog

Things agreed but not started. Each one lists what was asked for (in the owner's words where it
matters), what it would take, and the questions to settle before building.

## Rebuilds

### 1. NECO becomes a Centipede knock-off
Asked for: "The Neco one is boring, so let's redo it as a Centipede knock-off. Two centipedes, or
frogs, going after explosives and [each one] gets 10 faster."
- **Shape:** a top-down arcade field. Two segmented Neco creatures wind down the screen toward the
  explosives that land in it. Every explosive one eats makes it faster.
- **Every boss falls to its own trait:** Neco's trait is greed (there are already `neco_greedy` and
  `neco_overload` sprites). The natural finish is that they overload on what they ate, not that the
  frog shoots them.
- **Needs:** a new fight engine (a `centipedefight.js` in place of `mirrorfight.js`), config, tests,
  and art: head, body and tail segments, a hurt/overloaded pose, the field's obstacles, the frog at
  the bottom, and a background.
- **Open questions:** "10 faster" could mean +10% per explosive or ten times faster overall. How does
  the frog act on them without a punch? Does Neco keep its intro and defeat clip?

### 2. UMMA becomes pure Donkey Kong
Asked for: "The UMMA one is clunky... rethink it as pure Donkey Kong... only she throws Crocs and
they do flips."
- **Shape:** girders and ladders, the frog climbing up, UMMA at the top throwing Crocs that tumble
  down the platforms with a flip animation. Still no punch button for the frog.
- **Overlap to settle:** the Landlord is already a vertical climb (`climbfight.js`). Decide how the
  two differ (angled girders and rolling hazards vs falling debris), or change one of them.
- **Needs:** a new engine, a rolling/flipping Croc (rotation frames or a spin in code), girder and
  ladder art, the throw and trip poses (UMMA's sheet T already has these), and a win condition that
  is UMMA's own doing (for example tripping on her own Crocs).
- **Note:** she is currently the final boss and the true ending follows her.

## New interrupters
The Influencer is the model (`config/influencer.js`, `systems/influencer.js`, `ui/adcard.js`): a
character who breaks in during ordinary stages, in four tiers of getting worse, with a portrait per
tier, a voice, and products. The new ones are meant to be part of the gameplay, so **they should make
it harder**, not just talk (covering part of the field, fake close buttons, noise), unlike the
Influencer, who never blocks input.

When the first of these is built, generalise the Influencer into an interrupter system so each
character is data: who, when they unlock, tiers, portraits, props, lines, voice prefix.

### 3. The Preacher (unlocks after Sack Man is beaten)
Asked for: a preacher, telemarketers, a full scam, inspired by "Jesus He Knows Me" by Genesis. He
"gets worse and worse and tries to justify his indiscretions as the game progresses."
- **Careful:** take the idea (a televangelist who has been caught out), not the song's words.
- **Needs:** portraits across four tiers, props (donation tickers, hotline number stickers, prayer
  cloths sold at a markup), a voice character and script, config, and the interrupter system.
- **Timing:** Sack Man sits after K4, so he could only appear from K5 and the UMMA fight onward. That
  is a short window unless the run gets longer.

### 4. The Podcaster (unlocks after UMMA)
Asked for: "a political, full-on right-wing, conspiracy-theory, non-vaccination, the worst of the
worst podcaster."
- **Satire of a type, not of anyone real:** an invented grifter with an invented supplement and an
  invented network. No real names, parties, or real events.
- **Timing problem:** UMMA is the final boss and the ending follows her, so nothing comes after her
  today. Options: add stages after UMMA, add a post-game loop, or reorder the bosses.
- **Needs:** portraits, props (a fake mic, a bunker sign, a supplements tub), a voice and script,
  config.

### 5. The Boss's Boss (unlocks after Neco)
Asked for: the player's boss, from his real office, "asking what he's doing", full of productivity
keywords and business nonsense, getting "more and more unhinged as it goes on to the point that
his speech makes no sense."
- **Shape:** appears from K3 on (Neco is after K2). Tier one is fluent corporate, tier four is word
  salad.
- **Needs:** a corner office backdrop and portraits across four tiers, props (sticky notes, a KPI
  chart, a calendar invite), a voice and script, and a buzzword generator so the late tiers can
  degrade on purpose.

## Order of arrival
Influencer (from the start) -> Boss's Boss (after Neco) -> Preacher (after Sack Man) -> Podcaster
(after UMMA). The last two depend on the run getting longer.

## Shared open question
How intrusive should the harder interrupters be? A pop-up that only covers a corner is easy to
play through. One that blocks part of the road, or needs a click to dismiss, changes the difficulty.
