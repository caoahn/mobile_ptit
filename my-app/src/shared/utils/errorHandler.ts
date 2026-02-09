import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: any;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const errors = error.response?.data?.errors;

    return {
      message,
      statusCode,
      errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Đã xảy ra lỗi không xác định",
  };
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return apiError.message;
};
