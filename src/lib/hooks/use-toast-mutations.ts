"use client";

import { toast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function useToastMutations() {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(options?.title || "Success", {
      description: message,
      duration: options?.duration || 3000,
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(options?.title || "Error", {
      description: message,
      duration: options?.duration || 5000,
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(options?.title || "Info", {
      description: message,
      duration: options?.duration || 3000,
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(options?.title || "Warning", {
      description: message,
      duration: options?.duration || 4000,
    });
  };

  const showLoading = (message: string, options?: ToastOptions) => {
    return toast.loading(options?.title || "Loading", {
      description: message,
    });
  };

  const showPromise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    showPromise,
  };
}

// Standalone functions for use outside of React components
export const toastSuccess = (message: string, title?: string) => {
  toast.success(title || "Success", {
    description: message,
    duration: 3000,
  });
};

export const toastError = (message: string, title?: string) => {
  toast.error(title || "Error", {
    description: message,
    duration: 5000,
  });
};

export const toastInfo = (message: string, title?: string) => {
  toast.info(title || "Info", {
    description: message,
    duration: 3000,
  });
};

export const toastWarning = (message: string, title?: string) => {
  toast.warning(title || "Warning", {
    description: message,
    duration: 4000,
  });
};

export const toastLoading = (message: string, title?: string) => {
  return toast.loading(title || "Loading", {
    description: message,
  });
};

export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};
