/**
 * presets.js
 * 
 * Preset IBM 7094 ustawiony na ZMIERZONE wartości z nagrania Daisy Bell:
 *   pitch=1.0   → F0=120Hz (zmierzono ~110-130Hz)
 *   formantShift=1.0 → F1=570Hz, F2=762Hz, F3=959Hz (zmierzono)
 *   harmonics=0.6    → wyraźny szereg harmoniczny (127,189,254,320Hz)
 *   dist=0.08        → mała saturacja (analogowe zniekształcenia taśmy)
 *   reverb=0.35      → suche laboratorium komputerowe
 *   jitter=0.0       → ZERO niestabilności — maszyna, nie człowiek
 *   noise=0.03       → minimalny szum między fonemami
 */
window.PRESETS = [
  // ── ORYGINAŁY ─────────────────────────────────────────────────
  {
    name:'IBM 7094', desc:'Daisy Bell 1961',
    pitch:1.0, rate:0.70, detune:0, formantShift:1.0,
    harmonics:0.60, dist:0.08, reverb:0.35, reverbTime:1.2, reverbDecay:4.0,
    ringmod:0, chorus:0.0, jitter:0.0, noise:0.03,
  },
  {
    name:'HAL 9000', desc:'2001: Odyseja',
    pitch:0.88, rate:0.62, detune:-5, formantShift:0.97,
    harmonics:0.50, dist:0.06, reverb:0.42, reverbTime:1.5, reverbDecay:3.8,
    ringmod:0, chorus:0.0, jitter:0.0, noise:0.02,
  },
  {
    name:'ANDROID', desc:'czysty robot',
    pitch:1.05, rate:0.80, detune:0, formantShift:1.10,
    harmonics:0.80, dist:0.35, reverb:0.18, reverbTime:0.8, reverbDecay:4.0,
    ringmod:28, chorus:0.0, jitter:0.0, noise:0.0,
  },

  // ── DEEP HORROR ───────────────────────────────────────────────
  {
    name:'DEMON', desc:'ultra-niski',
    pitch:0.38, rate:0.44, detune:-24, formantShift:0.60,
    harmonics:0.70, dist:0.55, reverb:0.80, reverbTime:3.5, reverbDecay:2.5,
    ringmod:15, chorus:0.20, jitter:0.30, noise:0.10,
  },
  {
    name:'VOID', desc:'pustka',
    pitch:0.22, rate:0.26, detune:-36, formantShift:0.50,
    harmonics:0.60, dist:0.40, reverb:0.97, reverbTime:4.0, reverbDecay:2.0,
    ringmod:5,  chorus:0.15, jitter:0.15, noise:0.08,
  },
  {
    name:'DYING', desc:'konający',
    pitch:0.30, rate:0.30, detune:-30, formantShift:0.65,
    harmonics:0.55, dist:0.30, reverb:0.70, reverbTime:3.0, reverbDecay:3.0,
    ringmod:0,  chorus:0.30, jitter:0.70, noise:0.12,
  },
  {
    name:'LOBOTOMY', desc:'wolne myśli',
    pitch:0.32, rate:0.26, detune:-28, formantShift:0.70,
    harmonics:0.50, dist:0.25, reverb:0.96, reverbTime:3.8, reverbDecay:2.2,
    ringmod:0,  chorus:0.10, jitter:0.50, noise:0.06,
  },
  {
    name:'CRYPT', desc:'krypta',
    pitch:0.44, rate:0.40, detune:-22, formantShift:0.75,
    harmonics:0.60, dist:0.30, reverb:0.92, reverbTime:3.5, reverbDecay:2.8,
    ringmod:8,  chorus:0.05, jitter:0.25, noise:0.05,
  },

  // ── GHOSTLY ───────────────────────────────────────────────────
  {
    name:'GHOST', desc:'przezroczysty',
    pitch:1.35, rate:0.58, detune:0, formantShift:1.30,
    harmonics:0.20, dist:0.10, reverb:0.90, reverbTime:3.8, reverbDecay:1.8,
    ringmod:0,  chorus:0.50, jitter:0.40, noise:0.20,
  },
  {
    name:'ASYLUM', desc:'szpital',
    pitch:0.72, rate:0.50, detune:-20, formantShift:0.85,
    harmonics:0.65, dist:0.35, reverb:0.85, reverbTime:3.2, reverbDecay:2.5,
    ringmod:12, chorus:0.15, jitter:0.40, noise:0.08,
  },
  {
    name:'CAVE ECHO', desc:'jaskinia',
    pitch:0.70, rate:0.50, detune:-14, formantShift:0.90,
    harmonics:0.45, dist:0.20, reverb:0.95, reverbTime:4.0, reverbDecay:2.0,
    ringmod:0,  chorus:0.0, jitter:0.20, noise:0.04,
  },

  // ── DAMAGED ───────────────────────────────────────────────────
  {
    name:'GLITCH', desc:'błąd systemu',
    pitch:1.10, rate:1.25, detune:6, formantShift:1.60,
    harmonics:0.90, dist:0.90, reverb:0.20, reverbTime:0.8, reverbDecay:4.0,
    ringmod:60, chorus:0.0, jitter:0.80, noise:0.40,
  },
  {
    name:'REACTOR', desc:'nuklearny',
    pitch:0.58, rate:0.55, detune:-18, formantShift:0.80,
    harmonics:0.85, dist:0.80, reverb:0.50, reverbTime:2.0, reverbDecay:2.5,
    ringmod:40, chorus:0.10, jitter:0.30, noise:0.15,
  },
  {
    name:'STATIC', desc:'zakłócenia',
    pitch:0.90, rate:0.65, detune:-4, formantShift:1.00,
    harmonics:0.30, dist:0.70, reverb:0.40, reverbTime:1.5, reverbDecay:3.5,
    ringmod:50, chorus:0.0, jitter:0.60, noise:0.50,
  },
  {
    name:'OVERCLOCK', desc:'szybki demon',
    pitch:0.52, rate:0.95, detune:-10, formantShift:0.85,
    harmonics:0.90, dist:0.75, reverb:0.60, reverbTime:2.0, reverbDecay:2.5,
    ringmod:25, chorus:0.20, jitter:0.20, noise:0.15,
  },

  // ── TRANSMISSION ──────────────────────────────────────────────
  {
    name:'RADIO', desc:'stare radio',
    pitch:0.95, rate:0.70, detune:-5, formantShift:1.10,
    harmonics:0.50, dist:0.60, reverb:0.30, reverbTime:1.2, reverbDecay:3.0,
    ringmod:0,  chorus:0.0, jitter:0.15, noise:0.18,
  },
  {
    name:'TELEPHONE', desc:'telefon horror',
    pitch:1.00, rate:0.75, detune:-2, formantShift:1.50,
    harmonics:0.55, dist:0.65, reverb:0.20, reverbTime:0.8, reverbDecay:4.0,
    ringmod:0,  chorus:0.0, jitter:0.10, noise:0.12,
  },
  {
    name:'BROADCAST', desc:'nadawanie',
    pitch:1.15, rate:0.88, detune:2, formantShift:1.20,
    harmonics:0.40, dist:0.30, reverb:0.35, reverbTime:1.5, reverbDecay:2.8,
    ringmod:0,  chorus:0.05, jitter:0.10, noise:0.08,
  },

  // ── MASS ──────────────────────────────────────────────────────
  {
    name:'CHORUS', desc:'chór demonów',
    pitch:0.55, rate:0.42, detune:-16, formantShift:0.75,
    harmonics:0.85, dist:0.55, reverb:0.88, reverbTime:3.5, reverbDecay:2.3,
    ringmod:20, chorus:0.80, jitter:0.50, noise:0.08,
  },
  {
    name:'MUTANT', desc:'mutacja',
    pitch:0.62, rate:0.48, detune:-19, formantShift:0.72,
    harmonics:0.75, dist:0.60, reverb:0.75, reverbTime:2.8, reverbDecay:2.6,
    ringmod:18, chorus:0.30, jitter:0.65, noise:0.12,
  },
];
