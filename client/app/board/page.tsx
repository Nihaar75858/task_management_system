"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import TaskBoard from "@/components/TaskBoard";

export default function Page() {
  const router = useRouter();
  const { mode } = useAuth();

  useEffect(() => {
    if (mode === "unauthenticated") {
      router.replace("/");
    }
  }, [mode, router]);

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (mode === "unauthenticated") {
    // Redirect is in flight (see effect above) — render nothing in the
    // meantime rather than flashing the board.
    return null;
  }

  return <TaskBoard />;
}