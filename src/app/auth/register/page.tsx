import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="absolute left-6 top-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-4xl font-logo">Balance</h1>
            <h2 className="text-2xl font-semibold tracking-tight">
              Signup is closed
            </h2>
            <p className="text-gray-400">
              Public account creation is currently disabled. Existing users can
              continue signing in normally.
            </p>
          </div>

          <Button
            asChild
            className="h-11 w-full bg-brand-yellow-500 font-semibold text-black hover:bg-brand-yellow-600"
          >
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
