"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BIBLE_BOOKS,
  formatReference,
  nextChapter,
  prevChapter,
  type ChapterRef,
} from "@/data/books";
import { fetchChapterVerses, type Verse } from "@/lib/bibleData";
import {
  getReaderSize,
  getReaderTheme,
  saveReaderSize,
  saveReaderTheme,
  type ReaderSize,
  type ReaderTheme,
} from "@/lib/readerPrefs";
import AudioPlayer from "@/components/AudioPlayer";
import ReaderSettings from "@/components/browse/ReaderSettings";

interface ChapterReaderProps {
  position: ChapterRef;
  translation: string;
  onNavigate: (ref: ChapterRef) => void;
}

const THEMES: Record<
  ReaderTheme,
  { surface: string; text: string; num: string; rule: string }
> = {
  light: {
    surface: "bg-white border-zinc-200",
    text: "text-zinc-800",
    num: "text-amber-600",
    rule: "border-zinc-100",
  },
  sepia: {
    surface: "bg-[#f4ecd8] border-[#e2d7bd]",
    text: "text-[#463c2c]",
    num: "text-amber-700",
    rule: "border-[#e2d7bd]",
  },
  dark: {
    surface: "bg-zinc-900 border-zinc-800",
    text: "text-zinc-300",
    num: "text-amber-400",
    rule: "border-zinc-800",
  },
};

const SIZES: Record<ReaderSize, string> = {
  sm: "text-[15px] leading-7",
  md: "text-[17px] leading-8",
  lg: "text-[19px] leading-9",
};

export default function ChapterReader({
  position,
  translation,
  onNavigate,
}: ChapterReaderProps) {
  // Only ever mounted on the client (the page gates on mount), so reading
  // saved prefs in the initializer is safe and avoids a flash of defaults.
  const [theme, setTheme] = useState<ReaderTheme>(getReaderTheme);
  const [size, setSize] = useState<ReaderSize>(getReaderSize);

  const book = BIBLE_BOOKS[position.bookIndex];
  const reference = formatReference(position);
  const requestKey = `${translation}:${book.name}:${position.chapter}`;

  // Loading is derived from "what's fetched vs what's asked for", so switching
  // chapter or translation shows the spinner without an extra render pass.
  const [loaded, setLoaded] = useState<{ key: string; verses: Verse[] } | null>(
    null
  );
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const verses = loaded?.key === requestKey ? loaded.verses : [];
  const error = failedKey === requestKey;
  const loading = loaded?.key !== requestKey && !error;

  useEffect(() => {
    let active = true;
    fetchChapterVerses(book.name, position.chapter, translation)
      .then((result) => {
        if (active) setLoaded({ key: requestKey, verses: result });
      })
      .catch(() => {
        if (active) setFailedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [book.name, position.chapter, translation, requestKey, retryCount]);

  const load = useCallback(() => {
    setFailedKey(null);
    setRetryCount((n) => n + 1);
  }, []);

  const handleTheme = useCallback((next: ReaderTheme) => {
    setTheme(next);
    saveReaderTheme(next);
  }, []);

  const handleSize = useCallback((next: ReaderSize) => {
    setSize(next);
    saveReaderSize(next);
  }, []);

  const prev = prevChapter(position);
  const next = nextChapter(position);
  const styles = THEMES[theme];

  return (
    <div>
      <ReaderSettings
        theme={theme}
        size={size}
        onThemeChange={handleTheme}
        onSizeChange={handleSize}
      />

      <article
        className={`rounded-2xl border ${styles.surface} transition-colors duration-300`}
      >
        <div className="px-5 pt-5 pb-4">
          <h2 className={`font-serif font-bold text-xl ${styles.text}`}>
            {reference}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">{translation}</p>
        </div>

        <div className={`border-t ${styles.rule} px-5 py-5`}>
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 py-6 text-sm">
              <div className="w-4 h-4 border-2 border-zinc-300 border-t-amber-500 rounded-full animate-spin" />
              Loading {reference}...
            </div>
          )}

          {error && (
            <div className="py-6 text-sm text-zinc-500">
              <p className="mb-2">Could not load this chapter.</p>
              <button onClick={load} className="text-blue-600 underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <p className={`font-serif ${SIZES[size]} ${styles.text}`}>
              {verses.map((verse) => (
                <span key={verse.number}>
                  <sup
                    className={`${styles.num} text-[0.62em] font-sans font-bold mr-0.5 align-super`}
                  >
                    {verse.number}
                  </sup>
                  {verse.text}{" "}
                </span>
              ))}
            </p>
          )}
        </div>

        {translation === "WEB" && !loading && !error && (
          <div className={`border-t ${styles.rule} px-5 py-4 flex flex-wrap gap-2`}>
            <AudioPlayer reading={reference} />
          </div>
        )}
      </article>

      <div className="flex items-center justify-between gap-3 mt-4">
        <button
          onClick={() => prev && onNavigate(prev)}
          disabled={!prev}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {prev ? formatReference(prev) : "Start"}
        </button>

        <button
          onClick={() => next && onNavigate(next)}
          disabled={!next}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {next ? formatReference(next) : "End"}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
