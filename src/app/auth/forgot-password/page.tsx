"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/request-password-reset", data, {
        showSuccessToast: true,
        successMessage: "Password reset link sent to your email!",
      });
      setEmailSent(true);
    } catch (error) {
      // Error toast is handled by api client
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-logo font-bold mb-2">Balance</h1>
            </div>

            <div className="border border-white/10 rounded-2xl p-8 bg-white/5 text-center space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow-500/10">
                <Mail className="h-8 w-8 text-brand-yellow-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Check your email
                </h2>
                <p className="text-gray-400">
                  We&apos;ve sent a password reset link to{" "}
                  <strong>{getValues("email")}</strong>. Please check your inbox
                  and follow the instructions.
                </p>
              </div>
              <div className="pt-4">
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to login link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
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
              Secure Password Recovery
            </p>
            <p className="text-gray-500 leading-relaxed">
              We'll send you a secure link to reset your password. The link will expire 
              in 1 hour for your security.
            </p>
            
            <div className="mt-12 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Quick & Secure</h3>
                  <p className="text-sm text-gray-500">Reset your password in minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Verified Email</h3>
                  <p className="text-sm text-gray-500">We'll only send the link to your registered email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">24/7 Access</h3>
                  <p className="text-sm text-gray-500">Reset your password anytime, anywhere</p>
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
              <p className="text-gray-400">Reset your password</p>
            </div>

            {/* Desktop Heading */}
            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold mb-2">Reset your password</h2>
              <p className="text-gray-400">Enter your email to receive a reset link</p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
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
                <p className="text-xs text-gray-500">
                  Enter the email associated with your account
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
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
