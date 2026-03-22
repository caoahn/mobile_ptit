import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "@/src/shared/components";
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
import apiClient from "@/src/shared/services/api/client";
import { useAuthStore } from "@/src/features/auth/store/authStore";

export default function ConnectionScreen() {
  const { type, username, userId } = useLocalSearchParams<{ type: string; username: string; userId: string }>();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    (type as "followers" | "following") || "followers"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const endpoint = activeTab === "followers" ? `/users/${userId}/followers` : `/users/${userId}/following`;
        const res = await apiClient.get(endpoint);
        const fetchedUsers = res.data?.data || res.data || [];

        setUsers(fetchedUsers.map((u: any) => ({
          ...u,
          is_following: !!u.is_following
        })));
      } catch (error) {
        console.error("Lỗi khi tải danh sách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [userId, activeTab]);

  const toggleFollow = async (targetUserId: string, currentIsFollowing: boolean) => {
    try {
      setUsers(users.map(user =>
        String(user.id) === String(targetUserId) ? { ...user, is_following: !currentIsFollowing } : user
      ));

      if (currentIsFollowing) {
        await apiClient.delete(`/users/${targetUserId}/follow`);
      } else {
        await apiClient.post(`/users/${targetUserId}/follow`);
      }
    } catch (error) {
      setUsers(users.map(user =>
        String(user.id) === String(targetUserId) ? { ...user, is_following: currentIsFollowing } : user
      ));
      console.error("Lỗi khi follow/unfollow:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = String(currentUser?.id) === String(item.id);

    return (
      <View className="flex-row items-center justify-between py-3 px-4 bg-white">
        <TouchableOpacity
          className="flex-row items-center flex-1 gap-3"
          onPress={() => {
            if (isMe) {
              router.push("/(tabs)/profile" as any);
            } else {
              router.push(`/user/${item.id}` as any);
            }
          }}
        >
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} className="h-12 w-12 rounded-full bg-gray-200" />
          ) : (
            <View className="h-12 w-12 rounded-full bg-gray-200 items-center justify-center">
              <Text className="text-lg font-bold text-gray-500">
                {item.username?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View>
            <Text className="font-bold text-base text-gray-900">
              {item.full_name || item.username} {isMe && <Text className="text-gray-500 font-normal">(Bạn)</Text>}
            </Text>
            <Text className="text-sm text-gray-500">@{item.username}</Text>
          </View>
        </TouchableOpacity>

        {!isMe && (
          <TouchableOpacity
            onPress={() => toggleFollow(item.id, item.is_following)}
            className={`px-4 py-1.5 rounded-md border min-w-[100px] items-center ${item.is_following
              ? "bg-gray-100 border-gray-300"
              : "bg-primary border-primary"
              }`}
          >
            <Text className={`font-semibold text-sm ${item.is_following ? "text-gray-900" : "text-white"}`}>
              {item.is_following ? "Đang follow" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredUsers = users.filter(user => user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#121716" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          {username || "Người dùng"}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab("followers")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "followers" ? "border-black" : "border-transparent"
            }`}
        >
          <Text className={`font-semibold ${activeTab === "followers" ? "text-black" : "text-gray-500"
            }`}>
            Follower
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("following")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "following" ? "border-black" : "border-transparent"
            }`}
        >
          <Text className={`font-semibold ${activeTab === "following" ? "text-black" : "text-gray-500"
            }`}>
            Đang follow
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 py-2 mt-2">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <MaterialIcons name="search" size={20} color="gray" />
          <TextInput
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-base text-gray-900"
            placeholderTextColor="gray"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <LoadingSpinner text="" />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">Không tìm thấy người dùng</Text>}
        />
      )}
    </SafeAreaView>
  );
}
