"use client";

import { useId, useState, type ReactNode } from "react";

export type ProfileTab = {
  id: string;
  label: string;
  content: ReactNode;
};

// Underlined tabs (Posts, For trade, Trades, Reviews). Content is rendered on
// the server and passed in, so switching tabs needs no extra fetch.
export default function ProfileTabs({ tabs }: { tabs: ProfileTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const baseId = useId();

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="flex border-b-[1.5px] border-line">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={`flex min-h-11 flex-1 flex-col items-center justify-end gap-2 pt-1 text-body-s font-bold ${
                active ? "text-brand-plum" : "text-ink-400"
              }`}
            >
              {tab.label}
              <span className={`h-[3px] w-[60px] rounded-[2px] ${active ? "bg-brand-plum" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== activeId}
          className="flex flex-col gap-3"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

export function EmptyTab({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-body-s text-ink-400">{children}</p>;
}
