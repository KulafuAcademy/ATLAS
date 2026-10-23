# Pronunciation assessment (wav2vec2 API)

On every pair page (e.g. `/lessons/r-vs-l/pairs/right-light`), **step 3 "Say right / Say light"** and **step 4 "Say the sentence"** are scored by the wav2vec2 pronunciation assessment server. The full result appears in the **Results** panel to the right of the practice card (below it on screens narrower than `lg`). The result includes the score, grade, a colour for each word, tips, and optional AI coach feedback. The step itself shows a one-line summary ("Score 87 · Good").

This applies only on the single-pair page (`SinglePairPractice`, which passes `useAiAssessment`). The lesson grid on the home page (`MinimalPairTrainer`) uses the same card without it, and keeps the browser speech-recognition checks.

The server is a separate project. This app only records audio, sends it, and shows the result.

## Files

| File | What it does |
| --- | --- |
| [`components/training/MinimalPairTrainer.tsx`](../components/training/MinimalPairTrainer.tsx) | `PairPracticeCard` with `useAiAssessment`: steps 3 and 4 call `startAiAssessment()`, and the card and panel sit side by side. |
| [`components/pronunciation/PronunciationPanel.tsx`](../components/pronunciation/PronunciationPanel.tsx) | The right-side **Results** panel: server status, current target, live recording meter, "Checking...", notices, the result (see below), "Listen to me" and "Try again". |
| [`components/pronunciation/usePronunciationAssessment.ts`](../components/pronunciation/usePronunciationAssessment.ts) | Ties the recorder to the API: `prepare(target)` → `startRecording()` → `finish(onDone)`. Holds the target, result and notice. |
| [`components/pronunciation/useVoiceRecorder.ts`](../components/pronunciation/useVoiceRecorder.ts) | MediaRecorder hook: `prepare()` asks for the mic up front, then `start` / `stop` / `cancel`. 15 s safety auto-stop, blob + playback URL. |
| [`components/pronunciation/useServerStatus.ts`](../components/pronunciation/useServerStatus.ts) | Polls `GET /health` every 30 s. |
| [`lib/pronunciationApi.ts`](../lib/pronunciationApi.ts) | The only module that talks to the server. Typed responses and `PronunciationApiError`. |
| [`lib/pronunciationGrades.ts`](../lib/pronunciationGrades.ts) | The grade bands (`pronunciationGrades`) and `gradeFor(score)`. |

## Configuration

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_PRONUNCIATION_API_URL` | No | Server base URL, no trailing slash. Defaults to the current ngrok URL in `lib/pronunciationApi.ts`. **Free ngrok URLs change whenever the tunnel restarts.** Update this when that happens. |
| `NEXT_PUBLIC_PRONUNCIATION_API_KEY` | No | Only if the server is set up to require a key. It is sent as `X-API-Key`. Because it is `NEXT_PUBLIC_`, anyone can read it in the browser bundle, so treat it as a rate-limit token, not a secret. |

Restart `npm run dev` after changing `.env.local`. `NEXT_PUBLIC_` values are read when the app is built.

### Browser requirements

- The microphone only works on **HTTPS or `localhost`**. If you open the dev server from a phone using a LAN IP (`http://192.168.x.x:3000`), recording will be blocked and the page will show the "secure page" message. Test on phones with an HTTPS tunnel or a deployed preview instead.
- Recording uses `MediaRecorder`: Chrome, Edge, Firefox, and Safari 14.1+ (including iOS).

## How it works

```
tap "Say right"  ─► prepare(): ask for mic ─► "Get ready" 3-2-1
                                                   │
                         "Speak now" ─► startRecording() (MediaRecorder)
                                                   │  3 s for a word, 8 s for the sentence
                         countdown ends ─► finish(): stop ─► POST /analyze (audio + text)
                                                   │
        ├─ ok: true             ─► panel: results (see "Results panel")
        │                          step: "Score 87 · Good" (+ correct/incorrect sound)
        ├─ ok: false            ─► panel: "too short or too quiet" notice
        └─ HTTP error / offline ─► panel: kid-friendly notice
```

The countdown and answer windows (`prepareSeconds`, `pronunciationAnswerSeconds`, `tongueTwisterAnswerSeconds`) are the card's existing ones. The mic is requested on the tap, not when the countdown ends: iOS Safari is happier with that, and recording starts immediately at "Speak now". If the permission prompt is still open when "Speak now" arrives, recording starts as soon as the learner allows it, and stops at the end of the window.

