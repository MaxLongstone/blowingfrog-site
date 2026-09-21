// Writes docs/elevenlabs-master.md: the single sheet for everything made in ElevenLabs
// (voices, sound effects, music). Every line comes from the game's own files so the
// words match what is on screen; the [bracketed] cues are for the voice model only.
import { writeFileSync } from 'node:fs';
import { CAST, BOSS_LINES } from '../game/config/bossvoices.js';
import { INTERRUPTERS } from '../game/config/interrupters.js';
import { OUTBURSTS } from '../game/config/influencer.js';
import { PLANNED_ACHIEVEMENTS, AI_EXTRA_LINES } from '../game/config/plannedachievements.js';
import { getAchievement } from '../game/config/achievements.js';
import { MUSIC, SFX } from '../game/config/audioprompts.js';

const nn = (n) => String(n).padStart(2, '0');
const box = (t) => '```\n' + t + '\n```\n\n';
const item = (id, text) => `**${id}**\n\n${box(text)}`;
const put = (text, pairs, who) => {          // add delivery cues to a line without changing its words
  for (const [a, b] of pairs) {
    if (text.split(a).length !== 2) throw new Error(`${who}: "${a}" not found exactly once`);
    text = text.replace(a, b);
  }
  return text;
};

// ---- the Influencer's outbursts, with cues ----------------------------------------------
const OUT_CUES = [
  [['NO NO NO NO — wait. Wait. Hi. Hi babe.', '[screaming] NO NO NO NO — [gasps] wait. Wait. [sweetly] Hi. Hi babe.'], ['Now FUCK OFF,', '[snaps] Now FUCK OFF,']],
  [['AAAAAAAAAAAAAH! Sorry. Sorry! Breathing.', '[screaming] AAAAAAAAAAAAAH! [breathless] Sorry. Sorry! [inhales] Breathing.'], ['DO NOT CLOSE ME,', '[whispers] DO NOT CLOSE ME,']],
  [['Are you serious right now??', '[disbelief] Are you serious right now??'], ["no it's fine,", "[sniffles] no it's fine,"]],
  [['Please don\'t. Please.', '[pleading, small voice] Please don\'t. Please.'], ["I'm into weird shit.", "[whispers] I'm into weird shit. [pause]"], ['Just STAY.', '[voice breaks] Just STAY.']],
  [['Anyway, FUCK YOU.', 'Anyway, [snarling] FUCK YOU.'], ['Love you. Buy the tea.', '[sweetly] Love you. [chirpy] Buy the tea.']],
  [["LITERALLY the reason I'm in therapy.", "[shaky laugh] LITERALLY the reason I'm in therapy."], ['Hi. Anyone? Hello?', '[small voice] Hi. Anyone? [pause] Hello?']],
  [["I'm gonna count to three.", "[trembling] I'm gonna count to three."], ['THREE. PLEASE.', '[screaming] THREE. [sobbing] PLEASE.']],
  [['DO NOT TOUCH THAT BUTTON!', '[screaming] DO NOT TOUCH THAT BUTTON!'], ['…Okay. Okay okay, breathe.', '[pause] …Okay. [exhales] Okay okay, breathe.'], ['STOP EMPOWERING.', '[shouting] STOP EMPOWERING.']],
  [['you absolute bastard.', '[hissing] you absolute bastard.'], ["Just kidding, you're sweet.", "[giggles] Just kidding, you're sweet."]],
  [['Ha! Gotcha.', '[laughs manically] Ha! Gotcha.']],
  [['Do you want me to LOSE the kidney??', '[shrieks] Do you want me to LOSE the kidney??']],
  [['FUCK. YOU.', '[shouting] FUCK. YOU.'], ['no wait,', '[gasps] no wait,'], ['Sorry babe.', '[sweetly] Sorry babe.']],
  [['Stop stop stop stop,', '[panicked] Stop stop stop stop,'], ['CRY WITH ME.', '[sobbing] CRY WITH ME.']],
  [['AAAH! Sorry,', '[screams] AAAH! [pause] Sorry,'], ['NO. STAY.', '[screams] NO. STAY.']],
  [['Oh, you would.', '[flat] Oh, you would.']],
  [['SHUT UP.', '[shouts] SHUT UP.'], ['That was a bit.', '[nervous laugh] That was a bit.']],
  [['SIXTY. I\'m sweating', '[frantic] SIXTY. [pants] I\'m sweating']],
  [['Cute.', '[dark chuckle] Cute.']],
  [['Pet me.', '[whimpers] Pet me.']],
  [['ha ha ha ha HA HA HA HA', '[laughing hysterically] ha ha ha ha HA HA HA HA'], ['I hate you so much. Stay.', '[voice cracking] I hate you so much. [whispers] Stay.']],
  [['I was the rain.', '[deadpan] I was the rain.']],
  [['GET. OFF. MY. AD.', '[screaming] GET. OFF. MY. AD.'], ['sorry. Sorry!', '[sweetly] sorry. Sorry!'], ['FUCK OFF. Mwah.', '[snapping] FUCK OFF. [kiss] Mwah.']],
];

