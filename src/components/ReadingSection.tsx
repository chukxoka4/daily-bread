"use client";

import { useState, useCallback } from "react";
import { fetchBibleText, getBibleGatewayUrl } from "@/lib/bible";

interface ReadingSectionProps {
  label: string;
  reading: string;
  isComplete: boolean;
  onComplete: () => void;
  accentColor: string;
}

export default function ReadingSection({
  label,
  reading,
  isComplete,
  onComplete,
  accentColor,
}: ReadingSectionProps) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = useCallback(() => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded && !text && !loading && !error) {
      setLoading(true);
      fetchBibleText(reading)
        .then((t) => {
          setText(t);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [expanded, text, loading, error, reading]);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    fetchBibleText(reading)
      .then((t) => {
        setText(t);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [reading]);

  const gatewayUrl = getBibleGatewayUrl(reading, "NIV");

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-300 ${
        isComplete
          ? "border-green-400 bg-green-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          {isComplete && (
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Done
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-zinc-900 mb-3">{reading}</h3>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={handleExpand}
            className="text-sm px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition-colors"
          >
            {expanded ? "Hide Text" : "Read Here"}
          </button>

          <a
            href={gatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
          >
            BibleGateway
          </a>

          <a
            href={gatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
            Audio
          </a>
        </div>

        {/* Expandable Bible text */}
        {expanded && (
          <div className="mt-3 border-t border-zinc-100 pt-3">
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 py-4">
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                Loading passage...
              </div>
            )}
            {error && (
              <div className="text-zinc-500 py-4">
                <p className="mb-2">
                  Could not load text. You may be offline.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="text-blue-600 underline text-sm"
                  >
                    Try again
                  </button>
                  <span className="text-zinc-300">|</span>
                  <a
                    href={gatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Read on BibleGateway
                  </a>
                </div>
              </div>
            )}
            {text && (
              <div className="max-h-96 overflow-y-auto">
                <p className="text-xs text-zinc-400 mb-2 font-medium">
                  World English Bible (WEB)
                </p>
                <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-serif">
                  {text}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mark as read button */}
        {!isComplete && (
          <button
            onClick={onComplete}
            className="mt-3 w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: accentColor }}
          >
            Mark as Read
          </button>
        )}
      </div>
    </div>
  );
}
