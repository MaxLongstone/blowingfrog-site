/* ======================================
   BLOWING FROG — APP.JS
   ====================================== */

// ——————————————————————
// Custom Cursor
// ——————————————————————
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = 0, my = 0, cx = 0, cy = 0;

if (cursor && cursorDot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });
  (function tick() {
    cx += (mx - cx) * 0.11;
    cy += (my - cy) * 0.11;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();

  // Expand on interactive elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .service-card, .gallery-item, .team-card')) {
      cursor.classList.add('expanded');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .service-card, .gallery-item, .team-card')) {
      cursor.classList.remove('expanded');
    }
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorDot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorDot.style.opacity = '1'; });
}

// ——————————————————————
// Theme Toggle
// ——————————————————————
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  const saved = localStorage.getItem('bf-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  themeBtn.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bf-theme', next);
  });
}

// ——————————————————————
// Nav scroll (sub-pages)
// ——————————————————————
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ——————————————————————
// Mobile hamburger menu (button is in HTML; JS builds overlay + wires toggle)
// ——————————————————————
(function () {
  const burger = document.getElementById('navHamburger');
  if (!burger) return;

  // Build overlay dynamically
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobileMenu';

  [
    { href: 'about.html',    label: 'About Us' },
    { href: 'services.html', label: 'Services' },
    { href: 'contact.html',  label: 'Contact'  },
  ].forEach(({ href, label }) => {
    const a = document.createElement('a');
    a.href = href;
    a.className = 'mobile-menu-link';
    a.textContent = label;
    menu.appendChild(a);
  });

  const foot = document.createElement('div');
  foot.className = 'mobile-menu-footer';
  foot.textContent = 'blowingfrog.com';
  menu.appendChild(foot);
  document.body.appendChild(menu);

  const open  = () => { menu.classList.add('open');    burger.classList.add('open');    document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; };

  burger.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  menu.querySelectorAll('.mobile-menu-link').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ——————————————————————
// Scroll Reveal
// ——————————————————————
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        ro.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  // rAF ensures layout is settled before first intersection check
  requestAnimationFrame(() => revealEls.forEach(el => ro.observe(el)));
}

// ——————————————————————
// Active nav link
// ——————————————————————
const path = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (
    (href.includes('about')    && path.includes('about'))   ||
    (href.includes('services') && path.includes('services'))||
    (href.includes('contact')  && path.includes('contact'))
  ) link.classList.add('active');
});

// ——————————————————————
// Horizontal Slide System (index only)
// ——————————————————————
const track     = document.getElementById('slidesTrack');
const btnPrev   = document.getElementById('navPrev');
const btnNext   = document.getElementById('navNext');
const cntCur    = document.getElementById('counterCurrent');
const cntBar    = document.getElementById('counterBar');
const cntTotal  = document.getElementById('counterTotal');

