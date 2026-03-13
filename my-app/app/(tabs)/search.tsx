import { MaterialIcons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
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
import { RecipeSearchResults } from "@/src/features/recipe/components/RecipeSearchResults";
import { UserSearchResults } from "@/src/features/auth/components/UserSearchResults";

const RECENT_SEARCHES = [
  { id: 1, label: "Phở bò" },
  { id: 2, label: "Bánh flan" },
  { id: 3, label: "Gà rán" },
  { id: 4, label: "Salad" },
];

const POPULAR_SEARCH_CATEGORIES = [
  { id: 1, label: "Món Việt" },
  { id: 2, label: "Món Âu" },
  { id: 3, label: "Bánh ngọt" },
  { id: 4, label: "Món chay" },
  { id: 5, label: "Salad" },
  { id: 6, label: "Pasta" },
];

export default function SearchScreen() {
  const [searchMode, setSearchMode] = useState<"recipes" | "users">("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const handleSearch = () => setSubmittedQuery(searchQuery.trim());

  const placeholder =
    searchMode === "recipes"
      ? "Tìm theo tên hoặc nguyên liệu..."
      : "Tìm theo tên người dùng...";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-4 pt-2 pb-4 border-b border-gray-100">
        {/* Search input row */}
        <View className="flex-row items-center gap-2 mb-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5">
            <TouchableOpacity onPress={handleSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="search" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(""); setSubmittedQuery(""); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className="p-2.5 border border-gray-200 rounded-xl"
            onPress={() => router.push("/filter" as Href)}
          >
            <MaterialIcons name="tune" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Mode toggle */}
        <View className="flex-row bg-gray-100 rounded-full p-1">
          <TouchableOpacity
            onPress={() => setSearchMode("recipes")}
            className="flex-1 py-2 rounded-full items-center justify-center"
            style={searchMode === "recipes" ? { backgroundColor: "white", elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } } : undefined}
          >
            <Text className={`text-xs font-bold ${searchMode === "recipes" ? "text-gray-900" : "text-gray-400"}`}>
              Công thức
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSearchMode("users")}
            className="flex-1 py-2 rounded-full items-center justify-center"
            style={searchMode === "users" ? { backgroundColor: "white", elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } } : undefined}
          >
            <Text className={`text-xs font-bold ${searchMode === "users" ? "text-gray-900" : "text-gray-400"}`}>
              Người dùng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state — no query yet */}
        {submittedQuery.length === 0 ? (
          <>
            <View className="mb-7">
              <Text className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Tìm kiếm gần đây
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {RECENT_SEARCHES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2"
                    onPress={() => { setSearchQuery(item.label); setSubmittedQuery(item.label); }}
                  >
                    <MaterialIcons name="history" size={15} color="#9ca3af" />
                    <Text className="ml-1.5 text-sm text-gray-600 font-medium">{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Khám phá
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {POPULAR_SEARCH_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="w-[48%] py-5 mb-3 border border-gray-100 rounded-2xl items-center justify-center bg-white"
                    style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
                    onPress={() => {
                      setSearchMode("recipes");
                      setSearchQuery(item.label);
                      setSubmittedQuery(item.label);
                    }}
                  >
                    <Text className="font-semibold text-gray-700">{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Search results — delegate to sub-components */
          searchMode === "recipes" ? (
            <RecipeSearchResults query={submittedQuery} />
          ) : (
            <UserSearchResults query={submittedQuery} />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

