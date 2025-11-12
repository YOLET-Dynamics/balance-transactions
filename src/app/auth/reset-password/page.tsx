"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/schemas";
import { api } from "@/lib/api/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/reset-password", { ...data, token }, {
        showSuccessToast: true,
        successMessage: "Password reset successfully!",
      });
      
      router.push("/auth/login");
    } catch (error) {
      // Error toast is handled by api client
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-logo font-bold mb-2">Balance</h1>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 bg-white/5 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Invalid reset link</h2>
              <p className="text-gray-400">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/auth/forgot-password">
                <Button className="w-full bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold">
                  Request new link
                </Button>
              </Link>
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

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column - Branding */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 border-r border-white/10">
          <div className="max-w-lg">
            <h1 className="text-5xl xl:text-6xl font-logo font-bold mb-6">
              Balance
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Create a Strong Password
            </p>
            <p className="text-gray-500 leading-relaxed">
              Choose a secure password to protect your account and your organization's financial data.
            </p>
            
            <div className="mt-12 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Secure Storage</h3>
                  <p className="text-sm text-gray-500">Your password is encrypted with industry-standard bcrypt</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Minimum 8 Characters</h3>
                  <p className="text-sm text-gray-500">Use a mix of letters, numbers, and special characters</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">One-Time Link</h3>
                  <p className="text-sm text-gray-500">This reset link can only be used once</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="text-center lg:hidden">
              <h1 className="text-3xl font-logo font-bold mb-2">Balance</h1>
              <p className="text-gray-400">Set your new password</p>
            </div>

            {/* Desktop Heading */}
            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold mb-2">Set your new password</h2>
              <p className="text-gray-400">Enter a secure password for your account</p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-black border-white/20 text-white placeholder:text-gray-500"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-medium">Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>8-24 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-black border-white/20 text-white placeholder:text-gray-500"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-brand-yellow-500 hover:text-brand-yellow-600 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
