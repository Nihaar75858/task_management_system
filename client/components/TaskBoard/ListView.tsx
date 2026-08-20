"use client";

import { Calendar, GripVertical, MoreHorizontal, Plus, Tag } from "lucide-react";
import type { Column } from "./types";

type ListViewProps = {
  columns: Column[];
};

export default function ListView({ columns }: ListViewProps) {
  return (
    <div className="flex flex-1 gap-4 overflow-x-auto p-6">
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex w-72 flex-shrink-0 flex-col rounded-lg border-1 border-zinc-200 bg-zinc-100 p-4"
        >
          <div className="mb-3 flex items-center gap-2 px-1">
            <GripVertical className="h-4 w-4" />
            <span className="text-sm font-semibold text-neutral-700">
              {col.title}
            </span>
            <button className="ml-auto rounded p-0.5 text-neutral-400 hover:bg-neutral-100">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {col.tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-neutral-900">
                    {task.title}
                  </p>
                  <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[9px] font-semibold text-white">
                    {task.assigneeInitial}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {task.assignee}
                  </span>
                  {task.date && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-500">
                      <Calendar className="h-3 w-3" />
                      {task.date}
                    </span>
                  )}
                </div>

                {task.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {task.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-black"
                      >
                        <Tag className="h-2.5 w-2.5 font-bold" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="mt-3 flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-neutral-400 hover:text-neutral-600"
            title="Creating tasks is coming in the next integration step"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>
      ))}
    </div>
  );
}
