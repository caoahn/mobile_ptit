import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { router, Href } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useAuthStore } from "@/src/features/auth/store/authStore";

const RECIPES = [
  {
    id: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5RHy1N62_BKr4TXQcqHZdFFa-3nT_zJobJ57Xhlwqv-eDYjhATyaCR5TAJ59P0LQSrlnKbLZ_uCGqfpe7zxK8avGvIL_-8cgE6lxbdDmxBM6DDHF2aItZt9-apt5veDpuMNmkYqofOKaj53afopf7Y9NxrYmO5nZ4OqiWAU0aFvJE-yPWsX7cowYp42nBm9-Q2afT_jae2z_6faB3O02EPYu7uNVEQDWtj1F7MqRBoHpamziL2qvd6WEHV3l1_0tnnH5OYdbEoTIo",
    likes: 243,
  },
  {
    id: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQyY8NCshzqrVTD43lC82JUU-rrTgMLypzoihU6b_fDA6Q90GXkBYK-C5EELUX_EUGVJ7DR0JT9Kp11ef4Eh3S4sBI10VNAAKxFBFDKF7lpP-_yEW_ku0e-JFnsPTjMn7lFgRNT2yfR6WBXwpY6KKz5ed7lCuMT05FzZKehVsDVzuSYDy8yC0Hs3mDXeHnmJzgn8kkAGPtnwi4I2h4USTWLgm7i3rZ6eEPzqwQbyoTBaz0QK65pL1DqziRmbIPOVyQ5iq8xhMxZeni",
    likes: 189,
  },
  {
    id: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDswO-I2lqN2i-MPFCKyUFsMi_Oxy1KiTQ99wL6nsjeSuPea_4jHrfn19YWl5hncjyV_iZGQAAvWDKMLIXd_go4zjPIi_DmyrjZt7CsIu6xduS06d9pWGdRszgexjcqwmu7_dQjBDvwSTLogCSFws1pJ7aH85ej4H1EjwD2G1hQ8wqwOdmkwLP9Ou5guFVlSLlUU_wqe-B-2Yl0BQ4pKrcOlR3NrCztLozD-yHk05oCAp9J8vBCFt23nuMrPW_UzusQ3rLrMcCQzoYk",
    likes: 521,
  },
  {
    id: 4,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9nfqrO7KIvwZnkBJ07b99LLNITuOErhAwYX__o2Ptv3YSdByBBt-ZRuw4_blSQM5YAb_azpbeysq67EI4LFtdicQBZhEEizgCpG8sxDy02funvy8zDQv_wopmF8tcdgxM0UuHlxmaLhfgfhoHcQrWz9GJ4imyLE9Xeu77RbDzc0-P82dXNem1IAKcZ-qHqtMgNf4DfxO9ADXzn9EqgJOPzM2h3Ku8fdZKXyhs7t_NE9SBjggqprJVe-ZgLkg1AssAND-cThv1d4MF",
    likes: 332,
  },
  {
    id: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABk9E6Ah8f8mGdGJfv5XUj3ZIZDei7IV4ahuVCHVcdKjbTp-gT48mxo6JkvYXO9Xl8WSxHMMa6i3Cujhtst8XJUkkf3t19NxFk0dytW6Hbg_di8DVaS5M6cXAQqxvP3plBshqhMKsNvt1_9D5GgJxMqFynSn6eIMt6204WtstTbeAj0ni0hJX_zb3xETi7pu1mKTB-aPUUCX92PuYLt_MaxVcgr3LY_JDiUDduc3W6EkS2NUxZL7eWng8UhG3FpSoPr9cl5idm42Qu",
    likes: 1100,
  },
  {
    id: 6,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTWlX2KeSxRT1vcstflh46xNreYeBcmXPH9LEeaLmX4f7bVZbzgbvO_rhhg8D6xe7ik1olPqIwrv_7zDD_O_VG_C5OTUErQSNJyI48Y9bos7bXqjHxT8vAN3YvB2ZtLxsDfShkrSAO0h4Gr32RY92tc2ScH8JqcLXlpq3x6IMXr5tZg5YCqZSFePR-h9Cp9dXWHRs_RDzmWnglTR93FnkhyNr_HfDfwWBsNa8r-Gvkekn1Yofjpc4xJLarIDABAvyNTI8f5lP66GdO",
    likes: 942,
    ai: true,
  },
];

