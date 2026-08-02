"use client";

import { BIBLE_BOOKS } from "@/data/books";

interface ChapterGridProps {
  bookIndex: number;
  lastChapter: number | null;
  onSelect: (chapter: number) => void;
}

export default function ChapterGrid({
  bookIndex,
  lastChapter,
  onSelect,
}: ChapterGridProps) {
  const book = BIBLE_BOOKS[bookIndex];
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 gap-2">
      {chapters.map((chapter) => {
        const isLast = lastChapter === chapter;
        return (
          <button
            key={chapter}
            onClick={() => onSelect(chapter)}
            className={`aspect-square rounded-xl font-semibold text-sm tabular-nums transition-all duration-200 active:scale-95 ${
              isLast
                ? "bg-amber-400 text-zinc-900"
                : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
            }`}
          >
            {chapter}
          </button>
        );
      })}
    </div>
  );
}
