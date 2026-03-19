import apiClient from "./client";

// Lấy chi tiết công thức
export const getRecipe = async (id: number) => {
    console.log("CALL API GET RECIPE:", id);
  const res = await apiClient.get(`/recipes/${id}`);
  console.log(JSON.stringify(res.data, null, 2));
  return res.data;
};

// Cập nhật công thức
export const updateRecipe = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    category?: string;
    image_url?: string;
    cook_time?: number;
    ingredients?: {
      name: string;
      amount: string;
      unit: string;
    }[];
    steps?: {
      order: number;
      description: string;
      image_url?: string;
    }[];
    tags?: string[];
  }
) => {
    console.log("CALL UPDATE API:", id, data);
  const res = await apiClient.put(`/recipes/${id}`, data);
  console.log("UPDATE RESPONSE:", res.data);
  return res.data;
};

// Xóa công thức
export const deleteRecipe = async (id: number) => {
  const res = await apiClient.delete(`/recipes/${id}`);
  return res.data;
};

// Lấy công thức của user
export const getUserRecipes = async (userId: number) => {
  const res = await apiClient.get(`/recipes/user/${userId}`);
  return res.data;
};