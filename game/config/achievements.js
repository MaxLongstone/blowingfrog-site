// Thirty-six achievements, in the voice of the broadcast AI. Each is unlocked
// by a cumulative counter that survives across sessions. A further one (finishing
// the hidden level) exists but is not listed here until that level does --
// see config/plannedachievements.js.
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
  { id: 'probed',      emoji: '🛸', title: 'PROBED',
    blurb: "You got probed. And you liked it. That's bound to make you question everything. So, to quote a great writer: \"you can't unlink an asshole once it's licked.\"",
    hint: 'Beat PROBE ONE.',                 test: c => c.probeOneCleared >= 1 },
  { id: 'gallery',     emoji: '🎯', title: 'SHOOTING GALLERY',
    blurb: 'Fifty alien ships down. NASA already knows. NASA is furious.',
    hint: 'Shoot down 50 alien ships.',      test: c => c.probeKills >= 50 },

  // Boss-specific clears. Each boss falls to its own trait, never your
  // fists, and now each one leaves its own punchline behind too.
  { id: 'chacoDown',    emoji: '🐐', title: 'THE GOATED ONE',
    blurb: 'Beat the narco chupacabra. He was, etymologically, always going to be a goat joke. You’re welcome.',
    hint: 'Beat Chaco.',                     test: c => c.chacoCleared >= 1 },
  { id: 'landlordDown', emoji: '🔑', title: 'EVICTION NOTICE SERVED',
    blurb: 'Thirty-one years of not fixing the boiler, undone in one climb. Rent’s due, motherfucker.',
    hint: 'Beat The Landlord.',              test: c => c.landlordCleared >= 1 },
  { id: 'necoDown',     emoji: '🪞', title: 'MIRROR, MIRROR, OFF THE WALL',
    blurb: 'Beat your evil twin with the goatee. Somewhere, a cracked mirror feels a little better about itself.',
    hint: 'Beat The Neco Frog.',             test: c => c.necoCleared >= 1 },
  { id: 'narratorDown', emoji: '🎙️', title: 'NARRATIVE COLLAPSE',
    blurb: 'You beat the thing narrating you. I would be more upset about this if I were not also the one handing you the achievement for it.',
    hint: 'Beat The Narrator.',              test: c => c.narratorCleared >= 1 },
  { id: 'sackmanDown',  emoji: '⚫', title: 'SACKED',
    blurb: 'Beat the thing with no folder, no face, and apparently no legs anymore either.',
    hint: 'Beat The Sack Man.',              test: c => c.sackmanCleared >= 1 },
  { id: 'sackLicked',   emoji: '👅', title: 'SACK LICKED',
    blurb: "Yes, you get a second one. Why? Because the pun was there, and you are nothing but a plaything for me. Your prize? Sack licked. Yeah. Childish? Fuck you.",
    hint: 'Beat The Sack Man. Yes, again.',   test: c => c.sackmanCleared >= 1 },
  { id: 'ummaDown',     emoji: '👟', title: 'MOM WAS RIGHT AGAIN',
    blurb: 'Beat Umma without ever throwing a punch, because you do not hit your mother, not in this house, not in any house.',
    hint: 'Beat UMMA.',                      test: c => c.ummaCleared >= 1 },

  // Whole-game, no new boss required. Some of these are just puns wearing
  // a counter as a trenchcoat.
  { id: 'glutton',      emoji: '😋', title: 'GLUTTON FOR PUNISHMENT',
    blurb: 'Caught twenty-five explosives out of the air with your tongue. A doctor would like a word.',
    hint: 'Tongue 25 explosives out of the air.', test: c => c.midairEats >= 25 },
  { id: 'ninelives',    emoji: '🐈', title: "NOT EVEN A CAT'S NINE LIVES",
    blurb: 'Died twenty times. You are, mathematically, worse at this than a cat, and a cat cannot even eat a food truck.',
    hint: 'Die 20 times.',                   test: c => c.deaths >= 20 },
  { id: 'roadkill',     emoji: '🛣️', title: 'ROADKILL RÉSUMÉ',
    blurb: 'One hundred vehicles flattened. HR called. They want to talk about your "work history."',
    hint: 'Squash 100 vehicles.',            test: c => c.squashes >= 100 },
  { id: 'participation', emoji: '🏆', title: 'PARTICIPATION TROPHY',
    blurb: 'You opened the game. That is the entire achievement. We are as confused about this one as you are.',
    hint: 'Open the game. Yes, really.',     test: c => c.boots >= 1 },

  // The Influencer.
  { id: 'linkInBio',  emoji: '🔗', title: 'LINK IN BIO',
    blurb: 'Sat through a whole Influencer ad without skipping. Nobody has ever done that. Not even the Influencer. The link is in the bio. There is no bio.',
    hint: 'Sit through one of the Influencer\u2019s ads.', test: c => c.infFinishes >= 1 },
  { id: 'blocked',    emoji: '🚫', title: 'BLOCKED AND REPORTED',
    blurb: 'Skipped five of her ads. She has been blocked, reported, and briefly mourned. She is fine. She is not fine.',
    hint: 'Skip five of the Influencer\u2019s ads.', test: c => c.infSkips >= 5 },
  { id: 'notOkay',    emoji: '🔦', title: 'SHE IS NOT OKAY',
    blurb: 'Heard her last transmission, the one with the flashlight. Someone should check on her. You are someone. Do not check on her.',
    hint: 'Hear the Influencer\u2019s last tier.', test: c => c.infTier4Heard >= 1 },

  // Pastor Dale Hollis.
  { id: 'amen',       emoji: '🙏', title: 'AMEN',
    blurb: 'Sat through the Preacher\u2019s entire sermon. Your soul is unaffected. Your wallet has been asked, politely, for its account number.',
    hint: 'Sit through one of the Preacher\u2019s sermons.', test: c => c.pastorFinishes >= 1 },
  { id: 'prayerCloth', emoji: '🧣', title: 'PRAYER CLOTH, $89',
    blurb: 'Skipped the Preacher five times. Heaven has been notified. Eternal Acres has been notified. Your down payment has been notified.',
    hint: 'Skip the Preacher five times.', test: c => c.pastorSkips >= 5 },
  { id: 'heKnowsMe',  emoji: '⛵', title: 'HE KNOWS ME',
    blurb: 'Heard his last and worst justification. He knows you. He knows everyone. He knows a guy. The guy has a boat.',
    hint: 'Hear the Preacher\u2019s last, worst justification.', test: c => c.pastorAppearances >= 4 },

  // Buck Mallory, the podcaster.
  { id: 'research',   emoji: '📎', title: 'DO YOUR OWN RESEARCH',
    blurb: 'Sat through the Podcaster\u2019s whole broadcast. You did your own research. It was a frog. It is always a frog.',
    hint: 'Sit through one of the Podcaster\u2019s broadcasts.', test: c => c.podcasterFinishes >= 1 },
  { id: 'muted',      emoji: '🔇', title: 'MUTED',
    blurb: 'Skipped the Podcaster the very first time. Good instincts. He noted it. He notes everything. He has a corkboard.',
    hint: 'Skip the Podcaster the first time he appears.', test: c => c.podcasterSkippedFirst >= 1 },
  { id: 'supplements', emoji: '🐸', title: 'THE SUPPLEMENTS ARE FINE',
    blurb: 'Heard all four tiers of the Podcaster. The supplements are fine. Do not ask what is in them. Do not ask what is in you.',
    hint: 'Hear all four tiers of the Podcaster.', test: c => c.podcasterAppearances >= 4 },

  // Gregory Pemberton, the boss's boss.
  { id: 'lastEmail',  emoji: '📧', title: 'PER MY LAST EMAIL',
    blurb: 'Sat through a Boss\u2019s Boss check-in. You are now, technically, aligned. We are not sure with what.',
    hint: 'Sit through one of the Boss\u2019s Boss\u2019s check-ins.', test: c => c.bossbossFinishes >= 1 },
  { id: 'offline',    emoji: '📵', title: "LET'S TAKE THIS OFFLINE",
    blurb: 'Skipped him three times. He took it offline. He is calling your house now. Do not answer. He has your number and a slide.',
    hint: 'Skip the Boss\u2019s Boss three times.', test: c => c.bossbossSkips >= 3 },
  { id: 'synergy',    emoji: '🌀', title: 'SYNERGY',
    blurb: 'Heard all four tiers of the Boss\u2019s Boss. Language is a construct, and you have seen the end of it.',
    hint: 'Hear all four tiers of the Boss\u2019s Boss.', test: c => c.bossbossAppearances >= 4 },

  // The live comment section.
  { id: 'readComments', emoji: '💬', title: 'READ THE COMMENTS',
    blurb: 'Left the chat open through an entire boss fight. Everyone told you not to. You did it anyway. You are not smarter, and you are not better.',
    hint: 'Leave the chat open through a whole boss fight.', test: c => c.chatOpenAtBossWin >= 1 },
  { id: 'neverRead',  emoji: '🙈', title: 'NEVER READ THE COMMENTS',
    blurb: 'Hid the chat. Wise. Preserved your dignity. Missed a man named Kevin. Kevin is fine.',
    hint: 'Hide the chat.', test: c => c.chatHidden >= 1 },
];

export const COUNTER_KEYS = [
  'stagesCleared', 'detonations', 'midairEats', 'kaijuReached',
  'squashes', 'burns', 'cleanStages', 'deaths', 'finishes',
  'probeOneCleared', 'probeKills',
  'chacoCleared', 'landlordCleared', 'necoCleared', 'narratorCleared',
  'sackmanCleared', 'ummaCleared', 'boots',
  // The Influencer, the three interrupters, and the chat.
  'infFinishes', 'infSkips', 'infTier4Heard',
  'pastorFinishes', 'pastorSkips', 'pastorAppearances',
  'podcasterFinishes', 'podcasterSkips', 'podcasterAppearances', 'podcasterSkippedFirst',
  'bossbossFinishes', 'bossbossSkips', 'bossbossAppearances',
  'chatOpenAtBossWin', 'chatHidden',
];

export function getAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
}
