// The Influencer's ad card. It sits over the top of the playfield without
// blocking it (only the skip button takes clicks), reveals her words as the
// recording plays, and closes itself when she runs out of breath.
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

export function showAd({ root, tier, cfg, text, onSkip }) {
  const card = el('div', `bf-ad t${tier}`);
  const skip = el('button', 'bf-ad-x', 'SKIP AD ✕');
  skip.type = 'button';
  const top = el('div', 'bf-ad-top');
  top.append(el('span', 'bf-ad-tag', cfg.tag), skip);

  const avatar = el('div', 'bf-ad-avatar');
  avatar.append(el('span', '', cfg.avatar));
  if (cfg.art) {                      // a painted portrait, when one has been made
    const art = document.createElement('img');
    art.alt = ''; art.src = cfg.art;
    art.onload = () => avatar.classList.add('art');
    art.onerror = () => art.remove();
    avatar.append(art);
  }

  const handle = el('div', 'bf-ad-handle');
  handle.append(document.createTextNode(cfg.handle));
  if (cfg.badge) handle.append(el('b', 'live', cfg.badge));
  const copy = el('p', 'bf-ad-copy');
  const bar = el('div', 'bf-ad-bar'); const fill = el('i'); bar.append(fill);
  const main = el('div', 'bf-ad-main'); main.append(handle, copy);
  const body = el('div', 'bf-ad-body'); body.append(avatar, main);
  card.append(top, body, bar);
  root.append(card);

  let done = false;
  let ticker = null;
  const words = text.split(/\s+/);
  const close = (delay = 0) => {
    if (done) return;
    done = true;
    clearInterval(ticker);
    window.removeEventListener('keydown', onKey);
    setTimeout(() => { card.classList.add('out'); setTimeout(() => card.remove(), 260); }, delay * 1000);
  };
  const onKey = (e) => { if (e.key === 'Escape') { onSkip?.(); close(); } };
  skip.onclick = (e) => { e.stopPropagation(); onSkip?.(); close(); };
  window.addEventListener('keydown', onKey);

  // Start revealing her words across `seconds` (the length of the recording).
  const start = (seconds) => {
    if (done) return;
    const t0 = performance.now();
    fill.style.animation = `bf-ad-run ${seconds}s linear forwards`;
    copy.textContent = '';
    ticker = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / 1000 / (seconds * 0.92));
      copy.textContent = words.slice(0, Math.max(1, Math.ceil(words.length * k))).join(' ');
      if (k >= 1) clearInterval(ticker);
    }, 90);
  };

  return { start, close, get closed() { return done; } };
}