if (track) {
  const slides  = Array.from(track.querySelectorAll('.slide'));
  const total   = slides.length;
  let current   = 0;
  let animating = false;

  if (cntTotal) cntTotal.textContent = String(total).padStart(2, '0');

  // Mark videos ready when loaded
  slides.forEach(slide => {
    const vid = slide.querySelector('.slide-video');
    if (vid) {
      vid.addEventListener('loadeddata', () => vid.classList.add('loaded'));
      // If already loaded (cached)
      if (vid.readyState >= 2) vid.classList.add('loaded');
    }
  });

  function goTo(idx) {
    if (animating || idx < 0 || idx >= total || idx === current) return;
    animating = true;

    const prev = current;
    current = idx;

    // Move track
    track.style.transform = `translateX(-${current * 100}vw)`;

    // Active class
    slides[prev].classList.remove('active');
    slides[current].classList.add('active');

    // Video: pause old, play new
    const vPrev = slides[prev].querySelector('.slide-video');
    const vNext = slides[current].querySelector('.slide-video');
    if (vPrev) { vPrev.pause(); vPrev.currentTime = 0; }
    if (vNext)  vNext.play().catch(() => {});

    // Counter
    if (cntCur) cntCur.textContent = String(current + 1).padStart(2, '0');
    if (cntBar) cntBar.style.width = `${((current + 1) / total) * 100}%`;

    // Arrows
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === total - 1;

    setTimeout(() => { animating = false; }, 950);
  }

  // Init — boot first slide with every possible play trigger
  slides[0].classList.add('active');
  const firstVid = slides[0].querySelector('.slide-video');
  if (firstVid) {
    firstVid.muted = true; // ensure muted programmatically too
    firstVid.setAttribute('preload', 'auto');

    const tryPlay = () => { const p = firstVid.play(); if (p) p.catch(() => {}); };

    // Earliest possible attempt
    firstVid.autoplay = true;
    firstVid.setAttribute('autoplay', '');
    document.addEventListener('DOMContentLoaded', tryPlay, { once: true });

    // Immediate attempt + every readiness event
    tryPlay();
    ['canplay', 'canplaythrough', 'loadedmetadata', 'loadeddata'].forEach(evt =>
      firstVid.addEventListener(evt, tryPlay, { once: true })
    );

    // After full page load
    window.addEventListener('load', tryPlay);

    // Page becomes visible (tab switch / browser restore)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && current === 0) tryPlay();
    });

    // Guaranteed fallback: first user interaction on the page
    const interactionEvents = ['mousedown', 'touchstart', 'keydown', 'scroll', 'mousemove'];
    const playOnInteraction = () => {
      tryPlay();
      interactionEvents.forEach(e => document.removeEventListener(e, playOnInteraction));
    };
    interactionEvents.forEach(e =>
      document.addEventListener(e, playOnInteraction, { once: false, passive: true })
    );
  }
  if (cntBar) cntBar.style.width = `${(1 / total) * 100}%`;
  if (btnPrev) btnPrev.disabled = true;

  // Arrow buttons
  btnPrev?.addEventListener('click', () => goTo(current - 1));
  btnNext?.addEventListener('click', () => goTo(current + 1));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    goTo(current - 1);
  });

  // Touch / swipe
  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  // Mouse-wheel → horizontal
  let wTimer;
  window.addEventListener('wheel', e => {
    e.preventDefault();
    clearTimeout(wTimer);
    wTimer = setTimeout(() => {
      if (e.deltaX > 30 || e.deltaY > 30)  goTo(current + 1);
      if (e.deltaX < -30 || e.deltaY < -30) goTo(current - 1);
    }, 40);
  }, { passive: false });
}

// ——————————————————————
// Intro Splash Sequence
// ——————————————————————
(function () {
  const intro   = document.getElementById('intro');
  if (!intro) return;

  // Web Audio whoosh SFX — no external file needed
  function playWhoosh() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t  = i / ctx.sampleRate;
        const env = Math.exp(-t * 4.5);              // envelope decay
        data[i]  = (Math.random() * 2 - 1) * env;   // white noise × decay
      }
      const src    = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      filter.type            = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value         = 0.6;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      src.buffer = buf;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (e) { /* AudioContext not available — silent */ }
  }

  // Sequence timing:
  //   0.8s  → fade out logo
  //   1.4s  → open curtains + play whoosh
  //   2.6s  → hide intro entirely

  setTimeout(() => {
    intro.classList.add('logo-fade');
  }, 800);

  setTimeout(() => {
    intro.classList.add('curtains-open');
    playWhoosh();
  }, 1400);

  setTimeout(() => {
    intro.classList.add('done');
    intro.remove();
  }, 2600);
})();

// ——————————————————————
// Instagram Float Button (all pages)
// ——————————————————————
(function () {
  var a = document.createElement('a');
  a.href = 'https://www.instagram.com/blowingfrog';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'ig-float';
  a.setAttribute('aria-label', '@blowingfrog on Instagram');
  a.innerHTML = '<img src="assets/files Icons/InstagramICON.png" alt="Instagram"><span class="ig-handle">@blowingfrog</span>';
  document.body.appendChild(a);
})();

// ——————————————————————
// Blog nav link (inject into every nav)
// ——————————————————————
(function () {
  var links = document.querySelector('.nav-links');
  if (!links) return;
  // Only add if not already present
  if (links.querySelector('[href="blog.html"]')) return;
  var a = document.createElement('a');
  a.href = 'blog.html';
  a.className = 'nav-link' + (window.location.pathname.includes('blog') ? ' active' : '');
  a.textContent = 'Blog';
  links.appendChild(a);
  // Also add to mobile menu if it exists
  var mob = document.getElementById('mobileMenu');
  if (mob) {
    var ma = document.createElement('a');
    ma.href = 'blog.html';
    ma.className = 'mobile-menu-link';
    ma.textContent = 'Blog';
    var footer = mob.querySelector('.mobile-menu-footer');
    if (footer) mob.insertBefore(ma, footer);
  }
})();
