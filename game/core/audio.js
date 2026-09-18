// Sound. Four buses into one master: the original synthesized effects (still
// the fallback, and what ATARI mode sounds like), recorded sound effects,
// voice lines, and looping music that ducks while anyone is talking.
// Everything is silent, never broken, if WebAudio or a file is unavailable.
import { LEVELS } from '../config/media.js';

const CACHE_LIMIT = 12;   // decoded voice/music buffers kept around

export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.realSfx = true;
    this.sfxBuffers = new Map();     // name -> decoded AudioBuffer
    this.buffers = new Map();        // url -> Promise<AudioBuffer|null>, insertion-ordered LRU
    this.voice = null;               // { src, url }
    this.voiceQueue = [];
    this._voiceToken = 0;
    this._voiceLoading = false;
    this.music = null;               // { url, src, gain }
    this._musicToken = 0;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) {
        this.ctx = new Ctor();
        const bus = (value, to) => { const g = this.ctx.createGain(); g.gain.value = value; g.connect(to); return g; };
        this.master = bus(1, this.ctx.destination);
        this.synthBus = bus(LEVELS.synth, this.master);
        this.sfxBus = bus(LEVELS.sfx, this.master);
        this.voiceBus = bus(LEVELS.voice, this.master);
        this.musicDuck = bus(1, this.master);
        this.musicBus = bus(LEVELS.music, this.musicDuck);
      }
    } catch (e) { this.ctx = null; }
    // Browsers only allow sound after a gesture, so wake up on the first one.
    if (this.ctx && typeof window !== 'undefined') {
      const wake = () => this.unlock();
      for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, wake, { passive: true });
    }
  }

  unlock() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 1; }
  useRealSfx(on) { this.realSfx = !!on; }
  get voiceBusy() { return !!this.voice || this._voiceLoading; }

  // ---- decoding -----------------------------------------------------------
  _decode(bytes) {
    return new Promise((resolve, reject) => this.ctx.decodeAudioData(bytes, resolve, reject));
  }
  _fetchBuffer(url) {
    return fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
      .then((b) => this._decode(b));
  }
  // Voice and music: cached by url, oldest evicted, a failure is not remembered.
  _buf(url) {
    if (!this.ctx) return Promise.resolve(null);
    let p = this.buffers.get(url);
    if (p) { this.buffers.delete(url); this.buffers.set(url, p); return p; }
    p = this._fetchBuffer(url).catch((err) => {
      console.debug('[bf] audio unavailable:', url, err?.message || err);
      this.buffers.delete(url);
      return null;
    });
    this.buffers.set(url, p);
    while (this.buffers.size > CACHE_LIMIT) this.buffers.delete(this.buffers.keys().next().value);
    return p;
  }
  prefetch(url) { this._buf(url); }

  // Sound effects are tiny and used constantly, so they are decoded once, up front.
  loadSfx(names, urlFor) {
    if (!this.ctx) return Promise.resolve();
    return Promise.all(names.map((n) => this._fetchBuffer(urlFor(n))
      .then((b) => this.sfxBuffers.set(n, b))
      .catch((err) => console.debug('[bf] sfx unavailable:', n, err?.message || err))));
  }
  _playSample(name, gain) {
    const b = this.sfxBuffers.get(name);
    if (!this.ctx || this.muted || !b) return false;
    const src = this.ctx.createBufferSource(); src.buffer = b;
    const g = this.ctx.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(this.sfxBus);
    src.start();
    return true;
  }
  // A gameplay sound: the recording when allowed and loaded, else false so the
  // caller falls back to its synthesized version.
  _real(name) { return this.realSfx && this._playSample(name, 1); }
  // Cutscene extras are always the recordings.
  playSfx(name, { gain = 1 } = {}) { return this._playSample(name, gain); }

  // ---- voice --------------------------------------------------------------
  // policy 'interrupt' (default): story narration cuts whatever was speaking.
  // policy 'queue': waits its turn -- achievement callouts shouldn't talk over anyone.
  playVoice(url, { onstart, onend, policy = 'interrupt' } = {}) {
    if (!this.ctx) { onend?.(); return Promise.resolve(null); }
    if (policy === 'queue' && this.voiceBusy) {
      this.voiceQueue.push([url, { onstart, onend, policy: 'interrupt' }]);
      if (this.voiceQueue.length > 3) this.voiceQueue.shift();
      return Promise.resolve(null);
    }
    this.voiceQueue.length = 0;
    this._stopCurrentVoice();
    const token = ++this._voiceToken;
    this._voiceLoading = true;
    return this._buf(url).then((buf) => {
      if (token !== this._voiceToken) return null;          // a newer line took over while this loaded
      this._voiceLoading = false;
      if (!buf) { onend?.(); this._nextVoice(); return null; }
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      src.connect(this.voiceBus);
      this.voice = { src, url };
      this._duckMusic(true);
      src.onended = () => {
        if (this.voice?.src !== src) return;
        this.voice = null; this._duckMusic(false);
        onend?.();
        this._nextVoice();
      };
      src.start();
      onstart?.(buf.duration);
      return buf.duration;
    });
  }
  _nextVoice() {
    const next = this.voiceQueue.shift();
    if (next) this.playVoice(next[0], next[1]);
  }
  _stopCurrentVoice() {
    const v = this.voice;
    if (!v) return;
    this.voice = null;
    v.src.onended = null;
    try { v.src.stop(); } catch { /* already finished */ }
  }
  stopVoice() {
    this._voiceToken++;
    this._voiceLoading = false;
    this._stopCurrentVoice();
    this._duckMusic(false);
    this._nextVoice();
  }

  // ---- music --------------------------------------------------------------
  _duckMusic(on) {
    if (!this.ctx) return;
    const to = on ? LEVELS.musicDucked / LEVELS.music : 1;
    this.musicDuck.gain.setTargetAtTime(to, this.ctx.currentTime, 0.15);
  }
  _fadeOutCurrentMusic(fade) {
    const m = this.music;
    if (!m) return;
    this.music = null;
    const t = this.ctx.currentTime;
    m.gain.gain.cancelScheduledValues(t);
    m.gain.gain.setValueAtTime(m.gain.gain.value, t);
    m.gain.gain.linearRampToValueAtTime(0, t + fade);
    try { m.src.stop(t + fade + 0.05); } catch { /* not started */ }
  }
  playMusic(url, { fade = 1.2 } = {}) {
    if (!this.ctx || this.music?.url === url) return;
    const token = ++this._musicToken;
    this._fadeOutCurrentMusic(fade);
    this._buf(url).then((buf) => {
      if (token !== this._musicToken || !buf) return;
      const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const g = this.ctx.createGain();
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + fade);
      src.connect(g); g.connect(this.musicBus);
      src.start();
      this.music = { url, src, gain: g };
    });
  }
  stopMusic({ fade = 0.7 } = {}) {
    if (!this.ctx) return;
    this._musicToken++;
    this._fadeOutCurrentMusic(fade);
  }

  // ---- synthesized effects ------------------------------------------------
  _tone(freq, dur, { type = 'square', to = null, vol = 0.5, delay = 0 } = {}) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(this.synthBus);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  _noise(dur, { vol = 0.5, filter = 900, sweep = null, delay = 0 } = {}) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const bq = this.ctx.createBiquadFilter(); bq.type = 'lowpass';
    bq.frequency.setValueAtTime(filter, t0);
    if (sweep) bq.frequency.exponentialRampToValueAtTime(Math.max(60, sweep), t0 + dur);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bq); bq.connect(gain); gain.connect(this.synthBus);
    src.start(t0); src.stop(t0 + dur);
  }

  hop()    { if (this._real('hop')) return; this._tone(320, 0.09, { type: 'triangle', to: 620, vol: 0.35 }); }
  eat()    { if (this._real('eat')) return; this._tone(520, 0.07, { type: 'square', to: 900, vol: 0.4 }); this._tone(900, 0.06, { type: 'square', to: 1300, vol: 0.25, delay: 0.05 }); }
  food()   { if (this._real('food')) return; this._tone(700, 0.06, { type: 'sine', to: 1000, vol: 0.3 }); }
  tick()   { if (this._real('tick')) return; this._tone(1400, 0.03, { type: 'square', vol: 0.18 }); }
  tongue() { if (this._real('tongue')) return; this._tone(900, 0.05, { type: 'sawtooth', to: 300, vol: 0.22 }); }
  hit()    { if (this._real('hit')) return; this._tone(180, 0.22, { type: 'sawtooth', to: 60, vol: 0.5 }); this._noise(0.2, { vol: 0.4, filter: 1200, sweep: 200 }); }
  squash() { if (this._real('squash')) return; this._noise(0.16, { vol: 0.55, filter: 2200, sweep: 300 }); this._tone(120, 0.14, { type: 'square', to: 50, vol: 0.35 }); }
  boom()   {
    if (this._real('boom')) return;
    this._noise(1.5, { vol: 0.9, filter: 3000, sweep: 60 });
    this._tone(90, 1.2, { type: 'sawtooth', to: 28, vol: 0.7 });
    this._tone(200, 0.5, { type: 'square', to: 40, vol: 0.4, delay: 0.02 });
  }
  roar()   {
    if (this._real('roar')) return;
    this._tone(70, 1.1, { type: 'sawtooth', to: 130, vol: 0.6 });
    this._tone(105, 1.0, { type: 'square', to: 190, vol: 0.35, delay: 0.05 });
    this._noise(1.0, { vol: 0.35, filter: 700, sweep: 260 });
  }
  warn()   { if (this._real('warn')) return; this._tone(1100, 0.08, { type: 'square', vol: 0.2 }); this._tone(1100, 0.08, { type: 'square', vol: 0.2, delay: 0.14 }); }
  win()    { if (this._real('win')) return; [523, 659, 784, 1046].forEach((f, i) => this._tone(f, 0.18, { type: 'square', vol: 0.35, delay: i * 0.1 })); }
  lose()   { if (this._real('lose')) return; [400, 330, 260, 160].forEach((f, i) => this._tone(f, 0.28, { type: 'sawtooth', vol: 0.4, delay: i * 0.14 })); }
}
