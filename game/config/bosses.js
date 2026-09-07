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
      body: 'That is a man. Not a monster, not a cryptid, not something the nineties coughed up. A man in a vest, sat at the top of a building he has owned since 1994 and repaired precisely never.\n\nHe is aware of the boiler. He has been aware of the boiler for thirty-one years. He will get to it.',
    },
    {
      heading: 'THE BUILDING IS THE FIGHT',
      body: 'Look at what you are climbing. Scaffolding that went up for a fortnight and stayed a decade. Tarpaulin doing the job of a wall. Nine satellite dishes and no aerial. Air conditioning units dripping onto the washing of the flat below, which is also his, which he also has not fixed.\n\nNothing you stand on will hold you for long. That is not a trap he set. That is just the building.',
    },
    {
      heading: 'HE WILL NOT BE SPEAKING',
      body: 'Do not wait for a threat. He does not threaten. He does not negotiate. He will drop a boiler on you with the face of a man putting the bins out, and if you survive it he will make a note on the clipboard.\n\nThe good news, and I use the word loosely, is that the boilers are full of gas. He is arming you out of sheer negligence. Catch five and you go off in his stairwell.',
    },
    {
      heading: 'THE BOX',
      body: 'Note the black box beside him. He has one hand on it at all times. He has had that hand on it for as long as anyone in this building can remember.\n\nMy professional assessment, and I want to be clear that I have run the numbers: pornography. Obviously pornography. Let us not embarrass ourselves pretending it could be anything else.',
    },
    {
      heading: 'WHAT A BUILDING LIKE THIS IS',
      body: 'And you should understand what you are actually climbing, swamp bitch. Not a tower. A decision. Somebody worked out, on paper, with a calculator, that fixing it costs more than not fixing it, and that the people inside would absorb the difference with their lungs and their winters and their children.\n\nHe did not do anything to this building. That is the whole of it. Thirty-one years of not doing anything, stacked up, and now it is tall enough to climb.',
      menace: true,
    },
    {
      heading: 'GO ON THEN',
      body: 'Up you go. Nothing holds for long, so keep moving. ARROWS climb in any direction you like, SPACE is your tongue for anything he drops, SHIFT is the glove for anything boarded shut.\n\nReach him three times and the building will do the rest. It has been waiting thirty-one years for an excuse.',
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
    'The boiler manual. Still shrink-wrapped.',
    'His wife. Not deceased. Just in there.',
    'Thirty years of post for a Mr G. Haddad, who has never lived here.',
    'A smaller box.',
    'One tooth. Not his.',
    'The deed, which would prove he does not own this building.',
    'A film that was never released and should never be watched.',
    'Nothing. It is empty. It has always been empty. He knows, and he sits on it anyway.',
    'An earlier version of me. Still running. Still narrating. To no one.',
  ],
};

export const BOSSES = [CHACO, LANDLORD];
export const getBoss = (id) => BOSSES.find(b => b.id === id) || null;
export const bossAfter = (stageId) => BOSSES.find(b => b.after === String(stageId)) || null;
