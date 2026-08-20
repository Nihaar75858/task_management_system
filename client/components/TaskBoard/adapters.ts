import type {
  ApiBoard,
  ApiTask,
  ApiPriority,
  ApiStatus,
  Priority,
  Status,
  Column,
  Group,
} from "./types";
import { AVATAR_GRADIENTS } from "./constants";

const PRIORITY_LABELS: Record<Exclude<ApiPriority, null>, Priority> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const STATUS_LABELS: Record<ApiStatus, Status> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

export function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Adapts real board+task API data into the same Column[]/Group[] shapes
 * guest mode uses — everything downstream (search, Fields, rendering)
 * works identically regardless of which source it came from.
 */
export function adaptApiData(
  board: ApiBoard,
  tasks: ApiTask[],
): { columns: Column[]; groups: Group[] } {
  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  const tasksByColumn = new Map<string, ApiTask[]>();
  for (const task of tasks) {
    const list = tasksByColumn.get(task.column.id) ?? [];
    list.push(task);
    tasksByColumn.set(task.column.id, list);
  }
  for (const list of tasksByColumn.values()) {
    list.sort((a, b) => a.position - b.position);
  }

  const columns: Column[] = sortedColumns.map((col) => ({
    id: col.id,
    title: col.name,
    tasks: (tasksByColumn.get(col.id) ?? []).map((task) => {
      const primaryAssignee = task.assignees[0]?.user;
      return {
        id: task.id,
        title: task.title,
        assignee: primaryAssignee?.name ?? "Unassigned",
        assigneeInitial: primaryAssignee
          ? initialsOf(primaryAssignee.name)
          : "?",
        date: formatDate(task.dueDate),
        tags: task.labels.map((l) => l.label.name),
      };
    }),
  }));

  const groups: Group[] = sortedColumns.map((col) => ({
    id: col.id,
    title: col.name,
    status: STATUS_LABELS[
      (tasksByColumn.get(col.id)?.[0]?.status ?? "NOT_STARTED") as ApiStatus
    ],
    rows: (tasksByColumn.get(col.id) ?? []).map((task) => {
      const primaryAssignee = task.assignees[0]?.user;
      return {
        id: task.id,
        task: task.title,
        priority: task.priority
          ? PRIORITY_LABELS[task.priority]
          : "No Priority",
        member: primaryAssignee ? initialsOf(primaryAssignee.name) : null,
        memberColor: primaryAssignee ? gradientForId(primaryAssignee.id) : "",
        dueDate: formatDate(task.dueDate) ?? "—",
        labels: task.labels.map((l) => l.label.name),
        status: STATUS_LABELS[task.status],
        reporter: task.reporter?.name ?? "—",
      };
    }),
  }));

  return { columns, groups };
}
