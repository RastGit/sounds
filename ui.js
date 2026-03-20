/**
 * ui.js — wszystkie suwaki podpięte do silnika, żaden nie jest dekoracją
 */
'use strict';

const SLIDER_DEFS = [
  { id:'pitch',       label:'PITCH (F0)',      min:0.20, max:1.50, step:0.01, def:1.00, unit:''   },
  { id:'rate',        label:'RATE',            min:0.30, max:1.80, step:0.01, def:0.70, unit:''   },
  { id:'detune',      label:'DETUNE',          min:-36,  max:12,   step:1,    def:0,    unit:'st' },
  { id:'formantShift',label:'FORMANT SHIFT',   min:0.40, max:2.00, step:0.05, def:1.00, unit:'x'  },
  { id:'harmonics',   label:'HARMONICS',       min:0.00, max:1.00, step:0.01, def:0.60, unit:''   },
  { id:'dist',        label:'DISTORTION',      min:0.00, max:1.00, step:0.01, def:0.08, unit:''   },
  { id:'reverb',      label:'REVERB MIX',      min:0.00, max:1.00, step:0.01, def:0.35, unit:''   },
  { id:'reverbTime',  label:'REVERB TIME',     min:0.50, max:4.00, step:0.10, def:1.20, unit:'s'  },
  { id:'reverbDecay', label:'REVERB DECAY',    min:1.00, max:5.00, step:0.10, def:4.00, unit:''   },
  { id:'ringmod',     label:'RING MOD',        min:0,    max:80,   step:1,    def:0,    unit:'Hz' },
  { id:'chorus',      label:'CHORUS',          min:0.00, max:1.00, step:0.01, def:0.00, unit:''   },
  { id:'jitter',      label:'JITTER',          min:0.00, max:1.00, step:0.01, def:0.00, unit:''   },
  { id:'noise',       label:'BREATH NOISE',    min:0.00, max:0.60, step:0.01, def:0.03, unit:''   },
];

// ── BUILD UI ─────────────────────────────────────────────────────
function buildPresets() {
  const grid = document.getElementById('presetGrid');
  window.PRESETS.forEach((p, i) => {
    const btn       = document.createElement('button');
    btn.className   = 'pbtn';
    btn.id          = 'pb' + i;
    btn.innerHTML   = `<span class="pname">${p.name}</span><span class="pdesc">${p.desc}</span>`;
    btn.addEventListener('click', () => loadPreset(i));
    grid.appendChild(btn);
  });
}

function buildSliders() {
  const grid = document.getElementById('sliderGrid');
  SLIDER_DEFS.forEach(def => {
    const div     = document.createElement('div');
    div.className = 'sr';
    div.innerHTML = `
      <label>${def.label}</label>
      <div class="row">
        <input type="range" id="s_${def.id}"
          min="${def.min}" max="${def.max}" step="${def.step}" value="${def.def}">
        <span class="vd" id="v_${def.id}">${def.def}${def.unit}</span>
      </div>`;
    grid.appendChild(div);
    div.querySelector('input').addEventListener('input', e => {
      const dec = def.step < 1 ? 2 : (def.step < 0.5 ? 1 : 0);
      document.getElementById('v_' + def.id).textContent =
        parseFloat(e.target.value).toFixed(dec) + def.unit;
    });
  });
}

function loadPreset(i) {
  document.querySelectorAll('.pbtn').forEach(b => b.classList.remove('on'));
  const btn = document.getElementById('pb' + i);
  if (btn) btn.classList.add('on');
  const p = window.PRESETS[i];
  SLIDER_DEFS.forEach(def => {
    if (p[def.id] !== undefined) setSlider(def.id, p[def.id]);
  });
}

function setSlider(id, val) {
  const el  = document.getElementById('s_' + id);
  const vEl = document.getElementById('v_' + id);
  const def = SLIDER_DEFS.find(s => s.id === id);
  if (!el || !vEl || !def) return;
  el.value = val;
  const dec = def.step < 1 ? 2 : (def.step < 0.5 ? 1 : 0);
  vEl.textContent = parseFloat(val).toFixed(dec) + def.unit;
}

function getParams() {
  const obj = {};
  SLIDER_DEFS.forEach(def => {
    const el   = document.getElementById('s_' + def.id);
    obj[def.id] = el ? parseFloat(el.value) : def.def;
  });
  return obj;
}

