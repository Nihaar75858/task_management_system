"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoginCard from "@/components/LoginCard";

export default function Page() {
  const router = useRouter();
  const { mode } = useAuth();

  useEffect(() => {
    if (mode === "authenticated" || mode === "guest") {
      router.replace("/board");
    }
  }, [mode, router]);

  if (mode === "loading" || mode === "authenticated" || mode === "guest") {
    return null;
  }

  return <LoginCard />;
}