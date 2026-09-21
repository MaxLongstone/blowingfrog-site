// Writes docs/voice-cast.md from game/config/bossvoices.js, so the script for ElevenLabs
// and the captions in the game come from the same words.
import { writeFileSync } from 'node:fs';
import { CAST, BOSS_LINES } from '../game/config/bossvoices.js';

let out = `# Voice cast and boss lines

The **voice** is the name of the ElevenLabs voice to use. The **accent** is in [brackets] at the start
of every line so the model keeps it; the game strips the brackets before showing a caption.
Save each recording as \`voice_boss_<id>_<NN>.mp3\` (for example \`voice_boss_chaco_03.mp3\`) and it plays
in place of the caption-only version. Each boss says one of its five lines as a heads-up during the
stage before you meet them.

## The cast

| Id | Character | Voice | Accent |
|---|---|---|---|
`;
for (const [id, c] of Object.entries(CAST)) out += `| ${id} | ${c.name} | ${c.voice} | ${c.accent ?? 'none'} |\n`;
out += `\nThe Narrator has no voice of his own in the list, so he borrows the System's.\n`;
for (const [id, lines] of Object.entries(BOSS_LINES)) {
  out += `\n## ${CAST[id].name}, voice: ${CAST[id].voice}\n\n`;
  lines.forEach((l, i) => { out += `**${String(i + 1).padStart(2, '0')}** \`voice_boss_${id}_${String(i + 1).padStart(2, '0')}\`\n\n${l}\n\n`; });
}
out += `\n## The Influencer's outbursts (voice: Influencer)\n\nWhen she will not let you skip her, each click gets one of these. Not yet recorded; the card shows the words.\n\n`;
const { OUTBURSTS } = await import('../game/config/influencer.js');
OUTBURSTS.forEach((l, i) => { out += `${String(i + 1).padStart(2, '0')}. ${l}\n\n`; });
writeFileSync(new URL('../docs/voice-cast.md', import.meta.url), out);
console.log('wrote docs/voice-cast.md', out.length, 'chars');
