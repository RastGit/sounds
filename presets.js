/**
 * presets.js — 20 presetów, wszystkie parametry działają na silniku
 *
 * pitch        — częstotliwość fundamentalna (0.2–1.5)
 * rate         — tempo mówienia (0.3–1.8)
 * detune       — przestrojenie w semitonach (-36–+12)
 * formantShift — przesuwa F1/F2/F3 (0.4–2.0)
 * harmonics    — siła harmonicznych (0.0–1.0)
 * dist         — dystorsja / overdrive (0.0–1.0)
 * reverb       — pogłos (0.0–1.0)
 * reverbTime   — długość pogłosu w sek (0.5–4.0)
 * reverbDecay  — zanik pogłosu (1.0–5.0)
 * ringmod      — ring modulator Hz — metaliczny charakter (0–80)
 * chorus       — chorus / unison (0.0–1.0)
 * jitter       — niestabilność pitch — "ludzkość" (0.0–1.0)
 */

window.PRESETS = [
  {
    name:'IBM 7094', desc:'oryginał 1961',
    pitch:0.85, rate:0.68, detune:-8,  formantShift:1.0,
    harmonics:0.5, dist:0.15, reverb:0.55, reverbTime:2.5, reverbDecay:3.0,
    ringmod:0, chorus:0.1, jitter:0.2,
  },
  {
    name:'HAL 9000', desc:'2001: odyseja',
    pitch:0.82, rate:0.60, detune:-10, formantShift:0.95,
    harmonics:0.4, dist:0.10, reverb:0.60, reverbTime:3.0, reverbDecay:3.5,
    ringmod:0, chorus:0.05, jitter:0.1,
  },
  {
    name:'ANDROID', desc:'czysty robot',
    pitch:1.00, rate:0.80, detune:0,   formantShift:1.1,
    harmonics:0.8, dist:0.40, reverb:0.20, reverbTime:1.0, reverbDecay:2.0,
    ringmod:30, chorus:0.0, jitter:0.0,
  },
  {
    name:'DEMON', desc:'ultra-niski',
    pitch:0.38, rate:0.44, detune:-24, formantShift:0.6,
    harmonics:0.7, dist:0.55, reverb:0.80, reverbTime:3.5, reverbDecay:2.5,
    ringmod:15, chorus:0.2, jitter:0.3,
  },
  {
    name:'VOID', desc:'pustka',
    pitch:0.22, rate:0.26, detune:-36, formantShift:0.5,
    harmonics:0.6, dist:0.40, reverb:0.97, reverbTime:4.0, reverbDecay:2.0,
    ringmod:5,  chorus:0.15, jitter:0.15,
  },
  {
    name:'DYING', desc:'konający',
    pitch:0.30, rate:0.30, detune:-30, formantShift:0.65,
    harmonics:0.55, dist:0.30, reverb:0.70, reverbTime:3.0, reverbDecay:3.0,
    ringmod:0, chorus:0.3, jitter:0.7,
  },
  {
    name:'LOBOTOMY', desc:'wolne myśli',
    pitch:0.32, rate:0.26, detune:-28, formantShift:0.7,
    harmonics:0.5, dist:0.25, reverb:0.96, reverbTime:3.8, reverbDecay:2.2,
    ringmod:0, chorus:0.1, jitter:0.5,
  },
  {
    name:'CRYPT', desc:'krypta',
    pitch:0.44, rate:0.40, detune:-22, formantShift:0.75,
    harmonics:0.6, dist:0.30, reverb:0.92, reverbTime:3.5, reverbDecay:2.8,
    ringmod:8, chorus:0.05, jitter:0.25,
  },
  {
    name:'GHOST', desc:'przezroczysty',
    pitch:1.35, rate:0.58, detune:0,   formantShift:1.3,
    harmonics:0.2, dist:0.10, reverb:0.90, reverbTime:3.8, reverbDecay:1.8,
    ringmod:0, chorus:0.5, jitter:0.4,
  },
  {
    name:'ASYLUM', desc:'szpital',
    pitch:0.72, rate:0.50, detune:-20, formantShift:0.85,
    harmonics:0.65, dist:0.35, reverb:0.85, reverbTime:3.2, reverbDecay:2.5,
    ringmod:12, chorus:0.15, jitter:0.4,
  },
  {
    name:'CAVE ECHO', desc:'jaskinia',
    pitch:0.70, rate:0.50, detune:-14, formantShift:0.9,
    harmonics:0.45, dist:0.20, reverb:0.95, reverbTime:4.0, reverbDecay:2.0,
    ringmod:0, chorus:0.0, jitter:0.2,
  },
  {
    name:'GLITCH', desc:'błąd systemu',
    pitch:1.10, rate:1.25, detune:6,   formantShift:1.6,
    harmonics:0.9, dist:0.90, reverb:0.20, reverbTime:0.8, reverbDecay:4.0,
    ringmod:60, chorus:0.0, jitter:0.8,
  },
  {
    name:'REACTOR', desc:'nuklearny',
    pitch:0.58, rate:0.55, detune:-18, formantShift:0.8,
    harmonics:0.85, dist:0.80, reverb:0.50, reverbTime:2.0, reverbDecay:2.5,
    ringmod:40, chorus:0.1, jitter:0.3,
  },
  {
    name:'STATIC', desc:'zakłócenia',
    pitch:0.90, rate:0.65, detune:-4,  formantShift:1.0,
    harmonics:0.3, dist:0.70, reverb:0.40, reverbTime:1.5, reverbDecay:3.5,
    ringmod:50, chorus:0.0, jitter:0.6,
  },
  {
    name:'OVERCLOCK', desc:'szybki demon',
    pitch:0.52, rate:0.95, detune:-10, formantShift:0.85,
    harmonics:0.9, dist:0.75, reverb:0.60, reverbTime:2.0, reverbDecay:2.5,
    ringmod:25, chorus:0.2, jitter:0.2,
  },
  {
    name:'RADIO', desc:'stare radio',
    pitch:0.95, rate:0.70, detune:-5,  formantShift:1.1,
    harmonics:0.5, dist:0.60, reverb:0.30, reverbTime:1.2, reverbDecay:3.0,
    ringmod:0, chorus:0.0, jitter:0.15,
  },
  {
    name:'TELEPHONE', desc:'telefon horror',
    pitch:1.00, rate:0.75, detune:-2,  formantShift:1.5,
    harmonics:0.55, dist:0.65, reverb:0.20, reverbTime:0.8, reverbDecay:4.0,
    ringmod:0, chorus:0.0, jitter:0.1,
  },
  {
    name:'BROADCAST', desc:'nadawanie',
    pitch:1.15, rate:0.88, detune:2,   formantShift:1.2,
    harmonics:0.4, dist:0.30, reverb:0.35, reverbTime:1.5, reverbDecay:2.8,
    ringmod:0, chorus:0.05, jitter:0.1,
  },
  {
    name:'CHORUS', desc:'chór demonów',
    pitch:0.55, rate:0.42, detune:-16, formantShift:0.75,
    harmonics:0.85, dist:0.55, reverb:0.88, reverbTime:3.5, reverbDecay:2.3,
    ringmod:20, chorus:0.8, jitter:0.5,
  },
  {
    name:'MUTANT', desc:'mutacja',
    pitch:0.62, rate:0.48, detune:-19, formantShift:0.72,
    harmonics:0.75, dist:0.60, reverb:0.75, reverbTime:2.8, reverbDecay:2.6,
    ringmod:18, chorus:0.3, jitter:0.65,
  },
];
