import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data cho User Profile
const MOCK_USER = {
  id: "1",
  name: "Chef Sarah",
  username: "sarah_cooks",
  bio: "Passionate about fusion cuisine. Creating simple recipes for busy people. 🍜✨",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZIipZOfYOdAOlOqlHZc86BSQ3AGBKIUErFxgbdXoXLVvka4Pvqmbb01HoO5WOebCv8ZnJsUn1-Mm8HM9UcUU9YvuORO5czZOh2QV86Uzl4mVClERWdYQGcc_N34NOU8u_kQnMHeLt7WeS5jfKqqGClWQMjSTvgDAURxmG0GoRdp84ANpMeGCoK0K-wZ1q4qh6GhTUUU3H25LvKn6-x7l-BLAj9x-R_M1a4t0h_2SHBQh7KfVXa0AEFozx7CdexVr8HDeCdo6YtQrT",
  followers: "12.5k",
  following: "142",
  recipes_count: 86,
  is_verified: true,
};

const USER_RECIPES = [
  {
    id: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRMfoec0Pm0cAemNw4Af1dDioOhmWH5VjGt5h2enP_u3PO4U7__KwprSHyWhS_52ismBYKl9uQ8k58VZ_AWNIVMSrJGUzDRb1n1rGSOaZKPq4g7iN-C16d14PQlv4ob55568ms9gQuK30p3qJ8R8eytBR-nDNEf17vm8ISwTQeGC-M9hpKEJnetP_zHqO0Pka7Kf4iFBcqKojqa0m2YrqOuhtJo_YNfi0hGeOwZyQBJM3qI-E9xX1yZkWoempEYWbtQciSV5OIkyPV",
    likes: 1205,
  },
  {
    id: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdQzaEEq-JSHh8oDbrmpzytc22uCkzeE07lxukLCZfccanpdrenujvoKADkkwuVlGDgECJkgaZ1M_cPXCRjvsjYJWHlo_GRZkzMzAqB12lR5TD2AG8hSjzwlf7g-5tmaJuPV7wnlmdCe8QTETbWq74LVcE2jOLYopgwZajtADQJRsaJI-Z-08xjnTcCZfSHnyiBSqfHq74ztF-vTlmr5ZCSGQLGvIauZN7vnc7nE_tAPHnZl1pNSt1bKqAxMM55S8Dak5UAe2_g8E1",
    likes: 890,
  },
  {
    id: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDswO-I2lqN2i-MPFCKyUFsMi_Oxy1KiTQ99wL6nsjeSuPea_4jHrfn19YWl5hncjyV_iZGQAAvWDKMLIXd_go4zjPIi_DmyrjZt7CsIu6xduS06d9pWGdRszgexjcqwmu7_dQjBDvwSTLogCSFws1pJ7aH85ej4H1EjwD2G1hQ8wqwOdmkwLP9Ou5guFVlSLlUU_wqe-B-2Yl0BQ4pKrcOlR3NrCztLozD-yHk05oCAp9J8vBCFt23nuMrPW_UzusQ3rLrMcCQzoYk",
    likes: 540,
  },
];

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      {/* Header - Giống profile.tsx nhưng có nút Back */}
      <View className="flex-row items-center justify-between border-b border-white/10 bg-background-light/80 px-4 py-3 backdrop-blur-md dark:bg-background-dark/80">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#67837f" />
        </TouchableOpacity>
        <Text className="text-sm font-bold uppercase tracking-tight text-[#121716] dark:text-white">
          @{MOCK_USER.username}
        </Text>
        <TouchableOpacity className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5">
          <MaterialIcons name="more-horiz" size={24} color="#67837f" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Info - Cấu trúc giống hệt profile.tsx */}
        <View className="flex-col items-center px-6 pb-4 pt-8 text-center">
          <View className="mb-6 relative">
            <View className="h-28 w-28 rounded-full border-[3px] border-primary bg-white p-1 dark:bg-background-dark">
              <Image
                source={{ uri: MOCK_USER.avatar }}
                className="h-full w-full rounded-full"
              />
            </View>
            {MOCK_USER.is_verified && (
              <View className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-background-light bg-primary p-1 dark:border-background-dark">
                <MaterialIcons name="check" size={14} color="white" />
              </View>
            )}
          </View>
          <Text className="mb-1 text-2xl font-extrabold tracking-tight text-[#121716] dark:text-white">
            {MOCK_USER.name}
          </Text>
          <Text className="mb-1 text-sm font-light text-[#67837f] dark:text-[#a0b2af]">
            {MOCK_USER.bio}
          </Text>
          <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 dark:bg-primary/20">
            <MaterialIcons name="verified" size={16} color="#29a38f" />
            <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Verified Chef
            </Text>
          </View>
        </View>

        {/* Stats - Cấu trúc giống hệt profile.tsx */}
        <View className="relative flex-row items-center justify-between px-6 py-4">
          <View className="flex-1 flex-col items-center">
            <Text className="text-lg font-bold text-[#121716] dark:text-white">
              {MOCK_USER.recipes_count}
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Recipes
            </Text>
          </View>
          <View className="h-8 w-[1px] bg-[#dde4e3] dark:bg-[#3d4a48]" />
          <View className="flex-1 flex-col items-center">
            <Text className="text-lg font-bold text-[#121716] dark:text-white">
              {MOCK_USER.followers}
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Followers
            </Text>
          </View>
          <View className="h-8 w-[1px] bg-[#dde4e3] dark:bg-[#3d4a48]" />
          <View className="flex-1 flex-col items-center">
            <Text className="text-lg font-bold text-[#121716] dark:text-white">
              {MOCK_USER.following}
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Following
            </Text>
          </View>
        </View>

        {/* Buttons - Thay Edit thành Follow */}
        <View className="flex-row gap-3 px-6 py-6">
          <TouchableOpacity
            onPress={handleFollow}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg h-11 shadow-lg ${
              isFollowing 
                ? "bg-gray-200 shadow-none" 
                : "bg-primary shadow-primary/20"
            }`}
          >
            <MaterialIcons name={isFollowing ? "check" : "person-add"} size={18} color={isFollowing ? "#121716" : "white"} />
            <Text className={`text-sm font-bold tracking-wide ${isFollowing ? "text-[#121716]" : "text-white"}`}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="h-11 w-12 items-center justify-center rounded-lg border border-[#dde4e3] dark:border-[#3d4a48]">
            <MaterialIcons name="mail-outline" size={20} color={"#121716"} />
          </TouchableOpacity>
        </View>

        {/* Tabs - Giống profile.tsx */}
        <View className="mt-2">
          <View className="flex-row border-b border-[#dde4e3] px-6 dark:border-[#3d4a48]">
            <TouchableOpacity className="flex-1 border-b-2 border-primary py-4">
              <Text className="text-center text-sm font-bold tracking-tight text-[#121716] dark:text-white">
                Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-4">
              <Text className="text-center text-sm font-medium tracking-tight text-[#67837f] dark:text-[#a0b2af]">
                Collections
              </Text>
            </TouchableOpacity>
          </View>

          {/* Grid Content - Giống profile.tsx */}
          <View className="mt-1 flex-row flex-wrap bg-white dark:bg-background-dark">
            {USER_RECIPES.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                className="relative aspect-square w-1/3 p-[1px]"
                onPress={() => router.push(`/recipe/${item.id}`)}
              >
                <Image source={{ uri: item.image }} className="w-full h-full" />
                <View className="absolute bottom-1 right-1 z-10 flex-row items-center gap-1">
                  <MaterialIcons name="favorite" size={12} color="white" />
                  <Text className="text-[10px] font-bold text-white">
                    {item.likes}
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
