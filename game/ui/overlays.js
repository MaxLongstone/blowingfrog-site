// Full-screen DOM cards: title, still hungry, game over, ending.
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

import { MODES } from '../core/mode.js';

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

  title({ onStart, best, ach, onAchievements, mode = 'atari', artCount = 0, onMode }) {
    const btn = el('button', 'bf-btn', 'BEGIN THE SHOW');
    btn.onclick = onStart;
    const achBtn = el('button', 'bf-btn ghost', ach ? `ACHIEVEMENTS ${ach.count}/${ach.total}` : 'ACHIEVEMENTS');
    achBtn.onclick = onAchievements;

    const picker = el('div', 'bf-modes');
    for (const m of Object.values(MODES)) {
      const chosen = m.id === mode;
      const noArt = m.id === 'modern' && artCount === 0;
      const card = el('button', `bf-mode ${chosen ? 'on' : ''} ${noArt ? 'bare' : ''}`);
      card.append(
        el('div', 'bf-mode-kicker', m.kicker),
        el('div', 'bf-mode-title', m.title),
        el('div', 'bf-mode-body', m.body),
        el('div', 'bf-mode-tag', noArt
          ? 'NO PAINTED ART INSTALLED YET · LOOKS THE SAME FOR NOW'
          : (m.id === 'modern' ? `${artCount} PAINTED SPRITES INSTALLED` : m.tag)),
      );
      card.onclick = () => { if (!chosen) onMode?.(m.id); };
      picker.append(card);
    }
    this._show([
      el('div', 'bf-eyebrow', 'SWAMP BITCH REGISTRATION · NON-REFUNDABLE'),
      el('h1', 'bf-title', 'FROG<span>POCALYPSE</span>'),
      el('p', 'bf-body', 'You are a frog. You cross a road. You eat five bombs and explode, and each time you come back larger, until you are the size of the planet and the planet is the problem.'),
      el('div', 'bf-keys', '<b>← ↑ ↓ →</b> to hop &nbsp;·&nbsp; <b>SHIFT</b> to snap your tongue &nbsp;·&nbsp; on mobile, swipe to hop and tap to snap'),
      el('p', 'bf-note', 'Anything that explodes is food, even in mid-air. Everything else is just going to hurt you.'),
      picker,
      btn,
      achBtn,
      best ? el('div', 'bf-best', `PREVIOUS BEST: ${String(best).padStart(6, '0')}`) : el('div', 'bf-best', ''),
    ], 'title');
  }

  stillHungry(fuse, onContinue) {
    const btn = el('button', 'bf-btn', 'GO BACK IN');
    btn.onclick = onContinue;
    this._show([
      el('div', 'bf-eyebrow', 'ACHIEVEMENT: TECHNICALLY ALIVE'),
      el('h2', 'bf-title small', 'NO BOOM, NO GLORY'),
      el('p', 'bf-body', `You crossed with ${fuse} of 5. You did not explode. Do you know what an audience does when the frog fails to explode, you damp little disappointment? They change the channel. Get back in there and eat properly.`),
      btn,
    ], 'hungry');
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
      el('p', 'bf-body', `Flattened on ${stageName}. Four hundred billion viewers are already forgetting your name, and frankly so am I. Reward? Dead frogs don't get rewards. Season pass holders may retry immediately.`),
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
      el('div', 'bf-eyebrow', 'BROADCAST TERMINATED · NOTHING LEFT TO CROSS'),
      el('h2', 'bf-title', 'THE END'),
      el('p', 'bf-body', 'You ate every bomb they had, grew until the sky was too small for you, and sat on the planet like it was a beanbag. Ratings: unprecedented. Planet: unavailable. I really liked that. You are in so much trouble.'),
      el('div', 'bf-scoreline', `FINAL SCORE ${String(score).padStart(6, '0')}<br><span>BEST ${String(best).padStart(6, '0')}</span>`),
      share, achBtn, again,
      el('div', 'bf-note', 'Made by Blowing Frog. Yes, the frog always explodes. That is the whole point of the frog.'),
    ], 'ending');
  }
}
