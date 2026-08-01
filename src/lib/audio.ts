// Audio for the World English Bible reading — streamed from the complete
// chapter-per-file narration by Winfred W. Henson hosted on archive.org
// (item WEB_201806, CC BY-NC-ND 4.0).
const AUDIO_BASE = "https://archive.org/download/WEB_201806";

// Reading plan book name → audio filename base (spaces stripped afterwards)
const AUDIO_BOOK_MAP: Record<string, string> = {
  Psalm: "Psalms",
  "Song of Solomon": "SongOfSolomon",
};

// Books recorded as one file with no chapter number in the filename
const SINGLE_FILE_BOOKS = new Set([
  "Obadiah",
  "Philemon",
  "2 John",
  "3 John",
  "Jude",
]);

export interface AudioTrack {
  url: string;
  label: string; // e.g. "Nehemiah 1"
}

export const AUDIO_CREDIT =
  "WEB audio read by Winfred W. Henson (CC BY-NC-ND 4.0)";

export function getAudioTracks(reading: string): AudioTrack[] {
  const parts = reading.match(/^(.+?)\s+(\d.*)$/);
  const bookName = parts ? parts[1] : reading.trim();
  const chaptersStr = parts ? parts[2] : "";

  const base = (AUDIO_BOOK_MAP[bookName] || bookName).replace(/ /g, "");

  if (SINGLE_FILE_BOOKS.has(bookName)) {
    return [{ url: `${AUDIO_BASE}/${base}.mp3`, label: bookName }];
  }

  let chapters: number[];
  const rangeMatch = chaptersStr.match(/^(\d+)-(\d+)$/);
  const verseMatch = chaptersStr.match(/^(\d+):/);
  if (rangeMatch) {
    chapters = [];
    for (let c = parseInt(rangeMatch[1]); c <= parseInt(rangeMatch[2]); c++) {
      chapters.push(c);
    }
  } else if (verseMatch) {
    // Verse range like "119:1-88" → the whole chapter's audio
    chapters = [parseInt(verseMatch[1])];
  } else {
    chapters = [parseInt(chaptersStr) || 1];
  }

  return chapters.map((c) => ({
    url: `${AUDIO_BASE}/${base}${c}.mp3`,
    label: `${bookName} ${c}`,
  }));
}
