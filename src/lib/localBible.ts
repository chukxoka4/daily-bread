import {
  loadTranslation,
  findBook,
  getChapterVerses,
  type RawBook,
  type Verse,
} from "./bibleData";

function formatVerses(chapterNum: number, verses: Verse[]): string {
  return verses.map((v) => `${chapterNum}:${v.number} ${v.text}`).join("\n");
}

function chapterText(book: RawBook, chapterNum: number): string {
  return formatVerses(chapterNum, getChapterVerses(book, chapterNum));
}

function verseRangeText(
  book: RawBook,
  chapterNum: number,
  startVerse: number,
  endVerse: number
): string {
  const verses = getChapterVerses(book, chapterNum).filter(
    (v) => v.number >= startVerse && v.number <= endVerse
  );
  return formatVerses(chapterNum, verses);
}

export async function fetchLocalBibleText(
  reading: string,
  translation: string
): Promise<string> {
  const bible = await loadTranslation(translation);

  // Parse the reading reference
  const parts = reading.match(/^(.+?)\s+(\d.*)$/);

  // Single-chapter books appear bare in the plan (e.g. "Philemon", "Jude", "2 John")
  if (!parts) {
    const book = findBook(bible, reading.trim());
    if (!book) throw new Error(`Cannot parse reading: ${reading}`);
    return chapterText(book, 1);
  }

  const bookName = parts[1];
  const chaptersStr = parts[2];

  const book = findBook(bible, bookName);
  if (!book) throw new Error(`Book not found: ${bookName}`);

  // Verse range within a chapter: e.g., "Psalm 119:1-88"
  if (chaptersStr.includes(":")) {
    const verseMatch = chaptersStr.match(/^(\d+):(\d+)-(\d+)$/);
    if (verseMatch) {
      return verseRangeText(
        book,
        parseInt(verseMatch[1]),
        parseInt(verseMatch[2]),
        parseInt(verseMatch[3])
      );
    }
    // Single verse: e.g., "Proverbs 1:1"
    const singleMatch = chaptersStr.match(/^(\d+):(\d+)$/);
    if (singleMatch) {
      const verse = parseInt(singleMatch[2]);
      return verseRangeText(book, parseInt(singleMatch[1]), verse, verse);
    }
  }

  // Chapter range: e.g., "Genesis 1-2"
  const rangeMatch = chaptersStr.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const sections: string[] = [];
    for (let ch = start; ch <= end; ch++) {
      const text = chapterText(book, ch);
      if (text) {
        sections.push(start === end ? text : `--- Chapter ${ch} ---\n${text}`);
      }
    }
    return sections.join("\n\n");
  }

  // Single chapter: e.g., "Matthew 5"
  const singleCh = parseInt(chaptersStr);
  if (!isNaN(singleCh)) {
    return chapterText(book, singleCh);
  }

  throw new Error(`Cannot parse chapter reference: ${chaptersStr}`);
}
