/**
 * synth-engine.js
 *
 * Silnik zreverse-engineerowany z nagrania Daisy Bell (IBM 7094, 1961).
 *
 * Zmierzone parametry z pliku audio:
 *   F0 fundamentalny:   ~110-130 Hz (bardzo niski, basowy)
 *   Harmoniczne:         127, 189, 254, 320 Hz (szereg 1:1.5:2:2.5)
 *   Formant 1:          ~570 Hz  (wąski, Q≈12)
 *   Formant 2:          ~762 Hz  (wąski, Q≈10)
 *   Formant 3:          ~959 Hz  (wąski, Q≈8)
 *   Charakter:           ZERO vibrato, ZERO jitter, ZERO naturalności
 *                        Czyste harmoniki jak organ piszczałkowy
 *                        Mała ilość szumu między fonemami
 */
'use strict';

// ─── TABELA FONEMÓW ──────────────────────────────────────────────
// [skala_F1, skala_F2, skala_F3, czas_ms, typ, głośność]
// Skale odnoszą się do zmierzonych wartości: F1=570, F2=762, F3=959
const PH = {
  'a':  [1.40, 1.57, 2.61, 130, 'v', 1.0],
  'æ':  [1.16, 2.25, 2.51, 120, 'v', 1.0],
  'e':  [0.93, 2.41, 2.59, 110, 'v', 1.0],
  'ɛ':  [1.07, 2.49, 2.67, 115, 'v', 1.0],
  'i':  [0.53, 3.02, 3.13, 100, 'v', 0.9],
  'ɪ':  [0.70, 2.52, 2.66, 100, 'v', 0.9],
  'o':  [0.88, 0.92, 2.61, 115, 'v', 1.0],
  'ɔ':  [1.05, 1.05, 2.61, 115, 'v', 1.0],
  'u':  [0.53, 0.92, 2.29, 110, 'v', 0.85],
  'ʊ':  [0.70, 1.18, 2.40, 108, 'v', 0.9],
  'ʌ':  [1.23, 1.57, 2.61, 105, 'v', 1.0],
  'ə':  [1.05, 1.31, 2.61,  75, 'v', 0.75],
  'eɪ': [0.93, 2.41, 2.59, 140, 'v', 1.0],
  'aɪ': [1.40, 1.57, 2.61, 140, 'v', 1.0],
  'ɔɪ': [1.05, 1.05, 2.61, 140, 'v', 1.0],
  'm':  [0.44, 1.18, 2.29,  85, 'n', 0.6],
  'n':  [0.44, 2.23, 2.61,  85, 'n', 0.6],
  'ŋ':  [0.44, 1.05, 2.29,  85, 'n', 0.55],
  'l':  [0.70, 1.44, 2.61,  75, 'v', 0.7],
  'r':  [0.79, 1.57, 1.88,  75, 'v', 0.7],
  'w':  [0.53, 0.79, 2.29,  65, 'v', 0.65],
  'j':  [0.53, 2.89, 3.13,  65, 'v', 0.65],
  'b':  [0.35, 1.05, 2.61,  55, 's', 0.5],
  'd':  [0.35, 2.23, 2.61,  55, 's', 0.5],
  'g':  [0.35, 1.05, 2.61,  55, 's', 0.5],
  'v':  [0.70, 1.05, 2.61,  70, 'f', 0.55],
  'z':  [0.70, 2.36, 2.61,  75, 'f', 0.55],
  'ʒ':  [0.70, 2.36, 3.13,  75, 'f', 0.55],
  'p':  [0.35, 1.05, 2.61,  50, 's', 0.45],
  't':  [0.35, 2.23, 2.61,  50, 's', 0.45],
  'k':  [0.35, 1.05, 2.61,  55, 's', 0.45],
  'f':  [0.70, 1.05, 2.61,  70, 'f', 0.5],
  's':  [0.70, 2.36, 4.17,  80, 'f', 0.55],
  'ʃ':  [0.70, 2.36, 3.13,  80, 'f', 0.55],
  'tʃ': [0.70, 2.36, 3.13,  90, 'f', 0.55],
  'dʒ': [0.70, 2.36, 3.13,  90, 'f', 0.55],
  'h':  [0.88, 1.31, 2.61,  60, 'f', 0.45],
  'θ':  [0.70, 1.84, 2.61,  75, 'f', 0.45],
  'ð':  [0.70, 1.84, 2.61,  70, 'f', 0.5],
  ' ':  [0,0,0,  95, 'sil', 0],
  ',':  [0,0,0, 200, 'sil', 0],
  '.':  [0,0,0, 300, 'sil', 0],
  '!':  [0,0,0, 280, 'sil', 0],
  '?':  [0,0,0, 290, 'sil', 0],
  '-':  [0,0,0, 130, 'sil', 0],
  '\n': [0,0,0, 350, 'sil', 0],
};

