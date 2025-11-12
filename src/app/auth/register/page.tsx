"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validation/schemas";
import { api } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const handleNextStep = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
    ]);

    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/register", data, {
        showSuccessToast: true,
        successMessage:
          "Account created! Please check your email for the verification code.",
      });

      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 border-r border-white/10">
          <div className="max-w-lg">
            <h1 className="text-5xl xl:text-6xl font-logo font-bold mb-6">
              Balance
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Financial Management Simplified
            </p>
            <p className="text-gray-500 leading-relaxed">
              Join businesses across Ethiopia in streamlining their financial
              operations. Track sales, manage payments, and generate
              professional invoices—all in one place.
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Multi-Organization Support
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage multiple organizations from one account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Ethiopian Tax Compliance
                  </h3>
                  <p className="text-sm text-gray-500">
                    Built-in withholding tax calculations and VAT support
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Professional Documents</h3>
                  <p className="text-sm text-gray-500">
                    Generate polished invoices and payment vouchers instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:hidden">
              <h1 className="text-3xl font-logo font-bold mb-2">Balance</h1>
              <p className="text-gray-400">
                {currentStep === 1
                  ? "Step 1 of 2: Personal Info"
                  : "Step 2 of 2: Organization"}
              </p>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold mb-2">Create your account</h2>
              <p className="text-gray-400">
                {currentStep === 1
                  ? "Step 1 of 2: Personal Information"
                  : "Step 2 of 2: Organization Details"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`h-2 flex-1 rounded-full transition-colors ${
                  currentStep >= 1 ? "bg-brand-yellow-500" : "bg-white/20"
                }`}
              />
              <div
                className={`h-2 flex-1 rounded-full transition-colors ${
                  currentStep >= 2 ? "bg-brand-yellow-500" : "bg-white/20"
                }`}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="bg-black border-white/20 text-white placeholder:text-gray-500"
                        {...register("firstName")}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-400">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="bg-black border-white/20 text-white placeholder:text-gray-500"
                        {...register("lastName")}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-400">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

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
                      <p className="text-sm text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Phone Number{" "}
                      <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251911234567 or 0911234567"
                      className="bg-black border-white/20 text-white placeholder:text-gray-500"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-400">
                        {errors.phone.message}
                      </p>
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
                      <p className="text-sm text-red-400">
                        {errors.password.message}
                      </p>
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

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-11 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
                  >
                    Next: Organization Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgLegalName" className="text-white">
                        Organization Legal Name
                      </Label>
                      <Input
                        id="orgLegalName"
                        type="text"
                        placeholder="Your Company PLC"
                        className="bg-black border-white/20 text-white placeholder:text-gray-500"
                        {...register("orgLegalName")}
                      />
                      {errors.orgLegalName && (
                        <p className="text-sm text-red-400">
                          {errors.orgLegalName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgCode" className="text-white">
                        Organization Code
                      </Label>
                      <Input
                        id="orgCode"
                        type="text"
                        placeholder="ACME"
                        className="bg-black border-white/20 text-white placeholder:text-gray-500 uppercase"
                        {...register("orgCode")}
                      />
                      {errors.orgCode && (
                        <p className="text-sm text-red-400">
                          {errors.orgCode.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        2-20 characters, uppercase letters and numbers only
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 rounded border-white/20 bg-black text-brand-yellow-500 focus:ring-brand-yellow-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                      I agree to the{" "}
                      <Link
                        href="#"
                        className="text-brand-yellow-500 hover:text-brand-yellow-600"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="#"
                        className="text-brand-yellow-500 hover:text-brand-yellow-600"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      variant="outline"
                      className="flex-1 h-11 border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-11 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
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
