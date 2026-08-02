"use client";

import type { ReaderSize, ReaderTheme } from "@/lib/readerPrefs";

interface ReaderSettingsProps {
  theme: ReaderTheme;
  size: ReaderSize;
  onThemeChange: (theme: ReaderTheme) => void;
  onSizeChange: (size: ReaderSize) => void;
}

const THEME_OPTIONS: Array<{
  id: ReaderTheme;
  label: string;
  swatch: string;
}> = [
  { id: "light", label: "Light", swatch: "bg-white" },
  { id: "sepia", label: "Sepia", swatch: "bg-[#f4ecd8]" },
  { id: "dark", label: "Dark", swatch: "bg-zinc-900" },
];

const SIZE_OPTIONS: Array<{ id: ReaderSize; label: string; text: string }> = [
  { id: "sm", label: "Small text", text: "text-xs" },
  { id: "md", label: "Medium text", text: "text-sm" },
  { id: "lg", label: "Large text", text: "text-base" },
];

export default function ReaderSettings({
  theme,
  size,
  onThemeChange,
  onSizeChange,
}: ReaderSettingsProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3 px-1">
      <div className="flex items-center gap-1.5">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onThemeChange(option.id)}
            aria-label={option.label}
            aria-pressed={theme === option.id}
            className={`w-7 h-7 rounded-full ${option.swatch} border-2 transition-all duration-200 ${
              theme === option.id
                ? "border-amber-400 scale-110"
                : "border-zinc-700 hover:border-zinc-500"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1">
        {SIZE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSizeChange(option.id)}
            aria-label={option.label}
            aria-pressed={size === option.id}
            className={`w-7 h-7 rounded-lg font-serif font-bold ${option.text} transition-colors duration-200 ${
              size === option.id
                ? "bg-amber-400 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            A
          </button>
        ))}
      </div>
    </div>
  );
}
