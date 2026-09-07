// Full-screen DOM cards: title, still hungry, game over, ending.
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

import { MODES } from '../core/mode.js';
import { socialTargets } from './sharecard.js';

export class Overlays {
  constructor(root) {
    this.root = root;
    this.node = el('div', 'bf-overlay');
    root.append(this.node);
    this.node.style.display = 'none';
  }
  _show(children, cls = '') {
    this.node.innerHTML = '';
    this.node.className = `bf-overlay ${cls}`;
    const card = el('div', 'bf-card');
    children.forEach(c => card.append(c));
    this.node.append(card);
    this.node.style.display = 'flex';
    // Retrigger the entrance animation; the resting state is already visible,
    // so a skipped or interrupted animation cannot leave the card hidden.
    this.node.style.animation = 'none';
    void this.node.offsetWidth;
    this.node.style.animation = '';
    this.node.classList.add('in');
  }
  hide() { this.node.classList.remove('in'); this.node.style.display = 'none'; }

  // The cabinet art already carries the logo, so the title screen only supplies
  // what the art cannot: the rules, the mode choice, and the way in. Everything
  // sits inside the painted black screen; the buttons drop below it.
  title({ onStart, best, ach, onAchievements, mode = 'atari', artCount = 0, onMode }) {
    const screen = el('div', 'bf-screen');
    screen.append(
      el('p', 'bf-screen-line', 'You are a frog. You cross a road. You eat five bombs and come apart, and each time you come back bigger, until you are the size of the planet and the planet is the one with the problem.'),
      el('div', 'bf-keys', '<b>← ↑ ↓ →</b> hop &nbsp;·&nbsp; <b>SHIFT</b> tongue &nbsp;·&nbsp; on mobile, swipe and tap'),
      el('p', 'bf-note', 'Anything that explodes is food, even in mid-air. Everything else is just going to hurt you.'),
    );

    const picker = el('div', 'bf-modes');
    for (const m of Object.values(MODES)) {
      const chosen = m.id === mode;
      const noArt = m.id === 'modern' && artCount === 0;
      const card = el('button', `bf-mode ${chosen ? 'on' : ''} ${noArt ? 'bare' : ''}`);
      card.append(
        el('div', 'bf-mode-kicker', m.kicker),
        el('div', 'bf-mode-title', m.title),
        el('div', 'bf-mode-tag', noArt ? 'NO ART YET' : (m.id === 'modern' ? `${artCount} PAINTED SPRITES` : m.tag)),
      );
      card.onclick = () => { if (!chosen) onMode?.(m.id); };
      picker.append(card);
    }
    screen.append(picker);

    const go = el('button', 'bf-btn', 'BEGIN THE SHOW');
    go.onclick = onStart;
    const achBtn = el('button', 'bf-btn ghost', ach ? `ACHIEVEMENTS ${ach.count}/${ach.total}` : 'ACHIEVEMENTS');
    achBtn.onclick = onAchievements;
    const below = el('div', 'bf-below');
    below.append(go, achBtn);
    if (best) below.append(el('div', 'bf-best', `PREVIOUS BEST: ${String(best).padStart(6, '0')}`));

    this.node.innerHTML = '';
    this.node.className = 'bf-overlay title';
    this.node.append(screen, below);
    this.node.style.display = 'block';
    this.node.style.animation = 'none'; void this.node.offsetWidth; this.node.style.animation = '';
    this.node.classList.add('in');
  }

  // previewUrl is an object URL for the rendered card; null while it is building.
  shareSheet({ previewUrl, text, url, canNativeShare, onNative, onSave, onCopy, onBack }) {
    const preview = el('div', 'bf-share-preview');
    if (previewUrl) {
      const img = document.createElement('img');
      img.src = previewUrl; img.alt = 'Your achievement card';
      preview.append(img);
    } else {
      preview.append(el('div', 'bf-share-building', 'BUILDING YOUR CARD…'));
    }

    const row = el('div', 'bf-share-row');
    if (canNativeShare) {
      const b = el('button', 'bf-btn', 'SHARE…');
      b.onclick = onNative;
      row.append(b);
    }
    const save = el('button', 'bf-btn' + (canNativeShare ? ' ghost' : ''), 'SAVE IMAGE');
    save.onclick = onSave;
    row.append(save);

    const links = el('div', 'bf-share-links');
    for (const t of socialTargets(text, url)) {
      const a = document.createElement('a');
      a.className = 'bf-share-link';
      a.href = t.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = t.label;
      links.append(a);
    }
    const copy = el('button', 'bf-share-link as-btn', 'Copy text');
    copy.onclick = onCopy;
    links.append(copy);

    const back = el('button', 'bf-btn ghost', 'BACK');
    back.onclick = onBack;

    this._show([
      el('div', 'bf-eyebrow', 'TELL SOMEBODY, I SUPPOSE'),
      el('h2', 'bf-title small', 'SHARE'),
      preview,
      el('p', 'bf-note', 'Instagram has no web share link, so save the image and post it. On a phone, Share hands the picture straight to any app.'),
      row,
      links,
      back,
    ], 'share');
  }

