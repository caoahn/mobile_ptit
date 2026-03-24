import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
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
  Modal,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDialogStore } from "@/src/shared/stores/useDialogStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { createRecipe } from "@/src/features/recipe/services/recipeService";
import { router } from "expo-router";
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
  duration?: string;
}

const CATEGORIES = ["Món sáng", "Món trưa", "Món tối", "Tráng miệng", "Ăn vặt", "Đồ uống"];
const DIFFICULTIES: ("Easy" | "Medium" | "Hard")[] = ["Easy", "Medium", "Hard"];
const DIFFICULTY_LABELS = {
  Easy: "Dễ",
  Medium: "Trung bình",
  Hard: "Khó",
};

export default function CreateScreen() {
  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [cookingTime, setCookingTime] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", description: "", image_url: "", duration: "" },
  ]);
  const [uploadingStepImages, setUploadingStepImages] = useState<{ [key: string]: boolean }>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const showDialog = useDialogStore((state) => state.showDialog);

  // Handlers
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", amount: "", unit: "" },
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
      { id: Date.now().toString(), description: "", image_url: "", duration: "" },
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedCategory(null);
    setDifficulty("Easy");
    setCookingTime("");
    setImage(null);
    setUploadingImage(false);
    setIngredients([{ id: "1", name: "", amount: "", unit: "" }]);
    setSteps([{ id: "1", description: "", image_url: "", duration: "" }]);
    setUploadingStepImages({});
    setTags([]);
    setTagInput("");
  };

  const handlePost = async () => {
    // Validation
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng nhập tên món ăn" });
      return;
    }
    if (!description.trim()) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng nhập mô tả" });
      return;
    }
    if (!selectedCategory) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng chọn danh mục" });
      return;
    }
    if (!cookingTime || isNaN(Number(cookingTime)) || Number(cookingTime) <= 0) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng nhập thời gian nấu hợp lệ (phút)" });
      return;
    }
    if (ingredients.some(i => !i.name.trim() || !i.amount.trim())) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng điền đầy đủ thông tin nguyên liệu" });
      return;
    }
    if (steps.some(s => !s.description.trim())) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng điền đầy đủ mô tả các bước" });
      return;
    }

    try {
      setIsSubmitting(true);

      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        difficulty,
        cook_time: Number(cookingTime),
        image_url: image || undefined,
        ingredients: ingredients.map(i => ({
          name: i.name.trim(),
          amount: i.amount.trim(),
          unit: i.unit.trim(),
        })),
        steps: steps.map((s, index) => ({
          order: index + 1,
          description: s.description.trim(),
          image_url: s.image_url || undefined,
          duration: s.duration && !isNaN(Number(s.duration)) && Number(s.duration) > 0 ? Number(s.duration) : undefined,
        })),
        tags: tags.length > 0 ? tags : undefined,
      };

      await createRecipe(recipeData);
      Toast.show({ type: "success", text1: "Thành công", text2: "Công thức đã được đăng!" });
      setTimeout(() => {
        resetForm();
        router.push("/(tabs)");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create recipe:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.response?.data?.message || "Không thể đăng công thức. Vui lòng thử lại."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Toast.show({ type: "info", text1: "Quyền truy cập", text2: "Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục." });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Upload image
        setUploadingImage(true);
        try {
          const uploadResult = await uploadImage(imageUri, "recipes");
          setImage(uploadResult.url);
        } catch (error: any) {
          console.error("Upload failed:", error);
          Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể tải ảnh lên. Vui lòng thử lại." });
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Toast.show({ type: "error", text1: "Lỗi", text2: "Có lỗi xảy ra khi chọn ảnh." });
    }
  };

  const handlePickStepImage = async (stepId: string) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Toast.show({ type: "info", text1: "Quyền truy cập", text2: "Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục." });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Upload image
        setUploadingStepImages(prev => ({ ...prev, [stepId]: true }));
        try {
          const uploadResult = await uploadImage(imageUri, "recipe-steps");
          handleStepChange(stepId, "image_url", uploadResult.url);
        } catch (error: any) {
          console.error("Upload failed:", error);
          Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể tải ảnh lên. Vui lòng thử lại." });
        } finally {
          setUploadingStepImages(prev => ({ ...prev, [stepId]: false }));
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Toast.show({ type: "error", text1: "Lỗi", text2: "Có lỗi xảy ra khi chọn ảnh." });
    }
  };

  const handleRemoveImage = () => {
    showDialog({
      title: "Xóa ảnh",
      message: "Bạn có chắc muốn xóa ảnh này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => setImage(null)
    });
  };

  const handleRemoveStepImage = (stepId: string) => {
    showDialog({
      title: "Xóa ảnh",
      message: "Bạn có chắc muốn xóa ảnh này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => handleStepChange(stepId, "image_url", "")
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <Text className="text-xl font-bold text-gray-900">
          Tạo công thức
        </Text>
        <TouchableOpacity onPress={handlePost} disabled={isSubmitting}>
          <Text className={`text-sm font-bold ${isSubmitting ? "text-gray-400" : "text-primary"}`}>
            {isSubmitting ? "Đang đăng..." : "Đăng"}
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
              disabled={uploadingImage}
              className="h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50"
            >
              {uploadingImage ? (
                <View className="items-center">
                  <ActivityIndicator size="large" color="#29a38f" />
                  <Text className="mt-2 text-sm font-medium text-gray-400">
                    Đang tải lên...
                  </Text>
                </View>
              ) : image ? (
                <View className="h-full w-full overflow-hidden rounded-2xl relative">
                  <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
                  <View className="absolute top-3 right-3 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setPreviewImage(image)}
                      className="bg-gray-900/70 p-2 rounded-full"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="visibility" size={18} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleRemoveImage}
                      className="bg-gray-900/70 p-2 rounded-full"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="close" size={18} color="white" />
                    </TouchableOpacity>
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

            <View className="mb-5">
              <Text className="mb-2 text-xs font-medium text-gray-700">Độ khó *</Text>
              <View className="flex-row">
                {DIFFICULTIES.map((diff, index) => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => setDifficulty(diff)}
                    className={`flex-1 rounded-xl border py-3 ${index > 0 ? 'ml-2' : ''} ${difficulty === diff
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200"
                      }`}
                  >
                    <Text className={`text-center text-sm font-bold ${difficulty === diff ? "text-white" : "text-gray-600"}`}>
                      {DIFFICULTY_LABELS[diff]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-1 text-xs font-medium text-gray-700">Thời gian nấu (phút) *</Text>
              <TextInput
                value={cookingTime}
                onChangeText={setCookingTime}
                placeholder="60"
                keyboardType="number-pad"
                className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary"
              />
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
                      <Text className="font-bold text-gray-900">Bước {index + 1}</Text>
                      {steps.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveStep(step.id)}>
                          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      placeholder="Mô tả chi tiết bước này..."
                      value={step.description}
                      onChangeText={(v) => handleStepChange(step.id, "description", v)}
                      multiline
                      className="min-h-[60px] text-sm leading-relaxed text-gray-600"
                    />

                    {/* Duration Input */}
                    <View className="mt-3 flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <MaterialIcons name="schedule" size={18} color="#6b7280" />
                      <TextInput
                        placeholder="Thời gian (phút)"
                        value={step.duration}
                        onChangeText={(v) => handleStepChange(step.id, "duration", v)}
                        keyboardType="numeric"
                        className="ml-2 flex-1 text-sm font-medium text-gray-900"
                      />
                    </View>

                    {/* Step Image */}
                    <View className="mt-3">
                      {uploadingStepImages[step.id] ? (
                        <View className="h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                          <ActivityIndicator size="small" color="#29a38f" />
                          <Text className="mt-2 text-xs text-gray-400">Đang tải...</Text>
                        </View>
                      ) : step.image_url ? (
                        <View className="relative">
                          <Image
                            source={{ uri: step.image_url }}
                            className="h-32 w-full rounded-xl"
                            resizeMode="cover"
                          />
                          <View className="absolute top-2 right-2 flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => setPreviewImage(step.image_url!)}
                              className="bg-gray-900/70 p-1.5 rounded-full"
                              activeOpacity={0.7}
                            >
                              <MaterialIcons name="visibility" size={14} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleRemoveStepImage(step.id)}
                              className="bg-gray-900/70 p-1.5 rounded-full"
                              activeOpacity={0.7}
                            >
                              <MaterialIcons name="close" size={14} color="white" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handlePickStepImage(step.id)}
                          className="h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50"
                        >
                          <MaterialIcons name="add-photo-alternate" size={24} color="#9ca3af" />
                          <Text className="mt-1 text-xs text-gray-400">Thêm ảnh (tùy chọn)</Text>
                        </TouchableOpacity>
                      )}
                    </View>
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

          {/* Post Button */}
          <TouchableOpacity
            className={`mb-24 flex-row items-center justify-center rounded-2xl py-4 shadow-lg ${isSubmitting ? "bg-gray-400" : "bg-primary shadow-primary/30"}`}
            activeOpacity={0.8}
            onPress={handlePost}
            disabled={isSubmitting}
          >
            {isSubmitting && <MaterialIcons name="hourglass-empty" size={20} color="white" />}
            <Text className={`text-lg font-bold text-white ${isSubmitting ? "ml-2" : ""}`}>
              {isSubmitting ? "Đang đăng công thức..." : "Đăng công thức"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={previewImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View className="flex-1 bg-black">
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-12 pb-4">
            <View className="absolute inset-0 bg-black/80" />
            <Text className="text-lg font-bold text-white z-10">Xem trước</Text>
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="bg-white/20 p-2 rounded-full z-10"
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View className="flex-1 items-center justify-center">
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
