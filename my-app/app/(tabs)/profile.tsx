import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState, useCallback } from "react";
import { router, Href, useFocusEffect } from "expo-router";

import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/store/authStore";
import { useDialogStore } from "@/src/shared/stores/useDialogStore";
import { getUserRecipes, getSavedRecipes } from "@/src/features/recipe/services/recipeService";
import { getProfile } from "@/src/features/auth/services/userService";
import { LoadingSpinner } from "@/src/shared/components";

export default function ProfileScreen() {
  const { logout, user, updateUser } = useAuthStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"recipes" | "saved">("recipes");
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dkxvnzebp/image/upload/v1774540103/%E1%BA%A2nh_ch%E1%BB%A5p_m%C3%A0n_h%C3%ACnh_2026-03-26_224804_ouqddw.png";


  const handleLogout = () => {
    showDialog({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      onConfirm: () => logout(),
    });
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const freshUser = await getProfile();
        updateUser(freshUser); // 🔥 cập nhật lại store
      } catch (error) {
        console.log("Fetch profile error:", error);
      }
    };

    fetchProfile();
  }, []);


  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        if (!user) return;

        const [myRecipes, savedRes] = await Promise.all([
          getUserRecipes((user as any).id),
          getSavedRecipes().catch(() => []),
        ]);
        setRecipes(myRecipes || []);
        setSavedRecipes(savedRes || []);
      } catch (error) {
        console.log("Fetch recipes & saved error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        if (!user) return;
        try {
          setLoading(true);
          const [freshUser, myRecipes, savedRes] = await Promise.all([
            getProfile(),
            getUserRecipes((user as any).id),
            getSavedRecipes().catch(() => []),
          ]);
          updateUser(freshUser);
          setRecipes(myRecipes || []);
          setSavedRecipes(savedRes || []);
        } catch (error) {
          console.log("Focus refresh error:", error);
        } finally {
          setLoading(false);
        }
      };
      refresh();
    }, [user?.id])
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-white/10 bg-background-light/80 px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#67837f" />
        </TouchableOpacity>

        <Text className="text-sm font-bold uppercase text-[#121716]">
          @{user?.username}
        </Text>

        <View className="flex-row items-center gap-4">
          
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <MaterialIcons name="settings" size={24} color="#67837f" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>



        {/* Profile */}
        <View className="flex-col items-center px-6 pb-4 pt-8">

          <View className="mb-6">
            <View className="h-28 w-28 rounded-full border-[3px] border-primary bg-white p-1">
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <View className="h-full w-full items-center justify-center rounded-full bg-gray-200">
                  <Text className="text-4xl font-bold text-gray-500">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text className="mb-1 text-2xl font-extrabold text-[#121716]">
            {user?.full_name}
          </Text>

          <Text className="text-sm text-[#67837f]">
            {user?.bio || "Chưa có tiểu sử"}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-1 items-center">
            <Text className="text-xl font-bold">{recipes.length}</Text>
            <Text className="text-[13px] text-[#67837f]">CÔNG THỨC</Text>
          </View>

          <View className="h-8 w-[1px] bg-[#dde4e3]" />

          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() =>
              router.push(
                `/connection?type=followers&username=${user?.full_name || user?.username}&userId=${user?.id}` as any
              )
            }
          >
            <Text className="text-xl font-bold">{user?.followers_count || 0}</Text>
            <Text className="text-[13px] text-[#67837f]">FOLLOWERS</Text>
          </TouchableOpacity>

          <View className="h-8 w-[1px] bg-[#dde4e3]" />

          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() =>
              router.push(
                `/connection?type=following&username=${user?.full_name || user?.username}&userId=${user?.id}` as any
              )
            }
          >
            <Text className="text-xl font-bold">{user?.following_count || 0}</Text>
            <Text className="text-[13px] text-[#67837f]">FOLLOWING</Text>
          </TouchableOpacity>
        </View>


        {/* Tabs */}
        <View className="mt-2">
          <View className="flex-row border-b border-[#dde4e3] px-6">
            <TouchableOpacity 
              onPress={() => setActiveTab("recipes")}
              className={`flex-1 py-4 ${activeTab === "recipes" ? "border-b-2 border-primary" : ""}`}
            >
              <Text className={`text-center text-base ${activeTab === "recipes" ? "font-bold text-[#121716]" : "font-medium text-[#67837f]"}`}>
                Công thức
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab("saved")}
              className={`flex-1 py-4 ${activeTab === "saved" ? "border-b-2 border-primary" : ""}`}
            >
              <Text className={`text-center text-base ${activeTab === "saved" ? "font-bold text-[#121716]" : "font-medium text-[#67837f]"}`}>
                Bộ sưu tập
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading ? (
            <LoadingSpinner className="py-20 items-center justify-center" />
          ) : (
            <View className="flex-row flex-wrap bg-background-light">
              {(activeTab === "recipes" ? recipes : savedRecipes).length === 0 ? (
                <View className="w-full items-center justify-center py-16">
                  <MaterialIcons name={activeTab === "recipes" ? "restaurant-menu" : "bookmark-border"} size={48} color="#cbd5e1" />
                  <Text className="mt-4 text-sm font-medium text-gray-500">
                    {activeTab === "recipes" ? "Chưa có công thức nào" : "Bạn chưa lưu công thức nào"}
                  </Text>
                </View>
              ) : (
                (activeTab === "recipes" ? recipes : savedRecipes).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="relative aspect-square w-1/3 p-[1px]"
                    onPress={() => router.push(`/recipe/${item.id}`)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{
                        uri: item.image_url || "https://res.cloudinary.com/dkxvnzebp/image/upload/v1774540103/%E1%BA%A2nh_ch%E1%BB%A5p_m%C3%A0n_h%C3%ACnh_2026-03-26_224804_ouqddw.png"
                      }}
                      className="h-full w-full"
                    />

                    {/* Nút sửa chỉ hiện ở tab "Công thức của mình" */}
                    {activeTab === "recipes" && (
                      <TouchableOpacity
                        onPress={() => router.push(`/edit-recipe/${item.id}`)}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1.5"
                      >
                        <MaterialIcons name="edit" size={14} color="white" />
                      </TouchableOpacity>
                    )}

                    {/* Likes */}
                    <View className="absolute bottom-1 right-1 flex-row items-center gap-1">
                      <MaterialIcons name="favorite" size={12} color="white" />
                      <Text className="text-[10px] font-bold text-white">
                        {item.likes_count ?? 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Settings Modal (Bottom Sheet) */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View className="bg-white rounded-t-[28px] px-4 pt-3 pb-8">
            <View className="items-center mb-6">
              <View className="h-1.5 w-12 bg-gray-300 rounded-full" />
            </View>

            <TouchableOpacity
              onPress={() => { setShowSettings(false); router.push("/edit-profile"); }}
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
            >
              <MaterialIcons name="edit" size={24} color="#374151" />
              <Text className="ml-4 text-base font-medium text-gray-700">Chỉnh sửa Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setShowSettings(false); handleLogout(); }}
              className="flex-row items-center px-4 py-4"
            >
              <MaterialIcons name="logout" size={24} color="#EF4444" />
              <Text className="ml-4 text-base font-medium text-red-500">Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}