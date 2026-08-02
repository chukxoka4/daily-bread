"use client";

import { useState, useEffect, useCallback } from "react";
import { getSavedTranslation, saveTranslation } from "@/lib/bible";
import PlanScreen from "@/components/PlanScreen";
import BrowseScreen from "@/components/BrowseScreen";
import TabBar, { type Tab } from "@/components/TabBar";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [translation, setTranslation] = useState("NIV");

  useEffect(() => {
    setMounted(true);
    setTranslation(getSavedTranslation());
  }, []);

  const handleTranslationChange = useCallback((id: string) => {
    setTranslation(id);
    saveTranslation(id);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading your daily bread...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {tab === "today" ? (
        <PlanScreen
          translation={translation}
          onTranslationChange={handleTranslationChange}
        />
      ) : (
        <BrowseScreen
          translation={translation}
          onTranslationChange={handleTranslationChange}
        />
      )}
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}
