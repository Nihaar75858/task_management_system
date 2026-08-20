"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { FieldId, ViewMode } from "./types";
import { fieldDefs } from "./constants";

type BoardHeaderProps = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  checkedFields: Record<FieldId, boolean>;
  onToggleField: (id: FieldId) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
};

export default function BoardHeader({
  view,
  onViewChange,
  checkedFields,
  onToggleField,
  searchQuery,
  onSearchQueryChange,
}: BoardHeaderProps) {
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        fieldsRef.current &&
        !fieldsRef.current.contains(event.target as Node)
      ) {
        setFieldsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    onSearchQueryChange("");
  }

  return (
    <div className="flex p-6">
      <h1 className="text-base font-semibold">Tasks</h1>
      <div className="ml-auto flex items-center gap-2">
        {searchOpen ? (
          <div className="flex w-72 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
              }}
              placeholder="Search tasks..."
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchQueryChange("")}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
                ⌘F
              </kbd>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        <div className="relative" ref={fieldsRef}>
          <button
            onClick={() => setFieldsOpen((prev) => !prev)}
            aria-expanded={fieldsOpen}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
              fieldsOpen
                ? "border-neutral-300 bg-neutral-50 text-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Fields
          </button>

          {fieldsOpen && (
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
              <div className="flex rounded-lg bg-neutral-100 p-1">
                <button
                  onClick={() => onViewChange("list")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    view === "list"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  onClick={() => onViewChange("board")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    view === "board"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Board
                </button>
              </div>

              {view === "board" ? (
                <div className="mt-2 flex flex-col">
                  {fieldDefs.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => onToggleField(field.id)}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      {field.label}
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          checkedFields[field.id]
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {checkedFields[field.id] && (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-3 text-xs text-neutral-400">
                  Column fields only apply to Board view.
                </p>
              )}
            </div>
          )}
        </div>

        <button className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50">
          <Filter className="h-4 w-4 text-bold" />
        </button>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          title="Creating tasks is coming in the next integration step"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>
      </div>
    </div>
  );
}
