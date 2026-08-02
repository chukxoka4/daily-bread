"use client";

import { AVAILABLE_TRANSLATIONS } from "@/lib/bible";

interface TranslationPickerProps {
  translation: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function TranslationPicker({
  translation,
  onChange,
  className = "",
}: TranslationPickerProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-1.5 ${className}`}>
      {AVAILABLE_TRANSLATIONS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            translation === t.id
              ? "bg-amber-400 text-zinc-900"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
          title={t.name}
        >
          {t.id}
        </button>
      ))}
    </div>
  );
}
