import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data
const MOCK_USERS = [
  {
    id: "1",
    name: "Chef John",
    username: "john_cooking",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZIipZOfYOdAOlOqlHZc86BSQ3AGBKIUErFxgbdXoXLVvka4Pvqmbb01HoO5WOebCv8ZnJsUn1-Mm8HM9UcUU9YvuORO5czZOh2QV86Uzl4mVClERWdYQGcc_N34NOU8u_kQnMHeLt7WeS5jfKqqGClWQMjSTvgDAURxmG0GoRdp84ANpMeGCoK0K-wZ1q4qh6GhTUUU3H25LvKn6-x7l-BLAj9x-R_M1a4t0h_2SHBQh7KfVXa0AEFozx7CdexVr8HDeCdo6YtQrT",
    isFollowing: true,
  },
  {
    id: "2",
    name: "Maria Foodie",
    username: "maria_eats",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdQzaEEq-JSHh8oDbrmpzytc22uCkzeE07lxukLCZfccanpdrenujvoKADkkwuVlGDgECJkgaZ1M_cPXCRjvsjYJWHlo_GRZkzMzAqB12lR5TD2AG8hSjzwlf7g-5tmaJuPV7wnlmdCe8QTETbWq74LVcE2jOLYopgwZajtADQJRsaJI-Z-08xjnTcCZfSHnyiBSqfHq74ztF-vTlmr5ZCSGQLGvIauZN7vnc7nE_tAPHnZl1pNSt1bKqAxMM55S8Dak5UAe2_g8E1",
    isFollowing: false,
  },
  {
    id: "3",
    name: "Healthy Life",
    username: "healthy_life",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDswO-I2lqN2i-MPFCKyUFsMi_Oxy1KiTQ99wL6nsjeSuPea_4jHrfn19YWl5hncjyV_iZGQAAvWDKMLIXd_go4zjPIi_DmyrjZt7CsIu6xduS06d9pWGdRszgexjcqwmu7_dQjBDvwSTLogCSFws1pJ7aH85ej4H1EjwD2G1hQ8wqwOdmkwLP9Ou5guFVlSLlUU_wqe-B-2Yl0BQ4pKrcOlR3NrCztLozD-yHk05oCAp9J8vBCFt23nuMrPW_UzusQ3rLrMcCQzoYk",
    isFollowing: true,
  },
  {
    id: "4",
    name: "Vegan Corner",
    username: "vegan_corner",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9nfqrO7KIvwZnkBJ07b99LLNITuOErhAwYX__o2Ptv3YSdByBBt-ZRuw4_blSQM5YAb_azpbeysq67EI4LFtdicQBZhEEizgCpG8sxDy02funvy8zDQv_wopmF8tcdgxM0UuHlxmaLhfgfhoHcQrWz9GJ4imyLE9Xeu77RbDzc0-P82dXNem1IAKcZ-qHqtMgNf4DfxO9ADXzn9EqgJOPzM2h3Ku8fdZKXyhs7t_NE9SBjggqprJVe-ZgLkg1AssAND-cThv1d4MF",
    isFollowing: false,
  },
];

export default function ConnectionScreen() {
  const { type, username } = useLocalSearchParams<{ type: string; username: string }>();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    (type as "followers" | "following") || "followers"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(MOCK_USERS);

  const toggleFollow = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isFollowing: !user.isFollowing } : user
    ));
  };

  const renderItem = ({ item }: { item: typeof MOCK_USERS[0] }) => (
    <View className="flex-row items-center justify-between py-3 px-4 bg-white dark:bg-black">
      <TouchableOpacity 
        className="flex-row items-center flex-1 gap-3"
        onPress={() => router.push(`/user/${item.id}` as any)}
      >
        <Image source={{ uri: item.avatar }} className="h-12 w-12 rounded-full bg-gray-200" />
        <View>
          <Text className="font-bold text-base text-gray-900 dark:text-white">{item.name}</Text>
          <Text className="text-sm text-gray-500">@{item.username}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => toggleFollow(item.id)}
        className={`px-4 py-1.5 rounded-md border min-w-[100px] items-center ${
          item.isFollowing
            ? "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            : "bg-primary border-primary"
        }`}
      >
        <Text className={`font-semibold text-sm ${
          item.isFollowing ? "text-gray-900 dark:text-white" : "text-white"
        }`}>
          {item.isFollowing ? "Đang follow" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#121716" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {username || "Người dùng"}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity 
          onPress={() => setActiveTab("following")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "following" ? "border-black dark:border-white" : "border-transparent"
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === "following" ? "text-black dark:text-white" : "text-gray-500"
          }`}>
            Đang follow
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("followers")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "followers" ? "border-black dark:border-white" : "border-transparent"
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === "followers" ? "text-black dark:text-white" : "text-gray-500"
          }`}>
            Follower
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 py-2 mt-2">
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <MaterialIcons name="search" size={20} color="gray" />
          <TextInput 
            placeholder="Tìm kiếm" 
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
