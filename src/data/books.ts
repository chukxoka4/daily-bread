export type Testament = "ot" | "nt";

export interface BookInfo {
  name: string; // must match BookName in the translation JSONs
  testament: Testament;
  chapters: number;
}

// Canonical order and chapter counts. The translation JSONs carry arbitrary
// database ids (in NIV, id 1 is Philemon), so book order cannot be derived
// from them — this list is the source of truth for browsing.
export const BIBLE_BOOKS: BookInfo[] = [
  { name: "Genesis", testament: "ot", chapters: 50 },
  { name: "Exodus", testament: "ot", chapters: 40 },
  { name: "Leviticus", testament: "ot", chapters: 27 },
  { name: "Numbers", testament: "ot", chapters: 36 },
  { name: "Deuteronomy", testament: "ot", chapters: 34 },
  { name: "Joshua", testament: "ot", chapters: 24 },
  { name: "Judges", testament: "ot", chapters: 21 },
  { name: "Ruth", testament: "ot", chapters: 4 },
  { name: "1 Samuel", testament: "ot", chapters: 31 },
  { name: "2 Samuel", testament: "ot", chapters: 24 },
  { name: "1 Kings", testament: "ot", chapters: 22 },
  { name: "2 Kings", testament: "ot", chapters: 25 },
  { name: "1 Chronicles", testament: "ot", chapters: 29 },
  { name: "2 Chronicles", testament: "ot", chapters: 36 },
  { name: "Ezra", testament: "ot", chapters: 10 },
  { name: "Nehemiah", testament: "ot", chapters: 13 },
  { name: "Esther", testament: "ot", chapters: 10 },
  { name: "Job", testament: "ot", chapters: 42 },
  { name: "Psalms", testament: "ot", chapters: 150 },
  { name: "Proverbs", testament: "ot", chapters: 31 },
  { name: "Ecclesiastes", testament: "ot", chapters: 12 },
  { name: "Song of Solomon", testament: "ot", chapters: 8 },
  { name: "Isaiah", testament: "ot", chapters: 66 },
  { name: "Jeremiah", testament: "ot", chapters: 52 },
  { name: "Lamentations", testament: "ot", chapters: 5 },
  { name: "Ezekiel", testament: "ot", chapters: 48 },
  { name: "Daniel", testament: "ot", chapters: 12 },
  { name: "Hosea", testament: "ot", chapters: 14 },
  { name: "Joel", testament: "ot", chapters: 3 },
  { name: "Amos", testament: "ot", chapters: 9 },
  { name: "Obadiah", testament: "ot", chapters: 1 },
  { name: "Jonah", testament: "ot", chapters: 4 },
  { name: "Micah", testament: "ot", chapters: 7 },
  { name: "Nahum", testament: "ot", chapters: 3 },
  { name: "Habakkuk", testament: "ot", chapters: 3 },
  { name: "Zephaniah", testament: "ot", chapters: 3 },
  { name: "Haggai", testament: "ot", chapters: 2 },
  { name: "Zechariah", testament: "ot", chapters: 14 },
  { name: "Malachi", testament: "ot", chapters: 4 },
  { name: "Matthew", testament: "nt", chapters: 28 },
  { name: "Mark", testament: "nt", chapters: 16 },
  { name: "Luke", testament: "nt", chapters: 24 },
  { name: "John", testament: "nt", chapters: 21 },
  { name: "Acts", testament: "nt", chapters: 28 },
  { name: "Romans", testament: "nt", chapters: 16 },
  { name: "1 Corinthians", testament: "nt", chapters: 16 },
  { name: "2 Corinthians", testament: "nt", chapters: 13 },
  { name: "Galatians", testament: "nt", chapters: 6 },
  { name: "Ephesians", testament: "nt", chapters: 6 },
  { name: "Philippians", testament: "nt", chapters: 4 },
  { name: "Colossians", testament: "nt", chapters: 4 },
  { name: "1 Thessalonians", testament: "nt", chapters: 5 },
  { name: "2 Thessalonians", testament: "nt", chapters: 3 },
  { name: "1 Timothy", testament: "nt", chapters: 6 },
  { name: "2 Timothy", testament: "nt", chapters: 4 },
  { name: "Titus", testament: "nt", chapters: 3 },
  { name: "Philemon", testament: "nt", chapters: 1 },
  { name: "Hebrews", testament: "nt", chapters: 13 },
  { name: "James", testament: "nt", chapters: 5 },
  { name: "1 Peter", testament: "nt", chapters: 5 },
  { name: "2 Peter", testament: "nt", chapters: 3 },
  { name: "1 John", testament: "nt", chapters: 5 },
  { name: "2 John", testament: "nt", chapters: 1 },
  { name: "3 John", testament: "nt", chapters: 1 },
  { name: "Jude", testament: "nt", chapters: 1 },
  { name: "Revelation", testament: "nt", chapters: 22 },
];

export interface ChapterRef {
  bookIndex: number;
  chapter: number;
}

// Reading flows across book boundaries: Genesis 50 → Exodus 1.
export function nextChapter(ref: ChapterRef): ChapterRef | null {
  const book = BIBLE_BOOKS[ref.bookIndex];
  if (ref.chapter < book.chapters) {
    return { bookIndex: ref.bookIndex, chapter: ref.chapter + 1 };
  }
  if (ref.bookIndex < BIBLE_BOOKS.length - 1) {
    return { bookIndex: ref.bookIndex + 1, chapter: 1 };
  }
  return null;
}

export function prevChapter(ref: ChapterRef): ChapterRef | null {
  if (ref.chapter > 1) {
    return { bookIndex: ref.bookIndex, chapter: ref.chapter - 1 };
  }
  if (ref.bookIndex > 0) {
    const prev = BIBLE_BOOKS[ref.bookIndex - 1];
    return { bookIndex: ref.bookIndex - 1, chapter: prev.chapters };
  }
  return null;
}

// Single-chapter books read as just the book name, matching the reading plan
// and the audio filenames.
export function formatReference(ref: ChapterRef): string {
  const book = BIBLE_BOOKS[ref.bookIndex];
  return book.chapters === 1 ? book.name : `${book.name} ${ref.chapter}`;
}
