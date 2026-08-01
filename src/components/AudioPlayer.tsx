"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAudioTracks, AUDIO_CREDIT } from "@/lib/audio";

interface AudioPlayerProps {
  reading: string;
}

export default function AudioPlayer({ reading }: AudioPlayerProps) {
  const tracks = getAudioTracks(reading);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [error, setError] = useState(false);

  // Stop and reset when the reading changes (e.g. review-mode navigation)
  useEffect(() => {
    setOpen(false);
    setTrackIndex(0);
    setError(false);
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
    }
  }, [reading]);

  const loadAndPlay = useCallback(
    (index: number) => {
      const el = audioRef.current;
      if (!el) return;
      setTrackIndex(index);
      setError(false);
      el.src = tracks[index].url;
      el.play().catch(() => setError(true));
    },
    [tracks]
  );

  // play() is called inside the click handler so iOS unlocks the element
  const handleListen = useCallback(() => {
    if (open) {
      audioRef.current?.pause();
      setOpen(false);
      return;
    }
    setOpen(true);
    loadAndPlay(trackIndex);
  }, [open, trackIndex, loadAndPlay]);

  const handleEnded = useCallback(() => {
    if (trackIndex + 1 < tracks.length) {
      loadAndPlay(trackIndex + 1);
    }
  }, [trackIndex, tracks.length, loadAndPlay]);

  return (
    <>
      <button
        onClick={handleListen}
        className="text-sm px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
        {open ? "Hide Audio" : "Listen"}
      </button>

      <div className={open ? "w-full" : "hidden"}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-zinc-500">
            {tracks[trackIndex].label}
            {tracks.length > 1 && ` · ${trackIndex + 1} of ${tracks.length}`}
          </span>
          {tracks.length > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => loadAndPlay(trackIndex - 1)}
                disabled={trackIndex === 0}
                className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous chapter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => loadAndPlay(trackIndex + 1)}
                disabled={trackIndex === tracks.length - 1}
                className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next chapter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <audio
          ref={audioRef}
          controls
          preload="none"
          onEnded={handleEnded}
          onError={() => setError(true)}
          className="w-full h-10"
        />

        {error && (
          <p className="text-xs text-zinc-500 mt-1">
            Couldn&apos;t load audio. You may be offline.{" "}
            <button
              onClick={() => loadAndPlay(trackIndex)}
              className="text-blue-600 underline"
            >
              Try again
            </button>
          </p>
        )}

        <p className="text-[10px] text-zinc-400 mt-1">{AUDIO_CREDIT}</p>
      </div>
    </>
  );
}
