import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDialogStore } from "@/src/shared/stores/useDialogStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRecipeById, updateRecipe, deleteRecipe }
  from "@/src/features/recipe/services/recipeService";
import { LoadingSpinner } from "@/src/shared/components";

import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/src/shared/services/uploadService";

// Types
interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id: string;
  description: string;
  image_url?: string;
}

const CATEGORIES = ["Món sáng", "Món trưa", "Món tối", "Tráng miệng", "Ăn vặt", "Đồ uống"];

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams();
  console.log("Param ID:", id);
  const [isLoading, setIsLoading] = useState(true);
  const showDialog = useDialogStore((state) => state.showDialog);

  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "new_1", name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: "new_1", description: "", image_url: "" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load data
  useEffect(() => {
    const fetchRecipe = async () => {
      const recipeId = Array.isArray(id) ? id[0] : id;

      if (!recipeId || isNaN(Number(recipeId))) {
        console.log("Invalid recipe id:", recipeId);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getRecipeById(Number(recipeId));

        setTitle(data.title || "");
        setDescription(data.description || "");
        setSelectedCategory(data.category || null);
        setCookingTime(String(data.cook_time || "")); // FIX cook_time
        setServings(String(data.servings || ""));
        setImage(data.image_url || null);

        // ingredients
        if (data.ingredients) {
          setIngredients(
            data.ingredients.map((ing: any) => ({
              id: String(ing.id),
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
            }))
          );
        }

        // steps
        if (data.steps) {
          setSteps(
            data.steps.map((step: any) => ({
              id: String(step.id),
              description: step.description,
              image_url: step.image_url || "",
            }))
          );
        }

        // tags
        if (data.tags) {
          setTags(data.tags.map((t: any) => t.name));
        }

      } catch (error) {
        console.log("Fetch recipe error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Handlers
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: `new_${Date.now()}`, name: "", amount: "", unit: "" },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((item) => item.id !== id));
    }
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(
      ingredients.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { id: `new_${Date.now()}`, description: "", image_url: "" },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((item) => item.id !== id));
    }
  };

  const handleStepChange = (id: string, field: keyof Step, value: string) => {
    setSteps(
      steps.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập tên món ăn",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title,
        description,
        category: selectedCategory ?? undefined,
        image_url: image ?? undefined,
        cook_time: Number(cookingTime), // FIX
        servings: servings ? Number(servings) : undefined,

        ingredients: ingredients.map((ing) => ({
          id: ing.id.startsWith("new_") ? undefined : Number(ing.id),
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })),

        steps: steps.map((step, index) => ({
          id: step.id.startsWith("new_") ? undefined : Number(step.id),
          order: index + 1, // API dùng order
          description: step.description,
          image_url: step.image_url ?? undefined,
        })),

        tags,
      };

      await updateRecipe(Number(id), payload);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Công thức đã được cập nhật!",
      });

      setTimeout(() => router.replace("/(tabs)/profile" as any), 1200);

    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật công thức.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    showDialog({
      title: "Xác nhận",
      message: "Bạn có chắc chắn muốn xóa công thức này không?",
      confirmText: "Xóa",
      cancelText: "Hủy",

      onConfirm: async () => {
        try {
          setIsDeleting(true);

          await deleteRecipe(Number(id));

          Toast.show({
            type: "success",
            text1: "Đã xóa",
            text2: "Công thức đã bị xóa",
          });

          setTimeout(() => router.replace("/(tabs)/profile" as any), 1200);

        } catch {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không thể xóa công thức",
          });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ dùng bản cũ để hết lỗi đỏ
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;

        console.log("LOCAL URI:", localUri);

        const uploadResult = await uploadImage(localUri);

        console.log("UPLOAD RESULT:", uploadResult);

        setImage(uploadResult.url);

        Toast.show({
          type: "success",
          text1: "Upload success",
        });
      }
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error?.response?.data || error);

      Toast.show({
        type: "error",
        text1: "Upload failed",
      });
    }
  };


  const handlePickStepImage = async (stepId: string) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;

        console.log("STEP IMAGE URI:", localUri);

        const uploadResult = await uploadImage(localUri);

        // update đúng step
        setSteps((prev) =>
          prev.map((step) =>
            step.id === stepId
              ? { ...step, image_url: uploadResult.url }
              : step
          )
        );

        Toast.show({
          type: "success",
          text1: "Upload step image success",
        });
      }
    } catch (error: any) {
      console.log("STEP UPLOAD ERROR:", error?.response?.data || error);

      Toast.show({
        type: "error",
        text1: "Upload step image failed",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light">
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-base font-medium text-gray-500">Hủy</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          Sửa công thức
        </Text>
        <TouchableOpacity onPress={handleUpdate} disabled={isSubmitting}>
          <Text className={`text-sm font-bold ${isSubmitting ? "text-gray-400" : "text-primary"}`}>
            {isSubmitting ? "Lưu..." : "Lưu"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

          {/* 1. Recipe Images */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Hình ảnh món ăn
            </Text>
            <TouchableOpacity
              onPress={handlePickImage}
              className="h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50"
            >
              {image ? (
                <View className="h-full w-full overflow-hidden rounded-2xl relative">
                  <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
                  <View className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                    <MaterialIcons name="edit" size={16} color="white" />
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <MaterialIcons name="add-a-photo" size={32} color="#9ca3af" />
                  <Text className="mt-2 text-sm font-medium text-gray-400">
                    Thêm ảnh bìa
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 2. Basic Info */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Thông tin cơ bản
            </Text>

            <View className="mb-4">
              <Text className="mb-1 text-xs font-medium text-gray-700">Tên món ăn *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="VD: Phở bò Hà Nội"
                className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-xs font-medium text-gray-700">Mô tả *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả ngắn gọn về món ăn"
                multiline
                numberOfLines={3}
                className="min-h-[80px] rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary"
              />
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-xs font-medium text-gray-700">Danh mục *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {CATEGORIES.map((cat, index) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 border ${index > 0 ? 'ml-2' : ''} ${selectedCategory === cat
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200"
                      }`}
                  >
                    <Text className={`text-xs font-bold ${selectedCategory === cat ? "text-white" : "text-gray-600"}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-1 text-xs font-medium text-gray-700">Thời gian nấu (phút) *</Text>
                <TextInput
                  value={cookingTime}
                  onChangeText={setCookingTime}
                  placeholder="60"
                  keyboardType="number-pad"
                  className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs font-medium text-gray-700">Khẩu phần (người)</Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  placeholder="VD: 2"
                  keyboardType="number-pad"
                  className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary"
                />
              </View>
            </View>
          </View>

          {/* 3. Ingredients */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Nguyên liệu
              </Text>
              <Text className="text-[10px] text-gray-400">{ingredients.length} món</Text>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {ingredients.map((item, index) => (
                <View key={item.id} className={`flex-row ${index !== 0 ? "mt-4 border-t border-gray-100 pt-4" : ""}`}>
                  <View className="mr-2 flex-1">
                    <TextInput
                      placeholder="Tên nguyên liệu"
                      value={item.name}
                      onChangeText={(v) => handleIngredientChange(item.id, "name", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary"
                    />
                  </View>
                  <View className="mr-2 w-20">
                    <TextInput
                      placeholder="SL"
                      value={item.amount}
                      onChangeText={(v) => handleIngredientChange(item.id, "amount", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary"
                    />
                  </View>
                  <View className="mr-2 w-20">
                    <TextInput
                      placeholder="ĐVT"
                      value={item.unit}
                      onChangeText={(v) => handleIngredientChange(item.id, "unit", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary"
                    />
                  </View>
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveIngredient(item.id)} className="items-center justify-center">
                      <MaterialIcons name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={handleAddIngredient} className="mt-4 flex-row items-center justify-center rounded-xl bg-gray-50 py-3">
                <MaterialIcons name="add" size={20} color="#29a38f" />
                <Text className="ml-2 text-sm font-bold text-primary">Thêm nguyên liệu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Steps */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Các bước thực hiện
              </Text>
              <Text className="text-[10px] text-gray-400">{steps.length} bước</Text>
            </View>

            <View>
              {steps.map((step, index) => (
                <View
                  key={step.id}
                  className={`relative rounded-2xl border border-gray-200 bg-white p-4 ${index < steps.length - 1 ? 'mb-3' : ''}`}
                >
                  <View className="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-gray-50">
                    <Text className="text-xs font-bold text-white">{index + 1}</Text>
                  </View>

                  <View className="ml-2">
                    <View className="mb-2 flex-row justify-between">
                      <Text className="font-bold text-gray-900">
                        Bước {index + 1}
                      </Text>

                      <View className="flex-row items-center">
                        {/* Nút upload ảnh */}
                        <TouchableOpacity
                          onPress={() => handlePickStepImage(step.id)}
                          className="mr-2"
                        >
                          <MaterialIcons name="image" size={20} color="#29a38f" />
                        </TouchableOpacity>

                        {steps.length > 1 && (
                          <TouchableOpacity onPress={() => handleRemoveStep(step.id)}>
                            <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Mô tả */}
                    <TextInput
                      placeholder="Mô tả chi tiết bước này..."
                      value={step.description}
                      onChangeText={(v) =>
                        handleStepChange(step.id, "description", v)
                      }
                      multiline
                      className="min-h-[60px] text-sm leading-relaxed text-gray-600"
                    />

                    {/* Hiển thị ảnh nếu có */}
                    {step.image_url ? (
                      <Image
                        source={{ uri: step.image_url }}
                        className="mt-2 h-32 w-full rounded-lg"
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleAddStep} className="mt-4 flex-row items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 py-4">
              <MaterialIcons name="add-circle-outline" size={24} color="#29a38f" />
              <Text className="ml-2 text-sm font-bold text-primary">Thêm bước tiếp theo</Text>
            </TouchableOpacity>
          </View>

          {/* 5. Tags */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Tags (Tùy chọn)
            </Text>
            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              <View className="flex-row flex-wrap mb-3">
                {tags.map((tag) => (
                  <View key={tag} className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-50 px-3 py-1">
                    <Text className="text-xs font-medium text-blue-600">#{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)} className="ml-1">
                      <MaterialIcons name="close" size={14} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View className="flex-row">
                <TextInput
                  placeholder="Nhập tag (VD: món việt, thịt bò)"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium"
                />
                <TouchableOpacity onPress={handleAddTag} className="ml-2 items-center justify-center rounded-lg bg-primary px-4">
                  <MaterialIcons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            className={`mb-4 flex-row items-center justify-center rounded-2xl py-4 shadow-lg ${isSubmitting ? "bg-gray-400" : "bg-primary shadow-primary/30"}`}
            activeOpacity={0.8}
            onPress={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting && <MaterialIcons name="hourglass-empty" size={20} color="white" />}
            <Text className={`text-lg font-bold text-white ${isSubmitting ? "ml-2" : ""}`}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            className={`mb-24 flex-row items-center justify-center rounded-2xl py-4 border border-red-500 bg-white`}
            activeOpacity={0.8}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                <Text className="ml-2 text-lg font-bold text-red-500">
                  Xóa công thức
                </Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
