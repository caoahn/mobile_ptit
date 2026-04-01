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
import { getRecommendedFeed } from "@/src/features/recipe/services/recipeService";
import { Recipe } from "@/src/features/recipe/types/recipe.types";
import { useNotificationStore } from "@/src/features/notification/store/notificationStore";

// Re-probe AI at most every 5 minutes to avoid latency on every tab switch
const PROBE_INTERVAL_MS = 5 * 60 * 1000;
const LIMIT = 10;

export default function HomeScreen() {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedLabel, setFeedLabel] = useState<string | null>(null);

  const hasInitiallyLoaded = useRef(false);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const feedSourceRef = useRef<"rec" | "feed">("feed");
  const lastProbeTimeRef = useRef<number>(0);
  const seenIdsRef = useRef<Set<number>>(new Set());

  const updateHasMore = (val: boolean) => {
    setHasMore(val);
    hasMoreRef.current = val;
  };

  /**
   * Load page 1 — always probes backend to determine feed mode (rec vs feed).
   * Source is stored in ref so load-more can pass the same query.
   */
  const loadInitial = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await getRecommendedFeed(1, LIMIT);
      feedSourceRef.current = response.source;
      lastProbeTimeRef.current = Date.now();
      setFeedLabel(response.source === "rec" ? "Gợi ý cho bạn" : null);
      updateHasMore(response.hasMore);
      setRecipes(response.recipes);
      setPage(1);
      // Reset seenIds to page 1 results
      seenIdsRef.current = new Set(response.recipes.map((r) => r.id));
    } catch (err) {
      console.error("Failed to load feed:", err);
      setError("Không thể tải danh sách công thức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  };

  /**
   * Load-more — uses the same /recipes/recommended endpoint with next page.
   * Backend slices the AI ranked list for rec mode or paginates DB for feed mode.
   */
  const loadMore = async (nextPage: number) => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const response = await getRecommendedFeed(nextPage, LIMIT, Array.from(seenIdsRef.current));
      console.log(`[Feed] loadMore page=${nextPage} response:`, JSON.stringify({
        source: response.source,
        total: response.total,
        hasMore: response.hasMore,
        page: response.page,
        count: response.recipes.length,
        recipe_ids: response.recipes.map(r => r.id),
      }, null, 2));
      setRecipes((prev) => [...prev, ...response.recipes]);
      // Accumulate seen IDs
      response.recipes.forEach((r) => seenIdsRef.current.add(r.id));
      updateHasMore(response.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load more recipes:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    loadInitial();
    fetchUnreadCount();
    hasInitiallyLoaded.current = true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!hasInitiallyLoaded.current) return;

      // In rec mode: avoid re-probing AI on every tab switch (expensive).
      // Only re-probe after TTL expires.
      if (
        feedSourceRef.current === "rec" &&
        Date.now() - lastProbeTimeRef.current < PROBE_INTERVAL_MS
      ) {
        return;
      }

      loadInitial();
    }, []),
  );

  const handleLoadMore = () => {
    if (!isLoadingRef.current && hasMoreRef.current) {
      loadMore(page + 1);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    lastProbeTimeRef.current = 0; // Force re-probe on pull-to-refresh
    loadInitial();
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
    if (loading && page === 1 && recipes.length === 0) {
      return <LoadingSpinner className="flex-1 items-center justify-center py-20" />;
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className="mt-4 text-center text-gray-500">{error}</Text>
          <TouchableOpacity
            onPress={() => loadInitial()}
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
        <View>
          <Text className="text-xl font-extrabold tracking-tight text-primary">
            DishGram
          </Text>
          {feedLabel ? (
            <Text className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              {feedLabel}
            </Text>
          ) : null}
        </View>
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
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#29a38f"]}
            tintColor="#29a38f"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
