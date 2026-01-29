import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Reusing same grid for Saved placeholder
const SAVED_ITEMS = [
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
];

export default function SavedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-xl font-bold text-[#121716] dark:text-white">
          Saved Recipes
        </Text>
      </View>
      <ScrollView className="flex-1">
        <View className="flex-row flex-wrap bg-white dark:bg-background-dark">
          {SAVED_ITEMS.map((item) => (
            <View
              key={item.id}
              className="relative aspect-square w-1/3 p-[1px]"
            >
              <Image source={{ uri: item.image }} className="h-full w-full" />
              <View className="absolute bottom-1 right-1 z-10 flex-row items-center gap-1">
                <MaterialIcons name="favorite" size={12} color="white" />
                <Text className="text-[10px] font-bold text-white">
                  {item.likes}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
