/**
 * synth-engine.js
 * 
 * WŁASNY SILNIK FORMANTOWY — zero zewnętrznych API, zero ludzkiego głosu.
 * 
 * Jak działa prawdziwy syntezator mowy (IBM 7094 / eSpeak / Festival):
 * 
 * 1. GLOTTIS — oscylator piłokształtny = "wibracje strun głosowych"
 *    Każda samogłoska ma określoną CZĘSTOTLIWOŚĆ FUNDAMENTALNĄ (F0)
 * 
 * 2. FORMANTS — filtry pasmowoprzepustowe symulują rezonanse gardła/ust
 *    Każda głoska = unikalna kombinacja F1 + F2 + F3
 *    Np. "A" = F1:800Hz, F2:1200Hz, F3:2500Hz
 *        "I" = F1:300Hz, F2:2300Hz, F3:3000Hz
 *
 * 3. KONSONANTOWY SZUM — filtry na szum biały dla spółgłosek (s, f, sz...)
 *
 * 4. KOARTYKULACJA — płynne przejścia między fonemami (LFO na filtry)
 *
 * Wynik: mechaniczny, robotyczny głos który MÓWI SŁOWA — jak IBM 7094.
 */

'use strict';

// ─── TABLICA FONEMÓW (uproszczona angielsko-polska) ───────────────
// [F1, F2, F3, czas_ms, typ] typ: 'voiced'|'fricative'|'stop'|'nasal'|'silence'
const PHONEME_TABLE = {
  // SAMOGŁOSKI — klasyczne formants Petersona i Barneya
  'a':  [800, 1200, 2500, 120, 'voiced'],
  'æ':  [660, 1720, 2410, 110, 'voiced'],
  'e':  [530, 1840, 2480, 100, 'voiced'],
  'ɛ':  [610, 1900, 2560, 110, 'voiced'],
  'i':  [300, 2300, 3000, 90,  'voiced'],
  'ɪ':  [400, 1920, 2550, 90,  'voiced'],
  'o':  [500,  700, 2500, 110, 'voiced'],
  'ɔ':  [600,  800, 2500, 110, 'voiced'],
  'u':  [300,  700, 2200, 100, 'voiced'],
  'ʊ':  [400,  900, 2300, 100, 'voiced'],
  'ʌ':  [700, 1200, 2500, 100, 'voiced'],
  'ə':  [600, 1000, 2500, 70,  'voiced'], // schwa — najczęstszy fonem angielski

  // SPÓŁGŁOSKI DŹWIĘCZNE
  'b':  [200,  800, 2500, 60,  'stop'],
  'd':  [200, 1700, 2500, 60,  'stop'],
  'g':  [200,  800, 2500, 60,  'stop'],
  'v':  [400,  800, 2500, 70,  'fricative'],
  'z':  [400, 1700, 2500, 70,  'fricative'],
  'm':  [250,  900, 2200, 80,  'nasal'],
  'n':  [250, 1700, 2500, 80,  'nasal'],
  'ŋ':  [250,  800, 2200, 80,  'nasal'],
  'l':  [400, 1100, 2500, 70,  'voiced'],
  'r':  [450, 1200, 1800, 70,  'voiced'],
  'w':  [300,  600, 2200, 60,  'voiced'],
  'j':  [300, 2200, 3000, 60,  'voiced'],

  // SPÓŁGŁOSKI BEZDŹWIĘCZNE
  'p':  [200,  800, 2500, 50,  'stop'],
  't':  [200, 1700, 2500, 50,  'stop'],
  'k':  [200,  800, 2500, 50,  'stop'],
  'f':  [400,  800, 2500, 70,  'fricative'],
  's':  [400, 1800, 4000, 80,  'fricative'],
  'ʃ':  [400, 1800, 3000, 80,  'fricative'],  // sz
  'tʃ': [400, 1800, 3000, 90,  'fricative'],  // cz
  'h':  [500, 1000, 2500, 60,  'fricative'],
  'θ':  [400, 1400, 2500, 70,  'fricative'],  // th

  // PAUZY
  ' ':  [0, 0, 0, 90,  'silence'],
  ',':  [0, 0, 0, 180, 'silence'],
  '.':  [0, 0, 0, 280, 'silence'],
  '!':  [0, 0, 0, 250, 'silence'],
  '?':  [0, 0, 0, 260, 'silence'],
  '-':  [0, 0, 0, 120, 'silence'],
};

