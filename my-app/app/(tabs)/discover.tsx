import { MaterialIcons } from "@expo/vector-icons";
import { Link, router, Href } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data
const CATEGORIES = [
  { id: 1, name: "All", icon: "restaurant-menu", active: true },
  { id: 2, name: "Asian", icon: "ramen-dining", active: false },
  { id: 3, name: "Vegan", icon: "eco", active: false },
  { id: 4, name: "Quick", icon: "timer", active: false },
];

const TRENDING_RECIPES = [
  {
    id: 1,
    title: "Spicy Miso Ramen",
    chef: "Chef Sarah",
    time: "15 mins",
    level: "Beginner Friendly",
    rating: 4.8,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRMfoec0Pm0cAemNw4Af1dDioOhmWH5VjGt5h2enP_u3PO4U7__KwprSHyWhS_52ismBYKl9uQ8k58VZ_AWNIVMSrJGUzDRb1n1rGSOaZKPq4g7iN-C16d14PQlv4ob55568ms9gQuK30p3qJ8R8eytBR-nDNEf17vm8ISwTQeGC-M9hpKEJnetP_zHqO0Pka7Kf4iFBcqKojqa0m2YrqOuhtJo_YNfi0hGeOwZyQBJM3qI-E9xX1yZkWoempEYWbtQciSV5OIkyPV",
    chefImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZIipZOfYOdAOlOqlHZc86BSQ3AGBKIUErFxgbdXoXLVvka4Pvqmbb01HoO5WOebCv8ZnJsUn1-Mm8HM9UcUU9YvuORO5czZOh2QV86Uzl4mVClERWdYQGcc_N34NOU8u_kQnMHeLt7WeS5jfKqqGClWQMjSTvgDAURxmG0GoRdp84ANpMeGCoK0K-wZ1q4qh6GhTUUU3H25LvKn6-x7l-BLAj9x-R_M1a4t0h_2SHBQh7KfVXa0AEFozx7CdexVr8HDeCdo6YtQrT",
  },
  {
    id: 2,
    title: "Lemongrass Grilled Chicken",
    chef: "Chef Minh",
    time: "30 mins",
    level: "Intermediate",
    rating: 4.9,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdQzaEEq-JSHh8oDbrmpzytc22uCkzeE07lxukLCZfccanpdrenujvoKADkkwuVlGDgECJkgaZ1M_cPXCRjvsjYJWHlo_GRZkzMzAqB12lR5TD2AG8hSjzwlf7g-5tmaJuPV7wnlmdCe8QTETbWq74LVcE2jOLYopgwZajtADQJRsaJI-Z-08xjnTcCZfSHnyiBSqfHq74ztF-vTlmr5ZCSGQLGvIauZN7vnc7nE_tAPHnZl1pNSt1bKqAxMM55S8Dak5UAe2_g8E1",
    chefImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3hRXFbwAP1gdSix4mLLTd3eESs4whiUmuLSRt8x7GVRLJnEMmB6kkENmM2b3XQVCkaTVWqo-EWW4391oO17ZG5GP9o0cWI48epIsmlN0K53eYWmCDm6nQr-1QAUeRVHyi1h_wtIBFI-uS3Cw7fBsvqLTDjgi4GALGExai4bD_abBisujD1n2qZOQmjsNWw8UccP1Pj7ZSI8DMQbV4ljbQAs217O_ruR_zLuZ9OwNT0B5BDL0HJnTe0DZM5WhY3gkPPA2B_QuReO3W",
  },
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/10">
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaZEligGezWLNYBkgXuZ3_G7BAI93c9ddjzJ0Fn2LoiPdFxXdKcSEYfY3Z6nN4eiz0GA0RMc6IxiXvRxUTFYa1m58Zyu3pRqv8VRJXjqiu8QaGQ54l1AtovAOWVF763j3yklN2MTQnfk0ZHlvrxxpUhcyrG8eWUdPk8D7tU7ixYtynFSDN4ZYG0eT9XVv3FhtCCJFKPU9AEBxX_mbdZUsT1MYQ-DwYUJf7vjL9zv_RPD-D0fWuoctD4TP2G1tPSaFHzXYYBJBASWv-",
                }}
                className="h-full w-full bg-gray-200"
              />
            </View>
            <View>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-[#67837f]">
                Welcome back
              </Text>
              <Text className="font-display text-lg font-bold leading-tight text-[#121716] dark:text-white">
                Chef Alex
              </Text>
            </View>
          </View>
          <TouchableOpacity className="flex items-center justify-center rounded-full border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <MaterialIcons name="notifications-none" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3">
          <View className="flex-row items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <MaterialIcons name="search" size={24} color="#67837f" />
            <TextInput
              placeholder="Find recipes or ingredients"
              placeholderTextColor="#67837f"
              className="ml-2 flex-1 font-medium text-[#121716] dark:text-white"
            />
          </View>
        </View>

        {/* Categories */}
        <View className="mt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`flex-row items-center justify-center gap-2 rounded-xl px-4 py-2 ${cat.active
                  ? "bg-primary shadow-sm shadow-primary/20"
                  : "border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
                  }`}
              >
                <MaterialIcons
                  name={cat.icon as any}
                  size={18}
                  color={cat.active ? "white" : "#29a38f"}
                />
                <Text
                  className={`text-xs font-bold uppercase tracking-wider ${cat.active
                    ? "text-white"
                    : "text-[#121716] dark:text-gray-200"
                    }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section Header */}
        <View className="mt-6 flex-row items-center justify-between px-4">
          <Text className="text-xl font-extrabold text-[#121716] dark:text-white">
            Trending Today
          </Text>
          <TouchableOpacity>
            <Text className="text-xs font-bold uppercase tracking-widest text-primary">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Carousel */}
        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          >
            {TRENDING_RECIPES.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                className="h-[320px] w-[260px] flex-col justify-end overflow-hidden rounded-2xl bg-gray-200 shadow-lg"
                activeOpacity={0.9}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Image
                  source={{ uri: recipe.image }}
                  className="absolute inset-0 h-full w-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <View className="absolute left-4 top-4 flex-row items-center gap-1 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-md">
                  <MaterialIcons name="star" size={12} color="#F59E0B" />
                  <Text className="text-[10px] font-bold text-primary">
                    {recipe.rating}
                  </Text>
                </View>

                <View className="p-5">
                  {/* Chef Info - Clickable */}
                  <TouchableOpacity 
                    className="mb-2 flex-row items-center gap-2 self-start"
                    onPress={(e) => {
                      e.stopPropagation(); 
                      router.push(`/user/${recipe.id}` as Href);
                    }}
                  >
                    <View className="h-6 w-6 overflow-hidden rounded-full border border-white/40">
                      <Image
                        source={{ uri: recipe.chefImage }}
                        className="h-full w-full"
                      />
                    </View>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                      {recipe.chef}
                    </Text>
                  </TouchableOpacity>

                  <Text className="mb-1 text-xl font-bold leading-tight text-white">
                    {recipe.title}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color="rgba(255,255,255,0.7)"
                    />
                    <Text className="text-xs font-medium text-white/70">
                      {recipe.time} • {recipe.level}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Feature Prompt */}
        <View className="mt-8 px-4 pb-12">
          <View className="relative overflow-hidden rounded-2xl bg-primary p-6 shadow-xl shadow-primary/20">
            <View className="absolute right-0 top-0 p-4 opacity-20">
              <MaterialIcons name="auto-awesome" size={120} color="white" />
            </View>
            <View className="relative z-10">
              <Text className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/80">
                Cook with AI
              </Text>
              <Text className="mb-4 text-xl font-bold leading-tight text-white">
                What&apos;s in your fridge?
              </Text>
              <Text className="mb-6 max-w-[200px] text-sm font-medium text-white/90">
                Let our AI create a bespoke recipe from your leftovers.
              </Text>
              <Link href="/(tabs)/scanner" asChild>
                <TouchableOpacity className="w-auto self-start rounded-xl bg-white px-6 py-3 shadow-lg">
                  <Text className="text-sm font-bold text-primary">
                    Start AI Sous-Chef
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
