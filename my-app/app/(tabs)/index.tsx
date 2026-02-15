import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecipeCard } from "@/src/features/recipe/components/RecipeCard";
import { getFeed } from "@/src/features/recipe/services/recipeService";
import { Recipe } from "@/src/features/recipe/types/recipe.types";

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = async (pageNum: number, refresh: boolean = false, currentLoading: boolean = false, currentHasMore: boolean = true) => {
    if (currentLoading || (!currentHasMore && !refresh)) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getFeed(pageNum, 10);

      if (refresh) {
        setRecipes(response.recipes);
      } else {
        setRecipes((prev) => [...prev, ...response.recipes]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load recipes:", err);
      setError("Không thể tải danh sách công thức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecipes(1, true, false, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRecipes(page + 1, false, loading, hasMore);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadRecipes(1, true, false, true);
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && page === 1) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-4 text-gray-500">Đang tải...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className="mt-4 text-center text-gray-500">{error}</Text>
          <TouchableOpacity
            onPress={() => loadRecipes(1, true)}
            className="mt-4 rounded-lg bg-primary px-6 py-2"
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20">
        <MaterialIcons name="restaurant-menu" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-500">Chưa có công thức nào</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-black/95">
        <Text className="text-xl font-extrabold tracking-tight text-primary">
          DishGram
        </Text>
        <View className="flex-row items-center gap-4">
          <Link href="/create" asChild>
            <TouchableOpacity>
              <MaterialIcons name="add-box" size={26} color="black" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity className="relative">
            <MaterialIcons name="notifications" size={26} color="black" />
            <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
