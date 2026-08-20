"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type {
  ApiBoard,
  ApiProjectSummary,
  ApiTask,
  Column,
  FieldId,
  Group,
  ViewMode,
} from "./types";
import { defaultCheckedFields, fieldDefs } from "./constants";
import { GUEST_COLUMNS, GUEST_GROUPS } from "./guest-data";
import { adaptApiData } from "./adapters";
import Sidebar from "./Sidebar";
import BoardHeader from "./BoardHeader";
import ListView from "./ListView";
import BoardView from "./BoardView";

export default function TaskBoard() {
  const router = useRouter();
  const { mode, user, authFetch, logout } = useAuth();

  const [view, setView] = useState<ViewMode>("board");
  const [checkedFields, setCheckedFields] = useState<Record<FieldId, boolean>>(
    defaultCheckedFields,
  );
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");

  // Real data state — only populated/used when mode === "authenticated".
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiBoard, setApiBoard] = useState<ApiBoard | null>(null);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);

  // Load real data for authenticated users. Guest mode never reaches the
  // backend at all — it's excluded from this effect entirely.
  useEffect(() => {
    if (mode !== "authenticated") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const projectsRes = await authFetch("/projects");
        if (!projectsRes.ok) throw new Error("Failed to load projects");
        const projects: ApiProjectSummary[] = await projectsRes.json();

        let project = projects[0];
        if (!project) {
          const createRes = await authFetch("/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Pyramid" }),
          });
          if (!createRes.ok) throw new Error("Failed to create a project");
          project = await createRes.json();
        }

        const boardsRes = await authFetch(`/projects/${project.id}/boards`);
        if (!boardsRes.ok) throw new Error("Failed to load boards");
        const boards: { id: string; name: string }[] = await boardsRes.json();
        const boardSummary = boards[0];
        if (!boardSummary) throw new Error("This project has no board yet");

        const [boardRes, tasksRes] = await Promise.all([
          authFetch(`/boards/${boardSummary.id}`),
          authFetch(`/boards/${boardSummary.id}/tasks`),
        ]);
        if (!boardRes.ok) throw new Error("Failed to load board");
        if (!tasksRes.ok) throw new Error("Failed to load tasks");

        const boardData: ApiBoard = await boardRes.json();
        const tasksData: ApiTask[] = await tasksRes.json();

        if (!cancelled) {
          setApiBoard(boardData);
          setApiTasks(tasksData);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Something went wrong",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, authFetch]);

  function toggleField(id: FieldId) {
    setCheckedFields((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  const { columns, groups } = useMemo(() => {
    if (mode === "guest") {
      return { columns: GUEST_COLUMNS, groups: GUEST_GROUPS };
    }
    if (apiBoard) {
      return adaptApiData(apiBoard, apiTasks);
    }
    return { columns: [] as Column[], groups: [] as Group[] };
  }, [mode, apiBoard, apiTasks]);

  const query = searchQuery.trim().toLowerCase();

  const filteredColumns = query
    ? columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.title.toLowerCase().includes(query)),
      }))
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

  const displayName = mode === "guest" ? "Guest" : (user?.name ?? "…");
  const displayInitial = displayName.charAt(0).toUpperCase();

  const dataPending = mode === "authenticated" && (loading || !!loadError);

  return (
    <div className="flex h-screen w-full bg-white text-neutral-900">
      <Sidebar
        displayName={displayName}
        displayInitial={displayInitial}
        avatarUrl={mode === "authenticated" ? user?.avatarUrl : null}
        showLogout={mode === "authenticated"}
        onLogout={handleLogout}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
          <PanelLeft className="h-4 w-4 text-neutral-400" />
        </header>

        <BoardHeader
          view={view}
          onViewChange={setView}
          checkedFields={checkedFields}
          onToggleField={toggleField}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        {mode === "authenticated" && loading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-neutral-400">Loading your board…</p>
          </div>
        )}

        {mode === "authenticated" && !loading && loadError && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-red-500">{loadError}</p>
          </div>
        )}

        {!dataPending && view === "list" && (
          <ListView columns={filteredColumns} />
        )}

        {!dataPending && view === "board" && (
          <BoardView
            groups={filteredGroups}
            visibleFields={visibleFields}
            gridTemplateColumns={gridTemplateColumns}
            collapsedGroups={collapsedGroups}
            onToggleGroup={toggleGroup}
          />
        )}
      </main>
    </div>
  );
}
