// Nine achievements, in the voice of the broadcast AI. Each is unlocked by a
// cumulative counter that survives across sessions.
export const ACHIEVEMENTS = [
  { id: 'sentient',    emoji: '🐸', title: 'BARELY SENTIENT',
    blurb: 'Crossed a road. The bar was on the floor and you cleared it.',
    hint: 'Finish a stage.',                 test: c => c.stagesCleared >= 1 },
  { id: 'piggy',       emoji: '💥', title: 'THIS LITTLE PIGGY WENT BOOM',
    blurb: 'Detonated for the first time. Sixteen million households rewatched the feet.',
    hint: 'Detonate once.',                  test: c => c.detonations >= 1 },
  { id: 'wing',        emoji: '🚀', title: 'SNACK ON THE WING',
    blurb: 'Ate a live warhead out of the air. Disgusting. Do it again.',
    hint: 'Tongue an explosive mid-flight.',  test: c => c.midairEats >= 1 },
  { id: 'breach',      emoji: '🦖', title: 'CONTAINMENT FAILED',
    blurb: 'Grew past the point where anything on the road matters.',
    hint: 'Reach the kaiju act.',            test: c => c.kaijuReached >= 1 },
  { id: 'pest',        emoji: '🥾', title: 'PEST CONTROL',
    blurb: 'Twenty-five vehicles flattened. Their families have been notified by post.',
    hint: 'Squash 25 vehicles.',             test: c => c.squashes >= 25 },
  { id: 'revolting',   emoji: '🔥', title: 'REVOLTING',
    blurb: 'Burned twelve things with your tongue. I watched all of it.',
    hint: 'Burn 12 things with fire breath.', test: c => c.burns >= 12 },
  { id: 'untouched',   emoji: '✨', title: 'NOT A SCRATCH',
    blurb: 'Cleared a whole stage untouched. Suspicious. We are reviewing the tape.',
    hint: 'Clear a stage without being hit.', test: c => c.cleanStages >= 1 },
  { id: 'daddy',       emoji: '🍺', title: "YOU'RE WHY DADDY DRINKS",
    blurb: 'Died five times. The audience has started betting against you specifically.',
    hint: 'Die 5 times. You will.',          test: c => c.deaths >= 5 },
  { id: 'unavailable', emoji: '🌍', title: 'PLANET UNAVAILABLE',
    blurb: 'Sat on the Earth. Ratings unprecedented. You are in so much trouble.',
    hint: 'Finish the game.',                test: c => c.finishes >= 1 },
];

export const COUNTER_KEYS = [
  'stagesCleared', 'detonations', 'midairEats', 'kaijuReached',
  'squashes', 'burns', 'cleanStages', 'deaths', 'finishes',
];

export function getAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
}