// ── CHAR COUNTER ─────────────────────────────────────────────────
function setupCharCounter() {
  const ta  = document.getElementById('txt');
  const cnt = document.getElementById('charCount');
  if (!ta || !cnt) return;
  ta.addEventListener('input', () => {
    if (ta.value.length > 600) ta.value = ta.value.slice(0, 600);
    cnt.textContent = ta.value.length;
  });
}

// ── OSCILLOSCOPE ─────────────────────────────────────────────────
const cv      = document.getElementById('cv');
const cx      = cv ? cv.getContext('2d') : null;
let   animId  = null;
let   waveOn  = false;

function drawWave(active) {
  waveOn = active;
  cancelAnimationFrame(animId);
  if (!cv || !cx) return;
  cv.width  = cv.offsetWidth  || 700;
  cv.height = cv.offsetHeight || 80;
  cx.clearRect(0, 0, cv.width, cv.height);

  if (!active) {
    cx.strokeStyle = '#002200'; cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(0, cv.height / 2); cx.lineTo(cv.width, cv.height / 2);
    cx.stroke();
    return;
  }

  const t = Date.now() / 185;
  cx.strokeStyle = '#00ff41'; cx.shadowColor = '#00ff41';
  cx.shadowBlur  = 8; cx.lineWidth = 2;
  cx.beginPath();
  for (let x = 0; x < cv.width; x++) {
    const r   = x / cv.width;
    const amp = cv.height * 0.37;
    const y   = cv.height / 2
      + Math.sin(r * 18 + t)       * amp * 0.44
      + Math.sin(r * 7  - t * 1.3) * amp * 0.27
      + Math.sin(r * 33 + t * 2.1) * amp * 0.14
      + (Math.random() - 0.5)       * amp * 0.07;
    x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
  }
  cx.stroke();
  animId = requestAnimationFrame(() => { if (waveOn) drawWave(true); });
}

// ── STATUS LINE ───────────────────────────────────────────────────
function setStatus(msg, type = '') {
  const el = document.getElementById('st');
  if (!el) return;
  el.textContent = msg + ' ';
  el.className   = 'status' + (type ? ' ' + type : '');
  if (!type) {
    const cur = document.createElement('span');
    cur.className = 'blink'; cur.textContent = '_';
    el.appendChild(cur);
  }
}

// ── ACTIONS ───────────────────────────────────────────────────────
async function synthesize() {
  const txt = (document.getElementById('txt').value || '').trim();
  if (!txt) { setStatus('ERR: BRAK TEKSTU', 'err'); return; }

  const synBtn = document.getElementById('synBtn');
  const dlBtn  = document.getElementById('dlBtn');
  synBtn.classList.add('going');
  dlBtn.disabled = true;
  drawWave(true);
  setStatus('SYNTHESIZING... FORMANT ENGINE', 'act');

  const params = getParams();

  window.onSynthDone = () => {
    synBtn.classList.remove('going');
    dlBtn.disabled = false;
    drawWave(false);
    setStatus('COMPLETE ▸ DOWNLOAD READY', 'act');
  };

  try {
    const ms = await window.synth.speak(txt, params);
    setStatus(`PLAYING ▸ ~${(ms/1000).toFixed(1)}s`, 'act');
  } catch(e) {
    setStatus('ERR: ' + e.message, 'err');
    synBtn.classList.remove('going');
    drawWave(false);
  }
}

function stopAll() {
  window.synth.stop();
  document.getElementById('synBtn').classList.remove('going');
  drawWave(false);
  setStatus('STOPPED ■');
}

function downloadAudio() {
  const ok = window.synth.download();
  if (!ok) { setStatus('ERR: NICZEGO NIE NAGRAŁEM — NAJPIERW SYNTHESIZE', 'err'); return; }
  setStatus('DOWNLOADING ▸ OTWÓRZ .WEBM W AUDACITY → EXPORT AS WAV', 'act');
}

// ── KEYBOARD ─────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); synthesize(); }
  if (e.key === 'Escape')               stopAll();
  if (e.ctrlKey && e.key === 'd')     { e.preventDefault(); downloadAudio(); }
});

// ── INIT ─────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  buildPresets();
  buildSliders();
  loadPreset(0);
  setupCharCounter();
  drawWave(false);
  setStatus('SYSTEM READY ▸ WŁASNY SILNIK FORMANTOWY');
});
