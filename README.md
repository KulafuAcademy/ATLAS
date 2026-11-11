# ATLAS

ATLAS is an AI pronunciation training app for Japanese learners of English.

Version 0.9.0 introduces the first minimal-pair MVP with browser speech playback for R vs L practice. Full AI scoring, login, payment, and database features are intentionally out of scope for this step.

## Pronunciation check (ZIPA API)

On each pair page (e.g. `/lessons/r-vs-l/pairs/right-light`), **"Say right / Say light"** and **"Say the sentence"** record the learner and send the clip to the separate ZIPA pronunciation assessment server. The score, grade, per-word results, tips, and optional AI coach feedback appear right under the step that ran the check.

Setup:

```bash
cp .env.example .env.local   # then set ZIPA_API_URL and ZIPA_API_KEY
npm run dev
```

The microphone needs HTTPS or `localhost`. See [docs/pronunciation-assessment.md](docs/pronunciation-assessment.md) for the API contract, grade colours, configuration, and a test checklist.
