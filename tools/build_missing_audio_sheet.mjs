// Writes docs/elevenlabs-missing.md: only the sound effects and music that are
// not yet in assets/sfx or assets/music, each as a complete copy-paste prompt.
// Rerun any time -- it always reflects what is actually still missing.
import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import { MUSIC, SFX } from '../game/config/audioprompts.js';

const strip = (f) => f.replace(/\.(mp3|opus|wav)$/, '');
const have = (dir) => existsSync(dir) ? new Set(readdirSync(dir).map(strip)) : new Set();
const sfxHave = have(new URL('../assets/sfx', import.meta.url));
const musicHave = have(new URL('../assets/music', import.meta.url));

const box = (t) => '```\n' + t + '\n```\n\n';
let out = `# ElevenLabs -- what is still missing\n\n`;
out += `Everything below is a sound effect or a piece of music the game already expects and does not\nhave yet. Each box is a complete prompt: paste it as it is into ElevenLabs Sound Effects (for the\nSFX) or Music (for the music and stings), set the length shown, and save the result under the\nname in bold above the box (as .mp3, into the usual folder). Nothing here needs any other setup.\n\nThis list is generated from the game's own config, so it is never stale: if something below turns\nout to already be sitting in \`assets/sfx\` or \`assets/music\` next time this is run, it drops off.\n\n`;

const missingSfx = SFX.filter((s) => !sfxHave.has(s.id));
const missingMusic = MUSIC.filter((m) => !musicHave.has(m.id));

out += `## Sound effects (${missingSfx.length} of ${SFX.length} left)\n\nUse Sound Effects. Set the duration to the seconds shown.\n\n`;
let group = '';
for (const s of missingSfx) {
  if (s.group !== group) { group = s.group; out += `### ${group}\n\n`; }
  out += `**${s.id}** (${s.seconds} s)\n\n${box(s.prompt)}`;
}

out += `## Music and stings (${missingMusic.length} of ${MUSIC.length} left)\n\nUse Music. Set the length to the seconds shown.\n\n`;
for (const m of missingMusic) {
  out += `**${m.id}** (${m.seconds} s${m.loop ? ', loops' : ''}). ${m.note}.\n\n${box(m.prompt)}`;
}

out += `## Checklist\n\n`;
for (const s of missingSfx) out += `- [ ] ${s.id}\n`;
for (const m of missingMusic) out += `- [ ] ${m.id}\n`;
out += `\nTotal left: ${missingSfx.length + missingMusic.length} files (already done: ${SFX.length + MUSIC.length - missingSfx.length - missingMusic.length}).\n`;

writeFileSync(new URL('../docs/elevenlabs-missing.md', import.meta.url), out);
console.log('wrote docs/elevenlabs-missing.md --', missingSfx.length, 'sfx +', missingMusic.length, 'music =', missingSfx.length + missingMusic.length, 'left');
