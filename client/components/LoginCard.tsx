"use client";
import { Pyramid } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginCard() {
  const router = useRouter();
  const { continueAsGuest, loginWithGoogle } = useAuth();

  function handleGuest() {
    continueAsGuest();
    router.push("/board");
  }

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-white pt-36">
      <div className="flex w-full max-w-sm flex-col items-center px-4">
        {/* Brand */}
        <div className="mb-4 flex items-center gap-2">
          {/* <Pyramid size={18} className="text-white bg-black p-3 rounded-lg" /> */}
          <div className="bg-black p-1.5 rounded-lg flex items-center justify-center">
            <Pyramid size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-black">Pyramid</span>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
          <h1 className="text-center text-xl font-semibold text-neutral-900">
            Let&apos;s get back on track
          </h1>
          <p className="mt-2 text-center text-sm text-neutral-500">
            Enter your email below to login to your account.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGuest}
              className="w-full rounded-full bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Continue as Guest
            </button>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
            >
              <GoogleIcon className="h-4 w-4" />
              Login with Google
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-4 text-center text-xs leading-relaxed text-neutral-400 px-16">
          By clicking continue, you agree to our{" "}
          <Link
            href="#"
            className="underline underline-offset-2 hover:text-neutral-600"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="underline underline-offset-2 hover:text-neutral-600"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
