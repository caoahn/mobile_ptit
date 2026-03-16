import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@/src/shared/services/api/client";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [profileRes, recipesRes] = await Promise.all([
          apiClient.get(`/users/${id}`),
          apiClient.get(`/users/${id}/recipes`),
        ]);

        const profileData = profileRes.data?.data || profileRes.data?.user || profileRes.data?.profile || profileRes.data;
        setProfile(profileData);
        // Đặt trạng thái ban đầu của nút Follow dựa theo dữ liệu backend trả về
        setIsFollowing(!!profileData?.is_following);

        const recipesData = recipesRes.data?.data || recipesRes.data?.recipes || recipesRes.data || [];
        setRecipes(Array.isArray(recipesData) ? recipesData : []);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleFollow = async () => {
    try {
      const currentFollowingState = isFollowing;
      setIsFollowing(!isFollowing);

      // Cập nhật số lượng người theo dõi ngay lập tức trên UI (Optimistic Update)
      setProfile((prev: any) => ({
        ...prev,
        followers_count: (prev.followers_count || 0) + (currentFollowingState ? -1 : 1),
      }));

      if (currentFollowingState) {
        await apiClient.delete(`/users/${id}/follow`);
      } else {
        await apiClient.post(`/users/${id}/follow`);
      }
    } catch (error) {
      // Nếu gọi API thất bại, khôi phục lại trạng thái cũ
      setIsFollowing(isFollowing);
      setProfile((prev: any) => ({
        ...prev,
        followers_count: (prev.followers_count || 0) + (isFollowing ? -1 : 1),
      }));
      console.error("Lỗi khi follow/unfollow:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#29a38f" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
        <Text className="text-gray-500 mb-4">Không tìm thấy người dùng</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 bg-primary rounded-lg">
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-white/10 bg-background-light/80 px-4 py-3 backdrop-blur-md">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#67837f" />
        </TouchableOpacity>
        <Text className="text-sm font-bold tracking-tight text-[#121716]">
          @{profile.username}
        </Text>
        <TouchableOpacity className="rounded-full p-2 hover:bg-black/5">
          <MaterialIcons name="more-horiz" size={24} color="#67837f" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View className="flex-col items-center px-6 pb-4 pt-8 text-center">
          <View className="mb-6 relative">
            <View className="h-28 w-28 rounded-full border-[3px] border-primary bg-white p-1">
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <View className="h-full w-full items-center justify-center rounded-full bg-gray-200">
                  <Text className="text-4xl font-bold text-gray-500">
                    {profile.username?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>
            {profile.is_verified && (
              <View className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-background-light bg-primary p-1">
                <MaterialIcons name="check" size={14} color="white" />
              </View>
            )}
          </View>
          <Text className="mb-1 text-2xl font-extrabold tracking-tight text-[#121716]">
            {profile.full_name || profile.username}
          </Text>
          <Text className="mb-1 text-sm font-light text-[#67837f] ]">
            {profile.bio || "Chưa có tiểu sử"}
          </Text>
          {profile.is_verified && (
            <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <MaterialIcons name="verified" size={16} color="#29a38f" />
              <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Verified Chef
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="relative flex-row items-center justify-between px-6 py-4">
          <View className="flex-1 flex-col items-center">
            <Text className="text-lg font-bold text-[#121716]">
              {profile.recipes_count || recipes.length || 0}
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Recipes
            </Text>
          </View>
          <View className="h-8 w-[1px] bg-[#dde4e3] ]" />
          <TouchableOpacity 
            className="flex-1 flex-col items-center"
            onPress={() => router.push(`/connection?type=followers&username=${profile.full_name || profile.username}&userId=${id}` as any)}
          >
            <Text className="text-lg font-bold text-[#121716]">
              {profile.followers_count || 0}
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Followers
            </Text>
          </TouchableOpacity>
          <View className="h-8 w-[1px] bg-[#dde4e3] ]" />
          <TouchableOpacity 
            className="flex-1 flex-col items-center"
            onPress={() => router.push(`/connection?type=following&username=${profile.full_name || profile.username}&userId=${id}` as any)}
          >
            <Text className="text-lg font-bold text-[#121716]">
              {profile.following_count || 0}
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3 px-6 py-6">
          <TouchableOpacity
            onPress={handleFollow}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg h-11 shadow-lg ${isFollowing
              ? "bg-gray-200 shadow-none"
              : "bg-primary shadow-primary/20"
              }`}
          >
            <MaterialIcons name={isFollowing ? "check" : "person-add"} size={18} color={isFollowing ? "#121716" : "white"} />
            <Text className={`text-sm font-bold tracking-wide ${isFollowing ? "text-[#121716]" : "text-white"}`}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="mt-2">
          <View className="flex-row border-b border-[#dde4e3] px-6 ]">
            <TouchableOpacity className="flex-1 border-b-2 border-primary py-4">
              <Text className="text-center text-sm font-bold tracking-tight text-[#121716]">
                Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-4">
              <Text className="text-center text-sm font-medium tracking-tight text-[#67837f] ]">
                Collections
              </Text>
            </TouchableOpacity>
          </View>

          {/* Grid Content */}
          <View className="mt-1 flex-row flex-wrap bg-white">
            {recipes.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                className="relative aspect-square w-1/3 p-[1px]"
                onPress={() => router.push(`/recipe/${item.id}`)}
              >
                <Image source={{ uri: item.image_url || "https://placehold.co/150x150/png" }} className="w-full h-full" />
                <View className="absolute bottom-1 right-1 z-10 flex-row items-center gap-1">
                  <MaterialIcons name="favorite" size={12} color="white" />
                  <Text className="text-[10px] font-bold text-white">
                    {item.likes_count || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
