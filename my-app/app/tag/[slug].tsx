import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StatusBar, TextInput, TouchableOpacity, View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@/src/shared/services/api/client";
import { Recipe } from "@/src/features/recipe/types/recipe.types";
import { RecipeCard } from "@/src/features/recipe/components/RecipeCard";
import { LoadingSpinner } from "@/src/shared/components";

export default function TagScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTag, setSearchTag] = useState(slug || "");

  const loadRecipes = async (pageNum: number, refresh: boolean = false, currentLoading: boolean = false, currentHasMore: boolean = true) => {
    if (currentLoading || (!currentHasMore && !refresh)) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/recipes`, { 
        params: { tag: slug, page: pageNum, limit: 10 } 
      });
      const payload = response.data?.data || response.data;
      const newRecipes = payload?.recipes || [];

      if (refresh) {
        setRecipes(newRecipes);
      } else {
        setRecipes((prev) => [...prev, ...newRecipes]);
      }

      setHasMore(payload?.hasMore ?? newRecipes.length === 10);
      setPage(pageNum);
    } catch (err) {
      console.error("Lỗi khi tải công thức theo tag:", err);
      setError("Không thể tải danh sách công thức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (slug) {
      setSearchTag(slug);
      loadRecipes(1, true, false, true);
    }
  }, [slug]);

  const handleSearch = () => {
    if (searchTag.trim() && searchTag.trim() !== slug) {
      router.setParams({ slug: searchTag.trim() });
    }
  };

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
  }, [slug]);

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
      return <LoadingSpinner className="flex-1 items-center justify-center py-20" text="" />;
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
      <View className="flex-1 items-center justify-center py-16">
        <MaterialIcons name="local-offer" size={48} color="#e5e7eb" />
        <Text className="text-gray-500 mt-4 text-base text-center px-4">
          Chưa có công thức nào gắn thẻ #{slug}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Search */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <MaterialIcons name="arrow-back" size={24} color="#121716" />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Text className="text-base font-bold text-gray-500 mr-1">#</Text>
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Tìm thẻ khác..."
            placeholderTextColor="#9ca3af"
            value={searchTag}
            onChangeText={setSearchTag}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchTag.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTag("")} className="p-1">
              <MaterialIcons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
            colors={["#29a38f"]}
            tintColor="#29a38f"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}