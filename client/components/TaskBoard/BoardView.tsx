"use client";

import { ChartNoAxesColumnIncreasing, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import type { FieldDef, Group } from "./types";
import { priorityStyles, statusStyles } from "./constants";

type BoardViewProps = {
  groups: Group[];
  visibleFields: FieldDef[];
  gridTemplateColumns: string;
  collapsedGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
};

export default function BoardView({
  groups,
  visibleFields,
  gridTemplateColumns,
  collapsedGroups,
  onToggleGroup,
}: BoardViewProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {groups.map((group) => {
        const collapsed = collapsedGroups[group.id];
        return (
          <div key={group.id} className="mb-6">
            <button
              onClick={() => onToggleGroup(group.id)}
              className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-700"
            >
              <ChevronRight
                className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${
                  collapsed ? "" : "rotate-90"
                }`}
              />
              {group.title}
            </button>

            {!collapsed && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                <div
                  className="grid bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-500"
                  style={{ gridTemplateColumns }}
                >
                  <span>Task</span>
                  {visibleFields.map((f) => (
                    <span key={f.id}>{f.label}</span>
                  ))}
                  <span className="text-right">Actions</span>
                </div>

                {group.rows.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-neutral-400">
                    No tasks yet
                  </div>
                )}

                {group.rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid items-center border-t border-neutral-100 px-4 py-3 text-sm hover:bg-neutral-50"
                    style={{ gridTemplateColumns }}
                  >
                    <span className="text-neutral-900">{row.task}</span>

                    {visibleFields.map((f) => {
                      if (f.id === "priority") {
                        return (
                          <span
                            key={f.id}
                            className={`flex items-center gap-1 text-xs font-medium ${
                              priorityStyles[row.priority]
                            }`}
                          >
                            <ChartNoAxesColumnIncreasing className="h-3 w-3" />
                            {row.priority}
                          </span>
                        );
                      }
                      if (f.id === "members") {
                        return (
                          <span key={f.id}>
                            {row.member ? (
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ${row.memberColor}`}
                              >
                                {row.member}
                              </span>
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-neutral-300 text-neutral-400">
                                <Plus className="h-3 w-3" />
                              </span>
                            )}
                          </span>
                        );
                      }
                      if (f.id === "dueDate") {
                        return (
                          <span key={f.id} className="text-neutral-500">
                            {row.dueDate}
                          </span>
                        );
                      }
                      if (f.id === "labels") {
                        return (
                          <span key={f.id} className="flex flex-wrap gap-1">
                            {row.labels.map((label, li) => (
                              <span
                                key={li}
                                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                              >
                                {label}
                              </span>
                            ))}
                          </span>
                        );
                      }
                      if (f.id === "status") {
                        return (
                          <span key={f.id}>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                statusStyles[row.status]
                              }`}
                            >
                              {row.status}
                            </span>
                          </span>
                        );
                      }
                      if (f.id === "reporter") {
                        return (
                          <span key={f.id} className="text-neutral-600">
                            {row.reporter}
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button className="flex justify-end text-neutral-400 hover:text-neutral-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  className="flex w-full items-center gap-1.5 border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                  title="Creating tasks is coming in the next integration step"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
