# Frogpocalypse backlog

Things agreed but not started. Each one lists what was asked for (in the owner's words where it
matters), what it would take, and the questions to settle before building.

## Build plan

Confirmed: the hidden level is the Super Mario Bros. style side-scroller. Order below is meant to keep
you generating art and voices while I build systems.

**Phase 0: decisions (10 minutes)**
- [ ] Confirm the three characters as proposed (names, scandal, the rules for when they appear).
- [ ] Confirm the tier-by-appearance rule.

**Phase 1: the interrupter system (me, no art needed)**
- [ ] Turn the Influencer into data-driven interrupters (character config, unlock by boss, tier by
      appearance, one or two per stage, the "newest character shows up once" rule).
- [ ] Generalise the ad card and its product stickers; give each character their own colours.
- [ ] Track how each interruption ended (finished or skipped) for the achievements.
- [ ] Tests for the schedule, unlocks and tiers.

**Phase 2: the Preacher, end to end**
- [ ] Me: the 12 lines, the ElevenLabs voice-design prompt and the script with cues.
- [ ] You: generate the voice, and the hero portrait plus three edits, and the prop sheets.
- [ ] Me: wire it in and check it in the game.

**Phase 3: the Podcaster, then the Boss's Boss** (the same four steps each, run in parallel with
the art for the next while the previous is wired)

**Phase 4: the new interrupter achievements** (14 that count; see below) and the chat ones.

**Phase 5: NECO as a Centipede knock-off**
- [ ] Settle "10 faster", then the pitch, the engine, the art prompts, tests.

**Phase 6: UMMA as Donkey Kong**
- [ ] Settle how it differs from the Landlord climb, then the engine, the art, tests.

**Phase 8: Google Play** (see the checklist above; the last step, after everything else is done)

**Phase 7: the hidden level** (the largest job; it needs everything above)
- [ ] The engine, art (tileset, mini-bosses, powers), audio, the title-screen unlock, its achievement.

**Art and voice to generate, in total:** for each of the three characters, four portraits and two
prop sheets, and one voice with about 12 lines. For the hidden level, one tileset, a background, the
frog in four states, seven mini-bosses, a beaker and a detonator.

## Environmental effects before each boss

Decided: the stage before every boss carries a random hazard of its own that makes that stage harder,
and the boss you are about to meet says a line as it starts (`config/bossvoices.js`, five per boss).
The system is `config/envfx.js` and `systems/envfx.js`. Only the first is built.

| Stage | Before | Effect |
|---|---|---|
| 2 | Chaco | **Built.** A plane crosses, drops a package that lands where a red ring shows, explodes (a hit if you are in the ring), and blankets the screen in white powder. One or two drops a stage |
| 4 | Probe One | A saucer sweeps a tractor beam across the road. Anything in it, the frog included, is lifted and set down a few rows back. Cows drift past |
| K1 | The Landlord | Rent notices flutter down and stamp a lane, and that lane runs 60% faster for six seconds. Steam vents burst |
| K2 | The Neco Frog | The screen mirrors for a few seconds, twice a stage. Controls stay literal |
| K3 | The Narrator | The captions lie: "ALL CLEAR" while a lane speeds up, and left/right swap for four seconds behind a fake "LEFT IS RIGHT" notice |
| K4 | The Sack Man | Blackouts: the lights go out and you see only a small circle around the frog for three or four seconds, again and again |
| K5 | UMMA | Crocs come tumbling across the lanes end over end, and steam clouds blow through |

## Trophies at the end of a level

Built. Achievements earned in a level wait and are shown on a recap card at its end, read out in the AI's
voice. Only ones opened outside a level (the first-time participation trophy) are read straight away.

## Google Play

Once the game is finished it will be packaged as an app people can download from Google Play.
- [ ] Turn the site into an installable PWA: web manifest, icons, a service worker with offline play
- [ ] Wrap it as a Trusted Web Activity (Bubblewrap) or with Capacitor, portrait-locked
- [ ] Digital Asset Links file on blowingfrog.com so the wrapper opens full screen
- [ ] A Google Play developer account (one-time fee) and Play App Signing
- [ ] Build an Android App Bundle at the current required target API level
- [ ] A privacy policy page and the Data safety form (local storage and telemetry counters only)
- [ ] The content-rating questionnaire. Expect a mature rating: strong language, crude humour, sexual
      innuendo, drug references (Chaco), and simulated violence
- [ ] Store listing: 512 x 512 icon, 1024 x 500 feature graphic, two to eight phone screenshots, short
      and full descriptions
- [ ] Review the policy risks: the fake-scam chat lines, the Influencer's and Preacher's fake
      donation pitches, and the sexual joke in her outbursts could be read as deceptive or
      inappropriate content, so keep them clearly parody
- [ ] Test on a real phone: touch controls, audio unlock, the back button, low memory, and the
      keyboard-free Chaco controls
- [ ] Decide whether to pull the large media (cutscene clips) from the app bundle and stream them

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

## Status (2026-09-22)

