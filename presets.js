/**
 * presets.js
 * 20 horror voice presets.
 * Each preset maps directly to the slider parameters in ui.js.
 *
 * pitch   : playback rate multiplier (0.2 – 1.5)
 * rate    : speech rate multiplier   (0.2 – 1.4)
 * detune  : semitone detune          (-36 – +12)
 * formant : formant filter center Hz (200 – 2000)
 * dist    : distortion amount        (0 – 1)
 * verb    : reverb wet mix           (0 – 1)
 * noise   : noise injection          (0 – 0.6) [not used in eSpeak path but shown]
 */

window.PRESETS = [
  // ── CLASSIC ──────────────────────────────────────────────────────
  { name:'IBM 7094',   desc:'oryginał',        pitch:0.85, rate:0.68, detune:-8,  formant:900,  dist:0.15, verb:0.55 },
  { name:'HAL 9000',   desc:'spokojna śmierć', pitch:0.82, rate:0.62, detune:-10, formant:850,  dist:0.10, verb:0.60 },
  { name:'ANDROID',    desc:'robot',           pitch:1.00, rate:0.80, detune: 0,  formant:1100, dist:0.40, verb:0.25 },

  // ── DEEP HORROR ──────────────────────────────────────────────────
  { name:'DEMON',      desc:'ultra-niski',     pitch:0.38, rate:0.44, detune:-24, formant:400,  dist:0.55, verb:0.80 },
  { name:'VOID',       desc:'pustka',          pitch:0.22, rate:0.26, detune:-36, formant:280,  dist:0.40, verb:0.97 },
  { name:'DYING',      desc:'konający',        pitch:0.30, rate:0.30, detune:-30, formant:350,  dist:0.30, verb:0.70 },
  { name:'LOBOTOMY',   desc:'wolne myśli',     pitch:0.32, rate:0.26, detune:-28, formant:320,  dist:0.25, verb:0.96 },
  { name:'CRYPT',      desc:'krypta',          pitch:0.44, rate:0.40, detune:-22, formant:500,  dist:0.30, verb:0.92 },

  // ── GHOSTLY ──────────────────────────────────────────────────────
  { name:'GHOST',      desc:'przezroczysty',   pitch:1.35, rate:0.58, detune: 0,  formant:1200, dist:0.10, verb:0.90 },
  { name:'ASYLUM',     desc:'szpital',         pitch:0.72, rate:0.50, detune:-20, formant:650,  dist:0.35, verb:0.85 },
  { name:'CAVE ECHO',  desc:'jaskinia',        pitch:0.70, rate:0.50, detune:-14, formant:700,  dist:0.20, verb:0.95 },

  // ── DAMAGED / GLITCH ─────────────────────────────────────────────
  { name:'GLITCH',     desc:'błąd systemu',    pitch:1.10, rate:1.25, detune: 6,  formant:1500, dist:0.90, verb:0.20 },
  { name:'REACTOR',    desc:'nuklearny',       pitch:0.58, rate:0.55, detune:-18, formant:600,  dist:0.80, verb:0.50 },
  { name:'STATIC',     desc:'zakłócenia',      pitch:0.90, rate:0.65, detune:-4,  formant:800,  dist:0.70, verb:0.40 },
  { name:'OVERCLOCK',  desc:'szybki demon',    pitch:0.52, rate:0.95, detune:-10, formant:750,  dist:0.75, verb:0.60 },

  // ── TRANSMISSION ─────────────────────────────────────────────────
  { name:'RADIO',      desc:'stare radio',     pitch:0.95, rate:0.70, detune:-5,  formant:1000, dist:0.60, verb:0.30 },
  { name:'TELEPHONE',  desc:'telefon horror',  pitch:1.00, rate:0.75, detune:-2,  formant:1800, dist:0.65, verb:0.20 },
  { name:'BROADCAST',  desc:'nadawanie',       pitch:1.15, rate:0.88, detune: 2,  formant:1300, dist:0.30, verb:0.35 },

  // ── CHORUS / MASS ────────────────────────────────────────────────
  { name:'CHORUS',     desc:'chór demonów',    pitch:0.55, rate:0.42, detune:-16, formant:550,  dist:0.55, verb:0.88 },
  { name:'MUTANT',     desc:'mutacja',         pitch:0.62, rate:0.48, detune:-19, formant:450,  dist:0.60, verb:0.75 },
];
