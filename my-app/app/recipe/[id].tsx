import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="relative flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Header Image & Top Nav Overlay */}
      <View className="relative h-[450px] w-full">
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRbI2rcuZebKcWgWAKkQYBTPmdNs8IAzUBWC-IazgWUefOUz3mAJeIcPovnGG-2hEzMEAhsQyQD44s_M5QHoXeKedlMPBl5B2-mQkLRdcKzQ7VTh7bV5HTc1oaxcxv72UWpmYkB6ln4VwanNKu0ySX0u2k24Kf23Rb8UORBH3umiIAsRqernUkpiGsPyeDRan4sMHw5ly9q40ldA3ERDcLPrViJpRSHpS5twrPIJk0MCzisLgd8IbKQ9Sgv4ZEI6oFpVEUEOaF8tD1",
          }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
        />
        {/* Scrim */}
        <View className="absolute inset-0 h-24 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top App Bar Overlay */}
        <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between p-4 pt-12">
          <TouchableOpacity
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-md"
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={18}
              color="white"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
              <MaterialIcons name="share" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
              <MaterialIcons name="favorite" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 -mt-16 rounded-t-3xl bg-transparent"
        showsVerticalScrollIndicator={false}
      >
        {/* Floating Content Card */}
        <View className="px-4 pb-24">
          <View className="mb-6 rounded-xl bg-white p-6 shadow-xl dark:bg-[#1c2126]">
            <View className="mb-4 flex-row items-start justify-between">
              <View>
                <View className="mb-1 flex-row items-center gap-2">
                  <View className="rounded bg-primary/10 px-2 py-0.5">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      AI Optimized
                    </Text>
                  </View>
                </View>
                <Text className="text-2xl font-bold leading-tight tracking-tight text-[#121716] dark:text-white">
                  Miso-Glazed Atlantic Salmon & Spring Greens
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row items-center justify-between border-y border-gray-100 py-4 dark:border-gray-800">
              <View className="flex-col items-center gap-1">
                <MaterialIcons name="schedule" size={20} color="#29a38f" />
                <Text className="text-[10px] uppercase font-bold text-gray-400">
                  Time
                </Text>
                <Text className="text-sm font-bold text-[#121716] dark:text-white">
                  25 min
                </Text>
              </View>
              <View className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
              <View className="flex-col items-center gap-1">
                <MaterialIcons name="restaurant" size={20} color="#29a38f" />
                <Text className="text-[10px] uppercase font-bold text-gray-400">
                  Servings
                </Text>
                <Text className="text-sm font-bold text-[#121716] dark:text-white">
                  2 portions
                </Text>
              </View>
              <View className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
              <View className="flex-col items-center gap-1">
                <MaterialIcons name="bar-chart" size={20} color="#29a38f" />
                <Text className="text-[10px] uppercase font-bold text-gray-400">
                  Level
                </Text>
                <Text className="text-sm font-bold text-[#121716] dark:text-white">
                  Medium
                </Text>
              </View>
            </View>

            {/* AI Insight */}
            <View className="mt-4 flex-row items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
              <MaterialIcons name="auto-awesome" size={20} color="#29a38f" />
              <Text className="flex-1 text-xs font-medium leading-tight text-primary">
                Our AI recommends adding 10g of toasted sesame seeds to increase
                healthy fats by 12%.
              </Text>
            </View>
          </View>

          {/* Tabs Component - Sticky in real implementation, but scrolling here */}
          <View className="z-10 -mx-4 mb-6 bg-background-light/80 px-4 backdrop-blur-md dark:bg-background-dark/80">
            <View className="flex-row border-b border-gray-200 dark:border-gray-800">
              <TouchableOpacity className="flex-1 border-b-2 border-primary py-4">
                <Text className="text-center text-sm font-bold text-primary">
                  Ingredients
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 border-b-2 border-transparent py-4">
                <Text className="text-center text-sm font-bold text-gray-400">
                  Instructions
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ingredients List */}
          <View className="space-y-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-[#121716] dark:text-white">
                Main Ingredients
              </Text>
              <TouchableOpacity className="flex-row items-center gap-1">
                <MaterialIcons name="bolt" size={14} color="#29a38f" />
                <Text className="text-xs font-bold text-primary">
                  Smart Substitutions
                </Text>
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {[
                {
                  name: "2 Atlantic Salmon Fillets",
                  detail: "Approx. 150g each",
                },
                {
                  name: "2 tbsp White Miso Paste",
                  detail: "Low sodium preferred",
                },
                { name: "1 Bunch Asparagus", detail: "Trimmed ends" },
                { name: "1 tbsp Honey", detail: "Or agave syrup" },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#1c2126]"
                >
                  <View className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600" />
                  <View>
                    <Text className="text-sm font-bold text-[#121716] dark:text-white">
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500">{item.detail}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View className="h-10" />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 border-t border-gray-100 backdrop-blur-xl dark:bg-[#1c2126]/80 dark:border-gray-800">
        <TouchableOpacity className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4 shadow-lg shadow-primary/20 active:scale-[0.98]">
          <MaterialIcons name="play-circle-fill" size={24} color="white" />
          <Text className="font-bold text-white">Start Cooking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
