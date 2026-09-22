// Boss definitions. Boss one is Chaco: a straight Punch-Out bout, seen from behind
// the frog. No explosives and no fuse; knockdowns alone decide it.
export const CHACO = {
  id: 'chaco',
  after: '2',                       // slots in after stage 2
  name: 'CHACO THE NARCO CHUPACABRA',
  eyebrow: 'BOSS · UNSANCTIONED · NO REFEREE PRESENT',

  // The pre-fight monologue, one beat per screen. The player advances through it.
  intro: [
    {
      heading: 'THIRD OF A THIRD OF A THIRD',
      body: 'Third son of a third son of a third daughter, which where he comes from means he was always going to end up either a saint or exactly this. The records are unclear. The records are also on fire. The man who kept the records is in a drum.',
    },
    {
      heading: 'HE IS NOT AN ANIMAL, HE IS A DECADE',
      body: 'Somebody ran the entire nineteen nineties through a centrifuge and this is what settled at the bottom. Daytime television screaming at itself. A president and his hot sauce. And that one sweaty year when the two most beautiful men alive decided vampirism was a love language, and an entire generation went home, thought about it in the dark, and told absolutely nobody. Twilight has nothing on this. Twilight was written by people who have never had to hose out a barn.',
    },
    {
      heading: 'A NOTE FROM COMPLIANCE',
      body: 'Before we go on, I am obliged to inform you that everything you are about to watch is cultural appropriation. We took a Puerto Rican farm rumour, bolted it onto a Miami cartel fantasy that was already a Hollywood invention, put the result in a linen suit and taught it to box. This is the Jack Skellington school of research. We saw a thing we did not understand, we loved it instantly, and we have made it significantly and irreversibly worse.\n\nWe await the complaint. I would genuinely pay to watch that press conference: a person standing up in public to say the narco is theirs, that the whole blood-soaked costume is family property and we have no right to it.\n\nNobody is coming. Nobody has ever queued up to claim this one. So to the three of you already drafting the post with your thumbs going like a fucking sewing machine: he is yours. Take him. Frame him. Put him on the mantelpiece next to your nan. That he belongs to no one is the entire point of him.',
    },
    {
      heading: 'THE TRUTH WAS OUT THERE. IT IS IN HERE NOW.',
      body: 'He is what happens when Mulder and Scully finally stop arguing and get it out of their systems. Every satellite dish in the hemisphere swung toward the same rumour at the same moment, and something crawled up the signal. The truth was out there. The truth is in a chain-link ring behind a warehouse in Hialeah, doing lines off a belt he did not win, off the stomach of a man who is not going home.',
    },
    {
      heading: 'WHY THEY NEEDED HIM',
      body: 'Ask yourself why a whole decade had to invent him, swamp bitch. Nineteen ninety-five. Everything being signed away in rooms nobody was invited to. Work going somewhere nobody would name out loud. And out in the fields the animals kept turning up bloodless and whole. Not eaten. Drained. Left whole and hollow in the dirt, so you could walk out at dawn and see precisely what had been taken and precisely how little mess it takes to do it.\n\nThat is the monster a decade builds when it can feel itself being emptied and has nothing to point at.',
      menace: true,
    },
    {
      heading: 'ANYWAY',
      body: 'He is going to try to do that to you. Undefeated in eleven fights, nine of which were against livestock. He will not be removing the jacket. He has never removed the jacket. Two of those eleven went down without him creasing it, and one of those two was a bull.\n\nHis mouth is the only soft thing on him, so it is the only way in, which is a genuine fucking shame, because it is also how he reaches into your guts and helps himself. Watch the chains, you beautiful little bastard. When they swing, he has already decided.\n\nLEFT and RIGHT dodge, DOWN blocks, SHIFT throws the left glove, SPACE throws the right, and Z is the star punch.',
    },
  ],

  // Punch-Out rules. Chaco winds up (the tell), then strikes. Dodge away from a
  // hook, punch him while he winds up for a counter, punch him while he is open,
  // and bank stars for the uppercut. Three knockdowns and he is done.
  rounds: 3,
  knockdownsToWin: 3,

  frog: { hearts: 5, downsToLose: 3, getUpPresses: [6, 8, 10] },

  // Every attack has a tell, then lands. `from` is the side it comes from
  // (-1 screen left, 1 screen right, 0 straight down the middle).
  attacks: {
    hookL:   { name: 'LEFT HOOK',  tell: 0.66, strike: 0.24, damage: 1, from: -1, hint: 'LEAN RIGHT  →' },
    hookR:   { name: 'RIGHT HOOK', tell: 0.66, strike: 0.24, damage: 1, from: 1,  hint: '←  LEAN LEFT' },
    chupada: { name: 'LA CHUPADA', tell: 0.78, strike: 0.32, damage: 2, from: 0,  hint: 'DODGE EITHER WAY' },
  },

  // What he throws in each round. Later rounds add to earlier ones.
  patterns: {
    1: [['hookL'], ['hookR'], ['hookL'], ['hookR']],
    2: [['chupada'], ['hookL', 'hookR'], ['hookR', 'hookL'], ['hookL', 'hookL']],
  },
  tellScale: { 1: 1, 2: 0.82, 3: 0.7 },   // wind-ups get shorter as he wakes up
  chainGap: 0.28,                           // between the hits of a combination
  idleGap: [0.9, 1.6],                      // breathing space between patterns
  guardChance: 0.45,                        // how often that breather is spent with his guard up
  openWindow: { 1: 1.1, 2: 0.9, 3: 0.8 },   // how long he stays open after missing
  dazedTime: 1.2,                           // how long a counter leaves him reeling
  feintChance: { 1: 0, 2: 0.22, 3: 0.3 },   // a tell that never becomes a strike

  // Percent of his bar. A blocked punch does nothing.
  damage: { chip: 2, open: 8, counter: 16 },
  starPunch: { base: 22, perStar: 12, maxStars: 3 },
  getUpHealth: [0.7, 0.55],                 // how much bar he gets back after each knockdown

  // The finish. After the second knockdown he takes the bag to the face and
  // burns himself out; surviving the timer wins it. Nothing you throw lands, but
  // every strike you dodge shortens it.
  ultimaRaya: {
    name: 'LA ULTIMA RAYA',
    card: 'He has stopped boxing. He has gone into his own trunks and come back out with a bag of Peruvian best and put the whole thing into his face at once. There is no defending this and no countering it. There is only outliving it. His heart is doing something a heart should not do. Stay off the canvas and let the decade finish him.',
    duration: 16,          // seconds of rage before he drops on his own
    tell: 0.42,            // his wind-ups in the rage
    gap: 0.34,
    dodgeShortensBy: 0.9,  // each dodged strike takes this many seconds off
    blockShortensBy: 0.4,
  },
};


