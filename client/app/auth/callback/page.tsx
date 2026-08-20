"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setSessionFromCallback } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    // Strip the token out of the URL immediately, before doing anything
    // else — it should never linger in browser history even briefly.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      router.replace("/");
      return;
    }

    void setSessionFromCallback(token).then(() => {
      router.replace("/board");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-sm text-neutral-500">Signing you in…</p>
    </div>
  );
}
