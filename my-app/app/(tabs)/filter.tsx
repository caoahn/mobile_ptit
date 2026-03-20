import { MaterialIcons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for filters
const CATEGORIES = ["Món sáng", "Món trưa", "Món tối", "Tráng miệng", "Ăn vặt", "Đồ uống"];
const COOKING_TIMES = ["Dưới 15p", "15-30p", "30-60p", "Trên 60p"];

export default function FilterScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedTime(null);
  };

  const handleShowResults = () => {
    const timeMap: Record<string, string> = {
      "Dưới 15p": "under_15",
      "15-30p": "15_to_30",
      "30-60p": "30_to_60",
      "Trên 60p": "over_60"
    };

    router.push({
      pathname: "/filter-results",
      params: {
        categories: selectedCategories.join(","),
        time: selectedTime ? timeMap[selectedTime] : "",
      }
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.push("/search" as Href)}>
          <MaterialIcons name="close" size={24} color="#121716" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Bộ lọc
        </Text>
        <TouchableOpacity onPress={handleReset}>
          <Text className="text-base font-medium text-primary">Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Category Section */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Danh mục
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => toggleCategory(cat)}
                className={`rounded-full px-4 py-2 border ${selectedCategories.includes(cat)
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
                  }`}
              >
                <Text
                  className={`font-medium ${selectedCategories.includes(cat)
                    ? "text-white"
                    : "text-gray-700"
                    }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cooking Time Section */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Thời gian nấu
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {COOKING_TIMES.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                className={`rounded-full px-4 py-2 border ${selectedTime === time
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
                  }`}
              >
                <Text
                  className={`font-medium ${selectedTime === time
                    ? "text-white"
                    : "text-gray-700"
                    }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="border-t border-gray-100 px-6 py-4 bg-white">
        <TouchableOpacity
          onPress={handleShowResults}
          className="w-full rounded-xl bg-primary py-4 shadow-lg shadow-primary/20"
        >
          <Text className="text-center text-base font-extrabold text-white">
            Xem kết quả
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}