// Display-shape types. Both guest demo data and real API data get adapted
// into these shapes (see adapters.ts), so every view component only ever
// needs to know about these — never about where the data came from.

export type Priority = "Urgent" | "High" | "Medium" | "Low" | "No Priority";
export type Status = "Not Started" | "In Progress" | "Done" | "Blocked";

export type TaskCard = {
  id: string;
  title: string;
  assignee: string; // display name, or "Unassigned"
  assigneeInitial: string;
  date: string | null; // pre-formatted, or null if no due date
  tags: string[];
};

export type Column = {
  id: string;
  title: string;
  tasks: TaskCard[];
};

export type Row = {
  id: string;
  task: string;
  priority: Priority;
  member: string | null; // initials, or null for "add member"
  memberColor: string;
  dueDate: string;
  labels: string[];
  status: Status;
  reporter: string;
};

export type Group = {
  id: string;
  title: string;
  status: Status;
  rows: Row[];
};

export type FieldId =
  | "priority"
  | "members"
  | "dueDate"
  | "labels"
  | "status"
  | "reporter";

export type FieldDef = {
  id: FieldId;
  label: string;
  width: string; // px width used in the grid template
};

export type ViewMode = "list" | "board";

// ---------------------------------------------------------------------------
// Real API data shapes (subset of what the backend actually returns — only
// the fields this component uses).
// ---------------------------------------------------------------------------

export type ApiUser = { id: string; name: string; avatarUrl: string | null };
export type ApiLabel = { id: string; name: string; color: string };
export type ApiPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | null;
export type ApiStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export type ApiTask = {
  id: string;
  title: string;
  priority: ApiPriority;
  status: ApiStatus;
  dueDate: string | null;
  position: number;
  reporter: ApiUser | null;
  assignees: { user: ApiUser }[];
  labels: { label: ApiLabel }[];
  column: { id: string };
};

export type ApiColumn = {
  id: string;
  name: string;
  order: number;
  colorKey: string | null;
};

export type ApiBoard = { id: string; name: string; columns: ApiColumn[] };

export type ApiProjectSummary = {
  id: string;
  name: string;
  boards: { id: string; name: string }[];
};
