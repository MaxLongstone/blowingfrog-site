// Two ways to look at the same game. ATARI draws every sprite procedurally as
// vectors; 2026 swaps in whatever painted art is listed in the sprite manifest.
const KEY = 'bf-game-mode';

export const MODES = {
  atari: {
    id: 'atari',
    kicker: 'MODE ONE',
    title: 'ATARI, YOU OLD FART',
    body: 'Chunky vectors and honest colours, straight out of the machine, no art department involved. Nostalgia is only good when you are remembering it, swamp bitch, not when you are down on all fours rubbing yourself raw against it in the dark. Still. We all keep one filthy little hole to crawl back into. Enjoy yours.',
    tag: 'ALWAYS AVAILABLE',
  },
  modern: {
    id: 'modern',
    kicker: 'MODE TWO',
    title: 'THE 2026 VERSION',
    body: 'Rendered felt, scorched hide and wet highlights. Every bolt on the tanks, every hair in the chef’s moustache, every glistening toe pad on you. It costs more to look at and it is worth every credit. This is what four hundred billion viewers actually paid for.',
    tag: 'NEEDS PAINTED ART',
  },
};

export const DEFAULT_MODE = 'modern';

export function readMode() {
  try {
    const v = localStorage.getItem(KEY);
    return MODES[v] ? v : DEFAULT_MODE;
  } catch { return DEFAULT_MODE; }
}

export function writeMode(mode) {
  if (!MODES[mode]) return;
  try { localStorage.setItem(KEY, mode); } catch { /* storage unavailable */ }
}

export const usesPaintedArt = (mode) => mode === 'modern';
