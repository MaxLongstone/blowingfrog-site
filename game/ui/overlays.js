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
    const btn = el('button', 'bf-btn', 'START');
    btn.onclick = onStart;
    this._show([
      el('div', 'bf-eyebrow', 'BLOWING FROG PRESENTS'),
      el('h1', 'bf-title', 'FROG<span>POCALYPSE</span>'),
      el('p', 'bf-body', 'Cross the highway. Eat five explosives. Detonate. Come back bigger. Keep going until you are the size of the planet.'),
      el('div', 'bf-keys', '<b>← ↑ ↓ →</b> or <b>WASD</b> to hop &nbsp;·&nbsp; <b>SPACE</b> to snap your tongue &nbsp;·&nbsp; on mobile, swipe to hop and tap to snap'),
      el('p', 'bf-note', 'Anything explosive can be eaten, even in mid-air. Anything else will hurt.'),
      btn,
      best ? el('div', 'bf-best', `BEST: ${String(best).padStart(6, '0')}`) : el('div', 'bf-best', ''),
    ], 'title');
  }

  stillHungry(fuse, onContinue) {
    const btn = el('button', 'bf-btn', 'GO BACK IN');
    btn.onclick = onContinue;
    this._show([
      el('div', 'bf-eyebrow', 'YOU MADE IT ACROSS'),
      el('h2', 'bf-title small', 'STILL HUNGRY'),
      el('p', 'bf-body', `You crossed with ${fuse} of 5 explosives. No boom, no growth. The traffic is getting worse anyway.`),
      btn,
    ], 'hungry');
  }

  stageCard(stage, size, onGo) {
    const btn = el('button', 'bf-btn', 'CONTINUE');
    btn.onclick = onGo;
    this._show([
      el('div', 'bf-eyebrow', `STAGE ${stage.id}`),
      el('h2', 'bf-title small', stage.name),
      el('p', 'bf-body', stage.subtitle),
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
      el('div', 'bf-eyebrow', 'SQUASHED'),
      el('h2', 'bf-title small', 'GAME OVER'),
      el('p', 'bf-body', `You died on ${stageName}. The highway wins this round.`),
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
      el('div', 'bf-eyebrow', 'CONGRATULATIONS, MONSTER'),
      el('h2', 'bf-title', 'THE END'),
      el('p', 'bf-body', 'You ate every bomb they threw at you, grew to the size of the world, and sat on it. There is nothing left to cross.'),
      el('div', 'bf-scoreline', `FINAL SCORE ${String(score).padStart(6, '0')}<br><span>BEST ${String(best).padStart(6, '0')}</span>`),
      share, again,
      el('div', 'bf-note', 'Made by Blowing Frog. Yes, the frog always explodes.'),
    ], 'ending');
  }
}
