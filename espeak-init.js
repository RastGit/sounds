/**
 * espeak-init.js
 * Loads eSpeak-NG compiled to WebAssembly via espeakng.js CDN.
 * eSpeak is the same class of formant synthesizer that produced
 * the original IBM 7094 "Daisy Bell" in 1961.
 */

window.eSpeakReady = false;
window.eSpeakNG   = null;

const ESPEAK_CDN = 'https://cdn.jsdelivr.net/npm/espeak-ng@1.0.2/espeak-ng.js';

function setLoader(pct, txt, state) {
  const fill = document.getElementById('loaderFill');
  const label = document.getElementById('loaderTxt');
  const bar   = document.getElementById('loaderBar');
  if (fill)  fill.style.width  = pct + '%';
  if (label) label.textContent = txt;
  if (bar && state) { bar.className = 'loader-bar ' + state; }
}

async function loadEspeak() {
  try {
    setLoader(10, 'FETCHING eSPEAK-NG WASM ENGINE...', '');

    // Dynamically inject the script
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = ESPEAK_CDN;
      s.onload  = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    setLoader(50, 'INITIALIZING FORMANT ENGINE...', '');

    // espeakng exports a factory function
    window.eSpeakNG = await window.EspeakNGFactory({
      // point data files at the CDN package
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/espeak-ng@1.0.2/${f}`
    });

    setLoader(100, 'ENGINE READY ◄ SPEAK NOW', 'done');
    window.eSpeakReady = true;

    const synBtn = document.getElementById('synBtn');
    if (synBtn) synBtn.disabled = false;
    setStatus('ENGINE READY ▸ eSPEAK-NG FORMANT SYNTH LOADED', 'act');

  } catch (err) {
    console.error('eSpeak load error:', err);
    setLoader(100, 'eSPEAK FAILED — USING FALLBACK TTS', 'error');
    // Fallback: use Web Speech API but heavily processed
    window.eSpeakReady = false;
    window.useFallback = true;

    const synBtn = document.getElementById('synBtn');
    if (synBtn) synBtn.disabled = false;
    setStatus('FALLBACK MODE ▸ WEB SPEECH API + EFFECTS', 'err');
  }
}

// Boot on page load
window.addEventListener('DOMContentLoaded', loadEspeak);
