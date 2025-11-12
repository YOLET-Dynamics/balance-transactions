import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

interface RequestOptions extends AxiosRequestConfig {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

export interface ExtendedError extends Error {
  code?: string;
  validationErrors?: Record<string, string[]>;
  status?: number;
}

const axiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? "" : "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response;
    }

    return response.data.data !== undefined
      ? response.data.data
      : response.data;
  },
  (error: AxiosError) => {
    let errorMessage = "An error occurred";
    let errorCode: string | undefined;
    let validationErrors: Record<string, string[]> | undefined;

    if (error.response) {
      const errorData = error.response.data as any;

      if (errorData?.error) {
        errorMessage = errorData.error.message || errorMessage;
        errorCode = errorData.error.code;
        validationErrors = errorData.error.errors;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      }

      if (validationErrors) {
        const fieldErrors = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
          .join("; ");
        errorMessage = `${errorMessage}: ${fieldErrors}`;
      }
    } else if (error.request) {
      errorMessage = "No response from server";
    } else {
      errorMessage = error.message || errorMessage;
    }

    const customError = new Error(errorMessage) as ExtendedError;
    customError.code = errorCode;
    customError.validationErrors = validationErrors;
    customError.status = error.response?.status;

    return Promise.reject(customError);
  }
);

export async function apiRequest<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    showSuccessToast = false,
    successMessage = "Operation completed successfully",
    showErrorToast = true,
    errorMessage,
    ...axiosOptions
  } = options;

  try {
    const data = await axiosInstance.request<T>({
      url,
      ...axiosOptions,
    });

    if (showSuccessToast) {
      toast.success("Success", {
        description: successMessage,
      });
    }

    return data as T;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : errorMessage || "An error occurred";

    if (showErrorToast) {
      toast.error("Error", {
        description: message,
      });
    }

    throw error;
  }
}

export const api = {
  get: <T = unknown>(
    url: string,
    options?: Omit<RequestOptions, "method" | "data">
  ) => apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "method">
  ) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      data,
    }),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "method">
  ) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      data,
    }),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions, "method">
  ) =>
    apiRequest<T>(url, {
      ...options,
      method: "PATCH",
      data,
    }),

  delete: <T = unknown>(
    url: string,
    options?: Omit<RequestOptions, "method" | "data">
  ) => apiRequest<T>(url, { ...options, method: "DELETE" }),
};

export { axiosInstance };
