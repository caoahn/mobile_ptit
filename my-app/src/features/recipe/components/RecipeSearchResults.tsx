import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { searchRecipes } from "../services/recipeService";
import { Recipe } from "../types/recipe.types";

interface Props {
  query: string;
}

export const RecipeSearchResults: React.FC<Props> = ({ query }) => {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) {
      setRecipes([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    searchRecipes(query)
      .then((result) => {
        setRecipes(result.recipes);
        setTotal(result.total);
      })
      .catch(() => {
        setRecipes([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [query]);

  if (!query.trim()) return null;

  return (
    <View>
      {/* Result header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">
          Kết quả cho &quot;{query}&quot;
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#29a38f" />
        ) : (
          <Text className="text-sm font-bold text-primary">{total} kết quả</Text>
        )}
      </View>

      {/* Loading skeleton */}
      {loading && recipes.length === 0 && (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#29a38f" />
          <Text className="text-gray-400 mt-3 text-sm">Đang tìm kiếm...</Text>
        </View>
      )}

      {/* Recipe list */}
      {recipes.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          className="flex-row mb-3 bg-white rounded-2xl overflow-hidden border border-gray-100"
          style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          onPress={() => router.push(`/recipe/${item.id}` as any)}
        >
          {/* Thumbnail */}
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} className="w-28 h-28" resizeMode="cover" />
          ) : (
            <View className="w-28 h-28 bg-gray-100 items-center justify-center">
              <MaterialIcons name="restaurant" size={32} color="#d1d5db" />
            </View>
          )}

          {/* Info */}
          <View className="flex-1 px-3 py-3 justify-between">
            <View>
              {item.chef && (
                <TouchableOpacity
                  onPress={() => router.push(`/user/${item.chef!.id}` as any)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    {item.chef.username}
                  </Text>
                </TouchableOpacity>
              )}
              <Text className="text-sm font-bold text-gray-900 leading-snug" numberOfLines={2}>
                {item.title}
              </Text>
              {item.description ? (
                <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                  {item.description}
                </Text>
              ) : null}
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="schedule" size={13} color="#9ca3af" />
                <Text className="text-xs text-gray-400">{item.cook_time} phút</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="favorite" size={13} color="#ef4444" />
                  <Text className="text-xs font-semibold text-red-400">{item.likes_count}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="chat-bubble-outline" size={13} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">{item.comments_count}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Empty state */}
      {!loading && query.trim() && recipes.length === 0 && (
        <View className="items-center py-16">
          <MaterialIcons name="search-off" size={52} color="#e5e7eb" />
          <Text className="text-gray-400 mt-3 text-base font-medium">
            Không tìm thấy công thức nào
          </Text>
          <Text className="text-gray-300 mt-1 text-sm text-center px-8">
            Thử tìm với từ khóa khác hoặc tên nguyên liệu
          </Text>
        </View>
      )}
    </View>
  );
};