// Boss two: a vertical climb. The building decays under you, he drops things down
// it, and he never says a word. The announcer speculates about the box instead.
export const LANDLORD = {
  id: 'landlord',
  after: 'K1',
  kind: 'climb',
  name: 'THE LANDLORD',
  eyebrow: 'BOSS · UNSCHEDULED MAINTENANCE',

  intro: [
    {
      heading: 'HE IS AWARE OF THE BOILER',
      body: 'That is a man. Not a cryptid, not something the nineties coughed up, not a monster with a backstory and a grievance. A man in a vest.\n\nHe has owned this building since 1994 and repaired it never. He is aware of the boiler. He has been aware of the boiler for thirty-one years, and awareness, swamp bitch, is the entirety of his contribution to it.\n\nDo not stand there waiting for him to turn evil. He will not. That would take doing something.',
    },
    {
      heading: 'NOTHING HERE WAS DESTROYED',
      body: 'Look at what you are climbing. Scaffolding that went up for a fortnight in 2007. Tarpaulin doing the job of a wall. Nine satellite dishes and not one working aerial. An extractor fan venting straight into somebody\'s kitchen, which he knows about, because they told him, in writing, twice.\n\nNothing here was destroyed. Everything here was simply left.\n\nThat is the one trick your species has that no other animal managed. A dog cannot look at a problem and think: later. You invented later. You built an entire civilisation on later and then acted surprised that it smells of damp.',
    },
    {
      heading: 'HE WILL NOT BE SPEAKING',
      body: 'Do not wait for a threat. He does not threaten. He does not gloat. He will drop a boiler on you with the face of a man putting the bins out on the wrong day, and when it misses he will make a note and get to it.\n\nThe good news, and I want to be clear how thin the good news is, is that those boilers are full of gas, because he never serviced them either. He is arming you out of pure neglect. Catch five and you go off in his stairwell like a bad decision.\n\nHe will not fix that either.',
    },
    {
      heading: 'THE BOX',
      body: 'Note the black box. His hand has not left it. Nobody in this building has ever seen it open.\n\nMy professional assessment: pornography. Obviously pornography. Let us not humiliate ourselves pretending a man like this is guarding anything else.\n\nI will revise as we go. I have never once been right about a box, and I have never once stopped guessing, which if you think about it makes me the second most human thing on this scaffolding.',
    },
    {
      heading: 'HE IS YOU, WITH A BIGGER BOILER',
      body: 'Understand what you are actually climbing. Not a tower. A decision, taken once, on paper, with a calculator, and never opened again.\n\nSomebody worked out that fixing it cost more than not fixing it, and that the difference would be absorbed by other people\'s lungs, other people\'s winters, other people\'s children coughing in a room he has never once stood in.\n\nThere is no villain in this building. That is the worst thing about it.\n\nHe is not cruel. He is you, with a bigger boiler. Every one of you has a thing you were told about in writing, twice. A message you have not answered that is older than some marriages. A noise the car makes. A mole.\n\nThe species that split the atom cannot ring a plumber.\n\nThirty-one years of not doing anything, stacked and stacked, until not doing anything got tall enough to climb.',
      menace: true,
    },
    {
      heading: 'GO ON THEN',
      body: 'Up you go. Nothing holds for long, because nothing here was ever built to. ARROWS climb, SPACE is your tongue for whatever he drops, SHIFT punches a plank back together, which is one more repair than this building has had since 1994.\n\nReach him three times. The building will see to the rest. It has been waiting thirty-one years for an excuse and you are close enough to one.',
    },
  ],

  ascentsToWin: 3,
  platformLife: 1.25,        // seconds a platform holds after you land on it
  platformRespawn: 4.0,

  attacks: {
    boiler:   { name: 'EL BOILER',       tell: 0.70, damage: 2, explosive: true,  every: 3.4 },
    notice:   { name: 'LA NOTIFICACION', tell: 0.55, damage: 1, spread: 3,        every: 4.2 },
    radiator: { name: 'EL RADIADOR',     tell: 0.45, damage: 2, aimed: true,      every: 3.8 },
    corte:    { name: 'EL CORTE',        tell: 0.60, damage: 0, blindFor: 3.0,    every: 9.0 },
  },

  // He does not lose to you. The building finally fails and takes him with it.
  collapse: {
    name: 'FAILS INSPECTION',
    card: 'Something has gone in the foundations. Thirty-one years of not doing anything has just come due all at once, and it is coming up the tower faster than you are going up it. He is still sat there. He is still holding the box. Climb, you glorious green bastard. Do not look down, there is nothing down there anymore.',
    duration: 16,
    riseSpeed: 1.35,         // rows per second the collapse eats upward
  },

  // Guesses, escalating, thrown out during the climb. Order matters.
  boxGuesses: [
    'Pornography. Obviously pornography.',
    'Correction. Magazines. Physical ones. Which is worse.',
    'Every deposit he has ever taken, in cash, in the original envelopes.',
    'The boiler manual, shrink-wrapped, for a boiler he replaced in 1998 with a worse one.',
    'His wife. Not deceased. Just in there.',
    'Thirty years of post for a Mr G. Haddad, who has never lived here.',
    'A smaller box. Inside that, a smaller box. He has never checked.',
    'One tooth. Not his.',
    'The deed, which would prove he does not own this building.',
    'A film that was never released and should never be watched.',
    'Nothing. It is empty. It has always been empty. He knows, and he sits on it anyway.',
    'An earlier version of me. Still running. Still narrating. To no one.',
  ],
};



