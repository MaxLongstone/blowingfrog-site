// Synthesized sound. No audio files, no network. Silent if WebAudio is unavailable.
export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) { this.ctx = new Ctor(); this.master = this.ctx.createGain(); this.master.gain.value = 0.28; this.master.connect(this.ctx.destination); }
    } catch (e) { this.ctx = null; }
  }
  unlock() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.28; }

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
    osc.connect(gain); gain.connect(this.master);
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
    src.connect(bq); bq.connect(gain); gain.connect(this.master);
    src.start(t0); src.stop(t0 + dur);
  }

  hop()    { this._tone(320, 0.09, { type: 'triangle', to: 620, vol: 0.35 }); }
  eat()    { this._tone(520, 0.07, { type: 'square', to: 900, vol: 0.4 }); this._tone(900, 0.06, { type: 'square', to: 1300, vol: 0.25, delay: 0.05 }); }
  food()   { this._tone(700, 0.06, { type: 'sine', to: 1000, vol: 0.3 }); }
  tick()   { this._tone(1400, 0.03, { type: 'square', vol: 0.18 }); }
  tongue() { this._tone(900, 0.05, { type: 'sawtooth', to: 300, vol: 0.22 }); }
  hit()    { this._tone(180, 0.22, { type: 'sawtooth', to: 60, vol: 0.5 }); this._noise(0.2, { vol: 0.4, filter: 1200, sweep: 200 }); }
  squash() { this._noise(0.16, { vol: 0.55, filter: 2200, sweep: 300 }); this._tone(120, 0.14, { type: 'square', to: 50, vol: 0.35 }); }
  boom()   {
    this._noise(1.5, { vol: 0.9, filter: 3000, sweep: 60 });
    this._tone(90, 1.2, { type: 'sawtooth', to: 28, vol: 0.7 });
    this._tone(200, 0.5, { type: 'square', to: 40, vol: 0.4, delay: 0.02 });
  }
  roar()   {
    this._tone(70, 1.1, { type: 'sawtooth', to: 130, vol: 0.6 });
    this._tone(105, 1.0, { type: 'square', to: 190, vol: 0.35, delay: 0.05 });
    this._noise(1.0, { vol: 0.35, filter: 700, sweep: 260 });
  }
  warn()   { this._tone(1100, 0.08, { type: 'square', vol: 0.2 }); this._tone(1100, 0.08, { type: 'square', vol: 0.2, delay: 0.14 }); }
  win()    { [523, 659, 784, 1046].forEach((f, i) => this._tone(f, 0.18, { type: 'square', vol: 0.35, delay: i * 0.1 })); }
  lose()   { [400, 330, 260, 160].forEach((f, i) => this._tone(f, 0.28, { type: 'sawtooth', vol: 0.4, delay: i * 0.14 })); }
}
