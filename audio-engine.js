/**
 * audio-engine.js
 * Handles:
 *  1. eSpeak-NG synthesis → PCM audio buffer
 *  2. Web Audio FX chain (pitch, formant filters, distortion, reverb)
 *  3. MediaRecorder capture → downloadable WAV/WebM
 */

let actx        = null;
let recorder    = null;
let recChunks   = [];
let recDest     = null;
let stopFlag    = false;
let isSpeaking  = false;
let currentNodes = [];

// ── AUDIO CONTEXT ───────────────────────────────────────────────
function getCtx() {
  if (!actx || actx.state === 'closed') {
    actx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return actx;
}

// ── REVERB IMPULSE ───────────────────────────────────────────────
function makeReverb(ctx, durSec = 2.5, decay = 2.8) {
  const sr  = ctx.sampleRate;
  const len = Math.floor(sr * durSec);
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

// ── DISTORTION CURVE ─────────────────────────────────────────────
function makeDistCurve(amount) {
  const n = 512, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// ── BUILD FX CHAIN ───────────────────────────────────────────────
function buildFxChain(ctx, dest, p) {
  // Master
  const master = ctx.createGain();
  master.gain.value = 0.82;
  master.connect(dest);
  master.connect(ctx.destination);

  // Reverb
  const conv    = ctx.createConvolver();
  conv.buffer   = makeReverb(ctx, 2.5, 2.8);
  const verbG   = ctx.createGain();
  verbG.gain.value = p.verb;
  conv.connect(verbG);
  verbG.connect(master);

  // Dry chain
  const dryG = ctx.createGain();
  dryG.gain.value = 1 - p.verb * 0.45;
  dryG.connect(master);

  // Distortion
  const wshaper = ctx.createWaveShaper();
  wshaper.curve = makeDistCurve(p.dist * 240);
  wshaper.oversample = '4x';

  // Formant filters (vowel colouring)
  const bpF1 = ctx.createBiquadFilter();
  bpF1.type      = 'bandpass';
  bpF1.frequency.value = p.formant * 0.55;
  bpF1.Q.value   = 6;

  const bpF2 = ctx.createBiquadFilter();
  bpF2.type      = 'bandpass';
  bpF2.frequency.value = p.formant * 1.4;
  bpF2.Q.value   = 10;

  const bpMix = ctx.createGain();
  bpMix.gain.value = 0.5;

  // Low-pass to cut harsh highs (retro band-limit)
  const lp = ctx.createBiquadFilter();
  lp.type      = 'lowpass';
  lp.frequency.value = 3800 * p.pitch;
  lp.Q.value   = 0.8;

  // High-pass to remove rumble
  const hp = ctx.createBiquadFilter();
  hp.type      = 'highpass';
  hp.frequency.value = 60;

  // Chain: bpF1+bpF2 → bpMix → wshaper → lp → hp → dryG
  bpF1.connect(bpMix);
  bpF2.connect(bpMix);
  bpMix.connect(wshaper);
  wshaper.connect(lp);
  lp.connect(hp);
  hp.connect(dryG);

  return { bpF1, bpF2, conv, input: bpF1 };
}

// ── MAIN SYNTHESIZE ──────────────────────────────────────────────
async function synthesize() {
  const txt = document.getElementById('txt').value.trim();
  if (!txt) { setStatus('ERR: INPUT EMPTY', 'err'); return; }

  stopAll();
  stopFlag   = false;
  isSpeaking = true;
  document.getElementById('synBtn').classList.add('going');
  document.getElementById('dlBtn').disabled = true;
  setStatus('SYNTHESIZING...', 'act');
  drawWave(true);

  const p = getParams();

  // ── eSPEAK PATH ─────────────────────────────────────────────
  if (window.eSpeakReady && window.eSpeakNG) {
    try {
      await synthesizeEspeak(txt, p);
      return;
    } catch(e) {
      console.warn('eSpeak failed, falling back:', e);
    }
  }

  // ── FALLBACK: Web Speech API + heavy FX ─────────────────────
  await synthesizeFallback(txt, p);
}

// ── eSpeak SYNTHESIS ─────────────────────────────────────────────
async function synthesizeEspeak(txt, p) {
  setStatus('eSPEAK ENGINE RUNNING...', 'act');

  const eng = window.eSpeakNG;

  // eSpeak parameters
  eng.set_rate(Math.round(80 * p.rate));          // words-per-min style
  eng.set_pitch(Math.round(35 * p.pitch));        // 0-99
  eng.set_volume(90);
  eng.set_voice('en');                            // English formant voice

  // Synthesize to PCM Int16 array
  const pcm16 = eng.synthesize(txt);             // Int16Array, 22050 Hz mono

  if (!pcm16 || pcm16.length === 0) {
    throw new Error('eSpeak returned empty audio');
  }

  const ctx  = getCtx();
  if (ctx.state === 'suspended') await ctx.resume();

  const sr     = 22050;
  const frames = pcm16.length;

  // Convert Int16 → Float32
  const float32 = new Float32Array(frames);
  for (let i = 0; i < frames; i++) float32[i] = pcm16[i] / 32768;

  // Pitch-shift via playback rate (detune)
  const buf = ctx.createBuffer(1, frames, sr);
  buf.getChannelData(0).set(float32);

  // Setup recorder
  recDest   = ctx.createMediaStreamDestination();
  recChunks = [];
  recorder  = new MediaRecorder(recDest.stream);
  recorder.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data); };
  recorder.onstop = onRecordingDone;
  recorder.start();

  // Build FX chain
  const { bpF1, bpF2, input } = buildFxChain(ctx, recDest, p);

  // Source
  const src = ctx.createBufferSource();
  src.buffer          = buf;
  src.playbackRate.value = p.pitch;
  src.detune.value    = p.detune * 100;

  src.connect(bpF1);
  src.connect(bpF2);

  src.onended = () => {
    if (!stopFlag) {
      isSpeaking = false;
      document.getElementById('synBtn').classList.remove('going');
      drawWave(false);
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    }
  };

  src.start();
  currentNodes = [src];

  const durMs = (frames / sr / p.pitch) * 1000 + 400;
  setStatus(`PLAYING ▸ ${(durMs/1000).toFixed(1)}s`, 'act');
}

// ── FALLBACK: Web Speech + AudioWorklet trick ─────────────────────
// Since we can't tap Web Speech output directly, we use a gain node
// trick: play silence through AudioContext to keep recorder alive,
// and use SpeechSynthesisUtterance with the heaviest possible effects.
async function synthesizeFallback(txt, p) {
  setStatus('FALLBACK: WEB SPEECH + FX', 'act');

  if (!('speechSynthesis' in window)) {
    setStatus('ERR: NO SPEECH API', 'err');
    isSpeaking = false;
    return;
  }

  window.speechSynthesis.cancel();

  const utter        = new SpeechSynthesisUtterance(txt);
  utter.pitch        = Math.max(0.1, Math.min(2, p.pitch * 0.55));
  utter.rate         = Math.max(0.1, Math.min(2, p.rate  * 0.65));
  utter.volume       = 1;

  // Pick best male/robot voice
  const voices = window.speechSynthesis.getVoices();
  const pick   = voices.find(v =>
    /david|george|mark|james|daniel|microsoft/i.test(v.name) && v.lang.startsWith('en')
  ) || voices.find(v => v.lang.startsWith('en'));
  if (pick) utter.voice = pick;

  utter.onstart = () => setStatus('TRANSMITTING...', 'act');
  utter.onend   = () => {
    isSpeaking = false;
    document.getElementById('synBtn').classList.remove('going');
    drawWave(false);
    setStatus('DONE (FALLBACK MODE — DOWNLOAD N/A)', '');
  };
  utter.onerror = e => {
    setStatus('ERR: ' + e.error, 'err');
    isSpeaking = false;
    document.getElementById('synBtn').classList.remove('going');
    drawWave(false);
  };

  window.speechSynthesis.speak(utter);
}

// ── STOP ─────────────────────────────────────────────────────────
function stopAll() {
  stopFlag   = true;
  isSpeaking = false;
  window.speechSynthesis && window.speechSynthesis.cancel();

  currentNodes.forEach(n => { try { n.stop(); } catch(_){} });
  currentNodes = [];

  if (recorder && recorder.state === 'recording') recorder.stop();

  if (actx) {
    actx.close().then(() => { actx = null; });
  }

  document.getElementById('synBtn').classList.remove('going');
  drawWave(false);
  setStatus('STOPPED ■');
}

// ── RECORDING DONE ───────────────────────────────────────────────
function onRecordingDone() {
  document.getElementById('dlBtn').disabled = false;
  setStatus('COMPLETE ▸ READY TO DOWNLOAD', 'act');
}

// ── DOWNLOAD ─────────────────────────────────────────────────────
function downloadAudio() {
  if (!recChunks.length) {
    setStatus('ERR: NOTHING RECORDED — SYNTHESIZE FIRST', 'err');
    return;
  }
  const blob = new Blob(recChunks, { type: 'audio/webm' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'ibm7094_' + Date.now() + '.webm';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('DOWNLOADING ▸ OPEN IN AUDACITY TO EXPORT .WAV', 'act');
}
