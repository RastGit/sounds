# IBM 7094 HORROR SYNTH ☠️

**Własny silnik formantowy** — zero zewnętrznych API, zero głosu tłumacza, zero eSpeak.  
Syntezuje mowę przez oscylatory + filtry F1/F2/F3, dokładnie jak IBM 7094 z 1961 roku.

**[🔗 LIVE DEMO](https://YOUR-NAME.github.io/ibm7094-synth)**

---

## Jak działa silnik

```
TEKST → GRAFEM-DO-FONEMU → FONEMY → OSCYLATORY → FILTRY FORMANTOWE → EFEKTY → AUDIO

"daisy" → [d][eɪ][z][i] → sawtooth osc + bandpass F1/F2/F3 → dist + reverb → głos
```

Każdy fonem ma własne częstotliwości formantów (Peterson & Barney 1952):
- Samogłoski: oscylator piłokształtny przez filtry F1+F2+F3
- Spółgłoski: szum biały przefiltrowany pasmowo
- Stosy (p,b,t...): burst szumu z attack/release

---

## GitHub Pages — setup

### Opcja A: upload przez stronę (bez git)

1. Wejdź na [github.com](https://github.com) → `+` → **New repository**
2. Nazwa: `ibm7094-synth` | **Public** | **Create**
3. Kliknij **`uploading an existing file`**
4. Przeciągnij pliki: `index.html`, `style.css`, `synth-engine.js`, `presets.js`, `ui.js`
5. **Commit changes**
6. **Settings → Pages → Source: main, / (root) → Save**
7. Po ~2 min: `https://TWOJA-NAZWA.github.io/ibm7094-synth`

### Opcja B: git CLI

```bash
git init ibm7094-synth && cd ibm7094-synth
# skopiuj pliki
git add . && git commit -m "init"
git remote add origin https://github.com/TWOJA-NAZWA/ibm7094-synth.git
git push -u origin main
# potem włącz Pages w Settings
```

---

## 12 parametrów (wszystkie działają)

| Parametr     | Co robi                                              |
|--------------|------------------------------------------------------|
| PITCH        | Częstotliwość fundamentalna (F0) — niżej = głębszy  |
| RATE         | Tempo mówienia                                       |
| DETUNE       | Przestrojenie w semitonach                           |
| FORMANT SHIFT| Przesuwa filtry F1/F2/F3 — wyżej = "cieńszy" charakter |
| HARMONICS    | Siła 2. i 3. harmonicznej                            |
| DISTORTION   | Overdrive / saturacja                                |
| REVERB MIX   | Poziom pogłosu                                       |
| REVERB TIME  | Długość pogłosu w sekundach                          |
| REVERB DECAY | Jak szybko zanika pogłos                             |
| RING MOD     | Ring modulator — metaliczny, mechaniczny charakter   |
| CHORUS       | Podwojenie głosu / unison                            |
| JITTER       | Niestabilność pitch — "strach", organiczność         |

---

## Unity

```csharp
[RequireComponent(typeof(AudioSource), typeof(AudioLowPassFilter))]
public class HorrorVoice : MonoBehaviour {
    void Play(AudioClip clip) {
        var src = GetComponent<AudioSource>();
        src.clip   = clip;
        src.pitch  = Random.Range(0.80f, 0.90f);
        src.volume = Random.Range(0.65f, 0.95f);
        GetComponent<AudioLowPassFilter>().cutoffFrequency = 900f;
        src.Play();
    }
}
```

---

MIT License