**Wired and live:** the Preacher, the Podcaster and the Boss's Boss now interrupt ordinary stages
exactly like the Influencer, generalised in `config/interrupters.js` + `systems/interruptermgr.js`.
Unlock is tied to the boss they follow (Landlord, Neco, Narrator), a character is guaranteed once in
their first stage, and after that it is the same 0.4 chance / 10-35s window as the Influencer, up to
two interrupters a stage at least 20s apart. Portraits (4 tiers each), 9 props each, and all 12 lines
per character are in and voiced. All 7 bosses now have all 5 heads-up lines recorded and wired. The
Influencer's 22 skip-outbursts are recorded. 14 new achievements are live (36 total): 3 for the
Influencer, 3 each for the Preacher/Podcaster/Boss's Boss, and 2 for the chat (read/never-read).

**Received but not yet wired (no engine exists to use them):**
- Neco Centipede art (sheet `CN`, backdrop `cent_bg`) -- the top-down chase engine itself is not built.
- UMMA Donkey Kong art (sheet `UD`, backdrop `dk_bg`) -- the girder-climb engine itself is not built.
- Hidden-level art received so far: Probe One + the power-ups (`H6`), and the three mini-boss sheet
  received turned out to be Chaco/Landlord/Neco (`H4`). Still needed: tiles (`H1`), the small and big
  frog (`H2`, `H3`), and the Narrator/Sack Man/UMMA minis (`H5`). The whole platformer engine is unbuilt.
- Google Play icon and feature graphic, saved to `assets/store/`.
All of this sits in the repo (sliced, or as backgrounds) waiting on its engine; nothing references it
yet, so it costs nothing and cannot break anything.

**Still outstanding in ElevenLabs:** 22 sound effects and 7 pieces of music/stings (prompts are in
`docs/elevenlabs-master.md`, Parts 2 and 3) -- none of the environmental effects, the Centipede, the
Donkey Kong climb, or the hidden level have sound yet.

## New interrupters

Decided: **the same kind of interruption as the Influencer**, a card in a corner of the screen that
talks and never blocks input, with a skip button. Difficulty comes from the distraction, not from
covering the road.

The Influencer is the model (`config/influencer.js`, `systems/influencer.js`, `ui/adcard.js`): four
tiers of getting worse, a portrait per tier, a voice, props she holds up. The first job is to turn
that into a small interrupter system so each character is data: who, when they unlock, tiers,
portraits, props, lines, voice prefix, achievements.

### When each one arrives
| Character | Unlocks after | First appears | Stages they can appear in |
|---|---|---|---|
| Influencer | (from the start) | stage 1 | all |
| The Preacher | The Landlord | KAIJU II | K2, K3, K4, K5 |
| The Podcaster | The Neco Frog | KAIJU III | K3, K4, K5 |
| The Boss's Boss | The Narrator | KAIJU IV | K4, K5 |

**Rules proposed (to confirm):**
- A newly unlocked character always shows up at least once in their first stage, so you meet them.
- From K2 a stage can carry up to two interruptions, at least 20 seconds apart, never inside a boss fight.
- A character's tier is **how many times you have seen them** (first appearance is tier one, up to
  four), not the stage number. That is what lets the Boss's Boss, who only has two stages, still get
  from fluent corporate to word salad.

