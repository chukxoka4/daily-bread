const STORAGE_KEY = "daily-bread-progress";

export interface DayProgress {
  ot: boolean;
  psalms: boolean;
  nt: boolean;
  completedAt?: string;
}

export interface ProgressData {
  [dateKey: string]: DayProgress; // key format: "2026-03-03"
}

function getDateKey(date?: Date): string {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadProgress(): ProgressData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(data: ProgressData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayProgress(): DayProgress {
  const data = loadProgress();
  const key = getDateKey();
  return data[key] || { ot: false, psalms: false, nt: false };
}

export function markSectionComplete(section: "ot" | "psalms" | "nt") {
  const data = loadProgress();
  const key = getDateKey();
  if (!data[key]) {
    data[key] = { ot: false, psalms: false, nt: false };
  }
  data[key][section] = true;

  if (data[key].ot && data[key].psalms && data[key].nt) {
    data[key].completedAt = new Date().toISOString();
  }
  saveProgress(data);
  return data[key];
}

export function isDayComplete(date?: Date): boolean {
  const data = loadProgress();
  const key = getDateKey(date);
  const day = data[key];
  return day ? day.ot && day.psalms && day.nt : false;
}

export function isTodayComplete(): boolean {
  return isDayComplete(new Date());
}

export function getCurrentStreak(): number {
  const data = loadProgress();
  let streak = 0;
  const today = new Date();

  // Check if today is complete - if so, count it
  if (isDayComplete(today)) {
    streak = 1;
  } else {
    // If today isn't complete yet, start counting from yesterday
    // but only if we haven't missed today yet (it's still today)
    return 0;
  }

  // Count backwards from yesterday
  const date = new Date(today);
  date.setDate(date.getDate() - 1);

  while (true) {
    const key = getDateKey(date);
    const day = data[key];
    if (day && day.ot && day.psalms && day.nt) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getCompletedDaysThisMonth(): number[] {
  const data = loadProgress();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const days: number[] = [];

  for (let d = 1; d <= 31; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const day = data[key];
    if (day && day.ot && day.psalms && day.nt) {
      days.push(d);
    }
  }
  return days;
}

export function getTotalCompletedDays(): number {
  const data = loadProgress();
  return Object.values(data).filter(
    (d) => d.ot && d.psalms && d.nt
  ).length;
}
