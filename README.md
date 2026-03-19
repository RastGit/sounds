# IBM 7094 HORROR SYNTH 🎙️☠️

> Retro formant speech synthesizer — sounds like the original 1961 IBM 7094 "Daisy Bell".  
> Built for horror game audio (Unity compatible).  
> Runs 100% in the browser. No server. No API keys.

**[🔗 LIVE DEMO](https://YOUR-USERNAME.github.io/ibm7094-synth)**

---

## 🚀 Jak wrzucić na GitHub Pages (krok po kroku)

### Metoda 1 — GitHub Web (bez git, najprościej)

1. Wejdź na [github.com](https://github.com) → zaloguj się
2. Kliknij **`+`** (góra prawo) → **New repository**
3. Nazwa: `ibm7094-synth` → **Public** → kliknij **Create repository**
4. Kliknij **`uploading an existing file`**
5. Przeciągnij **wszystkie pliki** z tego folderu (`index.html`, `style.css`, `espeak-init.js`, `audio-engine.js`, `presets.js`, `ui.js`)
6. Kliknij **Commit changes**
7. Wejdź w **Settings** → **Pages** → Source: **`main`** branch, folder **`/ (root)`** → **Save**
8. Po ~2 minutach strona będzie dostępna pod:  
   `https://TWOJA-NAZWA.github.io/ibm7094-synth`

### Metoda 2 — Git CLI

```bash
git clone https://github.com/TWOJA-NAZWA/ibm7094-synth
cp -r /sciezka/do/plikow/* ibm7094-synth/
cd ibm7094-synth
git add .
git commit -m "initial upload"
git push origin main
```

---

## 🎛️ Jak używać

| Co          | Jak                                        |
|-------------|--------------------------------------------|
| Tekst       | Wpisz w pole tekstowe (max 500 znaków)     |
| Preset      | Kliknij jeden z 20 przycisków              |
| Fine tune   | Przesuń suwaki                             |
| Synteza     | Kliknij **SYNTHESIZE** lub `Ctrl+Enter`    |
| Stop        | `ESC` lub przycisk **STOP**                |
| Download    | Kliknij **DOWNLOAD WAV** po syntezie       |

---

## 🎮 Unity integration

1. Po syntezie kliknij **DOWNLOAD WAV** — pobierze się plik `.webm`
2. Otwórz w **Audacity** → `File → Export → Export as WAV`
3. Wrzuć `.wav` do `Assets/Audio/` w Unity

```csharp
// RetroHorrorAudio.cs
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
[RequireComponent(typeof(AudioLowPassFilter))]
public class RetroHorrorAudio : MonoBehaviour
{
    AudioSource src;
    AudioLowPassFilter lpf;

    void Awake()
    {
        src = GetComponent<AudioSource>();
        lpf = GetComponent<AudioLowPassFilter>();
    }

    public void PlayRetro(AudioClip clip)
    {
        src.clip    = clip;
        src.pitch   = Random.Range(0.80f, 0.90f);  // IBM 7094 range
        src.volume  = Random.Range(0.70f, 0.95f);
        lpf.cutoffFrequency = 900f;                 // old hardware band-limit
        src.Play();
    }
}
```

---

## 20 presetów

| # | Nazwa      | Opis              |
|---|------------|-------------------|
| 1 | IBM 7094   | Oryginał Daisy Bell |
| 2 | HAL 9000   | Spokojna śmierć   |
| 3 | ANDROID    | Czysty robot      |
| 4 | DEMON      | Ultra-niski       |
| 5 | VOID       | Pustka            |
| 6 | DYING      | Konający          |
| 7 | LOBOTOMY   | Wolne myśli       |
| 8 | CRYPT      | Krypta            |
| 9 | GHOST      | Przezroczysty     |
|10 | ASYLUM     | Szpital           |
|11 | CAVE ECHO  | Jaskinia          |
|12 | GLITCH     | Błąd systemu      |
|13 | REACTOR    | Nuklearny         |
|14 | STATIC     | Zakłócenia        |
|15 | OVERCLOCK  | Szybki demon      |
|16 | RADIO      | Stare radio       |
|17 | TELEPHONE  | Telefon horror    |
|18 | BROADCAST  | Nadawanie         |
|19 | CHORUS     | Chór demonów      |
|20 | MUTANT     | Mutacja           |

---

## Tech stack

- **eSpeak-NG WASM** — prawdziwy silnik formantowy (ten sam typ co IBM 7094)
- **Web Audio API** — efekty: pitch shift, formant filter, distortion, reverb
- **MediaRecorder API** — nagrywanie do pliku
- Pure HTML/CSS/JS — **zero frameworków, zero backendu**

---

## License

MIT — rób co chcesz.