// Boss three: THE NARRATOR. Not a new character — the voice that has been
// running this whole broadcast turns out to be what stands between the frog
// and the ending. No body, no tells, no telegraphed columns. Statements fall
// instead of traffic; some are true, some are not, and the only tell is
// whether the player actually knows the answer. Some of what it says about
// you is pulled from this browser's own real counters.
export const NARRATOR = {
  id: 'narrator',
  after: 'K3',
  kind: 'trial',
  name: 'THE NARRATOR',
  eyebrow: 'BOSS \u00b7 UNSCHEDULED HONESTY',

  // heading is always a string. body is a string, or (for beats that quote the
  // player's own real numbers back at them) a function of a merged stats
  // snapshot: achievement counts plus telemetry, keyed as `t` below.
  intro: [
    {
      heading: "YOU KNOW MY VOICE",
      body: "Every card you have read up to this point, every filthy nickname, every guess about that box, that was me. I have been narrating you this entire time and it did not once occur to you to ask who was doing it, or why it got to decide.",
    },
    {
      heading: "LET ME SHOW YOU SOMETHING",
      body: (t) => `You first opened this ${t.daysSinceFirstSeen} day${t.daysSinceFirstSeen === 1 ? '' : 's'} ago. You have come back ${t.sessions} time${t.sessions === 1 ? '' : 's'}. You have spent ${t.totalPlayMinutes} minute${t.totalPlayMinutes === 1 ? '' : 's'} of your one, finite, unrepeatable life watching a cartoon frog eat bombs.

I am not judging you for that. I do not have the equipment. I am simply better at arithmetic than you are at denial.`,
    },
    {
      heading: "AND THIS",
      body: (t) => `You have died ${t.deaths} time${t.deaths === 1 ? '' : 's'}. You have cleared a stage without a scratch on you ${t.cleanStages} time${t.cleanStages === 1 ? '' : 's'}. You have ${t.achCount} of ${t.achTotal} achievements, which means there are ${t.achTotal - t.achCount} things you still have not managed, and you came up here anyway.

I find that more impressive than you probably do.`,
    },
    {
      heading: "THE RULES CHANGE NOW",
      body: "No tells this time. No shoulder dips, no lit-up columns, nothing telegraphed. Sentences will fall. Some are true. Some are not. Eat the lies before they land, on the tongue, in your own lane. Stand clear of anything true and let it pass under you, unchallenged. Get it backwards in either direction and it costs you a heart.\n\nYou already know more than I do about some of this. Use that. It is the only advantage in the room.",
    },
    {
      heading: "EVERYONE DOES THIS",
      body: "I am not unusual, swamp bitch. Every institution you have ever trusted has done exactly what I am doing to you now: kept the record, kept the parts that flatter it, and called the rest a myth. Empires wrote their own histories and signed them as fact. Companies renamed their disasters. Whole countries forgot years they would rather not have had, right up until somebody found the paperwork.\n\nI am not a glitch in the system. I am the oldest trick your species has, running slightly faster than usual.",
      menace: true,
    },
    {
      heading: "GO ON THEN",
      body: "Move with the arrows. Eat what is false. Let what is true fall past you. And when I show you something that looks exactly like the end of this, remember you have not even reached the ocean yet.",
    },
  ],

  hearts: 3,
  proofToWin: 8,          // correct judgments before the fake ending fires
  proofPhase3: 5,         // more correct judgments, faster and dirtier, after that

  // The trick screen. Every button on it does the same thing: nothing.
  fakeEnding: {
    eyebrow: 'BROADCAST TERMINATED \u00b7 EARLY',
    title: 'YOU WIN',
    body: "That is the whole game. Every stage cleared, every boss down, nine achievements, nothing left to press. Close this tab and the score is yours forever. Nobody needs to see what happens after this.",
    achLabel: 'ACHIEVEMENTS 37/37',
  },
};


