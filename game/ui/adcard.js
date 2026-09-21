// The Influencer's ad card. It sits over the top of the playfield without
// blocking it (only the skip button takes clicks), reveals her words as the
// recording plays, and closes itself when she runs out of breath.
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

export function showAd({ root, tier, cfg, text, onSkip, resist = null }) {
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

  // Her painted portrait pops out of the corner of the card; the emoji circle is the fallback.
  if (cfg.art) {
    const portrait = document.createElement('img');
    portrait.className = 'bf-ad-portrait'; portrait.alt = ''; portrait.src = cfg.art;
    portrait.onload = () => card.classList.add('has-portrait');
    portrait.onerror = () => portrait.remove();
    card.append(portrait);
  }
  (cfg.products || []).forEach((p) => { new Image().src = p.img; });     // ready before she holds it up

  const handle = el('div', 'bf-ad-handle');
  handle.append(document.createTextNode(cfg.handle));
  if (cfg.badge) handle.append(el('b', 'live', cfg.badge));
  const copy = el('p', 'bf-ad-copy');
  const bar = el('div', 'bf-ad-bar'); const fill = el('i'); bar.append(fill);
  const main = el('div', 'bf-ad-main'); main.append(handle, copy);
  const body = el('div', 'bf-ad-body'); body.append(avatar, main);
  card.prepend(top, body, bar);
  root.append(card);

  let done = false;
  let ticker = null;
  const timers = [];
  // She holds up one product at a time, in a shuffled order, with its (satirical) price.
  const products = (cfg.products || []).slice().sort(() => Math.random() - 0.5);
  let nextProduct = 0;
  const showProduct = () => {
    if (done || !products.length) return;
    const item = products[nextProduct++ % products.length];
    const sticker = el('div', 'bf-ad-prod');
    const img = document.createElement('img');
    img.alt = ''; img.src = item.img; img.onerror = () => sticker.remove();
    const label = el('span'); label.textContent = item.label;
    sticker.style.setProperty('--tilt', `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    sticker.append(img, label);
    card.append(sticker);
    timers.push(setTimeout(() => sticker.classList.add('out'), 2700), setTimeout(() => sticker.remove(), 3000));
    timers.push(setTimeout(showProduct, 4000));
  };
  const words = text.split(/\s+/);
  const close = (delay = 0) => {
    if (done) return;
    done = true;
    clearInterval(ticker);
    timers.forEach(clearTimeout);
    window.removeEventListener('keydown', onKey);
    setTimeout(() => { card.classList.add('out'); setTimeout(() => card.remove(), 260); }, delay * 1000);
  };
  const onKey = (e) => { if (e.key === 'Escape') trySkip(); };
  // Skipping. Late in the game she fights it: each click is an outburst until she
  // has been clicked as many times as she was going to allow this time.
  let clicks = 0, lastOutburst = -1, calmAt = 0;
  const trySkip = () => {
    if (resist && clicks < resist.tries) {
      clicks += 1;
      const i = resist.pick(lastOutburst); lastOutburst = i;
      copy.textContent = resist.outbursts[i];
      calmAt = performance.now() + 3200;                 // hold her words back while she is in a mood
      card.classList.remove('freak'); void card.offsetWidth; card.classList.add('freak');
      skip.textContent = resist.labels[Math.floor(Math.random() * resist.labels.length)];
      resist.onBlocked?.(clicks);
      return;
    }
    onSkip?.(); close();
  };
  skip.onclick = (e) => { e.stopPropagation(); trySkip(); };
  window.addEventListener('keydown', onKey);

  // Start revealing her words across `seconds` (the length of the recording).
  const start = (seconds) => {
    if (done) return;
    const t0 = performance.now();
    fill.style.animation = `bf-ad-run ${seconds}s linear forwards`;
    timers.push(setTimeout(showProduct, 900));
    copy.textContent = '';
    ticker = setInterval(() => {
      if (performance.now() < calmAt) return;
      card.classList.remove('freak');
      const k = Math.min(1, (performance.now() - t0) / 1000 / (seconds * 0.92));
      copy.textContent = words.slice(0, Math.max(1, Math.ceil(words.length * k))).join(' ');
      if (k >= 1) clearInterval(ticker);
    }, 90);
  };

  return { start, close, get closed() { return done; } };
}