- **No client-side conversion.** The blob from MediaRecorder is uploaded as-is, and the server decodes it with ffmpeg (16 kHz mono). The mime type is the first one `MediaRecorder.isTypeSupported()` accepts from `audio/webm;codecs=opus`, `audio/webm`, `audio/mp4`, `audio/ogg;codecs=opus`, `audio/ogg`. The file name matches it: `recording.webm` / `.mp4` / `.ogg`.
- **One attempt at a time.** From the tap until the result arrives, every "Say ..." button and the panel's "Try again" are disabled (`isBusy`), and the panel shows "Checking...". The first request after the server starts can take several seconds.
- **Try again** in the panel re-runs the same word or sentence through the same countdown. Starting a new attempt cancels any request still in flight (`AbortController`), and so does leaving the page.
- **Sounds:** grade A or B plays the card's correct sound, and C or D plays the incorrect sound, like the other steps.
- **"Listen to me"** in the panel plays back the last recording.

## Server API

Every request sends `ngrok-skip-browser-warning: true`. Without it, free ngrok tunnels return an HTML warning page instead of JSON. CORS is open on the server.

### `GET /health`

```json
{ "ok": true }
```

This drives the status badge: *Connecting...* → *Checker is ready* / *Checker is offline*. It is polled every 30 s and re-checked right away when `/analyze` fails to connect.

### `POST /analyze` (multipart/form-data)

| Field | Value |
| --- | --- |
| `audio` | The recording (max 10 MB, checked on the client too) |
| `text` | The word or sentence the learner was asked to say |

Do not set `Content-Type` yourself. The browser adds the multipart boundary.

**Success**

```json
{
  "ok": true,
  "score": 87,
  "grade": { "letter": "B", "verdict": "Good", "color": "#65a30d" },
  "allWordsCorrect": false,
  "expected": { "phonemes": ["ɹ","ɑ","k"], "soundsLike": "r-ah-k ...", "ipa": "ɹɑk ..." },
  "heard":    { "phonemes": ["r","ɔ","k"], "soundsLike": "r-aw-k ...", "ipa": "rɔk ..." },
  "words": [
    { "word": "Rock", "score": 67, "phonemes": ["ɹ","ɑ","k"], "soundsLike": "r-ah-k",
      "ipa": "ɹɑk", "heardIpa": "rɔk" }
  ],
  "issues": [
    { "word": "Rock", "message": "you said \"aw\" ... instead of \"ah\" ...", "tip": "Open your mouth wide..." }
  ],
  "feedback": "You're doing great! In \"Rock\", ..."
}
```

Nullable fields:

- `words[].heardIpa`: `null` when the word wasn't heard at all. The UI says "We didn't hear this word".
- `issues[].tip`: `null` means no tip line is shown.
- `feedback`: `null` when the AI coach is offline. The "AI Assessment" box is hidden.
- `ipa`, `heardIpa`: the server may already wrap these in slashes. The UI strips them and adds exactly one pair (`formatIpa`), so `/laɪt/` never shows as `//laɪt//`.

**Too short / too quiet** (HTTP 200)

```json
{ "ok": false, "error": "too_short_or_quiet", "message": "Didn't catch that - the recording was too short or too quiet." }
```

**HTTP errors** return `{ "detail": "..." }`. `analyzePronunciation()` throws `PronunciationApiError` with `status` and `detail`:

| Status | Meaning | Shown to the learner |
| --- | --- | --- |
| 0 | Network error / server unreachable (client-side) | "We couldn't reach the checker..." |
| 400 | Empty `text` | "Pick something to say first." |
| 401 | Bad or missing API key | "The checker isn't set up correctly..." |
| 413 | File larger than 10 MB | "That recording is too long..." |
| 415 | Audio couldn't be decoded | "We couldn't play that recording..." |
| 502 | Response wasn't JSON, e.g. an ngrok page (client-side) | Generic "Something went wrong" |

## Results panel

Top to bottom (`AssessmentResults` in `PronunciationPanel.tsx`):

