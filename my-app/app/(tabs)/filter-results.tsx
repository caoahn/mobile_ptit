import { MaterialIcons } from "@expo/vector-icons";
import { router, Href, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@/src/shared/services/api/client";

const SORT_OPTIONS = [
  { id: "newest", label: "Mới nhất" },
  { id: "oldest", label: "Cũ nhất" },
  { id: "most_liked", label: "Được yêu thích nhất" },
];

export default function FilterResultsScreen() {
  const params = useLocalSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [showSort, setShowSort] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (showSort) {
      Animated.timing(slideAnim, {
        toValue: 0, // Trượt về vị trí gốc
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showSort]);

  const closeSortModal = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 300, 
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowSort(false);
      if (callback) callback(); 
    });
  };

  useEffect(() => {
    const fetchFilteredRecipes = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (params.categories) queryParams.append("category", params.categories as string);
        if (params.time) queryParams.append("time", params.time as string);
        queryParams.append("sort", sortOption);

        const res = await apiClient.get(`/recipes/feed?${queryParams.toString()}`);
        const fetchedData = res.data?.data?.recipes || res.data?.recipes || [];
        setResults(fetchedData);
      } catch (error) {
        console.error("Lỗi lọc công thức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredRecipes();
  }, [params.categories, params.time, sortOption]);

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.push("/filter" as Href)}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#121716" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Kết quả lọc
        </Text>
        <TouchableOpacity onPress={() => router.push('/filter' as Href)}>
          <MaterialIcons name="tune" size={24} color="#121716" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-bold text-gray-900">
            Tìm thấy {results.length} công thức
          </Text>
          <TouchableOpacity 
            className="flex-row items-center gap-1"
            onPress={() => setShowSort(true)}
          >
            <Text className="text-sm font-medium text-gray-500">
              {SORT_OPTIONS.find(o => o.id === sortOption)?.label}
            </Text>
            <MaterialIcons name="swap-vert" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#29a38f" />
          </View>
        ) : results.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <MaterialIcons name="search-off" size={60} color="#cbd5e1" />
            <Text className="text-gray-500 mt-4 text-base font-medium">Không tìm thấy công thức nào phù hợp.</Text>
          </View>
        ) : (
          results.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            className="flex-row mb-3 min-h-[112px] bg-white rounded-2xl overflow-hidden border border-gray-100"
            style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            {/* Thumbnail */}
            <View className="relative w-28 bg-gray-100">
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} className="absolute w-full h-full" resizeMode="cover" />
              ) : (
                <View className="absolute w-full h-full items-center justify-center">
                  <MaterialIcons name="restaurant" size={32} color="#d1d5db" />
                </View>
              )}
            </View>

            {/* Info */}
            <View className="flex-1 p-3 justify-between">
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
                    <Text className="text-xs text-gray-500">
                    {item.cook_time ? `${item.cook_time} phút` : "--"}
                    {item.servings ? ` • ${item.servings} người` : ""}
                    </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="favorite" size={13} color="#ef4444" />
                    <Text className="text-xs font-semibold text-red-400">{item.likes_count || 0}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="chat-bubble-outline" size={13} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">{item.comments_count || 0}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )))}
      </ScrollView>

      {/* Modal Chọn Sắp xếp */}
      <Modal visible={showSort} transparent={true} animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => closeSortModal()}
        >
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity activeOpacity={1} className="bg-white rounded-t-2xl p-4">
              <Text className="text-lg font-bold text-gray-900 mb-4 text-center border-b border-gray-100 pb-3">
                Sắp xếp theo
              </Text>
              
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  className="py-4 px-4 flex-row justify-between items-center border-b border-gray-50"
                  onPress={() => {
                    closeSortModal(() => setSortOption(opt.id));
                  }}
                >
                  <Text className={`text-base ${sortOption === opt.id ? 'font-bold text-primary' : 'text-gray-700'}`}>
                    {opt.label}
                  </Text>
                  {sortOption === opt.id && <MaterialIcons name="check" size={20} color="#29a38f" />}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="mt-4 py-4 items-center bg-gray-100 rounded-xl mb-4"
                onPress={() => closeSortModal()}
              >
                <Text className="font-bold text-gray-700">Đóng</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}