// ---- the System's callouts, with cues ------------------------------------------------------
const AI = '[sardonic AI announcer, dry and deadpan]';
const ACH_PAIRS = {
  linkInBio: [['Nobody has ever done that.', '[pause] Nobody has ever done that.']],
  blocked: [['She is fine. She is not fine.', '[pause] She is fine. [pause] She is not fine.']],
  notOkay: [['Do not check on her.', '[pause] Do not check on her.']],
  lastEmail: [['We are not sure with what.', '[pause] We are not sure with what.']],
  offline: [['He has your number and a slide.', '[pause] He has your number [pause] and a slide.']],
  synergy: [['and you have seen the end of it.', '[pause] and you have seen the end of it.']],
  amen: [['Your wallet has been asked', '[pause] Your wallet has been asked']],
  prayerCloth: [['Your down payment has been notified.', '[pause] Your down payment has been notified.']],
  heKnowsMe: [['The guy has a boat.', '[pause] The guy has a boat.']],
  research: [['It was a frog. It is always a frog.', '[pause] It was a frog. [sighs] It is always a frog.']],
  muted: [['He has a corkboard.', '[pause] He has a corkboard.']],
  supplements: [['Do not ask what is in you.', '[pause] Do not ask what is in you.']],
  readComments: [['You did it anyway.', '[pause] You did it anyway.']],
  neverRead: [['Kevin is fine.', '[pause] Kevin is fine.']],
  worldQ: [['or so briefly invincible.', '[pause] or so briefly invincible.']],
};
const HIDDEN_PAIRS = {
  hidden_unlock: [['Even the stupid ones.', '[pause] Even the stupid ones.'], ['Go through it.', '[pause] Go through it.']],
  hidden_intro: [['Be big.', '[pause] Be big.'], ['Be briefly unstoppable.', '[pause] Be briefly unstoppable.']],
  hidden_win: [['Go outside.', '[pause] Go outside.'], ['It is worse.', '[pause] It is worse.']],
};

let out = `# ElevenLabs master sheet

This one sheet is everything that gets made in ElevenLabs: **voices, sound effects and music**. Nothing else is needed.

## How to use it
- **Voices:** use the ElevenLabs **v3** model, which understands the [bracketed] cues. Paste the text in the box **exactly**,
  brackets included. The first bracket on a line is the accent and the general delivery; the rest are moments inside the
  line ([pause], [whispers], [laughs], [sobbing], [shouting] and so on). Keep stability on the low or creative side so the
  cues actually land.
- **Sound effects:** use Sound Effects. Paste the prompt and set the length to the seconds shown.
- **Music:** use Music. Paste the prompt and set the length to the seconds shown. Loops should be asked to be seamless in the prompt (they are).
- **Save each file under the name shown** in bold above its box (as .mp3). The game strips every [bracket] before showing captions, so nothing here appears on screen.
- When a batch is done, tell me the folder and I'll import it (levelling, trimming, and wiring).

## The cast
| Id | Character | ElevenLabs voice | Accent |
|---|---|---|---|
`;
for (const [id, c] of Object.entries(CAST)) out += `| ${id} | ${c.name} | ${c.voice} | ${c.accent ?? 'none'} |\n`;
out += `\nThe Narrator uses the System voice because no separate one was named.\n\n`;

