import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import { getRecipeById } from "@/src/features/recipe/services/recipeService";
import { RecipeDetail } from "@/src/features/recipe/types/recipe.types";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIngredients, setShowIngredients] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const loadRecipe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipeById(Number(id));
      setRecipe(data);
    } catch (err) {
      console.error("Failed to load recipe:", err);
      setError("Không thể tải công thức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id, loadRecipe]);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleStartCooking = () => {
    if (recipe?.steps && recipe.steps.length > 0) {
      setCurrentStep(0);
      setCookingMode(true);
    }
  };

  const handleNextStep = () => {
    if (recipe?.steps && currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCookingMode(false);
      setCurrentStep(0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#29a38f" />
        <Text className="mt-4 text-gray-500">Đang tải...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text className="mt-4 text-center text-gray-500">{error}</Text>
        <TouchableOpacity
          onPress={loadRecipe}
          className="mt-4 rounded-lg bg-primary px-6 py-2"
        >
          <Text className="font-bold text-white">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* Main Recipe Overview */}
      {!cookingMode && (
        <View className="flex-1 bg-white dark:bg-background-dark">
          <StatusBar barStyle="light-content" />

          {/* Hero Image */}
          <View className="relative h-80">
            {recipe.image_url ? (
              <Image
                source={{ uri: recipe.image_url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-200">
                <MaterialIcons name="restaurant" size={80} color="#9CA3AF" />
              </View>
            )}

            {/* Gradient overlay */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Back button */}
            <TouchableOpacity
              className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Quick actions */}
            <View className="absolute right-4 top-12 flex-row">
              <TouchableOpacity className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <MaterialIcons name="share" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <MaterialIcons name="favorite-border" size={22} color="white" />
              </TouchableOpacity>
            </View>

            {/* Title overlay at bottom */}
            <View className="absolute bottom-0 left-0 right-0 p-6">
              {recipe.category && (
                <View className="mb-2 self-start rounded-full bg-primary px-3 py-1">
                  <Text className="text-xs font-bold text-white">
                    {recipe.category}
                  </Text>
                </View>
              )}
              <Text className="text-3xl font-bold text-white">
                {recipe.title}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Stats Cards */}
            <View className="flex-row p-4">
              <View className="mr-3 flex-1 items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                <MaterialIcons name="schedule" size={24} color="#29a38f" />
                <Text className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                  {formatTime(recipe.cook_time)}
                </Text>
                <Text className="text-xs text-gray-500">Thời gian</Text>
              </View>

              {/* <View className="mr-3 flex-1 items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                <MaterialIcons name="local-fire-department" size={24} color="#EF4444" />
                <Text className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                  {recipe.difficulty || "Dễ"}
                </Text>
                <Text className="text-xs text-gray-500">Độ khó</Text>
              </View> */}

              <View className="flex-1 items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                <MaterialIcons name="favorite" size={24} color="#EF4444" />
                <Text className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                  {recipe.likes_count}
                </Text>
                <Text className="text-xs text-gray-500">Yêu thích</Text>
              </View>
            </View>

            {/* Description */}
            {recipe.description && (
              <View className="px-4 pb-4">
                <Text className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {recipe.description}
                </Text>
              </View>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <View className="flex-row flex-wrap px-4 pb-4">
                {recipe.tags.map((tag) => (
                  <View key={tag.id} className="mb-2 mr-2 rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-900/30">
                    <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      #{tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ingredients Preview */}
            <View className="p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Nguyên liệu
                </Text>
                <Text className="text-sm text-gray-500">
                  {recipe.ingredients?.length || 0} món
                </Text>
              </View>

              <View>
                {recipe.ingredients?.slice(0, 3).map((ingredient) => (
                  <View
                    key={ingredient.id}
                    className="mb-2 flex-row items-center rounded-xl bg-gray-50 p-3 dark:bg-gray-900"
                  >
                    <View className="mr-3 h-2 w-2 rounded-full bg-primary" />
                    <Text className="flex-1 text-sm text-gray-900 dark:text-white">
                      {ingredient.name}
                    </Text>
                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {ingredient.amount} {ingredient.unit}
                    </Text>
                  </View>
                ))}

                {recipe.ingredients && recipe.ingredients.length > 3 && (
                  <TouchableOpacity
                    onPress={() => setShowIngredients(true)}
                    className="mt-2 items-center rounded-xl border-2 border-dashed border-gray-300 p-3 dark:border-gray-700"
                  >
                    <Text className="text-sm font-bold text-primary">
                      + {recipe.ingredients.length - 3} nguyên liệu khác
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Steps Preview */}
            <View className="p-4 pb-32">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Các bước thực hiện
                </Text>
                <Text className="text-sm text-gray-500">
                  {recipe.steps?.length || 0} bước
                </Text>
              </View>

              {recipe.steps?.slice(0, 2).map((step, index) => (
                <View key={step.id} className="mb-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                  <View className="mb-2 flex-row items-center">
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Text className="text-sm font-bold text-white">{index + 1}</Text>
                    </View>
                    <Text className="flex-1 text-base font-bold text-gray-900 dark:text-white">
                      Bước {index + 1}
                    </Text>
                  </View>
                  <Text className="ml-11 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {step.description}
                  </Text>
                </View>
              ))}

              {recipe.steps && recipe.steps.length > 2 && (
                <View className="items-center rounded-xl border-2 border-dashed border-gray-300 p-4 dark:border-gray-700">
                  <Text className="text-sm text-gray-500">
                    Còn {recipe.steps.length - 2} bước nữa
                  </Text>
                  <Text className="mt-1 text-xs text-gray-400">
                    Nhấn &quot;Bắt đầu nấu&quot; để xem chi tiết
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Fixed Bottom CTAs */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setShowIngredients(true)}
                className="mr-3 flex-1 flex-row items-center justify-center rounded-xl border-2 border-primary bg-white py-4 dark:bg-gray-900"
              >
                <MaterialIcons name="list-alt" size={24} color="#29a38f" />
                <Text className="ml-2 font-bold text-primary">Xem nguyên liệu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartCooking}
                className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-4 shadow-lg shadow-primary/30"
              >
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text className="ml-2 font-bold text-white">Bắt đầu nấu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Ingredients Modal */}
      <Modal
        visible={showIngredients}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowIngredients(false)}
      >
        <View className="flex-1 bg-white dark:bg-background-dark">
          <View className="flex-row items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Nguyên liệu cần chuẩn bị
            </Text>
            <TouchableOpacity onPress={() => setShowIngredients(false)}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View>
              {recipe?.ingredients?.map((ingredient, index) => (
                <View
                  key={ingredient.id}
                  className="mb-3 flex-row items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900"
                >
                  <View className="mr-4 h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Text className="text-sm font-bold text-primary">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                      {ingredient.name}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      {ingredient.amount} {ingredient.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="border-t border-gray-100 p-4 dark:border-gray-800">
            <TouchableOpacity
              onPress={() => {
                setShowIngredients(false);
                handleStartCooking();
              }}
              className="flex-row items-center justify-center rounded-xl bg-primary py-4"
            >
              <MaterialIcons name="check" size={24} color="white" />
              <Text className="ml-2 font-bold text-white">Đã chuẩn bị xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cooking Mode - Step by Step */}
      <Modal
        visible={cookingMode}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-white dark:bg-background-dark">
          <StatusBar barStyle="dark-content" />

          {/* Header */}
          <View className="border-b border-gray-100 p-4 pt-12 dark:border-gray-800">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setCookingMode(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>

              <Text className="text-base font-bold text-gray-900 dark:text-white">
                Bước {currentStep + 1}/{recipe?.steps?.length || 0}
              </Text>

              <TouchableOpacity
                onPress={() => setShowIngredients(true)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <MaterialIcons name="list-alt" size={24} color="#29a38f" />
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <View
                className="h-full bg-primary"
                style={{
                  width: `${((currentStep + 1) / (recipe?.steps?.length || 1)) * 100}%`,
                }}
              />
            </View>
          </View>

          {/* Step Content */}
          <ScrollView className="flex-1 p-6">
            {recipe?.steps?.[currentStep] && (
              <View>
                {recipe.steps[currentStep].image_url && (
                  <Image
                    source={{ uri: recipe.steps[currentStep].image_url }}
                    className="mb-6 h-64 w-full rounded-2xl"
                    resizeMode="cover"
                  />
                )}

                <View className="mb-4 flex-row items-center">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <Text className="text-lg font-bold text-white">
                      {currentStep + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-2xl font-bold text-gray-900 dark:text-white">
                    Bước {currentStep + 1}
                  </Text>
                </View>

                <Text className="text-lg leading-loose text-gray-700 dark:text-gray-300">
                  {recipe.steps[currentStep].description}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Navigation Buttons */}
          <View className="border-t border-gray-100 p-4 dark:border-gray-800">
            <View className="flex-row">
              {currentStep > 0 && (
                <TouchableOpacity
                  onPress={handlePrevStep}
                  className="mr-3 flex-1 flex-row items-center justify-center rounded-xl border-2 border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-900"
                >
                  <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
                  <Text className="ml-2 font-bold text-gray-700 dark:text-gray-300">
                    Quay lại
                  </Text>
                </TouchableOpacity>
              )}

              <View className="flex-[2]">
                <TouchableOpacity
                  onPress={handleNextStep}
                  className="flex-row items-center justify-center rounded-xl bg-primary py-4"
                >
                  <Text className="font-bold text-white">
                    {currentStep < (recipe?.steps?.length || 0) - 1
                      ? "Bước tiếp theo"
                      : "Hoàn thành"}
                  </Text>
                  <MaterialIcons
                    name={currentStep < (recipe?.steps?.length || 0) - 1 ? "arrow-forward" : "check"}
                    size={24}
                    color="white"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
