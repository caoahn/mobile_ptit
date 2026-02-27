import { MaterialIcons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data for search results
const KET_QUA_TIM_KIEM = [
  {
    id: 1,
    title: "Phở Bò Gia Truyền Hà Nội",
    author: "Bếp Của Mẹ",
    time: "45 phút",
    likes: 1250,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5RHy1N62_BKr4TXQcqHZdFFa-3nT_zJobJ57Xhlwqv-eDYjhATyaCR5TAJ59P0LQSrlnKbLZ_uCGqfpe7zxK8avGvIL_-8cgE6lxbdDmxBM6DDHF2aItZt9-apt5veDpuMNmkYqofOKaj53afopf7Y9NxrYmO5nZ4OqiWAU0aFvJE-yPWsX7cowYp42nBm9-Q2afT_jae2z_6faB3O02EPYu7uNVEQDWtj1F7MqRBoHpamziL2qvd6WEHV3l1_0tnnH5OYdbEoTIo",
  },
  {
    id: 2,
    title: "Bún Bò Huế Chuẩn Vị",
    author: "Chef Dũng",
    time: "60 phút",
    likes: 890,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQyY8NCshzqrVTD43lC82JUU-rrTgMLypzoihU6b_fDA6Q90GXkBYK-C5EELUX_EUGVJ7DR0JT9Kp11ef4Eh3S4sBI10VNAAKxFBFDKF7lpP-_yEW_ku0e-JFnsPTjMn7lFgRNT2yfR6WBXwpY6KKz5ed7lCuMT05FzZKehVsDVzuSYDy8yC0Hs3mDXeHnmJzgn8kkAGPtnwi4I2h4USTWLgm7i3rZ6eEPzqwQbyoTBaz0QK65pL1DqziRmbIPOVyQ5iq8xhMxZeni",
  },
  {
    id: 3,
    title: "Cơm Tấm Sườn Bì Chả",
    author: "Tiệm Cơm 1990",
    time: "30 phút",
    likes: 540,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDswO-I2lqN2i-MPFCKyUFsMi_Oxy1KiTQ99wL6nsjeSuPea_4jHrfn19YWl5hncjyV_iZGQAAvWDKMLIXd_go4zjPIi_DmyrjZt7CsIu6xduS06d9pWGdRszgexjcqwmu7_dQjBDvwSTLogCSFws1pJ7aH85ej4H1EjwD2G1hQ8wqwOdmkwLP9Ou5guFVlSLlUU_wqe-B-2Yl0BQ4pKrcOlR3NrCztLozD-yHk05oCAp9J8vBCFt23nuMrPW_UzusQ3rLrMcCQzoYk",
  },
];

export default function FilterResultsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#121716" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Kết quả lọc
        </Text>
        <TouchableOpacity onPress={() => router.push('/filter' as Href)}>
          <MaterialIcons name="tune" size={24} color="#121716" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            Tìm thấy {KET_QUA_TIM_KIEM.length} công thức
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Text className="text-sm font-medium text-gray-500">Sắp xếp</Text>
            <MaterialIcons name="swap-vert" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Results List */}
        {KET_QUA_TIM_KIEM.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="flex-row mb-4 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <Image
              source={{ uri: item.image }}
              className="w-28 h-28"
              resizeMode="cover"
            />
            <View className="flex-1 p-3 justify-between">
              <View>
                <Text className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  {item.author}
                </Text>
                <Text className="text-base font-bold text-gray-900 leading-tight dark:text-white" numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="schedule" size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-500">{item.time}</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-red-50 px-2 py-1 rounded-full dark:bg-red-900/30">
                  <MaterialIcons name="favorite" size={12} color="#ef4444" />
                  <Text className="text-xs font-bold text-red-500 dark:text-red-400">{item.likes}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}