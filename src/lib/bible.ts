const API_BOOK_MAP: Record<string, string> = {
  Psalm: "Psalms",
  "Song of Solomon": "Song of Solomon",
};

interface BibleApiResponse {
  reference: string;
  text: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  error?: string;
}

// Parse "Genesis 1-2" into { book: "Genesis", start: 1, end: 2 }
// Parse "Psalm 119:1-88" into { book: "Psalms", start: "119:1-88" } (single fetch)
function parseReading(reading: string): {
  book: string;
  chapters: number[];
  rawRef?: string;
} {
  const parts = reading.match(/^(.+?)\s+(\d.*)$/);
  if (!parts) return { book: reading, chapters: [1] };

  const bookName = parts[1];
  const chaptersStr = parts[2];
  const apiBook = API_BOOK_MAP[bookName] || bookName;

  // If it contains a colon, it's a verse range within a chapter — fetch as-is
  if (chaptersStr.includes(":")) {
    return { book: apiBook, chapters: [], rawRef: `${apiBook} ${chaptersStr}` };
  }

  // If it's a range like "3-4", split into individual chapters
  const rangeMatch = chaptersStr.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const chapters: number[] = [];
    for (let i = start; i <= end; i++) {
      chapters.push(i);
    }
    return { book: apiBook, chapters };
  }

  // Single chapter
  return { book: apiBook, chapters: [parseInt(chaptersStr)] };
}

const TEXT_CACHE_KEY = "daily-bread-bible-text-cache";

function getTextCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEXT_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setTextCache(key: string, text: string) {
  if (typeof window === "undefined") return;
  try {
    const cache = getTextCache();
    cache[key] = text;
    localStorage.setItem(TEXT_CACHE_KEY, JSON.stringify(cache));
  } catch {
    try {
      localStorage.setItem(TEXT_CACHE_KEY, JSON.stringify({ [key]: text }));
    } catch {
      // give up
    }
  }
}

async function fetchSingleRef(ref: string): Promise<string> {
  const encoded = encodeURIComponent(ref);
  const response = await fetch(
    `https://bible-api.com/${encoded}?translation=web`
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data: BibleApiResponse = await response.json();
  if (data.error) throw new Error(data.error);

  return data.verses
    .map((v) => `${v.chapter}:${v.verse} ${v.text.trim()}`)
    .join("\n");
}

export async function fetchBibleText(reading: string): Promise<string> {
  // Check cache first
  const cache = getTextCache();
  if (cache[reading]) return cache[reading];

  try {
    const parsed = parseReading(reading);

    let text: string;

    if (parsed.rawRef) {
      // Verse range — single fetch
      text = await fetchSingleRef(parsed.rawRef);
    } else {
      // Fetch each chapter individually (API limit: 1 chapter per request)
      const parts: string[] = [];
      for (const ch of parsed.chapters) {
        const ref = `${parsed.book} ${ch}`;
        const chapterText = await fetchSingleRef(ref);
        parts.push(`--- Chapter ${ch} ---\n${chapterText}`);
      }
      text =
        parsed.chapters.length === 1
          ? parts[0].replace(/^--- Chapter \d+ ---\n/, "")
          : parts.join("\n\n");
    }

    setTextCache(reading, text);
    return text;
  } catch (error) {
    console.error("Failed to fetch Bible text:", error);
    throw error;
  }
}

export function getBibleGatewayUrl(
  reading: string,
  version: string = "NIV"
): string {
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reading)}&version=${version}`;
}