// ─── GRAFEM → FONEM ───────────────────────────────────────────────
const G2P = [
  ['tch','tʃ'],['igh','aɪ'],
  ['ch','tʃ'],['sh','ʃ'],['th','ð'],['ph','f'],
  ['ck','k'],['ng','ŋ'],['wh','w'],['dg','dʒ'],
  ['ee','i'],['ea','i'],['oo','u'],['ou','ʌ'],
  ['ow','o'],['aw','ɔ'],['ew','u'],['oi','ɔɪ'],
  ['oa','o'],['ai','eɪ'],['ay','eɪ'],['ie','i'],
  ['ue','u'],['ui','u'],['ey','i'],
  ['a','æ'],['e','ɛ'],['i','ɪ'],['o','ɔ'],['u','ʊ'],['y','ɪ'],
  ['b','b'],['c','k'],['d','d'],['f','f'],['g','g'],
  ['h','h'],['j','dʒ'],['k','k'],['l','l'],['m','m'],
  ['n','n'],['p','p'],['q','k'],['r','r'],['s','s'],
  ['t','t'],['v','v'],['w','w'],['x','ks'],['z','z'],
];

function textToPhonemes(text) {
  const out = [];
  const lower = text.toLowerCase().replace(/[^a-z ,.\-!\?\n]/g,' ');
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    if (PH[ch]?.[4] === 'sil') { out.push(ch); i++; continue; }
    let matched = false;
    for (const [g, p] of G2P) {
      if (lower.substr(i, g.length) === g) {
        for (const ph of p) { if (PH[ph]) out.push(ph); }
        i += g.length; matched = true; break;
      }
    }
    if (!matched) i++;
  }
  return out;
}

// ─── ZMIERZONE FORMANTS BAZOWE (Daisy Bell IBM 7094) ─────────────
const BASE_F1 = 570;
const BASE_F2 = 762;
const BASE_F3 = 959;

// ─── KLASA GŁÓWNA ────────────────────────────────────────────────
class FormantSynth {
  constructor() {
    this.ctx = null; this.recorder = null;
    this.recChunks = []; this.recDest = null;
    this.playing = false; this._timer = null;
  }

  _ctx() {
    if (!this.ctx || this.ctx.state === 'closed')
      this.ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    return this.ctx;
  }

