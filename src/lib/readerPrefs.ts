import type { ChapterRef } from "@/data/books";

const POSITION_KEY = "daily-bread-reader-position";
const THEME_KEY = "daily-bread-reader-theme";
const SIZE_KEY = "daily-bread-reader-size";

export type ReaderTheme = "light" | "sepia" | "dark";
export type ReaderSize = "sm" | "md" | "lg";

export function getLastPosition(): ChapterRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.bookIndex === "number" &&
      typeof parsed?.chapter === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLastPosition(ref: ChapterRef) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSITION_KEY, JSON.stringify(ref));
  } catch {
    // storage full or blocked — position is a convenience, not critical
  }
}

export function getReaderTheme(): ReaderTheme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "sepia" || saved === "dark" || saved === "light"
    ? saved
    : "light";
}

export function saveReaderTheme(theme: ReaderTheme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

export function getReaderSize(): ReaderSize {
  if (typeof window === "undefined") return "md";
  const saved = localStorage.getItem(SIZE_KEY);
  return saved === "sm" || saved === "md" || saved === "lg" ? saved : "md";
}

export function saveReaderSize(size: ReaderSize) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIZE_KEY, size);
}
