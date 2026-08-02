"use client";

import { useMemo, useState } from "react";
import { BIBLE_BOOKS, type Testament } from "@/data/books";

interface BookListProps {
  onSelect: (bookIndex: number) => void;
  lastBookIndex: number | null;
}

const SECTIONS: Array<{ testament: Testament; label: string }> = [
  { testament: "ot", label: "Old Testament" },
  { testament: "nt", label: "New Testament" },
];

export default function BookList({ onSelect, lastBookIndex }: BookListProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIBLE_BOOKS.map((book, index) => ({ book, index })).filter(
      ({ book }) => !q || book.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a book"
          aria-label="Find a book"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
        />
      </div>

      {matches.length === 0 && (
        <p className="text-center text-zinc-500 text-sm py-8">
          No book matches &ldquo;{query}&rdquo;.
        </p>
      )}

      {SECTIONS.map(({ testament, label }) => {
        const section = matches.filter(
          ({ book }) => book.testament === testament
        );
        if (section.length === 0) return null;

        return (
          <div key={testament} className="mb-6">
            <p className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.18em] mb-2 px-1">
              {label}
            </p>
            <div className="rounded-2xl overflow-hidden border border-zinc-800 divide-y divide-zinc-800">
              {section.map(({ book, index }) => (
                <button
                  key={book.name}
                  onClick={() => onSelect(index)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800 active:bg-zinc-700 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-zinc-200 font-medium text-[15px]">
                      {book.name}
                    </span>
                    {lastBookIndex === index && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </span>
                  <span className="text-zinc-500 text-xs tabular-nums">
                    {book.chapters === 1 ? "1 ch" : `${book.chapters} ch`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
