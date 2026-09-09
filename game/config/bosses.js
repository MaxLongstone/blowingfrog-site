// Boss definitions. Boss one is Chaco: a Punch-Out-style bout where the frog
// dodges, ducks and counters with its tongue, and the fuse rule still decides it.
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
      body: 'He is going to try to do that to you. Undefeated in eleven fights, nine of which were against livestock. He will not be removing the jacket. He has never removed the jacket. Two of those eleven went down without him creasing it, and one of those two was a bull.\n\nHis mouth is the only soft thing on him, so it is the only way in, which is a genuine fucking shame, because it is also how he reaches into your guts and helps himself. Watch the chains, you beautiful little bastard. When they swing, he has already decided.\n\nARROWS move you in and out, DOWN ducks, SHIFT throws the glove, SPACE is your tongue for whatever he throws at you.',
    },
  ],

  rounds: 3,
  knockdownsToWin: 3,

  // Every attack telegraphs first. tell is how long the wind-up reads for.
  attacks: {
    saludo:  { name: 'EL SALUDO',   tell: 0.42, damage: 1, opening: 0,    round: 1 },
    cobrador:{ name: 'EL COBRADOR', tell: 0.75, damage: 2, opening: 1.1,  round: 1 },
    chupada: { name: 'LA CHUPADA',  tell: 0.60, damage: 1, opening: 0.9,  round: 2, stealsFuse: true },
    polvo:   { name: 'EL POLVO',    tell: 0.50, damage: 0, blindFor: 4.0, round: 2 },
    belt:    { name: 'EL CINTURON', tell: 0.38, damage: 2, opening: 0.7,  round: 3 },
  },

  // Round three feints: a tell that never becomes an attack. Punishes reacting
  // instead of reading. Fraction of tells that are lies.
  feintChance: 0.28,

  // The finish. After the second knockdown he takes the bag to the face and
  // burns himself out; surviving the timer wins it. Countering fills the bar
  // faster but he is at his most dangerous.
  ultimaRaya: {
    name: 'LA ULTIMA RAYA',
    card: 'He has stopped boxing. He has gone into his own trunks and come back out with a bag of Peruvian best and put the whole thing into his face at once. There is no defending this and no countering it. There is only outliving it. His heart is doing something a heart should not do. Stay off the canvas and let the decade finish him.',
    duration: 14,          // seconds of rage before he drops on his own
    speedUp: 1.8,
    tellScale: 0.35,       // tells shrink to a third
    counterFillsBar: 0.14, // each landed counter shortens it
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
    achLabel: 'ACHIEVEMENTS 9/9',
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
  kind: 'mirror',
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
      heading: "HE PLAYS BY YOUR RULES",
      body: "This is the part that should worry you. It eats explosives too. Same fuse, same count to five, same detonation. Every bomb in that rift is a race, and whoever gets there first is the one who grows.",
    },
    {
      heading: "WATCH THE GOATEE",
      body: "It strokes it before every move, like a cartoon villain who has never once been embarrassed about being a cartoon villain. That is your tell, the only one you get. Everything else about this fight is new: shared bombs, three rounds, and it gets bigger every time it beats you to one.",
    },
    {
      heading: "WHAT IT ACTUALLY IS",
      body: "It is not stronger than you. It is not smarter than you. It is simply worse at knowing when to stop, and it is going to prove that by trying to out-eat you on the last one. Watch what happens to a thing that has never once, in its short backwards life, decided five was enough.",
      menace: true,
    },
    {
      heading: "GO ON THEN",
      body: "ARROWS move you between the bombs, SPACE eats them, SHIFT swings at it when it is close enough to hit. Win the race three times. It will not go quietly, but it will go on its own terms, which is worse for it than anything you could do on purpose.",
    },
  ],

  roundsToWin: 3,
  hearts: 3,
  fuseTarget: 5,

  // Its three attacks. Same telegraph grammar as Chaco: a readable wind-up,
  // then a strike with one correct answer.
  attacks: {
    claw:  { name: 'THE CLAW',   tell: 0.5,  damage: 1, reach: 'in'  },
    lash:  { name: 'THE LASH',   tell: 0.62, damage: 1, reach: 'mid' },
    throw: { name: 'THE SHARD',  tell: 0.55, damage: 2, reach: 'out' },
  },

  // Multipliers per growth tier (0, 1, 2), applied to its race speed and
  // attack pace after it wins a race instead of the player.
  growth: { raceSpeed: [1, 1.28, 1.6], attackEvery: [1, 0.82, 0.68] },

  finale: {
    card: "It has one bomb left to grab and it is not going to get there first, and it knows it, and it goes for it anyway. That is the whole species, in both dimensions.",
  },
};

export const BOSSES = [CHACO, LANDLORD, NARRATOR, NECO_FROG];
export const getBoss = (id) => BOSSES.find(b => b.id === id) || null;
export const bossAfter = (stageId) => BOSSES.find(b => b.after === String(stageId)) || null;
