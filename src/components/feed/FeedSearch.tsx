"use client";

import { useState } from "react";
import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react";
import FiltersSheet from "@/components/explore/FiltersSheet";

// Search bar plus the filters button. Searching opens /search (EXP-02).
export default function FeedSearch({
  placeholder = "Search gear, hobbies, people",
  defaultValue = "",
}: {
  placeholder?: string;
  defaultValue?: string;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <form role="search" action="/search" className="flex items-center gap-2">
      <label className="flex h-[46px] min-w-0 flex-1 items-center gap-2.5 rounded-input border-[1.5px] border-line bg-surface-white px-3.5 text-ink-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-plum">
        <MagnifyingGlass size={20} weight="bold" aria-hidden />
        <span className="sr-only">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-body-m text-ink-900 outline-none placeholder:text-ink-400"
        />
      </label>
      <button
        type="button"
        aria-label="Filters"
        aria-haspopup="dialog"
        onClick={() => setFiltersOpen(true)}
        className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-brand-plum text-surface-white"
      >
        <SlidersHorizontal size={20} weight="bold" aria-hidden />
      </button>
      <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </form>
  );
}
