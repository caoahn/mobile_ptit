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
            className="flex-row mb-4 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            <Image
              source={{ uri: item.image_url || "https://placehold.co/150x150/png" }}
              className="w-28 h-28"
              resizeMode="cover"
            />
            <View className="flex-1 p-3 justify-between">
              <View>
                <Text className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  {item.category || "Công thức"}
                </Text>
                <Text className="text-base font-bold text-gray-900 leading-tight" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Bởi @{item.chef?.username || "Ẩn danh"}</Text>
              </View>

              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="schedule" size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-500">{item.cook_time ? `${item.cook_time} phút` : "--"}</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                  <MaterialIcons name="favorite" size={12} color="#ef4444" />
                  <Text className="text-xs font-bold text-red-500">{item.likes_count || 0}</Text>
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