import type { Priority, Status, FieldDef, FieldId } from "./types";

export const priorityStyles: Record<Priority, string> = {
  Urgent: "text-red-600",
  High: "text-red-500",
  Medium: "text-orange-500",
  Low: "text-neutral-400",
  "No Priority": "text-neutral-300",
};

export const statusStyles: Record<Status, string> = {
  "Not Started": "bg-neutral-100 text-neutral-500",
  "In Progress": "bg-blue-50 text-blue-600",
  Done: "bg-emerald-50 text-emerald-600",
  Blocked: "bg-orange-50 text-orange-600",
};

export const fieldDefs: FieldDef[] = [
  { id: "priority", label: "Priority", width: "110px" },
  { id: "members", label: "Members", width: "90px" },
  { id: "dueDate", label: "Due Date", width: "130px" },
  { id: "labels", label: "Labels", width: "190px" },
  { id: "status", label: "Status", width: "130px" },
  { id: "reporter", label: "Reporter", width: "150px" },
];

export const defaultCheckedFields: Record<FieldId, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

export const AVATAR_GRADIENTS = [
  "from-purple-400 to-fuchsia-500",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-red-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];
