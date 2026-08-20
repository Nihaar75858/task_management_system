import type { Column, Group } from "./types";

// Guest is local-only (no backend at all) and represents a brand new,
// empty board — same starting shape a real new user's auto-created
// project gets (see Phase 4's default columns), just with zero tasks.

export const GUEST_COLUMNS: Column[] = [
  { id: "todo", title: "To Do", tasks: [] },
  { id: "doing", title: "Doing", tasks: [] },
  { id: "completed", title: "Completed", tasks: [] },
  { id: "onhold", title: "On Hold", tasks: [] },
];

export const GUEST_GROUPS: Group[] = [
  { id: "todo", title: "To Do", status: "Not Started", rows: [] },
  { id: "doing", title: "Doing", status: "In Progress", rows: [] },
  { id: "completed", title: "Completed", status: "Done", rows: [] },
  { id: "onhold", title: "On Hold", status: "Blocked", rows: [] },
];
