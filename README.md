# ATLAS — AI Pronunciation Trainer

ATLAS is an AI-assisted English pronunciation learning app, initially focused on helping Japanese learners hear and practice difficult English sound contrasts. The first priority is to make the pronunciation trainer functional, stable, and ready for actual use.

## 1. Project Overview & Objectives

### Purpose

ATLAS helps learners:

- Hear the difference between commonly confused English sounds.
- Practice minimal pairs, listening questions, and short sentences.
- Record speech and receive useful, honest feedback.
- Track lesson and test progress.

### Product direction

ATLAS may grow into a broader English-learning platform with speaking, listening, vocabulary, grammar, reading, writing, and other AI-powered tools. The current priority is to complete the pronunciation trainer first. IELTS and AICA corporate website features are separate future workstreams.

### Objectives

1. Make the pronunciation learning experience reliable for real users.
2. Provide clear audio playback, recording, recognition, and assessment states.
3. Offer structured lessons, separate tests, and visible progress.
4. Validate changes in a browser preview before merging.
5. Keep each pull request focused on one purpose.

## 2. Core Features & Functionality

### Sound contrast lessons

The trainer’s categories include:

- **R vs L:** right/light, pray/play, fry/fly.
- **B vs V:** ban/van, berry/very, boat/vote.
- **S vs SH:** see/she, sip/ship, seat/sheet.
- **Short I vs Long E:** sit/seat, ship/sheep, bit/beat.
- **TH sounds:** practice of dental fricatives.
- **Final consonants:** practice of word endings that learners may weaken or alter.

Each category should include an overview, examples, a lesson route, and a separate test route.

### Lesson workflow

1. Choose a sound category.
2. Review its explanation and example words.
3. Listen to each sound separately.
4. Play a listening prompt and choose A or B.
5. Record a target word for pronunciation practice.
6. Practice the sounds in a tongue twister or short sentence.

### Listening tests

- Present one question at a time.
- Label choices clearly, for example, “I hear A: right” and “I hear B: light.”
- Give understandable correct/incorrect feedback and allow retries.
- Support question navigation and track completed attempts and scores.

### Pronunciation recording and assessment

- Request microphone access when the learner starts recording.
- Show recording, processing, success, and error states clearly.
- Allow enough recording time and don’t evaluate before capture has finished.
- Show recognized speech as transcription. Don’t claim detailed pronunciation scoring unless the chosen service provides it.
- Explain errors such as denied microphone access, network problems, quota limits, and service outages.
- Do not display demo or simulated success in a real assessment flow.

**Speech implementation:** Text to speech uses the browser's native Web Speech API (`speechSynthesis`), and speech recognition uses the browser's native `SpeechRecognition`/`webkitSpeechRecognition` API when available. Voices and recognition support depend on the browser and device. Recognition may require an internet connection in some browsers. No cloud speech provider or server-side speech credentials are used.

### Tests and progress

- “Take test” should open a dedicated assessment page.
- Show whether a category has been tested, along with attempts and scores where available.
- Update progress only after a test is completed.
- Decide how progress will persist across reloads and devices.
- Label prototype or unverified progress honestly; don’t present placeholder results as real.

### Interface and localization

- Support English and Japanese interface text.
- Keep category navigation usable on mobile and desktop.
- Provide accessible controls, readable contrast, and clear loading and error messages.

## 3. Tech Stack & Architecture

### Project context

- **Framework:** Next.js, React, and TypeScript, based on the project structure discussed.
- **Source control:** Git and GitHub.
- **Team repository:** `KulafuAcademy/ATLAS`.
- **Deployment under consideration:** Vercel.
- **Workflow:** feature branch → pull request → preview deployment → functional testing → review → merge.

### Application components

1. **Presentation:** pages and React components for category overviews, lessons, listening tests, recording controls, and progress.
2. **Learning content:** typed category data, word pairs, audio prompts, instructions, and test questions.
3. **Progress:** a persistence layer for attempts, scores, and completion status. Browser storage may work for a prototype; production storage needs a team decision.
4. **Audio capture:** browser microphone APIs, permission handling, recording lifecycle, and audio encoding.
5. **Speech:** browser-native text to speech and speech recognition, with capability checks and clear messaging when a browser does not support them.
6. **Deployment:** Vercel connected to GitHub, with `main` as production and feature branches/Pull Requests generating previews.

### Security and privacy

- The current browser-native speech flows do not require cloud speech API credentials.
- Tell users when a browser feature requires a network connection and how recordings are handled.
- Store only the audio and learner data the product needs.

