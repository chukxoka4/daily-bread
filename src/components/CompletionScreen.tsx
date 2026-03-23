"use client";

import { getCurrentStreak, getTotalCompletedDays } from "@/lib/progress";

interface CompletionScreenProps {
  onReview?: () => void;
}

export default function CompletionScreen({ onReview }: CompletionScreenProps) {
  const streak = getCurrentStreak();
  const total = getTotalCompletedDays();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-500 to-emerald-700 flex items-center justify-center z-50 p-6">
      <div className="text-center text-white max-w-md">
        <div className="text-7xl mb-6 animate-bounce">
          <svg
            className="w-24 h-24 mx-auto text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Today&apos;s Reading Complete!
        </h1>
        <p className="text-green-100 text-lg mb-8">
          Well done, faithful servant. You&apos;ve nourished your soul today.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-4xl font-bold">{streak}</div>
            <div className="text-green-100 text-sm">Day Streak</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-4xl font-bold">{total}</div>
            <div className="text-green-100 text-sm">Days Completed</div>
          </div>
        </div>

        {onReview && (
          <button
            onClick={onReview}
            className="mb-8 px-6 py-3 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 active:bg-white/20 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Review Readings
          </button>
        )}

        <p className="text-green-200 text-sm italic">
          &ldquo;Your word is a lamp to my feet and a light to my
          path.&rdquo;
          <br />
          <span className="text-xs">&mdash; Psalm 119:105</span>
        </p>
      </div>
    </div>
  );
}
