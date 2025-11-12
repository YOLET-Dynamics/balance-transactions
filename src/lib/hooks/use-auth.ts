import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  organizationLegalName: string;
  organizationTradeName?: string;
  organizationCode: string;
  organizationTin?: string;
  organizationPhone?: string;
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api.post("/api/auth/login", credentials),
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on login
      toast.success("Login successful");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message,
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => api.post("/api/auth/register", data),
    onSuccess: (data: any) => {
      toast.success("Registration successful", {
        description: "Please verify your email to continue",
      });
      // Redirect to email verification page with email as query param
      const email = (data as any).email || "";
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    },
    onError: (error: Error) => {
      toast.error("Registration failed", {
        description: error.message,
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on logout
      toast.success("Logged out successfully");
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      toast.error("Logout failed", {
        description: error.message,
      });
      // Still redirect even if logout fails
      queryClient.clear();
      router.push("/auth/login");
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      api.post("/api/auth/verify-email", data),
    onSuccess: () => {
      toast.success("Email verified successfully", {
        description: "You can now log in",
      });
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      toast.error("Verification failed", {
        description: error.message,
      });
    },
  });
}

export function useResendVerificationOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      api.put("/api/auth/verify-email", { email }),
    onSuccess: () => {
      toast.success("Verification code sent", {
        description: "Check your email for the new code",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to resend code", {
        description: error.message,
      });
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post("/api/auth/request-password-reset", { email }),
    onSuccess: () => {
      toast.success("Reset link sent", {
        description: "Check your email for the password reset link",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to send reset link", {
        description: error.message,
      });
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      api.post("/api/auth/reset-password", data),
    onSuccess: () => {
      toast.success("Password reset successful", {
        description: "You can now log in with your new password",
      });
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      toast.error("Password reset failed", {
        description: error.message,
      });
    },
  });
}