## 4. Step-by-Step Action Plan / Roadmap

### Phase 1 — Confirm the baseline

1. Start from the latest `main` in `KulafuAcademy/ATLAS`.
2. Confirm the local checkout, package manager, and development commands.
3. Run the app locally and record the current lesson and test behavior.
4. Review repository instructions and existing checks before changing code.

### Phase 2 — Stabilize pronunciation practice

1. Review microphone capture and audio playback.
2. Make recording duration, stopping, processing, and repeated attempts reliable.
3. Handle denied permissions, unsupported browsers, silence, network failures, quota, and rate limits.
4. Verify that R/L listening audio and answer labels match.
5. Test repeated use: questions 1–3, retry, and navigation.
6. Confirm speech behavior on the supported browsers and devices before describing recognition as available everywhere.

### Phase 3 — Build the Take Test page

1. Implement the dedicated test route and interface.
2. Define question count, scoring, retry behavior, and completion rules.
3. Connect tests to real learning content and audio.
4. Store results using the agreed persistence approach.
5. Keep the Pull Request focused on the test page and necessary supporting changes.

### Phase 4 — Build progress tracking

1. Define what counts as lesson completion and how scores affect progress.
2. Show test status, attempts, best score, and latest score.
3. Update progress only after a valid completed test.
4. Verify behavior after reload and navigation.
5. Keep progress tracking in a separate Pull Request from the Take Test page where practical.

### Phase 5 — Preview and functional QA

1. Push the feature branch and open a Pull Request.
2. Create a Vercel Preview Deployment separate from production.
3. Test the preview in a browser at desktop and mobile sizes.
4. Verify playback, microphone access, repeated recording, errors, navigation, scoring, and progress.
5. Ask a teammate to cross-check the implementation when available.
6. Fix issues and repeat functional testing before review and merge.

### Phase 6 — Review and release

1. Request code review and include test results and the Preview URL.
2. Merge only after checks and product behavior are confirmed.
3. Confirm the production deployment and run a smoke test.
4. Collect feedback and prioritize follow-up issues.

### Phase 7 — Expand the roadmap

After pronunciation training is stable, consider speaking, listening, vocabulary, grammar, reading, writing, and other AI learning tools. Treat IELTS and AICA corporate website work as separate initiatives.

## 5. Current Progress & Next Steps

### Progress from our discussion

- The team repository is `KulafuAcademy/ATLAS`; `main` is the production branch.
- Work for a category test page and progress tracking was committed as `b69ebf8` on `geaser/feature-progress-bar`, and that branch appeared on GitHub.
- The branch was shown as one commit ahead and two behind `main`. Its current status should be checked and synchronized according to the team’s Git workflow before review.
- The feature work still needs browser-preview and functional validation. It has not been confirmed as merged or production-ready here.
- Pronunciation attempts previously showed service errors related to availability, quota, or request limits. The underlying cause was not conclusively established.
- Vercel did not show the organization repository during installation from the personal GitHub account. A KulafuAcademy owner/admin may need to authorize Vercel for the repository or configure access through the organization’s Vercel team.
- The boss asked to review the local prototype first and requested that progress tracking and the Take Test page be handled as separate tasks and separate Pull Requests.

### Immediate next steps

1. Ask the KulafuAcademy repository or organization owner to authorize Vercel for `KulafuAcademy/ATLAS`.
2. Run the current feature branch locally and demonstrate the test and progress behavior for review.
3. Check the branch against the latest `main` and resolve its divergence using the team’s preferred process.
4. Keep the Take Test and progress changes in separate, single-purpose Pull Requests.
5. Decide whether the first pronunciation feature needs transcription or genuine pronunciation assessment, then configure the appropriate provider securely.
6. Test repeated audio use, retries, navigation, error states, scoring, and progress persistence on a Vercel Preview Deployment.

## Pull Request and QA Workflow

**Development → Self-testing → Pull Request → Vercel Preview → Functional testing → Review → Merge**

Do not merge based only on code inspection. Record the browser flows tested, include the Preview URL in the Pull Request, and test repeated interactions.

## Open Decisions

- Which browsers and devices should be supported for browser-native speech recognition?
- What feedback should learners receive: word recognition, phoneme accuracy, fluency, or another score?
- Should progress be browser-local for the prototype or stored in an account/backend?
- Who owns the Vercel project and can authorize the GitHub organization integration?
- Which browsers, devices, and learner locales are supported in the first release?

This is a working plan. Update it as decisions are confirmed and the app is tested with learners.
