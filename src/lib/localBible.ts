interface BibleVerse {
  Id: number;
  VerseText: string;
}

interface BibleChapter {
  BookId: number;
  ChapterId: number;
  ChapterVerses: BibleVerse[];
}

interface BibleBook {
  Id: number;
  BookName: string;
  BookChapter: BibleChapter[];
}

interface BibleData {
  Name: string;
  ShortName: string;
  Books: BibleBook[];
}

// In-memory cache for loaded translations
const loadedBibles: Record<string, BibleData> = {};

// Book name mapping: reading plan name → JSON name
const BOOK_NAME_MAP: Record<string, string> = {
  Psalm: "Psalms",
};

async function loadTranslation(shortName: string): Promise<BibleData> {
  if (loadedBibles[shortName]) return loadedBibles[shortName];

  const response = await fetch(`/bibles/${shortName}.json`);
  if (!response.ok) throw new Error(`Failed to load ${shortName} translation`);

  const data: BibleData = await response.json();
  loadedBibles[shortName] = data;
  return data;
}

function findBook(bible: BibleData, bookName: string): BibleBook | undefined {
  const mapped = BOOK_NAME_MAP[bookName] || bookName;
  return bible.Books.find((b) => b.BookName === mapped);
}

function getChapterVerses(book: BibleBook, chapterNum: number): string {
  const chapter = book.BookChapter.find((ch) => ch.ChapterId === chapterNum);
  if (!chapter) return "";

  const sorted = [...chapter.ChapterVerses].sort((a, b) => a.Id - b.Id);
  return sorted.map((v) => `${chapterNum}:${v.Id} ${v.VerseText}`).join("\n");
}

function getVerseRange(
  book: BibleBook,
  chapterNum: number,
  startVerse: number,
  endVerse: number
): string {
  const chapter = book.BookChapter.find((ch) => ch.ChapterId === chapterNum);
  if (!chapter) return "";

  const sorted = [...chapter.ChapterVerses]
    .sort((a, b) => a.Id - b.Id)
    .filter((v) => v.Id >= startVerse && v.Id <= endVerse);

  return sorted
    .map((v) => `${chapterNum}:${v.Id} ${v.VerseText}`)
    .join("\n");
}

export async function fetchLocalBibleText(
  reading: string,
  translation: string
): Promise<string> {
  const bible = await loadTranslation(translation);

  // Parse the reading reference
  const parts = reading.match(/^(.+?)\s+(\d.*)$/);
  if (!parts) throw new Error(`Cannot parse reading: ${reading}`);

  const bookName = parts[1];
  const chaptersStr = parts[2];

  const book = findBook(bible, bookName);
  if (!book) throw new Error(`Book not found: ${bookName}`);

  // Verse range within a chapter: e.g., "Psalm 119:1-88"
  if (chaptersStr.includes(":")) {
    const verseMatch = chaptersStr.match(/^(\d+):(\d+)-(\d+)$/);
    if (verseMatch) {
      const ch = parseInt(verseMatch[1]);
      const start = parseInt(verseMatch[2]);
      const end = parseInt(verseMatch[3]);
      return getVerseRange(book, ch, start, end);
    }
    // Single verse: e.g., "Proverbs 1:1"
    const singleMatch = chaptersStr.match(/^(\d+):(\d+)$/);
    if (singleMatch) {
      const ch = parseInt(singleMatch[1]);
      const verse = parseInt(singleMatch[2]);
      return getVerseRange(book, ch, verse, verse);
    }
  }

  // Chapter range: e.g., "Genesis 1-2"
  const rangeMatch = chaptersStr.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const sections: string[] = [];
    for (let ch = start; ch <= end; ch++) {
      const text = getChapterVerses(book, ch);
      if (text) {
        sections.push(
          start === end ? text : `--- Chapter ${ch} ---\n${text}`
        );
      }
    }
    return sections.join("\n\n");
  }

  // Single chapter: e.g., "Matthew 5"
  const singleCh = parseInt(chaptersStr);
  if (!isNaN(singleCh)) {
    return getChapterVerses(book, singleCh);
  }

  throw new Error(`Cannot parse chapter reference: ${chaptersStr}`);
}
