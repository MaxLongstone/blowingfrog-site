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
      body: 'Third son of a third son of a third daughter, which where he comes from means he was always going to end up either a saint or exactly this. The records are unclear. The records are also on fire.',
    },
    {
      heading: 'HE IS NOT AN ANIMAL, HE IS A DECADE',
      body: 'Somebody ran the entire nineteen nineties through a centrifuge and this is what settled at the bottom. Daytime television screaming at itself. A president and his hot sauce. And that one sweaty year when the two most beautiful men alive decided vampirism was a love language and an entire generation quietly agreed. Twilight has nothing on this. Twilight was written by people who had never met one on a bad night in Miami.',
    },
    {
      heading: 'THE TRUTH WAS OUT THERE. IT IS IN HERE NOW.',
      body: 'He is what happens when Mulder and Scully stop arguing for one night. Every satellite dish in the hemisphere swung toward the same rumour at the same moment, and something crawled up the signal. The truth was out there. The truth is in a chain-link ring behind a warehouse, doing lines off a belt he did not win.',
    },
    {
      heading: 'WHY THEY NEEDED HIM',
      body: 'Ask yourself why a whole decade had to invent him, swamp bitch. Nineteen ninety-five. Everything being signed away in rooms nobody was invited to. Work going somewhere nobody would name out loud. And out in the fields the animals kept turning up bloodless and whole. Not eaten. Drained. Left intact, so you could see precisely what had been taken.\n\nThat is the monster a decade builds when it can feel itself being emptied and has nothing to point at.',
      menace: true,
    },
    {
      heading: 'ANYWAY',
      body: 'He is going to try to do that to you. He is undefeated in eleven fights, nine of which were against livestock. His mouth is the only soft thing on him, so it is the only way in, which is unfortunate, because it is also how he takes your bombs.\n\nWatch the chains. When they swing, he has already decided.',
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

export const BOSSES = [CHACO];
export const getBoss = (id) => BOSSES.find(b => b.id === id) || null;
export const bossAfter = (stageId) => BOSSES.find(b => b.after === String(stageId)) || null;
