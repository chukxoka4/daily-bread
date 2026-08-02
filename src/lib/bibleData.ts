// Loads and caches the bundled translation JSONs. Shared by the reading-plan
// reader (localBible.ts) and the free-form browser.
interface RawVerse {
  Id: number;
  VerseText: string;
}

interface RawChapter {
  BookId: number;
  ChapterId: number;
  ChapterVerses: RawVerse[];
}

export interface RawBook {
  Id: number;
  BookName: string;
  BookChapter: RawChapter[];
}

interface BibleData {
  Name: string;
  ShortName: string;
  Books: RawBook[];
}

export interface Verse {
  number: number;
  text: string;
}

const loadedBibles: Record<string, BibleData> = {};
const inFlight = new Map<string, Promise<BibleData>>();

// Reading plan name → JSON name
const BOOK_NAME_MAP: Record<string, string> = {
  Psalm: "Psalms",
};

export async function loadTranslation(shortName: string): Promise<BibleData> {
  if (loadedBibles[shortName]) return loadedBibles[shortName];
  // Two sections expanding at once must not trigger two 6MB fetches
  const pending = inFlight.get(shortName);
  if (pending) return pending;

  const request = (async () => {
    try {
      const response = await fetch(`/bibles/${shortName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${shortName} translation`);
      }
      const data: BibleData = await response.json();
      loadedBibles[shortName] = data;
      return data;
    } finally {
      inFlight.delete(shortName);
    }
  })();

  inFlight.set(shortName, request);
  return request;
}

export function findBook(
  bible: BibleData,
  bookName: string
): RawBook | undefined {
  const mapped = BOOK_NAME_MAP[bookName] || bookName;
  return bible.Books.find((b) => b.BookName === mapped);
}

export function getChapterVerses(book: RawBook, chapterNum: number): Verse[] {
  const chapter = book.BookChapter.find((ch) => ch.ChapterId === chapterNum);
  if (!chapter) return [];

  return [...chapter.ChapterVerses]
    .sort((a, b) => a.Id - b.Id)
    .map((v) => ({ number: v.Id, text: v.VerseText }));
}

export async function fetchChapterVerses(
  bookName: string,
  chapter: number,
  translation: string
): Promise<Verse[]> {
  const bible = await loadTranslation(translation);
  const book = findBook(bible, bookName);
  if (!book) throw new Error(`Book not found: ${bookName}`);
  return getChapterVerses(book, chapter);
}
