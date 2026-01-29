import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateRecipeScreen() {
  const [tags, setTags] = useState(["Dinner", "Healthy"]);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between border-b border-[#dde4e3]/30 bg-background-light/80 px-4 py-4 backdrop-blur-md dark:border-white/10 dark:bg-background-dark/80">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <MaterialIcons name="close" size={24} color="#67837f" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-display text-lg font-extrabold leading-tight tracking-tight text-[#121716] dark:text-white">
          Create New Recipe
        </Text>
        <View className="flex w-10 items-center justify-end">
          <TouchableOpacity>
            <Text className="text-sm font-bold tracking-tight text-primary">
              Drafts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 pb-32">
        {/* Progress Indicator */}
        <View className="flex-col gap-3 p-6">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-2xl font-extrabold tracking-tight text-[#121716] dark:text-white">
                Basic Info
              </Text>
              <Text className="text-sm font-medium text-[#67837f] dark:text-gray-400">
                Step 1 of 3
              </Text>
            </View>
            <View className="flex-row gap-1">
              <View className="h-1.5 w-8 rounded-full bg-primary" />
              <View className="h-1.5 w-8 rounded-full bg-[#dde4e3] dark:bg-gray-700" />
              <View className="h-1.5 w-8 rounded-full bg-[#dde4e3] dark:bg-gray-700" />
            </View>
          </View>
        </View>

        {/* Image Upload Area */}
        <View className="px-6 pb-6">
          <TouchableOpacity className="group relative flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#dde4e3] bg-white transition-all hover:border-primary/50 dark:border-gray-700 dark:bg-[#2c333a]">
            {/* Abstract placeholder background texture */}
            <View
              className="absolute inset-0 -z-10 bg-[radial-gradient(#29a38f_1px,transparent_1px)] opacity-5 [background-size:16px_16px]"
              pointerEvents="none"
            />

            <View className="flex-col items-center gap-2 text-center">
              <View className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcons name="add-a-photo" size={30} color="#29a38f" />
              </View>
              <View className="px-8 items-center">
                <Text className="text-base font-bold text-[#121716] dark:text-white">
                  Add a cover photo
                </Text>
                <Text className="mt-1 text-xs text-[#67837f] dark:text-gray-400">
                  Show off the final result of your dish
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="flex-col gap-6 px-6">
          {/* Recipe Name */}
          <View className="flex-col gap-2">
            <Text className="ml-1 text-sm font-bold text-[#121716] dark:text-gray-200">
              Recipe Name
            </Text>
            <TextInput
              className="w-full rounded-xl bg-white p-4 text-lg font-bold shadow-sm transition-shadow focus:ring-2 focus:ring-primary/20 dark:bg-[#2c333a] dark:text-white"
              placeholder="e.g. Miso Glazed Salmon"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Description with AI Assist */}
          <View className="flex-col gap-2">
            <View className="flex-row items-center justify-between ml-1">
              <Text className="text-sm font-bold text-[#121716] dark:text-gray-200">
                Short Description
              </Text>
              <TouchableOpacity className="flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 transition-colors hover:bg-primary/20">
                <MaterialIcons name="auto-awesome" size={14} color="#29a38f" />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  AI Assist
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              multiline
              className="min-h-[140px] w-full rounded-xl bg-white p-4 text-base leading-relaxed shadow-sm transition-shadow focus:ring-2 focus:ring-primary/20 dark:bg-[#2c333a] dark:text-white"
              placeholder="Tell the story of your dish, the heritage, or why it's a family favorite..."
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
          </View>

          {/* Category Tags */}
          <View className="flex-col gap-3">
            <Text className="ml-1 text-sm font-bold text-[#121716] dark:text-gray-200">
              Category Tags
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag, index) => (
                <View
                  key={index}
                  className={`flex-row items-center gap-1 rounded-full px-4 py-2 ${index === 0 ? "bg-primary shadow-md shadow-primary/20" : "bg-white border border-[#dde4e3] dark:bg-[#2c333a] dark:border-gray-700"}`}
                >
                  <Text
                    className={`text-sm font-bold ${index === 0 ? "text-white" : "text-[#121716] dark:text-gray-300"}`}
                  >
                    {tag}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTags(tags.filter((_, i) => i !== index))}
                  >
                    <MaterialIcons
                      name="close"
                      size={14}
                      color={index === 0 ? "white" : "gray"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity className="flex-row items-center gap-1 rounded-full border-2 border-dashed border-[#dde4e3] px-3 py-1.5 hover:border-primary transition-all dark:border-gray-700">
                <MaterialIcons name="add" size={14} color="#67837f" />
                <Text className="text-sm font-medium text-[#67837f]">
                  Add Tag
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 z-50 bg-background-light/80 border-t border-[#dde4e3]/30 px-6 py-5 backdrop-blur-xl dark:bg-background-dark/80 dark:border-white/10">
        <View className="mx-auto flex w-full max-w-md gap-4">
          <TouchableOpacity className="flex-1 rounded-xl bg-primary py-4 shadow-lg shadow-primary/30 transition-transform active:scale-95">
            <Text className="text-center text-base font-extrabold text-white">
              Next: Ingredients
            </Text>
          </TouchableOpacity>
        </View>
        {/* iOS Home Indicator Spacing */}
        <View className="h-6" />
      </View>

      {/* Background Decorative Elements */}
      <View
        className="absolute -left-20 top-20 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[100px]"
        pointerEvents="none"
      />
      <View
        className="absolute -right-20 bottom-20 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[100px]"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}
