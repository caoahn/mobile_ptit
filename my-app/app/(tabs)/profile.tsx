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

  const DEFAULT_AVATAR =
    "https://res.cloudinary.com/dkxvnzebp/image/upload/v1773670730/main-sample.png";


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
        <TouchableOpacity>
          <MaterialIcons name="arrow-back-ios" size={24} color="#67837f" />
        </TouchableOpacity>

        <Text className="text-sm font-bold uppercase text-[#121716]">
          @{user?.email}
        </Text>

        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color="#67837f" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>



        {/* Profile */}
        <View className="flex-col items-center px-6 pb-4 pt-8">

          <View className="mb-6">
            <View className="h-28 w-28 rounded-full border-[3px] border-primary bg-white p-1">
              <Image
                source={{
                  uri: user?.avatar_url && user.avatar_url.trim() !== ""
                    ? `${user.avatar_url}?v=${user?.updated_at || Date.now()}`
                    : DEFAULT_AVATAR,
                }}
                className="h-full w-full rounded-full"
              />
            </View>
          </View>

          <Text className="mb-1 text-2xl font-extrabold text-[#121716]">
            {user?.username}
          </Text>

          <Text className="text-sm text-[#67837f]">
            Exploring plant-based fusion with AI
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold">{recipes.length}</Text>
            <Text className="text-[11px] text-[#67837f]">Recipes</Text>
          </View>

          <View className="h-8 w-[1px] bg-[#dde4e3]" />

          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() =>
              router.push(
                `/connection?type=followers&username=${user?.username}` as Href
              )
            }
          >
            <Text className="text-lg font-bold">1.2k</Text>
            <Text className="text-[11px] text-[#67837f]">Followers</Text>
          </TouchableOpacity>

          <View className="h-8 w-[1px] bg-[#dde4e3]" />

          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() =>
              router.push(
                `/connection?type=following&username=${user?.username}` as Href
              )
            }
          >
            <Text className="text-lg font-bold">850</Text>
            <Text className="text-[11px] text-[#67837f]">Following</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View className="px-6 pb-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-red-50 h-11"
          >
            <MaterialIcons name="logout" size={18} color="#EF4444" />
            <Text className="text-sm font-bold text-red-500">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Edit */}
        <View className="flex-row gap-3 px-6 py-6">
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-primary h-11"
          >
            <MaterialIcons name="edit" size={18} color="white" />
            <Text className="text-sm font-bold text-white">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity className="h-11 w-12 items-center justify-center rounded-lg border border-[#dde4e3]">
            <MaterialIcons name="share" size={20} color={"#121716"} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="mt-2">
          <View className="flex-row border-b border-[#dde4e3] px-6">
            <TouchableOpacity 
              onPress={() => setActiveTab("recipes")}
              className={`flex-1 py-4 ${activeTab === "recipes" ? "border-b-2 border-primary" : ""}`}
            >
              <Text className={`text-center text-sm ${activeTab === "recipes" ? "font-bold text-[#121716]" : "font-medium text-[#67837f]"}`}>
                Công thức
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab("saved")}
              className={`flex-1 py-4 ${activeTab === "saved" ? "border-b-2 border-primary" : ""}`}
            >
              <Text className={`text-center text-sm ${activeTab === "saved" ? "font-bold text-[#121716]" : "font-medium text-[#67837f]"}`}>
                Bộ sưu tập
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading ? (
            <LoadingSpinner className="py-20 items-center justify-center" />
          ) : (
            <View className="flex-row flex-wrap bg-white">
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
                        uri: item.image_url || "https://placehold.co/150x150/png"
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
    </SafeAreaView>
  );
}