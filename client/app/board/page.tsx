"use client";
import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  ChevronDown,
  PanelLeft,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Calendar,
  Tag,
  Check,
  ChevronRight,
  ChartNoAxesColumnIncreasing,
  List,
  X,
  Filter,
  GalleryVerticalEnd,
  LayoutDashboard,
  ChevronsUpDown,
  GripVertical,
} from "lucide-react";
import Link from "next/link";

type Task = {
  title: string;
  assignee: string;
  date: string;
  tags: string[];
};

type Column = {
  id: string;
  title: string;
  task: Task;
};

const columns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    task: {
      title: "Write API Documentation",
      assignee: "Admin",
      date: "29 Jul",
      tags: ["Deployment", "Deployment"],
    },
  },
  {
    id: "doing",
    title: "Doing",
    task: {
      title: "Code Review Completed",
      assignee: "Admin",
      date: "29 Jul",
      tags: ["Deployment", "Deploy"],
    },
  },
  {
    id: "completed",
    title: "Completed",
    task: {
      title: "Feature Testing Passed",
      assignee: "QA Team",
      date: "30 Jul",
      tags: ["Testing", "Passed"],
    },
  },
  {
    id: "onhold",
    title: "On Hold",
    task: {
      title: "UI Review Pending",
      assignee: "Designer",
      date: "31 Jul",
      tags: ["Design", "Review"],
    },
  },
];

type Priority = "High" | "Medium" | "Low";
type Status = "Not Started" | "In Progress" | "Done" | "Blocked";

type Row = {
  task: string;
  priority: Priority;
  member: string | null; // initials, or null for "add member"
  memberColor: string;
  dueDate: string;
  labels: string[];
  status: Status;
  reporter: string;
};

type Group = {
  id: string;
  title: string;
  status: Status;
  rows: Row[];
};

const priorityStyles: Record<Priority, string> = {
  High: "text-red-500",
  Medium: "text-orange-500",
  Low: "text-neutral-400",
};

const statusStyles: Record<Status, string> = {
  "Not Started": "bg-neutral-100 text-neutral-500",
  "In Progress": "bg-blue-50 text-blue-600",
  Done: "bg-emerald-50 text-emerald-600",
  Blocked: "bg-orange-50 text-orange-600",
};

const groups: Group[] = [
  {
    id: "todo",
    title: "To Do",
    status: "Not Started",
    rows: [
      {
        task: "Design Homepage",
        priority: "High",
        member: "AK",
        memberColor: "from-purple-400 to-fuchsia-500",
        dueDate: "12 Sep 2026",
        labels: ["UI", "Design"],
        status: "Not Started",
        reporter: "Priya Singh",
      },
      {
        task: "Develop Login Feature",
        priority: "Low",
        member: "CN",
        memberColor: "from-sky-400 to-blue-500",
        dueDate: "15 Sep 2026",
        labels: ["Backend", "Auth"],
        status: "Not Started",
        reporter: "Rahul Mehta",
      },
      {
        task: "Test Payment Gateway",
        priority: "Medium",
        member: null,
        memberColor: "",
        dueDate: "18 Sep 2026",
        labels: ["QA", "Payments"],
        status: "Not Started",
        reporter: "Ananya Iyer",
      },
    ],
  },
  {
    id: "doing",
    title: "Doing",
    status: "In Progress",
    rows: [
      {
        task: "Design Homepage",
        priority: "High",
        member: "AK",
        memberColor: "from-purple-400 to-fuchsia-500",
        dueDate: "12 Sep 2026",
        labels: ["UI", "Design"],
        status: "In Progress",
        reporter: "Priya Singh",
      },
      {
        task: "Develop Login Feature",
        priority: "Low",
        member: "CN",
        memberColor: "from-sky-400 to-blue-500",
        dueDate: "15 Sep 2026",
        labels: ["Backend", "Auth"],
        status: "In Progress",
        reporter: "Rahul Mehta",
      },
      {
        task: "Test Payment Gateway",
        priority: "Medium",
        member: null,
        memberColor: "",
        dueDate: "18 Sep 2026",
        labels: ["QA", "Payments"],
        status: "In Progress",
        reporter: "Ananya Iyer",
      },
    ],
  },
  {
    id: "completed",
    title: "Completed",
    status: "Done",
    rows: [
      {
        task: "Design Homepage",
        priority: "High",
        member: "AK",
        memberColor: "from-purple-400 to-fuchsia-500",
        dueDate: "12 Sep 2026",
        labels: ["UI", "Design"],
        status: "Done",
        reporter: "Priya Singh",
      },
      {
        task: "Develop Login Feature",
        priority: "Low",
        member: "CN",
        memberColor: "from-sky-400 to-blue-500",
        dueDate: "15 Sep 2026",
        labels: ["Backend", "Auth"],
        status: "Done",
        reporter: "Rahul Mehta",
      },
      {
        task: "Test Payment Gateway",
        priority: "Medium",
        member: null,
        memberColor: "",
        dueDate: "18 Sep 2026",
        labels: ["QA", "Payments"],
        status: "Done",
        reporter: "Ananya Iyer",
      },
    ],
  },
  {
    id: "onhold",
    title: "On Hold",
    status: "Blocked",
    rows: [
      {
        task: "UI Review Pending",
        priority: "Medium",
        member: "SD",
        memberColor: "from-emerald-400 to-teal-500",
        dueDate: "20 Sep 2026",
        labels: ["Design", "Review"],
        status: "Blocked",
        reporter: "Karan Verma",
      },
    ],
  },
];

