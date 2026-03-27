import { MaterialIcons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { LoadingSpinner } from "@/src/shared/components";
import { getFeed } from "@/src/features/recipe/services/recipeService";
import { Recipe } from "@/src/features/recipe/types/recipe.types";
import { useNotificationStore } from "@/src/features/notification/store/notificationStore";

export default function HomeScreen() {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);

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
    fetchUnreadCount();
    hasInitiallyLoaded.current = true;
  }, []);

  // Refresh feed when tab is focused (e.g., after creating a recipe)
  useFocusEffect(
    useCallback(() => {
      // Only refresh on subsequent focuses, not the initial mount
      if (hasInitiallyLoaded.current) {
        loadRecipes(1, true, false, true);
      }
    }, [])
  );

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
    if (!loading || recipes.length === 0) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="large" color="#29a38f" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && page === 1) {
      return <LoadingSpinner className="flex-1 items-center justify-center py-20" />;
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
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <Text className="text-xl font-extrabold tracking-tight text-primary">
          DishGram
        </Text>
        <View className="flex-row items-center gap-4">
          <Link href="/(tabs)/create" asChild>
            <TouchableOpacity>
              <MaterialIcons name="add-box" size={26} color="black" />
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/notifications" asChild>
            <TouchableOpacity className="relative">
              <MaterialIcons name="notifications" size={26} color="black" />
              {unreadCount > 0 && (
                <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </TouchableOpacity>
          </Link>
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
