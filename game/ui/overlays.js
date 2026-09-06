// Full-screen DOM cards: title, still hungry, game over, ending.
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

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
    requestAnimationFrame(() => this.node.classList.add('in'));
  }
  hide() { this.node.classList.remove('in'); this.node.style.display = 'none'; }

  title(onStart, best) {
    const btn = el('button', 'bf-btn', 'BEGIN THE SHOW');
    btn.onclick = onStart;
    this._show([
      el('div', 'bf-eyebrow', 'CONTESTANT REGISTRATION · NON-REFUNDABLE'),
      el('h1', 'bf-title', 'FROG<span>POCALYPSE</span>'),
      el('p', 'bf-body', 'You are a frog. You cross a road. You eat five bombs and explode, and each time you come back larger, until you are the size of the planet and the planet is the problem.'),
      el('div', 'bf-keys', '<b>← ↑ ↓ →</b> to hop &nbsp;·&nbsp; <b>SHIFT</b> to snap your tongue &nbsp;·&nbsp; on mobile, swipe to hop and tap to snap'),
      el('p', 'bf-note', 'Anything that explodes is food, even in mid-air. Everything else is just going to hurt you.'),
      btn,
      best ? el('div', 'bf-best', `PREVIOUS BEST: ${String(best).padStart(6, '0')}`) : el('div', 'bf-best', ''),
    ], 'title');
  }

  stillHungry(fuse, onContinue) {
    const btn = el('button', 'bf-btn', 'GO BACK IN');
    btn.onclick = onContinue;
    this._show([
      el('div', 'bf-eyebrow', 'ACHIEVEMENT: TECHNICALLY ALIVE'),
      el('h2', 'bf-title small', 'NO BOOM, NO GLORY'),
      el('p', 'bf-body', `You crossed with ${fuse} of 5. You did not explode. Do you know what an audience does when the frog fails to explode, Crawler? They change the channel. Get back in there and eat properly.`),
      btn,
    ], 'hungry');
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

  gameOver(score, best, stageName, onRetry, onTitle) {
    const retry = el('button', 'bf-btn', 'TRY AGAIN');
    retry.onclick = onRetry;
    const home = el('button', 'bf-btn ghost', 'BACK TO TITLE');
    home.onclick = onTitle;
    this._show([
      el('div', 'bf-eyebrow', 'ACHIEVEMENT: ROADKILL'),
      el('h2', 'bf-title small', 'AND THAT IS THE EPISODE'),
      el('p', 'bf-body', `Flattened on ${stageName}. Four hundred billion viewers are already forgetting your name, and frankly so am I. Reward? Corpses don't get rewards. Season pass holders may retry immediately.`),
      el('div', 'bf-scoreline', `SCORE ${String(score).padStart(6, '0')}<br><span>BEST ${String(best).padStart(6, '0')}</span>`),
      retry, home,
    ], 'over');
  }

  ending(score, best, onShare, onReplay) {
    const share = el('button', 'bf-btn', 'SHARE');
    share.onclick = onShare;
    const again = el('button', 'bf-btn ghost', 'PLAY AGAIN');
    again.onclick = onReplay;
    this._show([
      el('div', 'bf-eyebrow', 'BROADCAST TERMINATED · NOTHING LEFT TO CROSS'),
      el('h2', 'bf-title', 'THE END'),
      el('p', 'bf-body', 'You ate every bomb they had, grew until the sky was too small for you, and sat on the planet like it was a beanbag. Ratings: unprecedented. Planet: unavailable. I really liked that. You are in so much trouble.'),
      el('div', 'bf-scoreline', `FINAL SCORE ${String(score).padStart(6, '0')}<br><span>BEST ${String(best).padStart(6, '0')}</span>`),
      share, again,
      el('div', 'bf-note', 'Made by Blowing Frog. Yes, the frog always explodes. That is the whole point of the frog.'),
    ], 'ending');
  }
}