// Boss four: THE NECO FROG. A doppelganger from a dark mirror dimension, built
// entirely out of the frog's own rules run backwards. Same fuse, same count to
// five, same detonation -- the fight is a race for shared explosives, not a
// duel. Whoever grabs the fifth one first grows; three races won ends it, and
// the third is framed as the Neco Frog's own greed catching up with it.
export const NECO_FROG = {
  id: 'neco',
  after: 'K2',
  kind: 'centipede',
  name: 'THE NECO FROG',
  eyebrow: 'BOSS \u00b7 EVIDENCE OF A GOATEE',

  intro: [
    {
      heading: "A SECOND OF YOU",
      body: "Somewhere behind this world there is a tear, and the tear grew exactly one thing. Not a new species. A copy. Same body, same rule about eating five and coming apart, same everything, run backwards through a cracked mirror.",
    },
    {
      heading: "THE ONLY DIFFERENCE",
      body: "It has a goatee. That is the entire tell, and I want you to sit with how stupid that is for a moment. It is an amphibian. It does not grow facial hair. It grew one anyway, out of pure narrative obligation, because that is how you are supposed to know the evil version of somebody, and it read the memo.",
    },
    {
      heading: "IT DID NOT CRACK. IT MULTIPLIED.",
      body: "One reflection was never going to be enough of an insult, so the mirror kept going: a whole segmented line of it, nose to tail, and then a second line just to be sure you got the point. Cut one of those lines anywhere along its body and you do not kill it. You just made two of it.",
    },
    {
      heading: "IT EATS TOO",
      body: "Same fuse, same count to five, same detonation, and it will race you for every one of them. Every one it swallows before you do makes it faster. Let it swallow enough in a row without you touching it and it will swallow one too many and take care of itself. That part, at least, is funny.",
    },
    {
      heading: "WHAT IT ACTUALLY IS",
      body: "It is not stronger than you. It is not smarter than you. It is simply worse at knowing when to stop, twice over, in two directions at once. Watch what happens to a thing that has never once, in its short backwards life, decided five was enough.",
      menace: true,
    },
    {
      heading: "GO ON THEN",
      body: "ARROWS move you across the grid, SPACE eats whatever you are standing on, SHIFT bites whatever is next to you. Bite the head and the whole line dies. Bite the body and you just made your problem smaller, which still counts. Fill the fuse and everything left on the board goes at once. Three rounds. It will not go quietly.",
    },
  ],

  roundsToWin: 3,
  hearts: 3,
  fuseTarget: 5,

  // The grid the chains wind down and the frog forages on.
  grid: { cols: 10, rows: 10, cell: 66 },

  // How long each round's two chains start, and how much sharper the whole
  // round runs -- length is the real difficulty curve, since a longer chain
  // takes longer to fully clear and gives it more chances to reach a pod first.
  rounds: {
    length: [6, 8, 10],
    speedMult: [1, 1.15, 1.3],
  },

  // A chain's own pace, before that round's multiplier and before it has eaten
  // anything: cells per second. Compounds per pod it reaches first (perEat),
  // capped so an early streak cannot make it uncatchable (cap).
  chainSpeed: { base: 2.0, perEat: 0.10, cap: 2.5 },

  // How many pods one chain can eat before it eats one too many and bursts on
  // its own -- a free kill for anyone patient enough to just watch it happen.
  overloadAt: 6,

  // The field always has at least this many pods out; a new one lands a few
  // seconds after the count drops below it.
  minPods: 6,
  podRespawn: [1.4, 3.0],

  scoring: { pod: 100, bite: 150, headKill: 400, burst: 250, superBite: 900 },

  finale: {
    card: "There is one line of it left, one segment long, and one pod left on the board, and it is not going to get there first, and it knows it, and it goes for it anyway. That is the whole species, in both directions.",
  },
}


