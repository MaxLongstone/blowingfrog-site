// Achievements for the characters that are still to be wired in, with the words the AI reads.
// They are added to ACHIEVEMENTS (with their counters) when their character goes live.
export const PLANNED_ACHIEVEMENTS = [
  { id: 'linkInBio',     emoji: '🔗', title: 'LINK IN BIO',            hint: 'Sit through one of the Influencer’s ads.',
    blurb: 'Sat through a whole Influencer ad without skipping. Nobody has ever done that. Not even the Influencer. The link is in the bio. There is no bio.' },
  { id: 'blocked',       emoji: '🚫', title: 'BLOCKED AND REPORTED',   hint: 'Skip five of the Influencer’s ads.',
    blurb: 'Skipped five of her ads. She has been blocked, reported, and briefly mourned. She is fine. She is not fine.' },
  { id: 'notOkay',       emoji: '🔦', title: 'SHE IS NOT OKAY',        hint: 'Hear the Influencer’s last tier.',
    blurb: 'Heard her last transmission, the one with the flashlight. Someone should check on her. You are someone. Do not check on her.' },
  { id: 'lastEmail',     emoji: '📧', title: 'PER MY LAST EMAIL',      hint: 'Sit through one of the Boss’s Boss’s check-ins.',
    blurb: 'Sat through a Boss’s Boss check-in. You are now, technically, aligned. We are not sure with what.' },
  { id: 'offline',       emoji: '📵', title: 'LET’S TAKE THIS OFFLINE', hint: 'Skip the Boss’s Boss three times.',
    blurb: 'Skipped him three times. He took it offline. He is calling your house now. Do not answer. He has your number and a slide.' },
  { id: 'synergy',       emoji: '🌀', title: 'SYNERGY',                hint: 'Hear all four tiers of the Boss’s Boss.',
    blurb: 'Heard all four tiers of the Boss’s Boss. Language is a construct, and you have seen the end of it.' },
  { id: 'amen',          emoji: '🙏', title: 'AMEN',                   hint: 'Sit through one of the Preacher’s sermons.',
    blurb: 'Sat through the Preacher’s entire sermon. Your soul is unaffected. Your wallet has been asked, politely, for its account number.' },
  { id: 'prayerCloth',   emoji: '🧣', title: 'PRAYER CLOTH, $89',      hint: 'Skip the Preacher five times.',
    blurb: 'Skipped the Preacher five times. Heaven has been notified. Eternal Acres has been notified. Your down payment has been notified.' },
  { id: 'heKnowsMe',     emoji: '⛵', title: 'HE KNOWS ME',            hint: 'Hear the Preacher’s last, worst justification.',
    blurb: 'Heard his last and worst justification. He knows you. He knows everyone. He knows a guy. The guy has a boat.' },
  { id: 'research',      emoji: '📎', title: 'DO YOUR OWN RESEARCH',   hint: 'Sit through one of the Podcaster’s broadcasts.',
    blurb: 'Sat through the Podcaster’s whole broadcast. You did your own research. It was a frog. It is always a frog.' },
  { id: 'muted',         emoji: '🔇', title: 'MUTED',                  hint: 'Skip the Podcaster the first time he appears.',
    blurb: 'Skipped the Podcaster the very first time. Good instincts. He noted it. He notes everything. He has a corkboard.' },
  { id: 'supplements',   emoji: '🐸', title: 'THE SUPPLEMENTS ARE FINE', hint: 'Hear all four tiers of the Podcaster.',
    blurb: 'Heard all four tiers of the Podcaster. The supplements are fine. Do not ask what is in them. Do not ask what is in you.' },
  { id: 'readComments',  emoji: '💬', title: 'READ THE COMMENTS',      hint: 'Leave the chat open through a whole boss fight.',
    blurb: 'Left the chat open through an entire boss fight. Everyone told you not to. You did it anyway. You are not smarter, and you are not better.' },
  { id: 'neverRead',     emoji: '🙈', title: 'NEVER READ THE COMMENTS', hint: 'Hide the chat.',
    blurb: 'Hid the chat. Wise. Preserved your dignity. Missed a man named Kevin. Kevin is fine.' },
  { id: 'worldQ',        emoji: '❓', title: 'WORLD ???',              hint: 'Finish the hidden level.',
    blurb: 'You found the level that is not on the map. The frog has never been so big, or so on fire, or so briefly invincible.' },
];

// Other lines for the AI to read.
export const AI_EXTRA_LINES = [
  { id: 'hidden_unlock', text: 'Every achievement. All of them. Even the stupid ones. There is a door on the title screen that was not there before. Nobody asked you to go through it. Go through it.' },
  { id: 'hidden_intro',  text: 'Welcome to the level that does not exist. Everything you killed is back, smaller, and angrier about it. Eat the explosives. Be big. Be on fire. Be briefly unstoppable.' },
  { id: 'hidden_win',    text: 'That is the last of it. The frog has nothing left to prove, and neither do you. Go outside. There is a road out there. It is worse.' },
];