### 3. The Preacher (Holy Equity Ministries)
Brief: a caught-out televangelist selling real estate and asking for donations while trying to
justify a scandal, and it gets worse as the game goes on.
- **Proposed:** Pastor Dale Hollis. He sells "Eternal Acres", plots in Paradise Estates, nothing
  down. The scandal is a building fund that turned into a private jet and a "prayer retreat" with a
  hot tub. Tier one is the soft sell with a passing "rumours". Two admits the jet ("a flying
  pulpit"). Three explains a photo ("a spiritual cousin"). Four blames the devil for having his
  login and sells the last plot, underwater.
- **Props:** a donation thermometer, a hotline number, prayer cloths at a markup, a deed to a
  cloud, a tiny jet, a hot tub.
- **Note:** it is inspired by the idea of the song, not its words. Invented names and ministry.

### 4. The Podcaster (THE UNFILTERED HOUR)
Brief: an invented grifter, no real names, parties or events, obsessed with conspiracy theories and
believing every dark one.
- **Proposed:** Buck Mallory. Every conspiracy is invented and absurd: the frog is a government
  drone, the hamburgers are surveillance, the moon is a hologram, time zones are a scheme, the road
  is rigged, "they" want you calm. Tier one is a confident opening. Two names enemies. Three sells
  the supplement that fixes it. Four is alone in a bunker, sure the frog is listening.
- **Props:** a microphone, a tinfoil hat, a bunker sign, a tub of Frog Bile Vitality, a corkboard of
  red string, a "they are watching" eye.
- **Note:** the target is grifters and misinformation as a type. The theories are fictional so no
  real group, event or person is being mocked.

### 5. The Boss's Boss (Strategic Alignment)
Brief: the player's boss, from his office, asking what he's doing, full of productivity keywords
and business nonsense, with speech that stops making sense.
- **Proposed:** Gregory Pemberton, VP of Synergy. Tier one is fluent corporate ("circle back",
  "low-hanging fruit"). Two is an aggressive check-in. Three's sentences start collapsing. Four is
  pure word salad delivered with total confidence.
- **Props:** a calendar invite, a KPI chart going the wrong way, a sticky-note wall, a coffee mug,
  a pivot table, a "quick sync".
- **Voice:** a buzzword generator can seed the late lines.

## The hidden level

Asked for: a hidden level that opens when **every achievement** is earned, "Mario Bros inspired."
"Only instead of Koopas we get the bosses we've defeated. Instead of mushrooms it's explosives."
- **TNT** makes you bigger.
- **A beaker of foaming chemicals** gives you fire breath.
- **A nuclear bomb** makes you invincible (the star).

Read as **Super Mario Bros.**: a side-scrolling platformer (the mushroom, fire flower, star and
Koopas are all from that game, not the 1983 single-screen arcade one). Say so if the arcade one was
meant.

**How it plays**
- The frog runs and hops through a scrolling level. **Small** is the default and one hit kills.
  **TNT** makes it big, so one hit shrinks it instead. **The beaker** adds fire breath (from big).
  **The nuke** is a few seconds of invincibility in which touching an enemy defeats it.
- Explosives come out of crates hit from below, and slide along the ground the way the mushroom does.
- **The enemies are the seven defeated bosses**, shrunk to walking size, each keeping a trick that
  comes from its own trait: Chaco jabs ahead, the Landlord drops a boiler, Neco splits in two, the
  Narrator talks and misleads, the Sack Man turns the lights off around him, UMMA throws flipping
  Crocs, Probe One flies. Stomp them or burn them.
- **Entry:** a new secret button on the title screen appears once the last achievement is earned,
  announced by the System AI. The level's own completion could be one more achievement (kept out of
  the "all achievements" count so it does not lock itself).
- The goal at the end of the level is a giant detonator, in place of the flagpole.

**Needs**
- **A side-scrolling platformer engine**: tile collision, gravity and variable jump, camera scroll,
  enemy AI, and the small/big/fire/invincible state machine. This is the largest single engine in
  the game, bigger than any boss fight.
- **Art:** a tileset (ground, brick, explosive crate, sewer-pipe warp), a parallax background, the
  frog in side view in four states, seven walking mini-bosses with a squashed frame each, a beaker of
  foaming chemicals, and a goal detonator. Dynamite and the nuke already exist.
- **Audio:** a jump, a stomp, a power-up, a fire-breath shot, and an invincibility theme.
- **Only inspired by:** the mechanics are homage. None of the characters, sprites, or level layouts
  should be copied.
- **Depends on** the achievement list below being finished, since "all achievements" includes the
  new ones.

## New achievements
The hidden level needs "all achievements", so each new character adds some. These are proposals in
the System AI's voice, with the count they would add. They only count once their character exists.

| Character | Title | How you earn it |
|---|---|---|
| Influencer | LINK IN BIO | Sit through one of her ads without skipping |
| Influencer | BLOCKED AND REPORTED | Skip five of her ads |
| Influencer | SHE IS NOT OKAY | Hear her last tier (the flashlight) |
| Boss's Boss | PER MY LAST EMAIL | Sit through one of his interruptions |
| Boss's Boss | LET'S TAKE THIS OFFLINE | Skip him three times |
| Boss's Boss | SYNERGY | Hear all four of his tiers |
| Preacher | AMEN | Sit through one of his sermons |
| Preacher | PRAYER CLOTH, $89 | Skip him five times |
| Preacher | HE KNOWS ME | Hear his last, worst justification |
| Podcaster | DO YOUR OWN RESEARCH | Sit through one of his broadcasts |
| Podcaster | MUTED | Skip him the first time he appears |
| Podcaster | THE SUPPLEMENTS ARE FINE | Hear all four of his tiers |
| The chat | READ THE COMMENTS | Leave the chat open through a whole boss fight |
| The chat | NEVER READ THE COMMENTS | Hide the chat |
| The hidden level | WORLD ??? | Finish it (not counted toward unlocking it) |

That is 14 that count, taking 21 to 35. Interrupter achievements need the game to record how each
interruption ended (finished or skipped) and per-character counters; the achievement system already
takes counters, so that part is small.

## Order of arrival
Influencer (from the start), then the Preacher (K2), the Podcaster (K3), and the Boss's Boss (K4).
This replaces the earlier plan, so the extra run length is not needed.

## The bosses today, in the order you meet them
1. Chaco, after stage 2 (Autonomous Lane): Punch-Out
2. Probe One, after stage 4 (They Hunt Now): Space Invaders
3. The Landlord, after KAIJU I (Rampage): a vertical climb
4. The Neco Frog, after KAIJU II (Downtown): a mirror duel
5. The Narrator, after KAIJU III (The Continent): a trial of statements
6. The Sack Man, after KAIJU IV (The Ocean): a fight in the dark
7. UMMA, after KAIJU V (Orbit): the final boss, then the ending

