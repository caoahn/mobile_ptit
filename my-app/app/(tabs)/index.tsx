import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
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

// Mock Data for Feed
const FEED_ITEMS = [
  {
    id: 1,
    chef: "chef_sarah",
    location: "Paris, France",
    chefImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZIipZOfYOdAOlOqlHZc86BSQ3AGBKIUErFxgbdXoXLVvka4Pvqmbb01HoO5WOebCv8ZnJsUn1-Mm8HM9UcUU9YvuORO5czZOh2QV86Uzl4mVClERWdYQGcc_N34NOU8u_kQnMHeLt7WeS5jfKqqGClWQMjSTvgDAURxmG0GoRdp84ANpMeGCoK0K-wZ1q4qh6GhTUUU3H25LvKn6-x7l-BLAj9x-R_M1a4t0h_2SHBQh7KfVXa0AEFozx7CdexVr8HDeCdo6YtQrT",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRMfoec0Pm0cAemNw4Af1dDioOhmWH5VjGt5h2enP_u3PO4U7__KwprSHyWhS_52ismBYKl9uQ8k58VZ_AWNIVMSrJGUzDRb1n1rGSOaZKPq4g7iN-C16d14PQlv4ob55568ms9gQuK30p3qJ8R8eytBR-nDNEf17vm8ISwTQeGC-M9hpKEJnetP_zHqO0Pka7Kf4iFBcqKojqa0m2YrqOuhtJo_YNfi0hGeOwZyQBJM3qI-E9xX1yZkWoempEYWbtQciSV5OIkyPV",
    time: "15 MINS",
    title: "Spicy Miso Ramen",
    description:
      "Creamy tonkotsu base with a secret spicy miso paste. Perfect for rainy days! 🍜✨",
    tags: ["#ramen", "#homemadenoodles", "#chefselection"],
    likes: "1,248",
  },
  {
    id: 2,
    chef: "chef_minh",
    location: "Hanoi, Vietnam",
    chefImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3hRXFbwAP1gdSix4mLLTd3eESs4whiUmuLSRt8x7GVRLJnEMmB6kkENmM2b3XQVCkaTVWqo-EWW4391oO17ZG5GP9o0cWI48epIsmlN0K53eYWmCDm6nQr-1QAUeRVHyi1h_wtIBFI-uS3Cw7fBsvqLTDjgi4GALGExai4bD_abBisujD1n2qZOQmjsNWw8UccP1Pj7ZSI8DMQbV4ljbQAs217O_ruR_zLuZ9OwNT0B5BDL0HJnTe0DZM5WhY3gkPPA2B_QuReO3W",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdQzaEEq-JSHh8oDbrmpzytc22uCkzeE07lxukLCZfccanpdrenujvoKADkkwuVlGDgECJkgaZ1M_cPXCRjvsjYJWHlo_GRZkzMzAqB12lR5TD2AG8hSjzwlf7g-5tmaJuPV7wnlmdCe8QTETbWq74LVcE2jOLYopgwZajtADQJRsaJI-Z-08xjnTcCZfSHnyiBSqfHq74ztF-vTlmr5ZCSGQLGvIauZN7vnc7nE_tAPHnZl1pNSt1bKqAxMM55S8Dak5UAe2_g8E1",
    time: "30 MINS",
    title: "Lemongrass Grilled Chicken",
    description:
      "Marinated for 12 hours in fresh lemongrass and ginger. Smokey and aromatic skewers. 🍢🔥",
    tags: ["#grillmaster", "#vietnamesefood"],
    likes: "892",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-black/95">
        <Text className="text-xl font-extrabold tracking-tight text-primary">
          DishGram
        </Text>
        <View className="flex-row items-center gap-4">
          <Link href="/create" asChild>
            <TouchableOpacity>
              <MaterialIcons name="add-box" size={26} color="black" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity className="relative">
            <MaterialIcons name="notifications" size={26} color="black" />
            <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stories / Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-gray-100 py-4 dark:border-gray-900"
        >
          <View className="flex-row gap-4 px-4">
            {/* Story 1 */}
            <View className="items-center gap-1">
              <View className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                <View className="h-full w-full overflow-hidden rounded-full border-2 border-white bg-gray-200 dark:border-black">
                  <Image
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaZEligGezWLNYBkgXuZ3_G7BAI93c9ddjzJ0Fn2LoiPdFxXdKcSEYfY3Z6nN4eiz0GA0RMc6IxiXvRxUTFYa1m58Zyu3pRqv8VRJXjqiu8QaGQ54l1AtovAOWVF763j3yklN2MTQnfk0ZHlvrxxpUhcyrG8eWUdPk8D7tU7ixYtynFSDN4ZYG0eT9XVv3FhtCCJFKPU9AEBxX_mbdZUsT1MYQ-DwYUJf7vjL9zv_RPD-D0fWuoctD4TP2G1tPSaFHzXYYBJBASWv-",
                    }}
                    className="h-full w-full"
                  />
                </View>
              </View>
              <Text className="text-[10px] font-medium text-gray-500">
                Your Story
              </Text>
            </View>
            {/* Category Circle */}
            <View className="items-center gap-1">
              <View className="h-16 w-16 justify-center items-center rounded-full border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-800 dark:bg-gray-800">
                <MaterialIcons name="ramen-dining" size={24} color="#29a38f" />
              </View>
              <Text className="text-[10px] font-medium text-gray-500">
                Asian
              </Text>
            </View>
            {/* Category Circle */}
            <View className="items-center gap-1">
              <View className="h-16 w-16 justify-center items-center rounded-full border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-800 dark:bg-gray-800">
                <MaterialIcons name="eco" size={24} color="#29a38f" />
              </View>
              <Text className="text-[10px] font-medium text-gray-500">
                Vegan
              </Text>
            </View>
            {/* Category Circle */}
            <View className="items-center gap-1">
              <View className="h-16 w-16 justify-center items-center rounded-full border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-800 dark:bg-gray-800">
                <MaterialIcons name="timer" size={24} color="#29a38f" />
              </View>
              <Text className="text-[10px] font-medium text-gray-500">
                Quick
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Feed Posts */}
        {FEED_ITEMS.map((item) => (
          <View key={item.id} className="flex-col">
            {/* Post Header */}
            <View className="flex-row items-center justify-between px-3 py-3">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    source={{ uri: item.chefImage }}
                    className="h-full w-full"
                  />
                </View>
                <View>
                  <Text className="text-xs font-bold">{item.chef}</Text>
                  <Text className="text-[10px] text-gray-500">
                    {item.location}
                  </Text>
                </View>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="more-horiz" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Post Image */}
            <View className="relative aspect-[4/5] w-full bg-gray-100">
              <Image
                source={{ uri: item.image }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute right-4 top-4 rounded bg-black/40 px-2 py-1 backdrop-blur-md">
                <Text className="text-[10px] font-bold text-white">
                  {item.time}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row items-center justify-between px-3 pb-2 pt-3">
              <View className="flex-row items-center gap-4">
                <TouchableOpacity>
                  <MaterialIcons
                    name="favorite-border"
                    size={28}
                    color="black"
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MaterialIcons name="mode-comment" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MaterialIcons name="send" size={28} color="black" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="bookmark-border" size={28} color="black" />
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <View className="border-b border-gray-50 px-3 pb-6 dark:border-gray-900">
              <Text className="mb-1 text-xs font-bold">{item.likes} likes</Text>
              <Text className="text-sm leading-relaxed">
                <Text className="mr-2 font-bold">{item.title}</Text>{" "}
                <Text>{item.description}</Text>
              </Text>
              <View className="mt-1 flex-row flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Text
                    key={tag}
                    className="text-sm text-blue-600 dark:text-blue-400"
                  >
                    {tag}
                  </Text>
                ))}
              </View>
              <Link href={`/recipe/${item.id}`} asChild>
                <TouchableOpacity className="mt-3 w-full rounded-lg border border-gray-100 bg-gray-50 py-2.5 dark:border-gray-800 dark:bg-gray-900">
                  <Text className="text-center text-xs font-bold uppercase tracking-widest text-primary">
                    View Full Recipe
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
