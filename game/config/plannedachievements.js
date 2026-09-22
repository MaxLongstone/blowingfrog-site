// What is left for the hidden level, once it exists. Everything else that was
// planned here has been wired into config/achievements.js.
export const PLANNED_ACHIEVEMENTS = [
  { id: 'worldQ', emoji: '❓', title: 'WORLD ???', hint: 'Finish the hidden level.',
    blurb: 'You found the level that is not on the map. The frog has never been so big, or so on fire, or so briefly invincible.' },
];

// Other lines for the AI to read, once the hidden level exists.
export const AI_EXTRA_LINES = [
  { id: 'hidden_unlock', text: 'Every achievement. All of them. Even the stupid ones. There is a door on the title screen that was not there before. Nobody asked you to go through it. Go through it.' },
  { id: 'hidden_intro',  text: 'Welcome to the level that does not exist. Everything you killed is back, smaller, and angrier about it. Eat the explosives. Be big. Be on fire. Be briefly unstoppable.' },
  { id: 'hidden_win',    text: 'That is the last of it. The frog has nothing left to prove, and neither do you. Go outside. There is a road out there. It is worse.' },
];
