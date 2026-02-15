import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createRecipe } from "@/src/features/recipe/services/recipeService";
import { router } from "expo-router";

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
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", description: "", image_url: "" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      { id: Date.now().toString(), description: "", image_url: "" },
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
    setIngredients([{ id: "1", name: "", amount: "", unit: "" }]);
    setSteps([{ id: "1", description: "", image_url: "" }]);
    setTags([]);
    setTagInput("");
  };

  const handlePost = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên món ăn");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mô tả");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Lỗi", "Vui lòng chọn danh mục");
      return;
    }
    if (!cookingTime || isNaN(Number(cookingTime)) || Number(cookingTime) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập thời gian nấu hợp lệ (phút)");
      return;
    }
    if (ingredients.some(i => !i.name.trim() || !i.amount.trim())) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin nguyên liệu");
      return;
    }
    if (steps.some(s => !s.description.trim())) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ mô tả các bước");
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
        })),
        tags: tags.length > 0 ? tags : undefined,
      };
      console.log("Submitting recipe data:", recipeData);

      await createRecipe(recipeData);
      Alert.alert("Thành công", "Công thức đã được đăng!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Failed to create recipe:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể đăng công thức. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickImage = () => {
    // In a real app, use expo-image-picker here
    Alert.alert("Upload Image", "This would open the image picker in a real device.");
    setImage("https://lh3.googleusercontent.com/aida-public/AB6AXuDRMfoec0Pm0cAemNw4Af1dDioOhmWH5VjGt5h2enP_u3PO4U7__KwprSHyWhS_52ismBYKl9uQ8k58VZ_AWNIVMSrJGUzDRb1n1rGSOaZKPq4g7iN-C16d14PQlv4ob55568ms9gQuK30p3qJ8R8eytBR-nDNEf17vm8ISwTQeGC-M9hpKEJnetP_zHqO0Pka7Kf4iFBcqKojqa0m2YrqOuhtJo_YNfi0hGeOwZyQBJM3qI-E9xX1yZkWoempEYWbtQciSV5OIkyPV"); // Mock image
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
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
              className="h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
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
              <Text className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Tên món ăn *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="VD: Phở bò Hà Nội"
                className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Mô tả *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả ngắn gọn về món ăn"
                multiline
                numberOfLines={3}
                className="min-h-[80px] rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Danh mục *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {CATEGORIES.map((cat, index) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 border ${index > 0 ? 'ml-2' : ''} ${selectedCategory === cat
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                  >
                    <Text className={`text-xs font-bold ${selectedCategory === cat ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Độ khó *</Text>
              <View className="flex-row">
                {DIFFICULTIES.map((diff, index) => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => setDifficulty(diff)}
                    className={`flex-1 rounded-xl border py-3 ${index > 0 ? 'ml-2' : ''} ${difficulty === diff
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                  >
                    <Text className={`text-center text-sm font-bold ${difficulty === diff ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                      {DIFFICULTY_LABELS[diff]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Thời gian nấu (phút) *</Text>
              <TextInput
                value={cookingTime}
                onChangeText={setCookingTime}
                placeholder="60"
                keyboardType="number-pad"
                className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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

            <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              {ingredients.map((item, index) => (
                <View key={item.id} className={`flex-row ${index !== 0 ? "mt-4 border-t border-gray-100 pt-4 dark:border-gray-700" : ""}`}>
                  <View className="mr-2 flex-1">
                    <TextInput
                      placeholder="Tên nguyên liệu"
                      value={item.name}
                      onChangeText={(v) => handleIngredientChange(item.id, "name", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </View>
                  <View className="mr-2 w-20">
                    <TextInput
                      placeholder="SL"
                      value={item.amount}
                      onChangeText={(v) => handleIngredientChange(item.id, "amount", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </View>
                  <View className="mr-2 w-20">
                    <TextInput
                      placeholder="ĐVT"
                      value={item.unit}
                      onChangeText={(v) => handleIngredientChange(item.id, "unit", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </View>
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveIngredient(item.id)} className="items-center justify-center">
                      <MaterialIcons name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={handleAddIngredient} className="mt-4 flex-row items-center justify-center rounded-xl bg-gray-50 py-3 dark:bg-gray-700">
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
                  className={`relative rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800 ${index < steps.length - 1 ? 'mb-3' : ''}`}
                >
                  <View className="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-gray-50 dark:ring-black">
                    <Text className="text-xs font-bold text-white">{index + 1}</Text>
                  </View>

                  <View className="ml-2">
                    <View className="mb-2 flex-row justify-between">
                      <Text className="font-bold text-gray-900 dark:text-white">Bước {index + 1}</Text>
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
                      className="min-h-[60px] text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                    />
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
            <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              <View className="flex-row flex-wrap mb-3">
                {tags.map((tag) => (
                  <View key={tag} className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-900/30">
                    <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">#{tag}</Text>
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
                  className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium dark:bg-gray-900 dark:text-white"
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
    </SafeAreaView>
  );
}
