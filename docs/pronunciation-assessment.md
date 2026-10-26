# Pronunciation assessment (wav2vec2 API)

On every pair page (e.g. `/lessons/r-vs-l/pairs/right-light`), **step 3 "Say right / Say light"** and **step 4 "Say the sentence"** are scored by the wav2vec2 pronunciation assessment server. On this page, each step is its own box. The full result appears in the **Results** panel **right under the step that ran the check**: under "Pronunciation test" for a word, and under "Tongue twister" for the sentence. The result includes the score, grade, a colour for each word, tips, and optional AI coach feedback. The step itself shows a one-line summary ("Score 87 · Good").

This applies only on the single-pair page (`SinglePairPractice`, which passes `useAiAssessment`). The lesson grid on the home page (`MinimalPairTrainer`) uses the same card without it, and keeps the browser speech-recognition checks.

The server is a separate project. This app only records audio, sends it, and shows the result.

## Files

| File | What it does |
| --- | --- |
| [`components/training/MinimalPairTrainer.tsx`](../components/training/MinimalPairTrainer.tsx) | `PairPracticeCard` with `useAiAssessment`: steps 3 and 4 call `startAiAssessment()`. Each step renders as its own box (`TestGroup separate`), and the panel is inserted under the step that matches `assessment.target`. Without `useAiAssessment` (home page grid), the same pieces render as one card, as before. |
| [`components/pronunciation/PronunciationPanel.tsx`](../components/pronunciation/PronunciationPanel.tsx) | The **Results** panel, shown under step 3 or step 4: server status, current target, live recording meter, "Checking...", notices, the result (see below), "Listen to me" and "Try again". |
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

**Success** (as sent by the server's `server.py`)

```json
{
  "ok": true,
  "score": 87,
  "grade": { "letter": "B", "verdict": "Good", "color": "#65a30d" },
  "allWordsCorrect": false,
  "expected": { "phonemes": ["ɹ","ɑ","k"], "soundsLike": "r-ah-k ..." },
  "heard":    { "phonemes": ["r","ɔ","k"], "soundsLike": "r-aw-k ..." },
  "words": [
    { "word": "Rock", "score": 67, "phonemes": ["ɹ","ɑ","k"], "soundsLike": "r-ah-k" }
  ],
  "issues": [
    { "word": "Rock", "message": "you said \"aw\" ... instead of \"ah\" ...", "tip": "Open your mouth wide..." }
  ],
  "feedback": "You're doing great! In \"Rock\", ..."
}
```

Nullable fields:

- `issues[].tip`: `null` means no tip line is shown.
- `feedback`: `null` when the AI coach is offline. The "ATLAS Assessment" box is hidden.

**IPA.** The server sends **no `ipa` or `heardIpa` fields**. `phonemes` are IPA symbols, and the UI builds the IPA by joining them (`formatIpa(ipa, phonemes)` in `PronunciationPanel.tsx`). The types also accept optional `ipa` / `words[].heardIpa`, in case the server adds them later:

- `ipa` (on `expected`, `heard`, or a word): used instead of the joined `phonemes` when present. Any surrounding slashes are stripped, so it never shows as `//laɪt//`.
- `words[].heardIpa`: when the field is present, the word detail shows a "We heard" column, and `null` there means "We didn't hear this word". The current server doesn't send it, so the column is hidden. The only per-word feedback is the score and `issues`.

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
3. **ATLAS Assessment:** the `feedback` text in a rounded box labelled "ATLAS Assessment". Hidden when `feedback` is `null`.
4. **Word by word:** a chip per word, coloured by `gradeFor(score)`. Tapping a chip shows "Say it like" (`soundsLike`, plus IPA from `phonemes`), and "We heard" only if the server sends `heardIpa`.
5. **IPA:** one box per word. It shows the word, the expected IPA (`words[].phonemes`), and below it what was heard. The server sends `heard.phonemes` as one flat list with no word breaks, so `lib/phonemeAlignment.ts` matches it to the expected phonemes with an edit-distance (Levenshtein) alignment and splits it back into words. Each heard sound is coloured with a grade-band colour: **A green** = correct, **D red** = a different sound, **C amber** = an extra sound. A **missing** sound is shown in the theme's grey, struck through, so it can't be confused with red. The legend under the boxes shows a sample sound drawn in each style. Hidden if no word has phonemes.
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
- **Layout:** the `useAiAssessment` return at the end of `PairPracticeCard`: the pair header box, step boxes, and `resultsKind` deciding where `resultsPanel` goes. Each playback speed toggle is the top row of the step box it affects (`TestGroup header`): words in step 1 ("Check the sounds"), the sentence in step 4 ("Tongue twister").
- **Focus while speaking:** from the "Say ..." tap until recording ends (`focusKind` in `PairPracticeCard`):
  - the text to read (the "Say this" card or the highlighted sentence box) scrolls to the middle of the screen. This runs from an effect on `focusKind`, so it happens after that element renders, on the first tap and on Try again;
  - every other box (header, other steps, Results panel) fades to 30% and can't be tapped (`focusDimClassName`), so a stray tap can't play audio into the recording;
  - **word:** a large "Say this" card shows the target word in step 3;
  - **tongue twister:** the sentence box gets a white border, a "Read this" label, and larger text.

  Everything goes back to normal when checking starts, so "Checking..." and the results are fully visible.
- **Mic level meter:** while recording, `LevelMeter` (`components/pronunciation/LevelMeter.tsx`) shows under the step's "Speak now" bar. It uses the recording's own mic stream, so it also works on touch devices. The Results panel only says "Listening…", with no timer.
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
- [ ] Tapping a word shows *Say it like* with IPA. There's no *We heard* column with the current server.
- [ ] The IPA section shows one box per word: the expected IPA on top and the heard IPA below. Heard sounds are coloured (green correct, red different, amber extra, grey struck-through missing), and each legend sample matches its style. E.g. saying "id" for "it" shows a red `d`.
- [ ] The "ATLAS Assessment" box is hidden when `feedback` is `null`.
- [ ] IPA shows single slashes (`/laɪt/`, not `//laɪt//`).
- [ ] "What to fix" leaves out words that scored 100, and shows "Nothing to fix…" when none are left.
- [ ] "N attempts" goes up with each scored try of the same word, and is tracked separately per word or sentence.
- [ ] "Try again" re-runs the same word or sentence, and scrolls the word card or sentence to the middle of the screen.
- [ ] Tapping "Say right" shows a big "Say this: right" card centred on screen, and fades the other boxes. "Say the sentence" does the same with the sentence box highlighted. The fade ends when checking starts.
- [ ] When a result loads, the page scrolls so the top of the Results panel sits just below the header. With "reduce motion" on, it jumps instead of animating.
- [ ] Each step is its own box. After "Say right/light", results appear under Pronunciation test. After "Say the sentence", they move under Tongue twister.
- [ ] The home page lesson grid still shows one combined card per pair.
- [ ] The home page lesson grid still uses the browser speech check, and doesn't poll `/health`.
- [ ] Layout works at phone width (~360 px) with no horizontal scroll.
