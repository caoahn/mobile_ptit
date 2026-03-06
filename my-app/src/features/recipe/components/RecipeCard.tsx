import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  StatusBar,
} from "react-native";
import { Recipe } from "../types/recipe.types";
import { toggleLike, toggleSave } from "../services/recipeService";

interface RecipeCardProps {
  recipe: Recipe;
  onUpdate?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onUpdate }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(recipe.is_liked || false);
  const [isSaved, setIsSaved] = useState(recipe.is_saved || false);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleLike = async () => {
    try {
      const result = await toggleLike(recipe.id);
      setIsLiked(result.liked);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSave = async () => {
    try {
      const result = await toggleSave(recipe.id);
      setIsSaved(result.saved);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleOpenComments = () => {
    router.push(`/recipe/${recipe.id}/comments`);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} MINS`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}H ${mins}M` : `${hours}H`;
  };

  return (
    <View className="flex-col">
      {/* Post Header */}
      <View className="flex-row items-center justify-between px-3 py-3">
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            {recipe.chef?.avatar_url ? (
              <Image
                source={{ uri: recipe.chef.avatar_url }}
                className="h-full w-full"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-300">
                <Text className="text-xs font-bold text-gray-600">
                  {recipe.chef?.username?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text className="text-xs font-bold">
              {recipe.chef?.username || "Anonymous"}
            </Text>
            <Text className="text-[10px] text-gray-500">{recipe.category}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-horiz" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => recipe.image_url && setPreviewImage(recipe.image_url)}
      >
        <View className="relative aspect-[4/5] w-full bg-gray-100">
          {recipe.image_url ? (
            <Image
              source={{ uri: recipe.image_url }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-200">
              <MaterialIcons name="restaurant" size={48} color="#9CA3AF" />
            </View>
          )}
          {recipe.cook_time > 0 && (
            <View className="absolute right-4 top-4 rounded bg-black/40 px-2 py-1 backdrop-blur-md">
              <Text className="text-[10px] font-bold text-white">
                {formatTime(recipe.cook_time)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row items-center justify-between px-3 pb-2 pt-3">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleLike}>
            <MaterialIcons
              name={isLiked ? "favorite" : "favorite-border"}
              size={28}
              color={isLiked ? "#EF4444" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenComments}>
            <MaterialIcons name="chat-bubble-outline" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="share" size={28} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <MaterialIcons
            name={isSaved ? "bookmark" : "bookmark-border"}
            size={28}
            color={isSaved ? "black" : "black"}
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View className="border-b border-gray-50 px-3 pb-6">
        <Text className="mb-1 text-xs font-bold">
          {likesCount.toLocaleString()} likes
        </Text>
        <Text className="text-sm leading-relaxed">
          <Text className="mr-2 font-bold">{recipe.title}</Text>{" "}
          <Text numberOfLines={2}>{recipe.description}</Text>
        </Text>
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="mt-1 flex-row flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <Text
                key={tag.id}
                className="text-sm text-blue-600"
              >
                #{tag.name}
              </Text>
            ))}
          </View>
        )}
        {recipe.comments_count > 0 && (
          <TouchableOpacity className="mt-2" onPress={handleOpenComments}>
            <Text className="text-xs text-gray-500">
              View all {recipe.comments_count} comments
            </Text>
          </TouchableOpacity>
        )}
        <Link href={`/recipe/${recipe.id}`} asChild>
          <TouchableOpacity className="mt-3 w-full rounded-lg border border-gray-100 bg-gray-50 py-2.5">
            <Text className="text-center text-xs font-bold uppercase tracking-widest text-primary">
              View Full Recipe
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

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
            <Text className="text-lg font-bold text-white z-10">{recipe.title}</Text>
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

          {/* Info */}
          <View className="absolute bottom-0 left-0 right-0 px-4 py-6">
            <View className="absolute inset-0 bg-black/80" />
            <View className="flex-row items-center justify-between z-10">
              <View className="flex-1">
                <Text className="text-sm text-white/80">Bởi {recipe.chef?.username || "Anonymous"}</Text>
                {recipe.cook_time > 0 && (
                  <Text className="text-xs text-white/60 mt-1">
                    Thời gian: {formatTime(recipe.cook_time)}
                  </Text>
                )}
              </View>
              <Link href={`/recipe/${recipe.id}`} asChild>
                <TouchableOpacity
                  className="bg-primary px-4 py-2 rounded-lg"
                  onPress={() => setPreviewImage(null)}
                >
                  <Text className="text-white font-bold text-xs">Xem công thức</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
