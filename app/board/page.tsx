"use client";
import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  FolderKanban,
  ChevronDown,
  PanelLeft,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Calendar,
  Tag,
  Check,
  List,
} from "lucide-react";
import Image from "next/image";
import { Filter, GalleryVerticalEnd, LayoutDashboard, ChevronsUpDown, GripVertical } from "lucide-react";
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

const fieldOptions = [
  "Priority",
  "Members",
  "Due Date",
  "Members",
  "Labels",
  "Status",
  "Reporter",
];

export default function TaskBoard() {
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [view, setView] = useState<"list" | "board">("board");
  const [checkedFields, setCheckedFields] = useState<boolean[]>(
    fieldOptions.map((_, i) => i === 1 || i === 3),
  );
  const fieldsRef = useRef<HTMLDivElement>(null);

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

  function toggleField(index: number) {
    setCheckedFields((prev) =>
      prev.map((val, i) => (i === index ? !val : val)),
    );
  }

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
            <button className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50">
              <Search className="h-4 w-4" />
            </button>
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

                  <div className="mt-2 flex flex-col">
                    {fieldOptions.map((field, i) => (
                      <button
                        key={i}
                        onClick={() => toggleField(i)}
                        className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        {field}
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            checkedFields[i]
                              ? "border-black bg-black text-white"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {checkedFields[i] && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    ))}
                  </div>
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

        {/* Board */}
        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {columns.map((col) => (
            <div key={col.id} className="flex w-72 flex-shrink-0 flex-col bg-zinc-100 border-1 border-zinc-200 p-4 rounded-lg">
              <div className="mb-3 flex items-center gap-2 px-1">
                {/* <span className={`h-2 w-2 rounded-full ${col.dotColor}`} /> */}
                <GripVertical className="w-4 h-4"/>
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
                      className="flex font-bold items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-black"
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
      </main>
    </div>
  );
}
