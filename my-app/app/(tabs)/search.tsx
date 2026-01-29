import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Filter Chips
const RECENT_SEARCHES = [
  { id: 1, label: "Phở bò" },
  { id: 2, label: "Bánh flan" },
  { id: 3, label: "Gà rán" },
  { id: 4, label: "Salad" },
];

const POPULAR_SEARCH_CATEGORIES = [
  { id: 1, label: "Món Việt", color: "bg-orange-50" },
  { id: 2, label: "Món Âu", color: "bg-blue-50" },
  { id: 3, label: "Bánh ngọt", color: "bg-pink-50" },
  { id: 4, label: "Món chay", color: "bg-green-50" },
  { id: 5, label: "Salad", color: "bg-green-50" },
  { id: 6, label: "Pasta", color: "bg-yellow-50" },
];

export default function SearchScreen() {
  const [searchMode, setSearchMode] = useState<"text" | "ingredients">("text");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header Search Area */}
      <View className="px-4 py-2 border-b border-gray-100 pb-4">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2.5">
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="Tìm kiếm công thức, nguyên liệu..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity className="p-2 border border-gray-200 rounded-lg">
            <MaterialIcons name="camera-alt" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 border border-gray-200 rounded-lg">
            <MaterialIcons name="tune" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Mode Toggle */}
        <View className="flex-row bg-gray-100 rounded-full p-1">
          <TouchableOpacity
            onPress={() => setSearchMode("text")}
            className={`flex-1 py-1.5 rounded-full items-center ${searchMode === "text" ? "bg-white shadow-sm" : ""}`}
          >
            <Text
              className={`font-semibold ${searchMode === "text" ? "text-gray-900" : "text-gray-500"}`}
            >
              Tìm theo text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSearchMode("ingredients")}
            className={`flex-1 py-1.5 rounded-full items-center ${searchMode === "ingredients" ? "bg-white shadow-sm" : ""}`}
          >
            <Text
              className={`font-semibold ${searchMode === "ingredients" ? "text-gray-900" : "text-gray-500"}`}
            >
              Tìm theo nguyên liệu
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Recent Searches */}
        <View className="mb-8">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Tìm kiếm gần đây
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {RECENT_SEARCHES.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2"
              >
                <MaterialIcons name="history" size={16} color="#6b7280" />
                <Text className="ml-2 text-gray-700 font-medium">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Searches */}
        <View>
          <Text className="text-base font-bold text-gray-900 mb-3">
            Tìm kiếm phổ biến
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {POPULAR_SEARCH_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-[48%] py-4 mb-3 border border-gray-100 rounded-xl items-center justify-center bg-white shadow-sm"
              >
                <Text className="font-semibold text-gray-800">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results Placeholder (if query exists) */}
        {searchQuery.length > 0 && (
          <View className="mt-8">
            <Text className="text-base font-bold text-gray-900 mb-3">
              Kết quả cho &quot;{searchQuery}&quot;
            </Text>
            <View className="h-40 bg-gray-50 rounded-xl items-center justify-center border border-gray-100 border-dashed">
              <Text className="text-gray-400">
                Danh sách bài viết sẽ hiển thị ở đây
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
