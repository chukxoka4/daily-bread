"use client";

import { useState, useEffect, useCallback } from "react";
import { getTodayReading, type DayReading } from "@/data/readingPlan";
import {
  getTodayProgress,
  markSectionComplete,
  isTodayComplete,
  getCurrentStreak,
  getTotalCompletedDays,
  type DayProgress,
} from "@/lib/progress";
import {
  AVAILABLE_TRANSLATIONS,
  getSavedTranslation,
  saveTranslation,
} from "@/lib/bible";
import ReadingSection from "@/components/ReadingSection";
import CompletionScreen from "@/components/CompletionScreen";

const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Home() {
  const [reading, setReading] = useState<DayReading | null>(null);
  const [progress, setProgress] = useState<DayProgress>({
    ot: false,
    psalms: false,
    nt: false,
  });
  const [complete, setComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [translation, setTranslation] = useState("NIV");

  useEffect(() => {
    setMounted(true);
    const todayReading = getTodayReading();
    setReading(todayReading || null);
    setProgress(getTodayProgress());
    setComplete(isTodayComplete());
    setTranslation(getSavedTranslation());
  }, []);

  const handleTranslationChange = useCallback((id: string) => {
    setTranslation(id);
    saveTranslation(id);
  }, []);

  const handleComplete = useCallback(
    (section: "ot" | "psalms" | "nt") => {
      const updated = markSectionComplete(section);
      setProgress({ ...updated });
      if (updated.ot && updated.psalms && updated.nt) {
        setComplete(true);
      }
    },
    []
  );

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading your daily bread...</p>
        </div>
      </div>
    );
  }

  if (complete) {
    return <CompletionScreen />;
  }

  if (!reading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center text-zinc-400 max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">
            No Reading Found
          </h1>
          <p>
            There&apos;s no reading scheduled for today in your plan. This might
            happen on leap years or if the plan doesn&apos;t cover today&apos;s
            date.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const progressPercent =
    [progress.ot, progress.psalms, progress.nt].filter(Boolean).length / 3;
  const streak = getCurrentStreak();
  const totalDays = getTotalCompletedDays();

  return (
    <div className="fixed inset-0 bg-zinc-950 overflow-y-auto">
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
          style={{ width: `${progressPercent * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Daily Bread
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">
            {MONTHS[reading.month]} {reading.day}
          </h1>
          <p className="text-zinc-500 text-sm">
            Day {dayOfYear} of 365
          </p>
        </div>

        {/* Translation picker */}
        <div className="flex justify-center gap-1.5 mb-6">
          {AVAILABLE_TRANSLATIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTranslationChange(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                translation === t.id
                  ? "bg-amber-400 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
              title={t.name}
            >
              {t.id}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-6 mb-8">
          {streak > 0 && (
            <div className="text-center">
              <div className="text-amber-400 text-xl font-bold">{streak}</div>
              <div className="text-zinc-500 text-xs">streak</div>
            </div>
          )}
          {totalDays > 0 && (
            <div className="text-center">
              <div className="text-zinc-300 text-xl font-bold">{totalDays}</div>
              <div className="text-zinc-500 text-xs">completed</div>
            </div>
          )}
        </div>

        {/* Reading sections */}
        <div className="space-y-4">
          <ReadingSection
            label="Old Testament"
            reading={reading.ot}
            isComplete={progress.ot}
            onComplete={() => handleComplete("ot")}
            accentColor="#B45309"
            translation={translation}
          />

          <ReadingSection
            label={
              reading.psalms.startsWith("Proverbs") ? "Proverbs" : "Psalms"
            }
            reading={reading.psalms}
            isComplete={progress.psalms}
            onComplete={() => handleComplete("psalms")}
            accentColor="#7C3AED"
            translation={translation}
          />

          <ReadingSection
            label="New Testament"
            reading={reading.nt}
            isComplete={progress.nt}
            onComplete={() => handleComplete("nt")}
            accentColor="#0369A1"
            translation={translation}
          />
        </div>

        {/* Bottom motivational text */}
        <div className="text-center mt-8">
          <p className="text-zinc-600 text-xs">
            {progressPercent === 0
              ? "Start with any section. You've got this."
              : progressPercent < 1
                ? `${Math.round(progressPercent * 100)}% done. Keep going!`
                : "All done for today!"}
          </p>
        </div>
      </div>
    </div>
  );
}
