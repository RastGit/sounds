/**
 * ui.js
 * Builds the preset grid, sliders, oscilloscope, status line,
 * keyboard shortcuts, and exposes getParams().
 */

// ── SLIDER DEFINITIONS ────────────────────────────────────────────
const SLIDER_DEFS = [
  { id:'pitch',   label:'PITCH',       min:0.20, max:1.50, step:0.01, def:0.85, unit:''   },
  { id:'rate',    label:'RATE',        min:0.20, max:1.40, step:0.01, def:0.68, unit:''   },
  { id:'detune',  label:'DETUNE',      min:-36,  max:12,   step:1,    def:-8,   unit:'st' },
  { id:'formant', label:'FORMANT HZ',  min:200,  max:2000, step:50,   def:900,  unit:'Hz' },
  { id:'dist',    label:'DISTORTION',  min:0.00, max:1.00, step:0.01, def:0.15, unit:''   },
  { id:'verb',    label:'REVERB',      min:0.00, max:1.00, step:0.01, def:0.55, unit:''   },
];

// ── BUILD PRESETS ─────────────────────────────────────────────────
function buildPresets() {
  const grid = document.getElementById('presetGrid');
  window.PRESETS.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className   = 'pbtn';
    btn.id          = 'pb' + i;
    btn.innerHTML   = `<span class="pname">${p.name}</span><span class="pdesc">${p.desc}</span>`;
    btn.addEventListener('click', () => loadPreset(i));
    grid.appendChild(btn);
  });
}

function loadPreset(i) {
  document.querySelectorAll('.pbtn').forEach(b => b.classList.remove('on'));
  const btn = document.getElementById('pb' + i);
  if (btn) btn.classList.add('on');

  const p = window.PRESETS[i];
  SLIDER_DEFS.forEach(def => {
    const val = p[def.id] !== undefined ? p[def.id] : def.def;
    setSlider(def.id, val);
  });
}

function setSlider(id, val) {
  const el  = document.getElementById('s_' + id);
  const vEl = document.getElementById('v_' + id);
  const def = SLIDER_DEFS.find(s => s.id === id);
  if (!el || !vEl || !def) return;
  el.value      = val;
  const decimals = def.step < 1 ? 2 : 0;
  vEl.textContent = parseFloat(val).toFixed(decimals) + def.unit;
}

// ── BUILD SLIDERS ─────────────────────────────────────────────────
function buildSliders() {
  const grid = document.getElementById('sliderGrid');
  SLIDER_DEFS.forEach(def => {
    const div  = document.createElement('div');
    div.className = 'sr';
    div.innerHTML = `
      <label>${def.label}</label>
      <div class="row">
        <input
          type="range"
          id="s_${def.id}"
          min="${def.min}"
          max="${def.max}"
          step="${def.step}"
          value="${def.def}"
        >
        <span class="vd" id="v_${def.id}">${def.def}${def.unit}</span>
      </div>`;
    grid.appendChild(div);

    const inp = div.querySelector('input');
    inp.addEventListener('input', () => {
      const dec = def.step < 1 ? 2 : 0;
      document.getElementById('v_' + def.id).textContent =
        parseFloat(inp.value).toFixed(dec) + def.unit;
    });
  });
}

// ── GET CURRENT PARAMS ────────────────────────────────────────────
function getParams() {
  const obj = {};
  SLIDER_DEFS.forEach(def => {
    const el = document.getElementById('s_' + def.id);
    obj[def.id] = el ? parseFloat(el.value) : def.def;
  });
  return obj;
}

// ── CHAR COUNTER ──────────────────────────────────────────────────
function setupCharCounter() {
  const ta  = document.getElementById('txt');
  const cnt = document.getElementById('charCount');
  if (!ta || !cnt) return;
  ta.addEventListener('input', () => {
    const len = ta.value.length;
    if (len > 500) ta.value = ta.value.slice(0, 500);
    cnt.textContent = Math.min(len, 500);
  });
}

// ── OSCILLOSCOPE ─────────────────────────────────────────────────
const cv  = document.getElementById('cv');
const cx  = cv ? cv.getContext('2d') : null;
let animId = null;
let waveActive = false;

function drawWave(active) {
  waveActive = active;
  cancelAnimationFrame(animId);
  if (!cv || !cx) return;

  cv.width  = cv.offsetWidth  || 700;
  cv.height = cv.offsetHeight || 80;
  cx.clearRect(0, 0, cv.width, cv.height);

  if (!active) {
    cx.strokeStyle = '#002200';
    cx.lineWidth   = 1;
    cx.beginPath();
    cx.moveTo(0, cv.height / 2);
    cx.lineTo(cv.width, cv.height / 2);
    cx.stroke();
    return;
  }

  const t = Date.now() / 190;
  cx.strokeStyle = '#00ff41';
  cx.shadowColor = '#00ff41';
  cx.shadowBlur  = 7;
  cx.lineWidth   = 2;
  cx.beginPath();

  for (let x = 0; x < cv.width; x++) {
    const r   = x / cv.width;
    const amp = cv.height * 0.36;
    const y   = cv.height / 2
      + Math.sin(r * 20 + t)        * amp * 0.44
      + Math.sin(r * 7  - t * 1.4)  * amp * 0.27
      + Math.sin(r * 35 + t * 1.9)  * amp * 0.14
      + (Math.random() - 0.5)        * amp * 0.07;
    x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
  }
  cx.stroke();

  animId = requestAnimationFrame(() => { if (waveActive) drawWave(true); });
}

// ── STATUS LINE ───────────────────────────────────────────────────
function setStatus(msg, type = '') {
  const el = document.getElementById('st');
  if (!el) return;
  el.textContent = msg + ' ';
  el.className   = 'status' + (type ? ' ' + type : '');
  if (!type) {
    const cur = document.createElement('span');
    cur.className   = 'blink';
    cur.textContent = '_';
    el.appendChild(cur);
  }
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); synthesize(); }
  if (e.key === 'Escape')              stopAll();
  if (e.ctrlKey && e.key === 'd')    { e.preventDefault(); downloadAudio(); }
});

// ── INIT ──────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  buildPresets();
  buildSliders();
  loadPreset(0);    // IBM 7094 by default
  setupCharCounter();
  drawWave(false);
});