// ─── REGUŁY GRAFEM→FONEM (angielski uproszczony) ──────────────────
// Kolejność ważna — dłuższe dopasowania pierwsze
const G2P_RULES = [
  // digraphs i trigraphs
  ['tch', 'tʃ'], ['ch',  'tʃ'], ['sh',  'ʃ'],  ['th',  'θ'],
  ['ph',  'f'],  ['ck',  'k'],  ['ng',  'ŋ'],  ['wh',  'w'],
  ['ee',  'i'],  ['ea',  'i'],  ['oo',  'u'],  ['ou',  'ʌ'],
  ['ow',  'o'],  ['aw',  'ɔ'],  ['ew',  'u'],  ['oi',  'ɔɪ'],
  ['igh', 'i'],  ['oa',  'o'],  ['ai',  'e'],  ['ay',  'e'],
  ['ie',  'i'],  ['ue',  'u'],  ['ui',  'u'],

  // samogłoski przed 'e' na końcu (magic-e)
  ['ae',  'e'],  ['oe',  'o'],  ['ue',  'u'],

  // pojedyncze litery
  ['a',   'æ'],  ['e',   'ɛ'],  ['i',   'ɪ'],  ['o',   'ɔ'],
  ['u',   'ʊ'],  ['y',   'ɪ'],
  ['b',   'b'],  ['c',   'k'],  ['d',   'd'],  ['f',   'f'],
  ['g',   'g'],  ['h',   'h'],  ['j',   'dʒ'], ['k',   'k'],
  ['l',   'l'],  ['m',   'm'],  ['n',   'n'],  ['p',   'p'],
  ['q',   'k'],  ['r',   'r'],  ['s',   's'],  ['t',   't'],
  ['v',   'v'],  ['w',   'w'],  ['x',   'ks'], ['z',   'z'],
];

function textToPhonemes(text) {
  const phonemes = [];
  let i = 0;
  const lower = text.toLowerCase();

  while (i < lower.length) {
    const ch = lower[i];

    // Interpunkcja i spacje
    if (PHONEME_TABLE[ch] && 'silence' === PHONEME_TABLE[ch][4]) {
      phonemes.push(ch);
      i++;
      continue;
    }

    // Szukaj najdłuższego pasującego digraphu
    let matched = false;
    for (const [graph, phone] of G2P_RULES) {
      if (lower.substr(i, graph.length) === graph) {
        // Rozbij wieloznakowy fonem
        for (const p of phone) {
          if (PHONEME_TABLE[p]) phonemes.push(p);
        }
        i += graph.length;
        matched = true;
        break;
      }
    }
    if (!matched) i++;
  }
  return phonemes;
}

// ─── GŁÓWNY SYNTEZATOR ────────────────────────────────────────────
class FormantSynth {
  constructor() {
    this.ctx       = null;
    this.recorder  = null;
    this.recChunks = [];
    this.recDest   = null;
    this.playing   = false;
    this.stopReq   = false;
  }

