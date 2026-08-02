"use client";

export type Tab = "today" | "bible";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  {
    id: "today",
    label: "Today",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    id: "bible",
    label: "Bible",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
  },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-label={tab.id === "today" ? "Today reading plan" : "Browse the Bible"}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors duration-200 ${
                isActive
                  ? "text-amber-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {tab.icon}
              </svg>
              <span className="text-[11px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