  _reverb(ctx, sec, decay) {
    const sr = ctx.sampleRate, len = Math.floor(sr * sec);
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, decay);
    }
    return buf;
  }

  _satCurve(amt) {
    const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i*2/n) - 1;
      c[i] = Math.tanh(x * (1 + amt * 4));
    }
    return c;
  }

  _chain(ctx, p) {
    const master = ctx.createGain();
    master.gain.value = 0.72;
    master.connect(ctx.destination);
    if (this.recDest) master.connect(this.recDest);

    const sat = ctx.createWaveShaper();
    sat.curve = this._satCurve(p.dist);
    sat.oversample = '4x';

    const conv = ctx.createConvolver();
    conv.buffer = this._reverb(ctx, p.reverbTime, p.reverbDecay);
    const convG = ctx.createGain();
    convG.gain.value = p.reverb;
    const dryG = ctx.createGain();
    dryG.gain.value = 1 - p.reverb * 0.6;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000 * p.formantShift;
    lp.Q.value = 0.5;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 80;

    // Chorus
    if (p.chorus > 0.05) {
      const del = ctx.createDelay(0.05);
      del.delayTime.value = 0.007 + p.chorus * 0.012;
      const choG = ctx.createGain();
      choG.gain.value = p.chorus * 0.4;
      hp.connect(del); del.connect(choG);
      choG.connect(conv); choG.connect(dryG);
    }

    // Ring mod
    let ringG = null;
    if (p.ringmod > 0) {
      const ringOsc = ctx.createOscillator();
      ringOsc.frequency.value = p.ringmod;
      ringOsc.type = 'sine';
      ringG = ctx.createGain();
      ringG.gain.value = 0.25;
      ringOsc.connect(ringG);
      ringOsc.start();
    }

    hp.connect(sat); sat.connect(lp);
    lp.connect(dryG); lp.connect(conv);
    conv.connect(convG);
    dryG.connect(master); convG.connect(master);

    return { input: hp, ringG };
  }

  _phoneme(ctx, ph, p, t0, chain) {
    const def = PH[ph];
    if (!def) return 0;
    const [sf1, sf2, sf3, durMs, type, vol] = def;
    const dur = Math.max(0.03, (durMs / 1000) / p.rate);
    if (type === 'sil') return dur;

    // F0: 120Hz × pitch (zmierzone z nagrania)
    const F0  = 120 * p.pitch;
    const det = p.detune * 100;
    const f1  = BASE_F1 * sf1 * p.formantShift;
    const f2  = BASE_F2 * sf2 * p.formantShift;
    const f3  = BASE_F3 * sf3 * p.formantShift;

    if (type === 'v') {
      // ── GŁOSKA DŹWIĘCZNA ──────────────────────────────────────
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = F0; osc.detune.value = det;
      if (p.jitter > 0.05) {
        const j = F0 * p.jitter * 0.03;
        osc.frequency.setValueAtTime(F0 - j * Math.random(), t0);
        osc.frequency.linearRampToValueAtTime(F0 + j * Math.random(), t0 + dur * 0.5);
        osc.frequency.linearRampToValueAtTime(F0, t0 + dur);
      }

      const h2 = ctx.createOscillator(); h2.type = 'sawtooth';
      h2.frequency.value = F0 * 2; h2.detune.value = det + 2;
      const h2g = ctx.createGain(); h2g.gain.value = p.harmonics * 0.30;

      const h3 = ctx.createOscillator(); h3.type = 'square';
      h3.frequency.value = F0 * 3; h3.detune.value = det - 2;
      const h3g = ctx.createGain(); h3g.gain.value = p.harmonics * 0.15;

      const h4 = ctx.createOscillator(); h4.type = 'triangle';
      h4.frequency.value = F0 * 4; h4.detune.value = det;
      const h4g = ctx.createGain(); h4g.gain.value = p.harmonics * 0.07;

      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass'; bp1.frequency.value = f1; bp1.Q.value = 12;
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass'; bp2.frequency.value = f2; bp2.Q.value = 10;
      const bp3 = ctx.createBiquadFilter();
      bp3.type = 'bandpass'; bp3.frequency.value = f3; bp3.Q.value = 8;
      const bp3g = ctx.createGain(); bp3g.gain.value = 0.35;

      if (p.noise > 0.02) {
        const nL = Math.ceil(ctx.sampleRate * dur);
        const nB = ctx.createBuffer(1, nL, ctx.sampleRate);
        const nd = nB.getChannelData(0);
        for (let i = 0; i < nL; i++) nd[i] = (Math.random()*2-1) * p.noise * 0.12;
        const nS = ctx.createBufferSource(); nS.buffer = nB;
        nS.connect(bp2); nS.start(t0); nS.stop(t0 + dur + 0.01);
      }

      const env = ctx.createGain();
      const att = Math.min(0.018, dur * 0.12);
      const rel = Math.min(0.030, dur * 0.18);
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(vol * 0.75, t0 + att);
      env.gain.setValueAtTime(vol * 0.70, t0 + dur - rel);
      env.gain.linearRampToValueAtTime(0, t0 + dur);
      if (chain.ringG) chain.ringG.connect(env.gain);

      osc.connect(bp1); osc.connect(bp2); osc.connect(bp3);
      h2.connect(h2g);  h2g.connect(bp1); h2g.connect(bp2);
      h3.connect(h3g);  h3g.connect(bp2);
      h4.connect(h4g);  h4g.connect(bp3);
      bp1.connect(env); bp2.connect(env);
      bp3.connect(bp3g); bp3g.connect(env);
      env.connect(chain.input);

      const stop = t0 + dur + 0.015;
      [osc,h2,h3,h4].forEach(o => { o.start(t0); o.stop(stop); });
    }

    else if (type === 'n') {
      // ── NASAL ─────────────────────────────────────────────────
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = F0; osc.detune.value = det;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = f1; bp.Q.value = 15;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(vol * 0.5, t0 + 0.015);
      env.gain.linearRampToValueAtTime(0, t0 + dur);
      osc.connect(bp); bp.connect(env); env.connect(chain.input);
      osc.start(t0); osc.stop(t0 + dur + 0.01);
    }

    else if (type === 'f') {
      // ── FRICATIVE ─────────────────────────────────────────────
      const nL = Math.ceil(ctx.sampleRate * (dur + 0.02));
      const nB = ctx.createBuffer(1, nL, ctx.sampleRate);
      const nd = nB.getChannelData(0);
      for (let i = 0; i < nL; i++) nd[i] = Math.random()*2-1;
      const nS = ctx.createBufferSource(); nS.buffer = nB;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = f2; bp.Q.value = 3.5;
      const lp2 = ctx.createBiquadFilter();
      lp2.type = 'lowpass'; lp2.frequency.value = f3 > 0 ? f3 : 5000;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(vol * 0.45, t0 + 0.01);
      env.gain.setValueAtTime(vol * 0.40, t0 + dur - 0.015);
      env.gain.linearRampToValueAtTime(0, t0 + dur);
      nS.connect(bp); bp.connect(lp2); lp2.connect(env); env.connect(chain.input);
      nS.start(t0); nS.stop(t0 + dur + 0.02);
    }

    else if (type === 's') {
      // ── STOP / PLOSIVE ────────────────────────────────────────
      const bL = Math.ceil(ctx.sampleRate * 0.022);
      const nB = ctx.createBuffer(1, bL, ctx.sampleRate);
      const nd = nB.getChannelData(0);
      for (let i = 0; i < bL; i++) nd[i] = Math.random()*2-1;
      const nS = ctx.createBufferSource(); nS.buffer = nB;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = f2 > 0 ? f2 : 1000; bp.Q.value = 3;
      const env = ctx.createGain();
      const bT = t0 + dur * 0.72;
      env.gain.setValueAtTime(0, bT);
      env.gain.linearRampToValueAtTime(vol * 0.6, bT + 0.008);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      nS.connect(bp); bp.connect(env); env.connect(chain.input);
      nS.start(bT); nS.stop(t0 + dur + 0.01);
    }

    return dur;
  }

  async speak(text, p) {
    this.stop();
    this.playing = true;
    const ctx = this._ctx();
    if (ctx.state === 'suspended') await ctx.resume();

    this.recDest = ctx.createMediaStreamDestination();
    this.recChunks = [];
    this.recorder = new MediaRecorder(this.recDest.stream);
    this.recorder.ondataavailable = e => { if (e.data.size > 0) this.recChunks.push(e.data); };
    this.recorder.start();

    const chain  = this._chain(ctx, p);
    const phones = textToPhonemes(text);

    let t = ctx.currentTime + 0.08;
    for (const ph of phones) {
      const d = this._phoneme(ctx, ph, p, t, chain);
      t += Math.max(0.018, d - 0.018);
    }
    t += 0.4;

    const ms = Math.max(200, (t - ctx.currentTime) * 1000 + 300);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      if (!this.playing) return;
      this.playing = false;
      try { if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop(); } catch(_) {}
      if (window.onSynthDone) window.onSynthDone();
    }, ms);

    return ms;
  }

  stop() {
    this.playing = false;
    clearTimeout(this._timer);
    try {
      if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    } catch(_) {}
    this.recorder = null;
    if (this.ctx) { this.ctx.close().then(() => { this.ctx = null; }); }
  }

  download() {
    if (!this.recChunks.length) return false;
    const blob = new Blob(this.recChunks, { type: 'audio/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ibm7094_' + Date.now() + '.webm';
    a.click();
    return true;
  }
}

window.synth = new FormantSynth();