export default function ProfileScreen() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-white/10 bg-background-light/80 px-4 py-3 backdrop-blur-md dark:bg-background-dark/80">
        <TouchableOpacity>
          <MaterialIcons name="arrow-back-ios" size={24} color="#67837f" />
        </TouchableOpacity>
        <Text className="text-sm font-bold uppercase tracking-tight text-[#121716] dark:text-white">
          @alex_culinary
        </Text>
        <TouchableOpacity className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5">
          <MaterialIcons name="settings" size={24} color="#67837f" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View className="flex-col items-center px-6 pb-4 pt-8 text-center">
          <View className="mb-6 relative">
            <View className="h-28 w-28 rounded-full border-[3px] border-primary bg-white p-1 dark:bg-background-dark">
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoIibnJOshuOXx_XIIyvpIZfazYbPiGJKnX-pGVdE4_BLd2PmG5AODJU5KrXQ054lvmJG3aJlynInH9V5dzRHH4xX25WouqEPxdyIMI2s3DzNt_beI4Vs7ZXbsBpBvMXfE3_XqBBki9gLBjM7r4vxK1k7CNRabLL_S1-42RcljeP1oUag_6PBMqhO38exWhW2myTQxZ83QZ1xOXwzp2RjH0-u4cC6FaJzwef1NKbHgpkyipADOaIMXCGcCRm9OUj-HcDM4hac_HfB5",
                }}
                className="h-full w-full rounded-full"
              />
            </View>
            <View className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-background-light bg-primary p-1 dark:border-background-dark">
              <MaterialIcons name="auto-awesome" size={14} color="white" />
            </View>
          </View>
          <Text className="mb-1 text-2xl font-extrabold tracking-tight text-[#121716] dark:text-white">
            Alex Culinary
          </Text>
          <Text className="mb-1 text-sm font-light text-[#67837f] dark:text-[#a0b2af]">
            Exploring plant-based fusion with AI
          </Text>
          <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 dark:bg-primary/20">
            <MaterialIcons name="verified" size={16} color="#29a38f" />
            <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">
              AI Power User
            </Text>
          </View>
        </View>

        {/* Stars */}
        <View className="relative flex-row items-center justify-between px-6 py-4">
          <View className="flex-1 flex-col items-center">
            <Text className="text-lg font-bold text-[#121716] dark:text-white">
              42
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Recipes
            </Text>
          </View>
          <View className="h-8 w-[1px] bg-[#dde4e3] dark:bg-[#3d4a48]" />
          <TouchableOpacity 
            className="flex-1 flex-col items-center"
            onPress={() => router.push("/connection?type=followers&username=Alex Culinary" as Href)}
          >
            <Text className="text-lg font-bold text-[#121716] dark:text-white">
              1.2k
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Followers
            </Text>
          </TouchableOpacity>
          <View className="h-8 w-[1px] bg-[#dde4e3] dark:bg-[#3d4a48]" />
          <TouchableOpacity 
            className="flex-1 flex-col items-center"
            onPress={() => router.push("/connection?type=following&username=Alex Culinary" as Href)}
          >
            <Text className="text-lg font-bold text-[#121716] dark:text-white">
              850
            </Text>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-[#67837f]">
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button (For Testing) */}
        <View className="px-6 pb-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-red-50 h-11"
          >
            <MaterialIcons name="logout" size={18} color="#EF4444" />
            <Text className="text-sm font-bold tracking-wide text-red-500">
              Logout (Test)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3 px-6 py-6">
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-primary h-11 shadow-lg shadow-primary/20"
          >
            <MaterialIcons name="edit" size={18} color="white" />
            <Text className="text-sm font-bold tracking-wide text-white">
              Edit Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="h-11 w-12 items-center justify-center rounded-lg border border-[#dde4e3] dark:border-[#3d4a48]">
            <MaterialIcons name="share" size={20} color={"#121716"} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="mt-2">
          <View className="flex-row border-b border-[#dde4e3] px-6 dark:border-[#3d4a48]">
            <TouchableOpacity className="flex-1 border-b-2 border-primary py-4">
              <Text className="text-center text-sm font-bold tracking-tight text-[#121716] dark:text-white">
                My Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-4">
              <Text className="text-center text-sm font-medium tracking-tight text-[#67837f] dark:text-[#a0b2af]">
                Collections
              </Text>
            </TouchableOpacity>
          </View>

          {/* Grid */}
          <View className="mt-1 flex-row flex-wrap bg-white dark:bg-background-dark">
            {RECIPES.map((item) => (
              <View
                key={item.id}
                className="relative aspect-square w-1/3 p-[1px]"
              >
                <Image source={{ uri: item.image }} className="h-full w-full" />
                {/* Edit Button Overlay */}
                <TouchableOpacity 
                  onPress={() => router.push(`/edit-recipe/${item.id}` as Href)}
                  className="absolute top-1 right-1 z-20 rounded-full bg-black/50 p-1.5 backdrop-blur-sm"
                >
                  <MaterialIcons name="edit" size={14} color="white" />
                </TouchableOpacity>

                <View className="absolute bottom-1 right-1 z-10 flex-row items-center gap-1">
                  <MaterialIcons name="favorite" size={12} color="white" />
                  <Text className="text-[10px] font-bold text-white">
                    {item.likes}
                  </Text>
                </View>
                {item.ai && (
                  <View className="absolute left-1 top-1 z-10 rounded bg-primary/80 px-1.5 py-0.5 backdrop-blur-sm">
                    <Text className="text-[8px] font-bold uppercase text-white">
                      AI Recipe
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
