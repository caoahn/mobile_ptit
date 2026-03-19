import apiClient from "./client";

export const getProfile = async () => {
  const res = await apiClient.get("/users/profile");
  return res.data.data;
};

export const updateProfile = async (data: {
  full_name: string;
  username: string;
  bio: string;
  avatar_url?: string;
}) => {
  const res = await apiClient.put("/users/profile", data);
  return res.data.data;
};