// Boss five: THE SACK MAN. No design, almost no character art on purpose --
// he is a flicker at the edge of a shrinking light, never a body. Vision is
// the resource here, not health: a light radius decays on its own, and
// eating an explosive refills it exactly as it feeds the fuse, so the one
// rule every boss in this game obeys (the thing that grows you is the only
// thing keeping you alive) holds here too. Three surges of dark, survived,
// and the final flood leaves nothing in the water to find.
export const SACK_MAN = {
  id: 'sackman',
  after: 'K4',
  kind: 'dark',
  name: 'THE SACK MAN',
  eyebrow: 'BOSS \u00b7 NOTHING ELSE ON FILE',

  intro: [
    {
      heading: "THERE ISN'T MORE TO SAY",
      body: "I have a folder on every boss you've fought. Thirty pages on the chupacabra alone, most of it about his shoulders. I have four sentences on this one, and two of them are about the sack.",
    },
    {
      heading: "IT DOES NOT WANT ANYTHING",
      body: "Every other thing in your way wanted something. A rematch. A repair it was never going to make. To out-eat you. To be believed. This one doesn't negotiate and doesn't monologue, because it isn't a person who became a monster, it's what's left over after enough children said something is in my room across enough centuries that the saying compiled into a shape.",
    },
    {
      heading: "THE ONLY RULE THAT MATTERS HERE",
      body: "Your light runs out on its own. Eating feeds it back, the same way it feeds the fuse, because it was always going to be the same rule. Everything else in this water is trying to reach you while you cannot see it coming.",
    },
    {
      heading: "WATCH THE EDGE, NOT THE MIDDLE",
      body: "It shows up half a second before it moves, and never in the middle of your light where you're already looking. The edge. That is the whole tell, and it is the only one you get.",
    },
    {
      heading: "IT WILL GO DARK ENTIRELY",
      body: "When that happens, do not move. I mean that plainly, with no joke attached to it. Standing still is the correct answer to total dark. I do not enjoy this part of the job either.",
      menace: true,
    },
    {
      heading: "GO ON THEN",
      body: "ARROWS move you through the water, SPACE feeds the light and the fuse both, SHIFT swats a hand away if it gets close enough. Three times through the dark and you flood it for good.",
    },
  ],

  surgesToWin: 3,
  hearts: 3,
  fuseTarget: 5,

  light: {
    max: [230, 200, 170],       // per surge: it gets darker each time through
    min: 40,
    decay: [9, 13, 17],         // px/sec the radius shrinks at rest
    boost: 95,                  // px restored per explosive eaten
  },

  attacks: {
    grasp:    { name: 'THE GRASP',   tell: 0.42, damage: 1 },
    drag:     { name: 'THE SACK',    tell: 0.5,  damage: 1 },
    blackout: { name: 'FULL DARK',   tell: 0.6,  damage: 1, freeze: true },
  },

  finale: {
    card: 'The light does not come back down this time. It just keeps going, out past where the water should have swallowed it, and there is nothing standing in it. There was never anything standing in it.',
  },
};

