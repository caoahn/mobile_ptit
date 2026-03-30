import { MaterialIcons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadImage } from "@/src/shared/services/uploadService";
import { RecipeSearchResults } from "@/src/features/recipe/components/RecipeSearchResults";
import { UserSearchResults } from "@/src/features/auth/components/UserSearchResults";

const AI_BASE_URL =
  process.env.EXPO_PUBLIC_AI_URL || "http://localhost:8000";

export default function SearchScreen() {
  const [searchMode, setSearchMode] = useState<"recipes" | "users">("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<{ id: number; label: string }[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanLoading) {
      [dot1, dot2, dot3, pulse1, pulse2].forEach((v) => v.setValue(0));
      return;
    }

    const makeDot = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -9, duration: 260, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.delay(Math.max(0, 780 - delay * 2)),
        ])
      );

    const makePulse = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(Math.max(0, 400 - delay)),
        ])
      );

    const anims = [
      makeDot(dot1, 0),
      makeDot(dot2, 160),
      makeDot(dot3, 320),
      makePulse(pulse1, 0),
      makePulse(pulse2, 700),
    ];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [scanLoading, dot1, dot2, dot3, pulse1, pulse2]);

  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const saved = await AsyncStorage.getItem("recent_searches");
        if (saved) {
          setRecentSearches(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load recent searches", error);
      }
    };
    loadRecentSearches();
  }, []);

  const saveRecentSearch = async (query: string) => {
    const newQuery = query.trim();
    if (!newQuery) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.label.toLowerCase() !== newQuery.toLowerCase());
      const updated = [{ id: Date.now(), label: newQuery }, ...filtered].slice(0, 6);
      AsyncStorage.setItem("recent_searches", JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem("recent_searches");
  };

  const handleScanIngredients = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Quyền truy cập", "Vui lòng cấp quyền truy cập camera để tiếp tục.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      setScanLoading(true);
      setScanStatus("Đang tải ảnh lên...");
      try {
        // Step 1: Upload image
        console.log("[Scan] Uploading image...");
        const uploadResult = await uploadImage(result.assets[0].uri, "ingredients");
        console.log("[Scan] Upload result:", uploadResult);

        // Step 2: Submit to AI detection
        setScanStatus("Đang phân tích nguyên liệu...");
        console.log("[Scan] Submitting to detect/url with:", uploadResult.url);
        const detectRes = await fetch(`${AI_BASE_URL}/detect/url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: uploadResult.url }),
        });
        const detectData = await detectRes.json();
        console.log("[Scan] Detect response:", detectData);

        const jobId = detectData?.job_id;
        if (!jobId) {
          console.warn("[Scan] No job_id returned from detect endpoint.");
          return;
        }

        // Step 3: Poll job status until completed
        setScanStatus("Đang lấy kết quả...");
        console.log(`[Scan] Polling job status for job_id: ${jobId}`);

        let statusData: any = null;
        const MAX_ATTEMPTS = 20;
        const POLL_INTERVAL_MS = 2000;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          const statusRes = await fetch(`${AI_BASE_URL}/job/status_detection/${jobId}`);
          statusData = await statusRes.json();
          console.log(`[Scan] Job status (attempt ${attempt + 1}):`, statusData);

          if (statusData.status === "completed" || statusData.status === "finished" || statusData.status === "failed") {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }

        if (!statusData || (statusData.status !== "completed" && statusData.status !== "finished") || !statusData.result?.length) {
          Alert.alert("Không tìm thấy", "Không nhận diện được nguyên liệu trong ảnh.");
          return;
        }

        // Extract ingredient names and search
        const ingredients: string[] = statusData.result.map((r: any) => r.class_name);
        const uniqueIngredients = [...new Set(ingredients)] as string[];
        const searchQuery = uniqueIngredients.join(",");

        console.log("[Scan] Detected ingredients:", uniqueIngredients);

        setSearchMode("recipes");
        setSearchQuery(searchQuery);
        setSubmittedQuery(searchQuery);
        saveRecentSearch(searchQuery);
      } catch (err) {
        console.error("[Scan] Error:", err);
        Alert.alert("Lỗi", "Có lỗi xảy ra khi quét nguyên liệu.");
      } finally {
        setScanLoading(false);
        setScanStatus("");
      }
    } catch (err) {
      console.error("[Scan] Camera error:", err);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
      saveRecentSearch(searchQuery.trim());
    }
  };

  const placeholder =
    searchMode === "recipes"
      ? "Tìm theo tên hoặc nguyên liệu..."
      : "Tìm theo tên người dùng...";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Full-screen loading overlay */}
      <Modal visible={scanLoading} transparent animationType="fade" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" }}>
          <View style={{
            backgroundColor: "#ffffff",
            borderRadius: 24,
            paddingVertical: 40,
            paddingHorizontal: 44,
            alignItems: "center",
            width: 260,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
          }}>
            {/* Pulsing rings + icon */}
            <View style={{ width: 88, height: 88, alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
              <Animated.View style={{
                position: "absolute",
                width: 88, height: 88, borderRadius: 44,
                borderWidth: 1.5,
                borderColor: "#f97316",
                transform: [{ scale: pulse1.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.6] }) }],
                opacity: pulse1.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
              }} />
              <Animated.View style={{
                position: "absolute",
                width: 88, height: 88, borderRadius: 44,
                borderWidth: 1.5,
                borderColor: "#f97316",
                transform: [{ scale: pulse2.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.6] }) }],
                opacity: pulse2.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
              }} />
              <View style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: "#fff7ed",
                borderWidth: 1.5,
                borderColor: "#fed7aa",
                alignItems: "center", justifyContent: "center",
              }}>
                <MaterialIcons name="image-search" size={28} color="#f97316" />
              </View>
            </View>

            {/* Bouncing dots */}
            <View style={{ flexDirection: "row", gap: 7, marginBottom: 22 }}>
              {[dot1, dot2, dot3].map((dot, i) => (
                <Animated.View key={i} style={{
                  width: 7, height: 7, borderRadius: 3.5,
                  backgroundColor: "#fdba74",
                  transform: [{ translateY: dot }],
                }} />
              ))}
            </View>

            {/* Status text */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: 4 }}>
              {scanStatus}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
              Đang nhận diện nguyên liệu...
            </Text>
          </View>
        </View>
      </Modal>

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
            onPress={handleScanIngredients}
            disabled={scanLoading}
          >
            <MaterialIcons name="camera-alt" size={20} color="#374151" />
          </TouchableOpacity>
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
            {recentSearches.length > 0 && (
              <View className="mb-7">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Tìm kiếm gần đây
                  </Text>
                  <TouchableOpacity onPress={clearRecentSearches} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text className="text-xs font-medium text-gray-500">Xóa lịch sử</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2 overflow-hidden max-h-[84px]">
                  {recentSearches.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2"
                      style={{ maxWidth: 180 }}
                      onPress={() => {
                        setSearchQuery(item.label);
                        setSubmittedQuery(item.label);
                        saveRecentSearch(item.label);
                      }}
                    >
                      <MaterialIcons name="history" size={15} color="#9ca3af" />
                      <Text
                        className="ml-1.5 text-sm text-gray-600 font-medium"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ flexShrink: 1 }}
                      >{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}


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
