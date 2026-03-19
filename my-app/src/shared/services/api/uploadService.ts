import apiClient from "./client";

export const uploadImage = async (imageUri: string) => {
  const formData = new FormData();

  // 🔥 Convert blob URL → file thật
  const response = await fetch(imageUri);
  const blob = await response.blob();

  formData.append("image", blob, "photo.jpg");

  // ❗ tạm thời bỏ dòng này nếu backend không dùng
  // formData.append("folder", "avatars");

  const res = await apiClient.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};