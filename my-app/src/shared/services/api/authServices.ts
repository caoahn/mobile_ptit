import apiClient from "./client";

export const sendOtp = async (email: string) => {
  console.log("CALL SEND OTP API:", email);

  const res = await apiClient.post("/auth/forgot-password", {
    email,
  });

  return res.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await apiClient.post("/auth/verify-otp", {
    email,
    otp,
  });
  return res.data;
};

export const resetPassword = async (email: string, password: string) => {
  const res = await apiClient.post("/auth/reset-password", {
    email,
    password,
  });
  return res.data;
};

