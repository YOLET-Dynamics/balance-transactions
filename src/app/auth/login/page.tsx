"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validation/schemas";
import { api } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/login", data, {
        showSuccessToast: true,
        successMessage: "Welcome back!",
      });
      
      router.push("/dashboard");
    } catch (error) {
      // Error toast is handled by api client
    } finally {
      setIsLoading(false);
    }
  };

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
              Track. Record. Grow.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Your complete financial management solution designed for Ethiopian businesses. 
              Manage sales invoices, payment vouchers, and purchase bills with ease.
            </p>
            
            <div className="mt-12 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Sequential Numbering</h3>
                  <p className="text-sm text-gray-500">Automatic document numbering with yearly reset</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Tax Compliance</h3>
                  <p className="text-sm text-gray-500">Built-in VAT and withholding tax calculations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Fast</h3>
                  <p className="text-sm text-gray-500">Bank-level security with lightning-fast performance</p>
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
              <p className="text-gray-400">Welcome back</p>
            </div>

            {/* Desktop Heading */}
            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
              <p className="text-gray-400">Sign in to your account</p>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-white/20 bg-black text-brand-yellow-500 focus:ring-brand-yellow-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-brand-yellow-500 hover:text-brand-yellow-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-brand-yellow-500 hover:text-brand-yellow-600 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