1. **Header:** "RESULTS", plus "N attempts" (scored attempts for this word or sentence during this visit). Before the first result, the header shows the server status instead.
2. **Score row:** a ring gauge filled to `score`% in `grade.color` with the score inside, then the grade letter (in `grade.color`) and verdict. Below that, "⭕️ Every sound was correct" when `allWordsCorrect`, otherwise "N of M words need practice". Then `Target: "…"`.
3. **AI Assessment:** the `feedback` text in a rounded box labelled "AI Assessment". Hidden when `feedback` is `null`.
4. **Word by word:** a chip per word, coloured by `gradeFor(score)`. Tapping a chip shows "Say it like" (`soundsLike` and `ipa`) and "We heard" (`heardIpa`).
5. **IPA:** "Should be" `expected.ipa` and "You said" `heard.ipa`.
6. **What to fix:** `issues`, **excluding issues for words that scored 100**, each with its word's score tag, message and tip. If none are left: "Nothing to fix. Try it again at normal speed to lock it in."

## Grade bands and colours

The bands in `lib/pronunciationGrades.ts` match the server:

| Grade | Score | Verdict | Colour |
| --- | --- | --- | --- |
| A | ≥ 90 | Excellent! | `#16a34a` |
| B | ≥ 75 | Good | `#65a30d` |
| C | ≥ 55 | Needs some work | `#d97706` |
| D | < 55 | Try again | `#dc2626` |

Rules:

- The overall score uses `grade.color` **from the response**, as-is.
- Per-word colours and the score tags on issues use `gradeFor(words[].score)`. Don't add other cutoffs or shades.
- These four colours are the **only** non-theme colours, and they appear only on score elements: the score ring and grade letter, the word chips, and the issue score tags. The "⭕️" mark is the app's existing success mark, also used in the practice steps. Everything else uses the app's black and white theme (`white`, `white/NN`, `black`).
- If the server's bands ever change, update `pronunciationGrades` to match.

## Copy and language

The panel's text is in `panelCopy` (`en` / `ja`) in `PronunciationPanel.tsx`. The one-line step summaries (`aiScore`, `aiChecking`, `aiFailed`, `micUnavailable`) are in `trainerCopy` in `MinimalPairTrainer.tsx`. Both follow the language toggle like the rest of the app. The verdict is translated by grade letter. Text generated by the server (`issues[].message`, `tip`, `feedback`, and the too-quiet `message`) is English only. In Japanese mode, the too-quiet notice uses the local translation.

## Changing things

- **What is scored:** step 3 sends `pair.wordA` / `pair.wordB`, and step 4 sends the tongue twister text (`pair.tongueTwister`, or the generated fallback in `getTongueTwister()`).
- **Answer window length:** `pronunciationAnswerSeconds` / `tongueTwisterAnswerSeconds` in `MinimalPairTrainer.tsx`.
- **Panel layout:** the `lg:grid-cols-2` wrapper at the end of `PairPracticeCard`.
- **Safety cap on recording length:** `maxRecordingSeconds` in `useVoiceRecorder.ts` (default 15 s). The answer windows are shorter, so this only matters if something goes wrong.
- **Server URL:** set `NEXT_PUBLIC_PRONUNCIATION_API_URL`, or the fallback in `lib/pronunciationApi.ts`.
- **New response fields:** add them to the types in `lib/pronunciationApi.ts` first.

## Manual test checklist

- [ ] Status badge shows *ready* when the server is up and *offline* when the URL is wrong.
- [ ] Denying mic permission shows the friendly "allow the microphone" notice, and the page still works after allowing it.
- [ ] "Say right" → countdown → panel shows "Listening..." with a moving level meter → "Checking..." → score.
- [ ] "Say the sentence" records for the full 8 s window and scores every word.
- [ ] Step 3/4 shows "Score NN · verdict" and plays the correct or incorrect sound.
- [ ] "Listen to me" plays the last recording (also on iOS Safari).
- [ ] A silent clip shows the too-short/too-quiet notice.
- [ ] While recording or checking, all "Say ..." buttons and "Try again" are disabled.
- [ ] Tapping a word shows *Say it like* and *We heard* (or "didn't hear this word").
- [ ] The "AI Assessment" box is hidden when `feedback` is `null`.
- [ ] IPA shows single slashes (`/laɪt/`, not `//laɪt//`).
- [ ] "What to fix" leaves out words that scored 100, and shows "Nothing to fix…" when none are left.
- [ ] "N attempts" goes up with each scored try of the same word, and is tracked separately per word or sentence.
- [ ] "Try again" re-runs the same word or sentence.
- [ ] On desktop (`lg`), the panel sits to the right and stays in view while scrolling. On phones, it sits below the card.
- [ ] The home page lesson grid still uses the browser speech check, and doesn't poll `/health`.
- [ ] Layout works at phone width (~360 px) with no horizontal scroll.