// ---- part 1: voices
out += `# Part 1. Voices\n\n`;
out += `## The System (voice: System). New achievement callouts and hidden-level lines\n\nRead the title, then the blurb, in the AI's usual sardonic voice.\n\n`;
const sl = getAchievement('sackLicked');
out += item('voice_ach_sackLicked', `${AI} ${put(`${sl.title}. ${sl.blurb}`, [['Childish?', '[pause] Childish? [flat]']], 'sackLicked')}`);
for (const a of PLANNED_ACHIEVEMENTS) out += item(`voice_ach_${a.id}`, `${AI} ${put(`${a.title}. ${a.blurb}`, ACH_PAIRS[a.id] ?? [], a.id)}`);
for (const l of AI_EXTRA_LINES) out += item(`voice_${l.id}`, `${AI} ${put(l.text, HIDDEN_PAIRS[l.id] ?? [], l.id)}`);

out += `## The Influencer (voice: Influencer). 22 outbursts for when you try to skip her\n\nShe swings between moods inside a single breath, so play the cues hard.\n\n`;
OUTBURSTS.forEach((t, i) => { out += item(`voice_influencer_outburst_${nn(i + 1)}`, `[frantic, high-pitched influencer voice] ${put(t, OUT_CUES[i] ?? [], `outburst ${i + 1}`)}`); });

out += `## The bosses (five lines each)\n\nEach boss says one of these as a heads-up in the stage before you meet them.\n\n`;
for (const [id, lines] of Object.entries(BOSS_LINES)) {
  out += `### ${CAST[id].name}. Voice: ${CAST[id].voice}\n\n`;
  lines.forEach((l, i) => { out += item(`voice_boss_${id}_${nn(i + 1)}`, l); });
}
for (const [id, c] of Object.entries(INTERRUPTERS)) {
  out += `## ${c.name} (${c.ministry}). Voice: ${c.voice}\n\nFirst appears in ${c.firstStage}. Four tiers of three lines; the tier is how many times you have seen him, and he gets worse each time.\n\n`;
  c.tiers.forEach((tier, ti) => tier.forEach((l, li) => { out += item(`voice_${id}_tier${ti + 1}_${nn(li + 1)}`, l); }));
}

// ---- part 2: SFX
out += `# Part 2. Sound effects\n\nUse Sound Effects. Set the duration to the seconds shown.\n\n`;
let group = '';
for (const s of SFX) {
  if (s.group !== group) { group = s.group; out += `## ${group}\n\n`; }
  out += `**${s.id}** (${s.seconds} s)\n\n${box(s.prompt)}`;
}

// ---- part 3: music
out += `# Part 3. Music\n\nUse Music. Set the length to the seconds shown.\n\n`;
for (const m of MUSIC) out += `**${m.id}** (${m.seconds} s${m.loop ? ', loops' : ''}). ${m.note}.\n\n${box(m.prompt)}`;

const nVoices = 1 + PLANNED_ACHIEVEMENTS.length + AI_EXTRA_LINES.length + OUTBURSTS.length
  + Object.values(BOSS_LINES).reduce((n, l) => n + l.length, 0)
  + Object.values(INTERRUPTERS).reduce((n, c) => n + c.tiers.flat().length, 0);
out += `# Checklist\n\n- [ ] Voices: ${nVoices} lines\n- [ ] Sound effects: ${SFX.length}\n- [ ] Music and stings: ${MUSIC.length}\n\nTotal: ${nVoices + SFX.length + MUSIC.length} files.\n`;
writeFileSync(new URL('../docs/elevenlabs-master.md', import.meta.url), out);
console.log('wrote docs/elevenlabs-master.md', out.length, 'chars;', nVoices, 'voices,', SFX.length, 'sfx,', MUSIC.length, 'music');