  getCtx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  }

  // Buduje łańcuch FX: wejście → formants → dist → LP → reverb → wyjście
  buildChain(ctx, params) {
    const master = ctx.createGain();
    master.gain.value = 0.75;
    master.connect(ctx.destination);
    if (this.recDest) master.connect(this.recDest);

    // Reverb
    const conv   = ctx.createConvolver();
    conv.buffer  = this._makeReverb(ctx, params.reverbTime, params.reverbDecay);
    const convG  = ctx.createGain();
    convG.gain.value = params.reverb;
    conv.connect(convG);
    convG.connect(master);

    // Dry gain
    const dryG = ctx.createGain();
    dryG.gain.value = 1 - params.reverb * 0.5;
    dryG.connect(master);

    // Distortion / overdrive
    const dist = ctx.createWaveShaper();
    dist.curve      = this._distCurve(params.dist * 300);
    dist.oversample = '4x';
    dist.connect(dryG);

    // Globalny LP — odcina "cyfrowe" szczyty
    const lp = ctx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 3500 * Math.max(0.3, params.pitch);
    lp.Q.value         = 0.7;
    lp.connect(dist);

    // HP — usuwa niski hum
    const hp = ctx.createBiquadFilter();
    hp.type            = 'highpass';
    hp.frequency.value = 50;
    hp.connect(lp);

    // Ringmod / tremolo dla metalicznego charakteru
    const ringLFO  = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ringLFO.frequency.value = params.ringmod;
    ringGain.gain.value     = params.ringmod > 0 ? 0.3 : 0;
    ringLFO.connect(ringGain);
    ringLFO.start();

    // Chorus / detune
    const chorusDelay = ctx.createDelay(0.05);
    chorusDelay.delayTime.value = 0.008 + params.chorus * 0.015;
    const chorusGain  = ctx.createGain();
    chorusGain.gain.value = params.chorus;
    hp.connect(chorusDelay);
    chorusDelay.connect(chorusGain);
    chorusGain.connect(dryG);
    chorusGain.connect(conv);

    hp.connect(conv);

    return { input: hp, ringGain, ringLFO };
  }

  // Synteza pojedynczego fonemu
  _synthPhoneme(ctx, phoneme, params, startTime, chain) {
    const ph = PHONEME_TABLE[phoneme];
    if (!ph) return 0;

    const [F1, F2, F3, durBase, type] = ph;

    // Czas trwania skalowany przez rate
    const dur = (durBase / 1000) / params.rate;
    if (type === 'silence') return dur;

    const f0 = 110 * params.pitch; // Częstotliwość fundamentalna

    // ─ VOICED (samogłoski, sonoranty) ─
    if (type === 'voiced' || type === 'nasal') {
      // Główny oscylator — piłokształtny (bogaty w harmoniczne)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f0, startTime);
      // Lekki pitch wobble — naturalny jitter głosu
      osc.frequency.linearRampToValueAtTime(
        f0 * (1 + params.jitter * (Math.random() - 0.5) * 0.04),
        startTime + dur
      );
      osc.detune.value = params.detune * 100;

      // Harmoniczna 2 — kwadrat (imparzysty charakter)
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = f0 * 2;
      osc2.detune.value    = params.detune * 100 + 5;
      const osc2G = ctx.createGain();
      osc2G.gain.value = params.harmonics * 0.18;

      // Harmoniczna 3
      const osc3 = ctx.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.value = f0 * 3;
      osc3.detune.value    = params.detune * 100 - 3;
      const osc3G = ctx.createGain();
      osc3G.gain.value = params.harmonics * 0.09;

      // Formant F1
      const bp1 = ctx.createBiquadFilter();
      bp1.type            = 'bandpass';
      bp1.frequency.value = F1 * params.formantShift;
      bp1.Q.value         = 7;

      // Formant F2
      const bp2 = ctx.createBiquadFilter();
      bp2.type            = 'bandpass';
      bp2.frequency.value = F2 * params.formantShift;
      bp2.Q.value         = 9;

      // Formant F3 (mniejszy wpływ, daje "barwę")
      const bp3 = ctx.createBiquadFilter();
      bp3.type            = 'bandpass';
      bp3.frequency.value = F3 * params.formantShift;
      bp3.Q.value         = 6;
      const bp3G = ctx.createGain();
      bp3G.gain.value = 0.3;

      // Envelope (ADSR)
      const env = ctx.createGain();
      const att = Math.min(0.025, dur * 0.15);
      const rel = Math.min(0.04,  dur * 0.2);
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(0.7, startTime + att);
      env.gain.setValueAtTime(0.65, startTime + dur - rel);
      env.gain.linearRampToValueAtTime(0, startTime + dur);

      // Connect
      osc.connect(bp1); osc.connect(bp2); osc.connect(bp3);
      osc2.connect(osc2G); osc2G.connect(bp1); osc2G.connect(bp2);
      osc3.connect(osc3G); osc3G.connect(bp2);
      bp1.connect(env); bp2.connect(env);
      bp3.connect(bp3G); bp3G.connect(env);
      env.connect(chain.input);
      // Ringmod
      chain.ringGain.connect(env.gain);

      osc.start(startTime);  osc.stop(startTime + dur + 0.01);
      osc2.start(startTime); osc2.stop(startTime + dur + 0.01);
      osc3.start(startTime); osc3.stop(startTime + dur + 0.01);
    }

    // ─ FRICATIVE (s, f, sz, h...) ─
    else if (type === 'fricative') {
      const bufLen  = Math.ceil(ctx.sampleRate * (dur + 0.01));
      const nBuf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const nData   = nBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nData[i] = Math.random() * 2 - 1;

      const nSrc = ctx.createBufferSource();
      nSrc.buffer = nBuf;

      // Filtruj szum przez pasmo fonemu
      const bp = ctx.createBiquadFilter();
      bp.type            = 'bandpass';
      bp.frequency.value = (F2 > 0 ? F2 : 3000) * params.formantShift;
      bp.Q.value         = 4;

      const lp2 = ctx.createBiquadFilter();
      lp2.type            = 'lowpass';
      lp2.frequency.value = F3 > 0 ? F3 * params.formantShift : 5000;

      const env = ctx.createGain();
      const att = Math.min(0.01, dur * 0.1);
      const rel = Math.min(0.02, dur * 0.15);
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(0.5, startTime + att);
      env.gain.setValueAtTime(0.45, startTime + dur - rel);
      env.gain.linearRampToValueAtTime(0, startTime + dur);

      nSrc.connect(bp);
      bp.connect(lp2);
      lp2.connect(env);
      env.connect(chain.input);

      nSrc.start(startTime);
      nSrc.stop(startTime + dur + 0.01);
    }

    // ─ STOP (p, b, t, d, k, g) — krótki puls + release ─
    else if (type === 'stop') {
      // Burst szumu
      const bufLen = Math.ceil(ctx.sampleRate * 0.025);
      const nBuf   = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const nd     = nBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = nBuf;

      const bp = ctx.createBiquadFilter();
      bp.type            = 'bandpass';
      bp.frequency.value = (F2 > 0 ? F2 : 1000) * params.formantShift;
      bp.Q.value         = 3;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, startTime + dur * 0.7);
      env.gain.linearRampToValueAtTime(0.6, startTime + dur * 0.75);
      env.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      nSrc.connect(bp);
      bp.connect(env);
      env.connect(chain.input);
      nSrc.start(startTime + dur * 0.7);
      nSrc.stop(startTime + dur + 0.01);
    }

    return dur;
  }

  // Budowa impulsu pogłosu
  _makeReverb(ctx, dur = 2.5, decay = 3) {
    const sr  = ctx.sampleRate;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // Krzywa dystorsji
  _distCurve(amount) {
    const n = 512, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // ── GŁÓWNA FUNKCJA: syntetyzuj tekst ─────────────────────────────
  async speak(text, params) {
    this.stop();
    this.stopReq = false;
    this.playing = true;

    const ctx = this.getCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    // Recorder
    this.recDest   = ctx.createMediaStreamDestination();
    this.recChunks = [];
    this.recorder  = new MediaRecorder(this.recDest.stream);
    this.recorder.ondataavailable = e => { if (e.data.size > 0) this.recChunks.push(e.data); };
    this.recorder.start();

    // FX chain
    const chain = this.buildChain(ctx, params);

    // Tekst → fonemy
    const phonemes = textToPhonemes(text);

    // Oblicz całkowitą długość
    let t = ctx.currentTime + 0.05;
    for (const ph of phonemes) {
      if (this.stopReq) break;
      const dur = this._synthPhoneme(ctx, ph, params, t, chain);
      t += dur;
      // Koartykulacja: mały overlap między fonemami
      t -= 0.008;
    }
    t += 0.3; // ogon

    // Zatrzymaj recorder gdy skończymy
    const msUntilEnd = Math.max(100, (t - ctx.currentTime) * 1000 + 200);
    this._endTimer = setTimeout(() => {
      if (this.playing && !this.stopReq) {
        this.playing = false;
        chain.ringLFO.stop();
        if (this.recorder && this.recorder.state !== 'inactive') {
          this.recorder.stop();
        }
        if (window.onSynthDone) window.onSynthDone();
      }
    }, msUntilEnd);

    return msUntilEnd;
  }

  stop() {
    this.stopReq = false;
    this.playing = false;
    clearTimeout(this._endTimer);
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    if (this.ctx) {
      this.ctx.close().then(() => { this.ctx = null; });
    }
  }

  download() {
    if (!this.recChunks.length) return false;
    const blob = new Blob(this.recChunks, { type: 'audio/webm' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'ibm7094_' + Date.now() + '.webm';
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}

window.synth = new FormantSynth();
