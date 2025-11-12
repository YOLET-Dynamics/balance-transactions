"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { verifyEmailSchema, type VerifyEmailInput } from "@/lib/validation/schemas";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromQuery || "",
    },
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyEmailInput) => {
    setIsVerifying(true);
    try {
      await api.post(
        "/api/auth/verify-email",
        { email: data.email, otp: data.otp },
        {
          showSuccessToast: true,
          successMessage: "Email verified successfully!",
        }
      );
      setVerified(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      // Error toast is handled by api client
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) {
      return;
    }

    setIsResending(true);
    try {
      await api.put(
        "/api/auth/verify-email",
        { email },
        {
          showSuccessToast: true,
          successMessage: "A new verification code has been sent!",
        }
      );
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      // Error toast is handled by api client
    } finally {
      setIsResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-logo font-bold mb-2">Balance</h1>
            </div>

            <div className="border border-white/10 rounded-2xl p-8 bg-white/5 text-center space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Email verified!
                </h2>
                <p className="text-gray-400">
                  Your email has been verified successfully. Redirecting to
                  login...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to home link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-logo font-bold mb-2">Balance</h1>
            <p className="text-gray-400">Verify your email address</p>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 bg-white/5 space-y-6">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow-500/10 mb-4">
                <Mail className="h-8 w-8 text-brand-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-400 text-sm">
                Enter the 6-digit verification code sent to your email
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-black border-white/20 text-white placeholder:text-gray-500"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="bg-black border-white/20 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
                  {...register("otp")}
                />
                {errors.otp && (
                  <p className="text-sm text-red-400">{errors.otp.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full h-11 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={isResending || countdown > 0}
                className="text-brand-yellow-500 hover:text-brand-yellow-600 hover:bg-white/5"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 text-center">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/5"
                >
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