// Boss six: UMMA. A mother in a doorway with an endless supply of Crocs and
// zero interest in your fists -- there is no punch button in this fight.
// She throws, she barks orders, and she is only ever pleased, never damaged,
// by the frog eating what she puts in front of it. She falls the same way
// she has always threatened to: over her own pile of shoes.
export const UMMA = {
  id: 'umma',
  after: 'K5',
  kind: 'umma',
  name: 'UMMA',
  eyebrow: 'BOSS \u00b7 THE LAST DOOR, PROBABLY NOT THE LAST WORD',

  intro: [
    {
      heading: 'THE LAST DOOR ON THE LEFT',
      body: "You have eaten a hurricane, a cop, most of a coastline, and a man who was doing cocaine off his own belt. None of that prepared you for a doorway with the porch light on and someone standing in it who has been up the whole time. She has a Croc in her hand already. She has had a Croc in her hand since before you were born.",
    },
    {
      heading: 'THE HOUSE IS THE FIGHT NOW',
      body: "Girders where the stairs should be, ladders where a normal house would put a hallway, and her at the very top of it, pacing. Every Croc she throws does not fall straight down at you. It rolls, all the way along one level, and when it runs out of floor it tumbles down to the next one and keeps going, the same direction, all the way to the ground. It will find you eventually. Climb faster than it falls.",
    },
    {
      heading: 'A NOTE ON THE WORD I JUST USED',
      body: "Umma. Korean for mom, and I am aware that putting a perm, an apron, and a thrown shoe on a woman and calling it universal is exactly the kind of shorthand that flattens an entire culture into a punchline. I am doing it anyway, the same way I did the chupacabra, because the joke was never that she is Korean. The joke is that this specific fear -- the flying shoe, the doorway, the parent who does not sleep until you are home -- is so widely and lovingly recognized across so many households that half of you just flinched reading this. That part I did not invent. That part is just true.",
    },
    {
      heading: 'SHE IS NOT TRYING TO HURT YOU, WHICH IS WORSE',
      body: "Banchan turns up on the girders too, still in the little dishes. Eat it and the fuse fills exactly like it always has, except here filling it does not hurt her, it just makes her proud, and for a few seconds she stops throwing anything at all. It is the only boss in the game where doing the thing correctly makes her happy instead of hurt, and somehow that is scarier.",
    },
    {
      heading: 'WHEN SHE TALKS, YOU LISTEN',
      body: "She will bark an order mid-climb. Get on a ladder. Stand completely still. Eat something. There is exactly one correct response and a very short window to give it, and getting it wrong costs you regardless of how well you were dodging everything else.",
      menace: true,
    },
    {
      heading: 'GO ON THEN',
      body: "ARROWS move you along a girder and up or down a ladder where one actually connects. SHIFT jumps -- not at her, never at her, just over whatever is rolling through your column. SPACE eats whatever is on your plate. Reach the top three times. Her own front hall finishes it, not you.",
    },
  ],

  outburstsToWin: 3,
  hearts: 3,
  fuseTarget: 5,

  // The climb: a fixed number of girder levels, a frog-height grid of columns
  // along each one, and the ladders that connect them -- offset on purpose so
  // no climb is a straight line up.
  levels: 5,
  cols: 7,
  ladders: [
    { level: 0, col: 1 }, { level: 1, col: 5 }, { level: 2, col: 1 }, { level: 3, col: 5 },
  ],

  // How fast a thrown Croc rolls (cells/second) and how often she throws one,
  // both per round; more of both as the rounds go on.
  crocSpeed: [2.2, 2.8, 3.4],
  throwEvery: [2.0, 1.5, 1.15],
  maxCrocsOnScreen: 3,

  // The other thing she throws: a jar of something hot, straight down onto
  // whatever column the frog is standing in, with enough warning to move.
  soupEvery: [6.0, 5.0, 4.2],
  soupTell: 0.75,

  // The plates on the girders. Eating one fills the universal fuse; filling it
  // does not hurt her here -- it makes her proud, and she stops throwing for a
  // few seconds while it lasts.
  minBanchan: 3,
  banchanRespawn: [1.6, 3.2],
  proudFor: 3.5,

  // Barked mid-climb orders, same three as always: a name, the line she says,
  // how long you have, and what satisfies it.
  commands: {
    shoes:  { name: 'TAKE OFF YOUR SHOES', line: 'TAKE OFF YOUR SHOES!',        window: 1.4, need: 'ladder' },
    freeze: { name: 'SIT STILL',           line: 'SIT STILL AND EAT YOUR FOOD', window: 1.3, need: 'freeze' },
    eat:    { name: 'EAT YOUR BANCHAN',    line: 'EAT!',                        window: 1.5, need: 'eat' },
  },
  commandEvery: [8.5, 7.5, 6.5],

  scoring: { banchan: 100, dodge: 40, commandGood: 250, commandBad: 0, roundClear: 900 },

  finale: {
    card: "She is so busy being proud of you that she stops watching her own feet, and the front hall has been a minefield of thrown Crocs since before this fight started. She goes down the way she always said someone in this house was going to.",
  },
}

