import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ScannerScreen() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Camera Feed Simulation */}
      <View className="relative flex-1 w-full bg-black overflow-hidden">
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc2C7sxpPAGbEPOuEoYLD3omneIctUb6g82UUuaMO6nUOpP1fjrRDSwTG8jtTbinOgy8M4mAKLnDH9XAJEGs2447aiyg6U-t5SCOZW7CxYkaw00ur3mcu-zFvZbbBT-c6DxXdHG5pQTVwLQNd_kdtn3eFSDqS96CJ8PjIThRmlrl7Pg9hm1J1HEjcBFmDy5JdunKkbOiv6_lfH591-3dyDWqnPVUKNNgwsB2chuwqjmxArlG4OSzmthIgS2KD5mGbABBHXA7GgSUZZ",
          }}
          className="absolute inset-0 h-full w-full opacity-80"
          resizeMode="cover"
        />

        {/* Top Bar */}
        <View className="absolute top-0 left-0 w-full flex-row items-center justify-between px-6 pb-6 pt-12 z-20">
          <TouchableOpacity
            className="rounded-full bg-white/10 p-2 border border-white/20 backdrop-blur-md"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 border border-white/20 backdrop-blur-md">
            <View className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <Text className="text-sm font-medium tracking-wide text-white">
              AI SCANNING
            </Text>
          </View>

          <TouchableOpacity className="rounded-full bg-white/10 p-2 border border-white/20 backdrop-blur-md">
            <MaterialIcons name="flash-on" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bounding Boxes */}
        <View className="absolute inset-0 z-10 p-0 pointer-events-none">
          {/* Tomato */}
          <View className="absolute top-[25%] left-[20%] h-32 w-32 rounded-xl border-2 border-primary/60">
            <View className="absolute -top-10 left-0 flex-row items-center gap-2 rounded-lg bg-white/15 px-3 py-1 backdrop-blur-md">
              <Text className="text-xs font-bold uppercase tracking-tighter text-white">
                Organic Tomato
              </Text>
              <Text className="text-[10px] font-extrabold text-primary">
                98%
              </Text>
            </View>
            {/* Corners */}
            <View className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-primary" />
            <View className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-primary" />
          </View>

          {/* Onion */}
          <View className="absolute top-[45%] right-[15%] h-28 w-28 rounded-xl border-2 border-white/40">
            <View className="absolute -top-10 left-0 flex-row items-center gap-2 rounded-lg bg-white/15 px-3 py-1 backdrop-blur-md">
              <Text className="text-xs font-bold uppercase tracking-tighter text-white">
                Red Onion
              </Text>
              <Text className="text-[10px] font-extrabold text-white/70">
                84%
              </Text>
            </View>
            <View className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-white/40" />
            <View className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-white/40" />
          </View>

          {/* Bell Pepper */}
          <View className="absolute top-[60%] left-[40%] h-36 w-36 rounded-xl border-2 border-primary/60">
            <View className="absolute -top-10 left-0 flex-row items-center gap-2 rounded-lg bg-white/15 px-3 py-1 backdrop-blur-md">
              <Text className="text-xs font-bold uppercase tracking-tighter text-white">
                Bell Pepper
              </Text>
              <Text className="text-[10px] font-extrabold text-primary">
                91%
              </Text>
            </View>
            <View className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-primary" />
            <View className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-primary" />
          </View>
        </View>

        {/* Scanning Line */}
        <View className="absolute left-0 top-1/2 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(41,163,143,1)] z-10 opacity-50" />

        {/* Right Controls */}
        <View className="absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-20">
          <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20">
            <MaterialIcons name="image" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20">
            <MaterialIcons name="sync" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="relative z-30 max-h-[45%] flex-col rounded-t-[32px] bg-background-light shadow-2xl dark:bg-background-dark">
        <View className="items-center justify-center pt-3 pb-2">
          <View className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
        </View>

        <View className="flex-row items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <View>
            <Text className="text-xl font-extrabold leading-tight text-[#121716] dark:text-white">
              Detected Ingredients
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              3 items found in your kitchen
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-sm font-bold tracking-wide text-primary">
              ADD NEW
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-2 py-2">
          {[
            { name: "Organic Tomato", count: "2 Units detected" },
            { name: "Red Onion", count: "1 Unit detected" },
            { name: "Bell Pepper", count: "1 Unit detected" },
          ].map((item, index) => (
            <View
              key={index}
              className="flex-row items-center gap-4 rounded-xl px-4 py-3 active:bg-black/5 dark:active:bg-white/5"
            >
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <MaterialIcons name="check-circle" size={24} color="#29a38f" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-[#121716] dark:text-white">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500">{item.count}</Text>
              </View>
              <TouchableOpacity className="p-2">
                <MaterialIcons name="delete" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View className="p-6 pt-2">
          <TouchableOpacity className="w-full flex-row items-center justify-center gap-3 rounded-2xl bg-primary py-4 shadow-lg shadow-primary/20">
            <MaterialIcons name="restaurant-menu" size={24} color="white" />
            <Text className="font-bold text-white">FIND RECIPES</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
