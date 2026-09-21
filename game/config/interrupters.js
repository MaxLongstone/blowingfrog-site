// The three interrupters that join the Influencer (the wiring comes after the assets).
// Each has four tiers of three lines; a character's tier is how many times you have
// seen them. Every line opens with its voice cue in [brackets] for ElevenLabs; the game
// strips it before showing the words. Recordings: voice_<id>_tier<T>_<NN>.mp3.
export const INTERRUPTERS = {
  pastor: {
    name: 'Pastor Dale Hollis', ministry: 'Holy Equity Ministries', voice: 'Preacher',
    unlocksAfter: 'landlord', firstStage: 'K2', handle: '@PastorDale', tag: 'DONATE NOW',
    tiers: [
      [
        "[Southern televangelist, warm, booming] Brothers and sisters, the Lord has laid a plot on my heart. Eternal Acres. Paradise Estates. Nothing down, nothing to fear, [chuckles] and nothing you can prove in a court of law. Call the number on your screen and sow a seed of forty-nine ninety-nine.",
        "[Southern televangelist, warm and folksy] Friend, [sighs] I will be honest, there have been rumours. Rumours are just the devil's little gossips. The truth is the Lord wants you in a gated community with a lake view, and I am the humble servant who holds the deed. [sweetly] Thank you for your generosity.",
        "[Southern televangelist, warm, booming] Some folks ask, Pastor Dale, why does the House of God need a fourth roof? And I say, [pause] so the good Lord's rain can find you in comfort. Now, who is ready to reserve a plot? Sow your seed, and the Lord will multiply your square footage.",
      ],
      [
        "[Southern televangelist, defensive, still smiling] Now, about the plane. It is not a jet, [pause] it is a flying pulpit. A pulpit with wings and a wet bar. The Lord said, Dale, go forth, and the Lord did not specify coach. [breathy] Praise Him. Seed offering, forty-nine ninety-nine.",
        "[Southern televangelist, warm, a little strained] The building fund is fine. The building fund is doing wonderfully. It is just [pause] in a different building. Several different buildings. One of them is on a lake. Blessings, friend. Eternal Acres, now with a private dock.",
        "[Southern televangelist, booming, wounded] They are saying I took the money. I did not take the money. I borrowed it [pause] prophetically, from the future, and the future owes ME. Now sow a seed, and I will pray for your gutters.",
      ],
      [
        "[Southern televangelist, whispering then booming] [lowers voice] There is a photograph. [pause] Brothers, sisters, it is not what it looks like. It is a spiritual cousin. She was helping me with a laying on of hands, on a very small boat. [nervous laugh] We were praying. Forty-nine ninety-nine.",
        "[Southern televangelist, shaky, sweating] The woman is a consultant. A consultant of the Spirit. And the hot tub is a baptismal font, with jets, which is how you know it is sacred. [gulps] God is my co-signer, friend, and He has never once bounced a check.",
        "[Southern televangelist, pleading, oily] I have made mistakes. Everybody has. Mine were just [chuckles] more scenic. But forgiveness costs nothing, and Eternal Acres costs only your entire retirement. Call now. Operators are standing by. [pause] They are also praying.",
      ],
      [
        "[Southern televangelist, unravelling, screaming then whispering] [screaming] It was the DEVIL! The devil had my LOGIN! The devil booked the boat! The devil bought the hot tub, and the devil has been dead to me since Tuesday! [sobbing] Praise God! [shouts] Seed! Seed!",
        "[Southern televangelist, hoarse, desperate] I am selling the last lot. It is underwater. Some say that is a flaw. I say it is a baptism included at no extra charge. Ten thousand dollars, and you will never be dry again. [voice cracks] Amen. [screams] AMEN.",
        "[Southern televangelist, broken, sincere for one second, then booming] [sniffles] Is anyone even watching. [pause] The jet is gone. The lake is gone. It is just me and a folding table. But the Lord is good, and the Lord takes Venmo. Venmo me. [sobs] Please. In Jesus' name.",
      ],
    ],
  },
  podcaster: {
    name: 'Buck Mallory', ministry: 'THE UNFILTERED HOUR', voice: 'Nixon',
    unlocksAfter: 'neco', firstStage: 'K3', handle: '@BuckUnfiltered', tag: 'LIVE · UNFILTERED',
    tiers: [
      [
        "[gravelly paranoid American, confident radio host] Welcome back to THE UNFILTERED HOUR. I'm Buck Mallory, and tonight I'm going to tell you what they don't want you to know. [pause] That frog on your screen? Ask yourself who paid for its little shoes.",
        "[gravelly paranoid American, conspiratorial] Folks, the hamburgers are surveillance. [pause] I said it. [pause] You heard it. Every burger on that road has a tiny camera in the bun, and the pickles are, frankly, antennae. Wake up. Also, I have a sponsor.",
        "[gravelly paranoid American, righteous] Time zones are fake. Ask any farmer. Ask any rooster. [pause] Nobody consulted the rooster. I have documents. The documents are in a box. The box is in my truck. [whispers] The truck is being watched.",
      ],
      [
        "[gravelly paranoid American, angry] They're coming after me, folks. They. [pause] You know who. The Big Road. The Lobby. The Association of Frogs. Every time I tell the truth my phone gets a little bit warmer, and that is NOT a coincidence.",
        "[gravelly paranoid American, whispering] The moon is a hologram. I've seen the wires. Ask yourself why it only comes out at night. Ask yourself why it's always the same size. [whispers] Ask yourself why I keep getting these headaches.",
        "[gravelly paranoid American, ranting] The pigeons are drones, the tunnels are portals, and my neighbour Gary is either a lizard or a very dedicated man in a suit. I have named him Suspect Gary. Suspect Gary waved at me today. [pause] Explain that.",
      ],
      [
        "[gravelly paranoid American, salesman voice] Now folks, to fight all this you need to be strong, and that's why I take Frog Bile Vitality. Ten thousand percent of your daily everything. It's not approved, [laughs] and that's how you know it works. Use code BUCK.",
        "[gravelly paranoid American, feverish] The doctors won't tell you this, because the doctors are in on it, but every cure is in the swamp. The mud knows. The mud has always known. I've been eating the mud. I feel amazing. [manic laugh] I feel so amazing.",
        "[gravelly paranoid American, intense] Frog Bile Vitality is not a scam, it's a movement. And the movement has a monthly subscription. [pause] Also I sleep in my truck now. But the truth is worth sleeping in a truck for. Ninety-nine dollars, folks.",
      ],
      [
        "[gravelly paranoid American, whispering, terrified] [whispers] I'm in the bunker. It's okay. It's fine. The bunker has foil on every wall. The foil is holding. Something is listening, folks. [pause] Something small. [pause] Something green.",
        "[gravelly paranoid American, voice cracking] [gasps] It's the frog. It has ALWAYS been the frog. It eats the bombs, it eats the signals, it eats the truth. I've done the math. The math is on the wall. The math is [laughs weakly] in crayon. It is very clear.",
        "[gravelly paranoid American, exhausted, almost tender] This is Buck Mallory, signing off. If I go quiet, it means they got me. If I go quiet, it also might mean I fell asleep. Either way, check on the mud. [exhales] Goodnight, America. Or whatever this is.",
      ],
    ],
  },
  bossboss: {
    name: 'Gregory Pemberton', ministry: 'VP of Synergy, Strategic Alignment', voice: 'Protagonist',
    unlocksAfter: 'narrator', firstStage: 'K4', handle: 'gpemberton@strategicalignment', tag: 'URGENT · RE: RE: RE:',
    tiers: [
      [
        "[corporate American, fake-friendly] Hey there, Gregory here! Just circling back on that thing we discussed. Do you have a quick minute to align on some low-hanging fruit? [chuckles] I'd love to leverage your bandwidth ahead of the offsite.",
        "[corporate American, upbeat] Quick sync! Not a big deal. Just wanted to touch base on why you're at a stage right now instead of in the Q3 deck. [laughs] No pressure. [pause] Great energy. Let's take this offline and put a pin in it.",
        "[corporate American, chirpy] [claps] Love the hustle! Really moving the needle on those explosions. As we ideate, let's make sure we're aligned on deliverables, scalable frog synergies, and best-in-class bandwidth. Circle back EOD.",
      ],
      [
        "[corporate American, tense politeness] Per my last email. And the one before that. And the calendar invite you declined. [strained laugh] It's fine! Just noting it. For the record. Do you have visibility on why you're not visible?",
        "[corporate American, clipped] [sighs] I'm going to be transparent. The frog is a resource, and the resource is not being utilized in a way that is synergistic with my vision, which I will share when I have one. Can you ping me the deck?",
        "[corporate American, sing-song threat] Let's not boil the ocean. Let's boil a lake. Let's boil, I don't know, a puddle, of value. Just circle back, on my desk, by yesterday. [pause] Thanks so much. [smiling through teeth] Really.",
      ],
      [
        "[corporate American, starting to fracture] [stammering] We need to pivot the pivot. Our north star is a compass, in a sense, and the compass is upside down, and I need you to unblock the blockers who are, frankly, blocking. [pause] Synergize this. [voice cracks] Vertically.",
        "[corporate American, loud then quiet] Are we crushing it, or is it crushing us? Let's leverage the leverage. Double-click on the double-click. Take this offline. Take this online. Take this to a lake. [pause] I don't know. [whispers] Circle.",
        "[corporate American, breathless] I don't have time for this, I have to align with the alignment, and the alignment has been bought by the other alignment. Give me a bandwidth on the frog. The frog's bandwidth is the bandwidth. Do you follow. [pause] [desperate] Please follow.",
      ],
      [
        "[corporate American, calm and completely unhinged] Circle the paradigm, unbundle the frog, and let us proactively harvest the low-hanging bandwidth. In the cloud of the cloud. Synergy is the wheel, and I am the wheel's wheel. [pause] Kindly action.",
        "[corporate American, chanting] Leverage, leverage, leverage the deliverable of the deliverable. Ideate the sandbox. Sandbox the ideation. Onboard the offboarding. Value, value, value. Value. [pause] Quarterly. Quarterly. [whispers] Frog.",
        "[corporate American, serene, then whispering] Everything is a stakeholder. The lily pad is a stakeholder. The stakeholder is a stake. And I am, [pause] at end of day, a holder. Thank you for your time. This meeting could have been [pause] a frog.",
      ],
    ],
  },
};

