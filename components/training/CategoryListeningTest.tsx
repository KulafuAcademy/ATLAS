"use client";

import { useEffect, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ListeningTestSession } from "@/components/training/ListeningTestSession";
import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import type { TrainingLesson } from "@/data/trainingLessons";
import {
  getBrowserSpeechVoices,
  getSavedBrowserSpeechVoice,
  saveBrowserSpeechVoice,
} from "@/lib/speechVoices";
import { playBrowserSpeech, stopSpeechPlayback } from "@/lib/speechPlayback";
import type { TrainingProgress } from "@/types/training";

const progressStorageKey = "atlas.trainingProgress.v1";
type ProgressByCategory = Record<string, TrainingProgress>;

const copy = {
  en: {
    progress: "Your progress",
    noTest: "Complete a test to start tracking your progress.",
    attempts: "Attempts",
    best: "Best score",
    latest: "Latest score",
    percent: "Best score progress",
    voice: "Practice voice",
    testVoice: "Test voice",
    previewStarting: "Playing voice preview…",
    previewStarted: "Voice preview started.",
    previewError: "Browser speech playback failed. Try another available voice.",
    voiceHelp: "This voice is used for the listening test and lesson practice.",
  },
  ja: {
    progress: "学習の進捗",
    noTest: "テストを完了すると進捗が記録されます。",
    attempts: "回数",
    best: "最高スコア",
    latest: "最新スコア",
    percent: "最高スコアの進捗",
    voice: "練習音声",
    testVoice: "音声を試す",
    previewStarting: "音声プレビューを再生しています…",
    previewStarted: "音声プレビューを再生しました。",
    previewError: "ブラウザ音声を再生できません。別の音声を試してください。",
    voiceHelp: "この音声は聞き取りテストとレッスンの練習に使われます。",
  },
};

export function CategoryListeningTest({ lesson }: { lesson: TrainingLesson }) {
  const { language, text } = useLanguage();
  const labels = copy[language];
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voicePreviewMessage, setVoicePreviewMessage] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(progressStorageKey);
      if (!stored) return;
      const allProgress = JSON.parse(stored) as ProgressByCategory;
      setProgress(allProgress[lesson.id] ?? null);
    } catch {
      window.localStorage.removeItem(progressStorageKey);
    }
  }, [lesson.id]);

  useEffect(() => {
    const updateVoices = () => setAvailableVoices(getBrowserSpeechVoices());
    setSelectedVoice(getSavedBrowserSpeechVoice());
    updateVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", updateVoices);
      stopSpeechPlayback();
    };
  }, []);

  async function previewSelectedVoice() {
    setVoicePreviewMessage(labels.previewStarting);
    try {
      await playBrowserSpeech(
        "Hello, this is the selected practice voice.",
        selectedVoice,
      );
      setVoicePreviewMessage(labels.previewStarted);
    } catch {
      setVoicePreviewMessage(labels.previewError);
    }
  }

  function recordProgress(score: number, total: number) {
    const stored = window.localStorage.getItem(progressStorageKey);
    let allProgress: ProgressByCategory = {};

    try {
      if (stored) allProgress = JSON.parse(stored) as ProgressByCategory;
    } catch {
      allProgress = {};
    }

    const previous = allProgress[lesson.id];
    const next: TrainingProgress = {
      attempts: (previous?.attempts ?? 0) + 1,
      bestScore: Math.max(previous?.bestScore ?? 0, score),
      lastScore: score,
      total,
      updatedAt: new Date().toISOString(),
    };
    const nextAllProgress = { ...allProgress, [lesson.id]: next };

    window.localStorage.setItem(progressStorageKey, JSON.stringify(nextAllProgress));
    setProgress(next);
  }

  const percent = progress
    ? Math.round((progress.bestScore / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#111] to-[#050505] p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">{labels.progress}</h2>
              {progress ? (
                <p className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.07] px-3 py-1 text-xs text-cyan-100/80">
                  {labels.attempts}: {progress.attempts}
                </p>
              ) : null}
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-white/[0.08]"
              role="progressbar"
              aria-label={labels.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-sky-300 transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            {progress ? (
              <p className="text-xs text-white/55">
                {labels.best}: {progress.bestScore} / {progress.total}
                <span className="px-2 text-white/25">·</span>
                {labels.latest}: {progress.lastScore} / {progress.total}
              </p>
            ) : (
              <p className="text-xs text-white/45">{labels.noTest}</p>
            )}
          </div>

          <div className="grid gap-1.5 text-xs font-medium text-white/65">
            <label htmlFor="category-practice-voice">{labels.voice}</label>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <select
                id="category-practice-voice"
                value={selectedVoice}
                onChange={(event) => {
                  const voice = event.target.value;
                  setSelectedVoice(voice);
                  saveBrowserSpeechVoice(voice);
                  stopSpeechPlayback();
                  setVoicePreviewMessage("");
                }}
                className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-[#101313] px-3 text-sm text-white outline-none transition focus:border-cyan-100/60 focus:ring-2 focus:ring-cyan-100/30"
              >
                <option value="atlas-recordings" disabled>
                  ATLAS Voice (recordings coming soon)
                </option>
                <option value="">Default browser voice</option>
                {availableVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void previewSelectedVoice()}
                className="h-11 shrink-0 rounded-lg border border-cyan-100/30 bg-cyan-100/[0.06] px-4 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/60 hover:bg-cyan-100/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
              >
                {labels.testVoice}
              </button>
            </div>
            <p className="text-[0.68rem] leading-4 text-white/40" role="status" aria-live="polite">
              {voicePreviewMessage || labels.voiceHelp}
            </p>
          </div>
        </div>
      </section>

      <ListeningTestSession
        enhancedLayout
        browserVoice={selectedVoice}
        showVoiceControls={false}
        onComplete={recordProgress}
        title={lesson.title}
        pairs={lesson.pairs}
      />

      <MinimalPairTrainer
        id={`${lesson.id}-first-training`}
        title={lesson.title}
        description={lesson.description}
        pairs={lesson.pairs}
        showPairControls
        browserVoice={selectedVoice}
        showVoiceControls={false}
      />
    </div>
  );
}