  achievements(ach, best, onShare, onBack) {
    const grid = el('div', 'bf-ach-grid');
    for (const a of ach.list()) {
      const cell = el('div', `bf-ach ${a.unlocked ? 'got' : 'locked'}`);
      const badge = el('div', 'bf-ach-badge');
      const img = document.createElement('img');
      img.alt = '';
      img.src = `assets/game/ach_${a.id}.png`;
      // No art yet? Fall back to the emoji rather than a broken image.
      img.onerror = () => { img.remove(); badge.textContent = a.emoji; };
      badge.append(img);
      cell.append(
        badge,
        el('div', 'bf-ach-title', a.unlocked ? a.title : 'LOCKED'),
        el('div', 'bf-ach-blurb', a.unlocked ? a.blurb : a.hint),
      );
      grid.append(cell);
    }
    const share = el('button', 'bf-btn', 'SHARE ACHIEVEMENTS');
    share.onclick = onShare;
    const back = el('button', 'bf-btn ghost', 'BACK');
    back.onclick = onBack;
    this._show([
      el('div', 'bf-eyebrow', 'PERMANENT RECORD · CANNOT BE APPEALED'),
      el('h2', 'bf-title small', `${ach.count} OF ${ach.total}`),
      grid,
      share, back,
    ], 'achievements');
  }

  // Chaco's monologue, one beat at a time. The last beat starts the bout.
  bossIntro(boss, index, onNext, onSkip) {
    const beat = boss.intro[index];
    const last = index === boss.intro.length - 1;
    const go = el('button', 'bf-btn', last ? 'RING THE BELL' : 'GO ON');
    go.onclick = onNext;
    const skip = el('button', 'bf-btn ghost', 'SKIP THE SPEECH');
    skip.onclick = onSkip;
    const dots = el('div', 'bf-beats');
    boss.intro.forEach((_, i) => dots.append(el('span', `bf-beat ${i <= index ? 'on' : ''}`)));
    const kids = [
      el('div', 'bf-eyebrow', index === 0 ? boss.eyebrow : boss.name),
      el('h2', `bf-title small${beat.menace ? ' menace' : ''}`, beat.heading),
    ];
    for (const para of beat.body.split('\n\n')) kids.push(el('p', 'bf-body', para));
    kids.push(dots, go);
    if (!last) kids.push(skip);
    this._show(kids, 'boss' + (beat.menace ? ' menace' : ''));
  }

  stageCard(stage, size, onGo) {
    const btn = el('button', 'bf-btn', 'CONTINUE');
    btn.onclick = onGo;
    const a = stage.announce || { eyebrow: `STAGE ${stage.id}`, title: stage.name, body: stage.subtitle };
    this._show([
      el('div', 'bf-eyebrow', a.eyebrow),
      el('h2', 'bf-title small', a.title),
      el('p', 'bf-body', a.body),
      el('div', 'bf-size', `SIZE CLASS ${size} / 9`),
      btn,
    ], 'stage');
  }

  gameOver(score, best, stageName, onRetry, onTitle, onAchievements, ach) {
    const retry = el('button', 'bf-btn', 'TRY AGAIN');
    retry.onclick = onRetry;
    const achBtn = el('button', 'bf-btn ghost', ach ? `ACHIEVEMENTS ${ach.count}/${ach.total}` : 'ACHIEVEMENTS');
    achBtn.onclick = onAchievements;
    const home = el('button', 'bf-btn ghost', 'BACK TO TITLE');
    home.onclick = onTitle;
    this._show([
      el('div', 'bf-eyebrow', 'ACHIEVEMENT: ROADKILL'),
      el('h2', 'bf-title small', 'AND THAT IS THE EPISODE'),
      el('p', 'bf-body', `Flattened on ${stageName}. Nobody saw it. Nobody was ever going to see it. That is the part people never account for.\n\nReward? Dead frogs don't get rewards. Dead frogs get closed in a tab. Go again if you have nothing better on, and we both know you don't.`),
      el('div', 'bf-scoreline', `SCORE ${String(score).padStart(6, '0')}<br><span>BEST ${String(best).padStart(6, '0')}</span>`),
      retry, achBtn, home,
    ], 'over');
  }

  ending(score, best, onShare, onReplay, onAchievements, ach) {
    const share = el('button', 'bf-btn', 'SHARE');
    share.onclick = onShare;
    const achBtn = el('button', 'bf-btn ghost', ach ? `ACHIEVEMENTS ${ach.count}/${ach.total}` : 'ACHIEVEMENTS');
    achBtn.onclick = onAchievements;
    const again = el('button', 'bf-btn ghost', 'PLAY AGAIN');
    again.onclick = onReplay;
    this._show([
      el('div', 'bf-eyebrow', 'NOTHING LEFT TO CROSS'),
      el('h2', 'bf-title', 'THE END'),
      el('p', 'bf-body', 'You ate every bomb they had, grew until the sky was too small for you, and sat on the planet like it was a beanbag. Planet: unavailable. Insurance: contested, loudly, by men who will not be paid. Afternoon: gone, and you are not getting it back.\n\nI really liked that. You are in so much fucking trouble.'),
      el('div', 'bf-scoreline', `FINAL SCORE ${String(score).padStart(6, '0')}<br><span>BEST ${String(best).padStart(6, '0')}</span>`),
      share, achBtn, again,
      el('div', 'bf-note', 'Made by Blowing Frog. Yes, the frog always explodes. That is the entire point of the frog and it is frankly none of your business why.'),
    ], 'ending');
  }
}