// What each character holds up while they talk (art: sheets PR, PO, BB), with the label on the sticker.
export const INTERRUPTER_PROPS = {
  pastor: [
    ['prop_pastor_thermometer', 'DONATION GOAL · 3% (DOWN)'], ['prop_pastor_hotline', 'CALL NOW · OPERATORS PRAYING'],
    ['prop_pastor_cloth', 'PRAYER CLOTH · $89'], ['prop_pastor_deed', 'DEED TO A CLOUD · NOTHING DOWN'],
    ['prop_pastor_jet', 'FLYING PULPIT · NOT A JET'], ['prop_pastor_hottub', 'BAPTISMAL FONT · WITH JETS'],
    ['prop_pastor_mic', 'GOLD MIC · $12,000'], ['prop_pastor_bible', 'GOLD-PLATED · SEED GIFT'],
    ['prop_pastor_estate', 'ETERNAL ACRES · LOT 9'],
  ],
  podcaster: [
    ['prop_pod_mic', 'ON AIR · UNFILTERED'], ['prop_pod_foilhat', 'FOIL HAT · $49'],
    ['prop_pod_bunker', 'BUNKER · PREPPER SPECIAL'], ['prop_pod_supplement', 'FROG BILE VITALITY · $99'],
    ['prop_pod_corkboard', 'THE BOARD · DO NOT TOUCH'], ['prop_pod_eye', 'THEY ARE WATCHING'],
    ['prop_pod_cap', 'TRUCKER CAP · WITH FOIL'], ['prop_pod_burger', 'SURVEILLANCE BURGER'],
    ['prop_pod_pigeon', 'DRONE PIGEON · EVIDENCE'],
  ],
  bossboss: [
    ['prop_boss_invite', 'ACCEPT? · ACCEPT.'], ['prop_boss_chart', 'Q3 · TRENDING'],
    ['prop_boss_notes', 'ALIGNMENT WALL'], ['prop_boss_mug', 'WORLD’S OKAYEST VP'],
    ['prop_boss_pivot', 'PIVOT TABLE · PIVOTING'], ['prop_boss_clock', 'QUICK SYNC · 3 HOURS'],
    ['prop_boss_laptop', 'THE DECK · SLIDE 412'], ['prop_boss_badge', 'VP · ACCESS: ALL'],
    ['prop_boss_orgchart', 'ORG CHART · YOU: BOTTOM'],
  ],
};
