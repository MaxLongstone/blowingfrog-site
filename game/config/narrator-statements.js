// The statement bank for THE NARRATOR. Every entry is either true or false and
// the game must be right about which, since the whole fight rests on that.
// Categories:
//   world  — real, well-documented facts and the myths people confuse them
//            with. Nothing contested, nothing political, nothing about a
//            named private person. Old-fashioned trivia-night territory.
//   game   — checkable against what the earlier boss cards actually said.
//   you    — built at fight-start from this browser's own real counters.

export const WORLD_STATEMENTS = [
  { text: "It is spelled Berenstain Bears.", isLie: false },
  { text: "It is spelled Berenstein Bears.", isLie: true },
  { text: 'Darth Vader says "Luke, I am your father" in The Empire Strikes Back.', isLie: true },
  { text: "Humphrey Bogart never actually says “play it again, Sam” in Casablanca.", isLie: false },
  { text: "Napoleon Bonaparte was notably shorter than average for his time.", isLie: true },
  { text: "Albert Einstein failed mathematics in school.", isLie: true },
  { text: "The Great Wall of China is visible from space with the naked eye.", isLie: true },
  { text: "Fortune cookies were invented in China.", isLie: true },
  { text: "Goldfish have a memory span of only a few seconds.", isLie: true },
  { text: "Lightning never strikes the same place twice.", isLie: true },
  { text: "Bulls become enraged specifically at the colour red.", isLie: true },
  { text: "Chameleons change colour mainly to camouflage with their surroundings.", isLie: true },
  { text: "Ostriches bury their heads in the sand when frightened.", isLie: true },
  { text: "The Coca-Cola company invented Santa Claus's red and white suit.", isLie: true },
  { text: "Mount Everest is the tallest mountain on Earth, measured base to peak.", isLie: true },
  { text: "A group of crows is called a murder.", isLie: false },
  { text: "Vikings wore horned helmets into battle.", isLie: true },
  { text: "Bananas grow on trees.", isLie: true },
  { text: "Honey, stored properly, does not spoil.", isLie: false },
  { text: "Octopuses have three hearts.", isLie: false },
  { text: "The shortest war on record lasted under an hour.", isLie: false },
  { text: "Sharks existed before trees did.", isLie: false },
  { text: "A day on Venus is longer than a year on Venus.", isLie: false },
  { text: "Wombat droppings are cube-shaped.", isLie: false },
  { text: "The man who invented the Pringles can is partly buried inside one.", isLie: false },
  { text: "Oxford University is older than the Aztec empire.", isLie: false },
  { text: "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.", isLie: false },
];

export const GAME_STATEMENTS = [
  { text: "Chaco went down to his own cocaine, not to a punch.", isLie: false },
  { text: "The Landlord's black box was confirmed, on screen, to contain pornography.", isLie: true },
  { text: "The Landlord spoke at least once during that fight.", isLie: true },
  { text: "Anything that explodes has been food since the very first stage.", isLie: false },
  { text: "The frog has always had five lives to start with, never three.", isLie: true },
  { text: "Every boss so far has been beaten by something other than the frog's fists.", isLie: false },
];

// Built once per fight from real, local numbers. `stats` merges the
// Achievements snapshot with the Telemetry snapshot. Templates that would be
// meaningless at zero (streaks, ratios) are skipped rather than forced.
export function buildYouStatements(stats) {
  const s = (n, singular, plural = singular + 's') => `${n} ${n === 1 ? singular : plural}`;
  const out = [
    { text: `You have died ${s(stats.deaths, 'time')}.`, isLie: false },
    { text: `You have cleared a stage without being hit ${s(stats.cleanStages, 'time')}.`, isLie: false },
    { text: `You have caught ${s(stats.midairEats, 'thing')} out of the air with your tongue.`, isLie: false },
    { text: `You have squashed ${s(stats.squashes, 'vehicle')}.`, isLie: false },
    { text: `You have opened this game ${s(stats.sessions, 'time')}.`, isLie: false },
    { text: `It has been ${s(stats.daysSinceFirstSeen, 'day')} since you first opened this.`, isLie: false },
    { text: `You have spent ${s(stats.totalPlayMinutes, 'minute')} of your life on a cartoon frog.`, isLie: false },
    { text: `Your best score stands at ${stats.best}.`, isLie: false },
    // Ones the Narrator lies about, in the direction that is more flattering
    // than your real record. Only meaningful, and only included, when it is
    // actually false to say.
    ...(stats.achCount < stats.achTotal
      ? [{ text: `You have unlocked all ${stats.achTotal} achievements.`, isLie: true }]
      : []),
    ...(stats.deaths > 0
      ? [{ text: "You have never once died.", isLie: true }]
      : []),
  ];
  return out;
}
