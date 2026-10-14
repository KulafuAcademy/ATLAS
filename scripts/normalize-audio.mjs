// Normalizes every .mp3 under public/words and public/twisters to one loudness.
// Usage: node scripts/normalize-audio.mjs [--force]
// Needs ffmpeg + ffprobe on PATH. Files are rewritten in place (git has the originals).
// Already-normalized files are tagged in their metadata and skipped on later runs.

import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOTS = ["public/words", "public/twisters"];
const TARGET_LUFS = -16;
const TRUE_PEAK = -1.5;
const LRA = 11;
const TAG = `normalized-${TARGET_LUFS}LUFS`;
const force = process.argv.includes("--force");

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.toLowerCase().endsWith(".mp3")) yield full;
  }
}

function isTagged(file) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format_tags=comment", "-of", "csv=p=0", file],
    { encoding: "utf8" }
  );
  return out.includes(TAG);
}

const filter = `loudnorm=I=${TARGET_LUFS}:TP=${TRUE_PEAK}:LRA=${LRA}`;

// Pass 1: measure. loudnorm prints a JSON block to stderr.
function analyze(file) {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-i", file, "-af", `${filter}:print_format=json`, "-f", "null", "-"],
    { encoding: "utf8" }
  );
  const match = r.stderr.match(/\{[\s\S]*?\}/g);
  if (r.status !== 0 || !match) throw new Error(`analysis failed for ${file}`);
  return JSON.parse(match[match.length - 1]);
}

function normalize(file) {
  const m = analyze(file);
  const af =
    `${filter}:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
    `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}` +
    `:offset=${m.target_offset}:linear=true`;
  const tmp = `${file}.tmp.mp3`;
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", file,
      "-af", af,
      "-ar", "44100",
      "-codec:a", "libmp3lame", "-q:a", "2",
      "-metadata", `comment=${TAG}`,
      tmp,
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    rmSync(tmp, { force: true });
    throw new Error(r.stderr || `encode failed for ${file}`);
  }
  renameSync(tmp, file);
}

let done = 0, skipped = 0, failed = 0;
for (const root of ROOTS) {
  for (const file of walk(resolve(root))) {
    try {
      if (!force && isTagged(file)) {
        skipped++;
        continue;
      }
      normalize(file);
      done++;
      console.log(`normalized  ${file}`);
    } catch (e) {
      failed++;
      console.error(`FAILED      ${file}\n${e.message}`);
    }
  }
}
console.log(`\nDone: ${done} normalized, ${skipped} skipped, ${failed} failed.`);
