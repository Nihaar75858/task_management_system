"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronsUpDown,
  GalleryVerticalEnd,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

type SidebarProps = {
  displayName: string;
  displayInitial: string;
  avatarUrl?: string | null;
  showLogout: boolean;
  onLogout: () => void;
};

export default function Sidebar({
  displayName,
  displayInitial,
  avatarUrl,
  showLogout,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-neutral-200 p-4">
      <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-[10px] font-semibold text-white">
            {displayInitial}
          </span>
        )}
        <span className="text-sm font-medium">{displayName}</span>
        <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-neutral-400" />
      </button>

      <div className="mt-6 flex items-center justify-between px-2 text-xs font-medium text-neutral-400">
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

      {showLogout && (
        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      )}
    </aside>
  );
}