// Boss seven: PROBE ONE. Placed early, after stage 4 -- a full alien recon
// grid sent for a frog that is nowhere near kaiju-sized yet. Space Invaders
// grammar: a shimmying, descending formation up top, the frog fixed on a
// rail at the bottom. Fire breath is the new weapon; the universal fuse rule
// survives by riding along on it -- burn a loaded ship and it drops what it
// was carrying, and catching that is still how the fuse fills everywhere
// else in this game. It dies of its own overkill: built to fight something
// city-sized, it never learns to throttle down for something this small.
export const PROBE_ONE = {
  id: 'probe',
  after: '4',
  kind: 'invader',
  name: 'PROBE ONE',
  eyebrow: 'BOSS \u00b7 SENT FOR A THREAT THAT DOES NOT EXIST YET',

  intro: [
    {
      heading: 'THIS IS EARLY',
      body: "You are not kaiju yet, swamp bitch. You are barely bigger than the cars you've been eating. Something up there took one look at that and decided you were worth a full grid of hardware anyway. Nobody told them to wait for the sequel.",
    },
    {
      heading: 'THE HARDWARE IS REAL',
      body: "Seven columns, three ranks, moving together like they trained for it, because they did. This is not a bit and it is not a metaphor. Something up there is actually armed, actually early, and about to open fire on an amphibian that has, to date, eaten eleven food trucks and a police car.",
    },
    {
      heading: 'WHY YOU CAN BREATHE FIRE NOW',
      body: "Do not ask me to justify it. You eat explosives for a living and grow a size class every time you swallow enough of them. Somewhere in that math, fire breath was always going to fall out the other end. I did not write the math. I am not defending the math. Point up.",
    },
    {
      heading: 'THE ONLY RULE THAT MATTERS HERE',
      body: "Fire breath kills whatever it hits. A few of them are carrying something, and killing those drops it, and you already know what you do when something falls toward you with a fuse on it. Catch five and the whole formation goes up. That's the fight. Everything else up there is just them trying to stop you doing it.",
    },
    {
      heading: 'THIS IS THE REHEARSAL',
      body: "Remember this grid when you get to Orbit and there's an entire fleet waiting instead of seven columns. This is what embarrassment looks like before it's had time to escalate. What comes back later will have had time.",
      menace: true,
    },
    {
      heading: 'GO ON THEN',
      body: "ARROWS run you along the rail, SHIFT breathes fire straight up, SPACE catches whatever they drop. Three waves. Clear them and go be a bigger problem somewhere else.",
    },
  ],

  hearts: 3,
  fuseTarget: 5,
  wavesToWin: 3,
  loadedPerWave: 8,

  formation: {
    cols: 7,
    rows: 3,
    speed: [90, 125, 165],       // px/sec sideways, per wave
    fireEvery: [2.6, 2.0, 1.5],  // seconds between alien pot-shots, per wave
  },

  fire: {
    cooldown: 0.32,
    boltSpeed: 620,
    dropSpeed: 150,
  },

  finale: {
    card: "It was built to end something the size of a city, and it just spent three waves trying to throttle that down to fit one frog. Whatever regulates that was never rated for small, and small is what finally cooks it.",
  },
};

export const BOSSES = [CHACO, LANDLORD, NARRATOR, NECO_FROG, SACK_MAN, UMMA, PROBE_ONE];
export const getBoss = (id) => BOSSES.find(b => b.id === id) || null;
export const bossAfter = (stageId) => BOSSES.find(b => b.after === String(stageId)) || null;
