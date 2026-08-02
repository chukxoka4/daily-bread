"use client";

import { useCallback, useRef, useState } from "react";
import { BIBLE_BOOKS, type ChapterRef } from "@/data/books";
import { getLastPosition, saveLastPosition } from "@/lib/readerPrefs";
import TranslationPicker from "@/components/TranslationPicker";
import BookList from "@/components/browse/BookList";
import ChapterGrid from "@/components/browse/ChapterGrid";
import ChapterReader from "@/components/browse/ChapterReader";

type Level = "books" | "chapters" | "reader";

interface BrowseScreenProps {
  translation: string;
  onTranslationChange: (id: string) => void;
}

export default function BrowseScreen({
  translation,
  onTranslationChange,
}: BrowseScreenProps) {
  const [level, setLevel] = useState<Level>("books");
  const [bookIndex, setBookIndex] = useState(0);
  // Restore where reading left off. Client-only component, so the initializer
  // can read localStorage directly.
  const [position, setPosition] = useState<ChapterRef | null>(getLastPosition);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const handleBookSelect = useCallback(
    (index: number) => {
      setBookIndex(index);
      const book = BIBLE_BOOKS[index];
      // Single-chapter books have nothing to pick — go straight to reading
      if (book.chapters === 1) {
        const ref = { bookIndex: index, chapter: 1 };
        setPosition(ref);
        saveLastPosition(ref);
        setLevel("reader");
      } else {
        setLevel("chapters");
      }
      scrollToTop();
    },
    [scrollToTop]
  );

  const handleChapterSelect = useCallback(
    (chapter: number) => {
      const ref = { bookIndex, chapter };
      setPosition(ref);
      saveLastPosition(ref);
      setLevel("reader");
      scrollToTop();
    },
    [bookIndex, scrollToTop]
  );

  const handleNavigate = useCallback(
    (ref: ChapterRef) => {
      setBookIndex(ref.bookIndex);
      setPosition(ref);
      saveLastPosition(ref);
      scrollToTop();
    },
    [scrollToTop]
  );

  const handleBack = useCallback(() => {
    setLevel((current) => {
      // Single-chapter books skip the grid on the way in, so skip it coming back
      if (current === "reader" && BIBLE_BOOKS[bookIndex].chapters > 1) {
        return "chapters";
      }
      return "books";
    });
    scrollToTop();
  }, [bookIndex, scrollToTop]);

  const handleResume = useCallback(() => {
    if (!position) return;
    setBookIndex(position.bookIndex);
    setLevel("reader");
    scrollToTop();
  }, [position, scrollToTop]);

  const showBack = level !== "books";
  const title =
    level === "books" ? "Bible" : BIBLE_BOOKS[bookIndex].name;

  return (
    <div ref={scrollRef} className="fixed inset-0 bg-zinc-950 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        <div className="flex items-center gap-2 mb-1 pt-2">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Back"
              className="p-2 -ml-2 rounded-full text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <span className="w-1" />
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>

        {level === "books" && (
          <p className="text-zinc-500 text-sm mb-5 pl-1">
            Read anything, any time.
          </p>
        )}
        {level === "chapters" && (
          <p className="text-zinc-500 text-sm mb-5 pl-1">
            Chapter {BIBLE_BOOKS[bookIndex].chapters === 1 ? "1" : `1–${BIBLE_BOOKS[bookIndex].chapters}`}
          </p>
        )}
        {level === "reader" && <div className="mb-4" />}

        <TranslationPicker
          translation={translation}
          onChange={onTranslationChange}
          className="mb-6"
        />

        {level === "books" && (
          <>
            {position && (
              <button
                onClick={handleResume}
                className="w-full flex items-center justify-between gap-2 mb-5 px-4 py-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/15 transition-colors"
              >
                <span className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80">
                    Continue reading
                  </span>
                  <span className="block text-amber-300 font-semibold text-sm mt-0.5">
                    {BIBLE_BOOKS[position.bookIndex].name}
                    {BIBLE_BOOKS[position.bookIndex].chapters > 1 &&
                      ` ${position.chapter}`}
                  </span>
                </span>
                <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <BookList
              onSelect={handleBookSelect}
              lastBookIndex={position?.bookIndex ?? null}
            />
          </>
        )}

        {level === "chapters" && (
          <ChapterGrid
            bookIndex={bookIndex}
            lastChapter={
              position?.bookIndex === bookIndex ? position.chapter : null
            }
            onSelect={handleChapterSelect}
          />
        )}

        {level === "reader" && position && (
          <ChapterReader
            position={position}
            translation={translation}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
}