type FieldId =
  | "priority"
  | "members"
  | "dueDate"
  | "labels"
  | "status"
  | "reporter";

type FieldDef = {
  id: FieldId;
  label: string;
  width: string; // px width used in the grid template
};

const fieldDefs: FieldDef[] = [
  { id: "priority", label: "Priority", width: "110px" },
  { id: "members", label: "Members", width: "90px" },
  { id: "dueDate", label: "Due Date", width: "130px" },
  { id: "labels", label: "Labels", width: "190px" },
  { id: "status", label: "Status", width: "130px" },
  { id: "reporter", label: "Reporter", width: "150px" },
];

const defaultCheckedFields: Record<FieldId, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

// const fieldOptions = [
//   "Priority",
//   "Members",
//   "Due Date",
//   "Members",
//   "Labels",
//   "Status",
//   "Reporter",
// ];

export default function TaskBoard() {
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [view, setView] = useState<"list" | "board">("board");
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  // const [checkedFields, setCheckedFields] = useState<boolean[]>(
  //   fieldOptions.map((_, i) => i === 1 || i === 3),
  // );
  const [checkedFields, setCheckedFields] =
    useState<Record<FieldId, boolean>>(defaultCheckedFields);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  function toggleField(id: FieldId) {
    setCheckedFields((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  const query = searchQuery.trim().toLowerCase();

  const filteredColumns = query
    ? columns.filter((col) => col.task.title.toLowerCase().includes(query))
    : columns;

  const filteredGroups = query
    ? groups
        .map((group) => ({
          ...group,
          rows: group.rows.filter((row) =>
            row.task.toLowerCase().includes(query),
          ),
        }))
        .filter((group) => group.rows.length > 0)
    : groups;

  const visibleFields = fieldDefs.filter((f) => checkedFields[f.id]);
  const gridTemplateColumns = `1fr ${visibleFields
    .map((f) => f.width)
    .join(" ")} 80px`;

  return (
    <div className="flex h-screen w-full bg-white text-neutral-900">
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-neutral-200 p-4">
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-[10px] font-semibold text-white">
            D
          </span>
          <span className="text-sm font-medium">Dexter</span>
          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-neutral-400" />
        </button>

        <div className="mt-6 flex justify-between items-center px-2 text-xs font-medium text-neutral-400">
          Workspace
          <ChevronDown className="h-3 w-3" />
        </div>

        <nav className="mt-2 flex flex-col gap-0.5">
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-2 py-1.5 text-sm font-medium text-neutral-900"
          >
            <LayoutDashboard className="h-4 w-4" />
            Tasks
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
          >
            <GalleryVerticalEnd className="h-4 w-4" />
            Projects
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
          <PanelLeft className="h-4 w-4 text-neutral-400" />
        </header>

        {/* Main Header */}
        <div className="flex p-6">
          <h1 className="text-base font-semibold">Tasks</h1>
          <div className="ml-auto flex items-center gap-2">
            {searchOpen ? (
              <div className="flex w-72 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 flex-shrink-0 text-black" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeSearch();
                  }}
                  placeholder="Search tasks..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-black hover:text-neutral-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-black">
                    ⌘F
                  </kbd>
                )}
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-lg border border-neutral-200 p-2 text-black hover:bg-neutral-50"
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
                      onClick={() => setView("list")}
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
                      onClick={() => setView("board")}
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
                          onClick={() => toggleField(field.id)}
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
            <button className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>
        </div>

        {/* List */}
        {view === "list" && (
          <div className="flex flex-1 gap-4 overflow-x-auto p-6">
            {filteredColumns.map((col) => (
              <div
                key={col.id}
                className="flex w-72 flex-shrink-0 flex-col bg-zinc-100 border-1 border-zinc-200 p-4 rounded-lg"
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <GripVertical className="w-4 h-4" />
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

                {/* <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-neutral-900">
                      {col.task.title}
                    </p>
                    <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[9px] font-semibold text-white">
                      {col.task.assignee.charAt(0)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {col.task.assignee}
                    </span>
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-500">
                      <Calendar className="h-3 w-3" />
                      {col.task.date}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {col.task.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex font-bold items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-black"
                      >
                        <Tag className="h-2.5 w-2.5 font-bold" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div> */}

                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-neutral-900">
                      {col.task.title}
                    </p>
                    <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[9px] font-semibold text-white">
                      {col.task.assignee.charAt(0)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {col.task.assignee}
                    </span>
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-500">
                      <Calendar className="h-3 w-3" />
                      {col.task.date}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {col.task.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-black"
                      >
                        <Tag className="h-2.5 w-2.5 font-bold" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="mt-3 flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-neutral-400 hover:text-neutral-600">
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grouped table board
        {view === "board" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {groups.map((group) => {
              const collapsed = collapsedGroups[group.id];
              return (
                <div key={group.id} className="mb-6">
                  <button
                    onClick={() => toggleGroup(group.id)}
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
                      <div className="grid grid-cols-[1fr_120px_120px_140px_80px] bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-500">
                        <span>Task</span>
                        <span>Priority</span>
                        <span>Members</span>
                        <span>Due Date</span>
                        <span className="text-right">Actions</span>
                      </div>

                      {group.rows.map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_120px_120px_140px_80px] items-center border-t border-neutral-100 px-4 py-3 text-sm hover:bg-neutral-50"
                        >
                          <span className="text-neutral-900 font-medium">{row.task}</span>
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${
                              priorityStyles[row.priority]
                            }`}
                          >
                            <ChartNoAxesColumnIncreasing className="h-3 w-3" />
                            {row.priority}
                          </span>
                          <span>
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
                          <span className="text-neutral-500">
                            {row.dueDate}
                          </span>
                          <button className="flex justify-end text-neutral-400 hover:text-neutral-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <button className="flex w-full items-center gap-1.5 border-t border-neutral-100 px-4 py-2.5 text-sm text-black hover:bg-neutral-50 hover:text-neutral-600">
                        <Plus className="h-3.5 w-3.5" />
                        Add Task
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )} */}
        {/* Grouped table board */}
        {view === "board" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredGroups.map((group) => {
              const collapsed = collapsedGroups[group.id];
              return (
                <div key={group.id} className="mb-6">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-700"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${
                        collapsed ? "" : "rotate-90"
                      }`}
                    />
                    {group.title}
                  </button>

                  {/* {!collapsed && (
                    <div className="overflow-hidden rounded-xl border border-neutral-200">
                      <div className="grid grid-cols-[1fr_120px_120px_140px_80px] bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-500">
                        <span>Task</span>
                        <span>Priority</span>
                        <span>Members</span>
                        <span>Due Date</span>
                        <span className="text-right">Actions</span>
                      </div>

                      {group.rows.map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_120px_120px_140px_80px] items-center border-t border-neutral-100 px-4 py-3 text-sm hover:bg-neutral-50"
                        >
                          <span className="text-neutral-900">{row.task}</span>
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${
                              priorityStyles[row.priority]
                            }`}
                          >
                            <ChartNoAxesColumnIncreasing className="h-3 w-3" />
                            {row.priority}
                          </span>
                          <span>
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
                          <span className="text-neutral-500">
                            {row.dueDate}
                          </span>
                          <button className="flex justify-end text-neutral-400 hover:text-neutral-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <button className="flex w-full items-center gap-1.5 border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600">
                        <Plus className="h-3.5 w-3.5" />
                        Add Task
                      </button>
                    </div>
                  )} */}
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

                      {group.rows.map((row, i) => (
                        <div
                          key={i}
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
                                <span
                                  key={f.id}
                                  className="flex flex-wrap gap-1"
                                >
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
                      <button className="flex w-full items-center gap-1.5 border-t border-neutral-100 px-4 py-2.5 text-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600">
                        <Plus className="h-3.5 w-3.5" />
                        Add Task
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
