import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
}

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink"];

export default function CreateScreen() {
  // State
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", title: "", description: "" },
  ]);
  const [tips, setTips] = useState("");

  // Handlers
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", amount: "", unit: "" },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((item) => item.id !== id));
    }
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(
      ingredients.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { id: Date.now().toString(), title: "", description: "" },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((item) => item.id !== id));
    }
  };

  const handleStepChange = (id: string, field: keyof Step, value: string) => {
    setSteps(
      steps.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handlePickImage = () => {
    // In a real app, use expo-image-picker here
    Alert.alert("Upload Image", "This would open the image picker in a real device.");
    setImage("https://lh3.googleusercontent.com/aida-public/AB6AXuDRMfoec0Pm0cAemNw4Af1dDioOhmWH5VjGt5h2enP_u3PO4U7__KwprSHyWhS_52ismBYKl9uQ8k58VZ_AWNIVMSrJGUzDRb1n1rGSOaZKPq4g7iN-C16d14PQlv4ob55568ms9gQuK30p3qJ8R8eytBR-nDNEf17vm8ISwTQeGC-M9hpKEJnetP_zHqO0Pka7Kf4iFBcqKojqa0m2YrqOuhtJo_YNfi0hGeOwZyQBJM3qI-E9xX1yZkWoempEYWbtQciSV5OIkyPV"); // Mock image
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Create Recipe
        </Text>
        <TouchableOpacity>
          <Text className="text-sm font-bold text-primary">Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

          {/* 1. Recipe Images */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              recipe photos
            </Text>
            <TouchableOpacity
              onPress={handlePickImage}
              className="h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              {image ? (
                <View className="h-full w-full overflow-hidden rounded-2xl relative">
                  <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
                  <View className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                    <MaterialIcons name="edit" size={16} color="white" />
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <MaterialIcons name="add-a-photo" size={32} color="#9ca3af" />
                  <Text className="mt-2 text-sm font-medium text-gray-400">
                    Add Cover Photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 2. Basic Info */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Basic Info
            </Text>
            <View className="space-y-4">
              <View>
                <Text className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Name</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Spicy Miso Ramen"
                  className="rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </View>

              <View>
                <Text className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      className={`rounded-full px-4 py-2 border ${selectedCategory === cat
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                        }`}
                    >
                      <Text className={`text-xs font-bold ${selectedCategory === cat ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* 3. Ingredients */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Ingredients
              </Text>
              <Text className="text-[10px] text-gray-400">{ingredients.length} items</Text>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              {ingredients.map((item, index) => (
                <View key={item.id} className={`flex-row gap-2 ${index !== 0 ? "mt-4 border-t border-gray-100 pt-4 dark:border-gray-700" : ""}`}>
                  <View className="flex-1">
                    <TextInput
                      placeholder="Item name"
                      value={item.name}
                      onChangeText={(v) => handleIngredientChange(item.id, "name", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </View>
                  <View className="w-20">
                    <TextInput
                      placeholder="Qty"
                      value={item.amount}
                      onChangeText={(v) => handleIngredientChange(item.id, "amount", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </View>
                  <View className="w-20">
                    <TextInput
                      placeholder="Unit"
                      value={item.unit}
                      onChangeText={(v) => handleIngredientChange(item.id, "unit", v)}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    />
                  </View>
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveIngredient(item.id)} className="items-center justify-center px-1">
                      <MaterialIcons name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={handleAddIngredient} className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 dark:bg-gray-700">
                <MaterialIcons name="add" size={20} color="#29a38f" />
                <Text className="text-sm font-bold text-primary">Add Ingredient</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Steps */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Instructions
              </Text>
              <Text className="text-[10px] text-gray-400">{steps.length} steps</Text>
            </View>

            <View className="space-y-4">
              {steps.map((step, index) => (
                <View key={step.id} className="relative rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                  <View className="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-4 ring-gray-50 dark:ring-black">
                    <Text className="text-xs font-bold text-white">{index + 1}</Text>
                  </View>

                  <View className="ml-2">
                    <View className="mb-2 flex-row justify-between">
                      <TextInput
                        placeholder="Step Title (e.g. Prepare Veggies)"
                        value={step.title}
                        onChangeText={(v) => handleStepChange(step.id, "title", v)}
                        className="flex-1 font-bold text-gray-900 dark:text-white"
                      />
                      {steps.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveStep(step.id)}>
                          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      placeholder="Describe this step in detail..."
                      value={step.description}
                      onChangeText={(v) => handleStepChange(step.id, "description", v)}
                      multiline
                      className="min-h-[60px] text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                    />
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleAddStep} className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-4">
              <MaterialIcons name="add-circle-outline" size={24} color="#29a38f" />
              <Text className="text-sm font-bold text-primary">Add Next Step</Text>
            </TouchableOpacity>
          </View>

          {/* 5. Tips/Notes */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Chef&apos;s Tips (Optional)
            </Text>
            <View className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
              <TextInput
                placeholder="Share your secrets! e.g. 'Use cold butter for flakiness'"
                value={tips}
                onChangeText={setTips}
                multiline
                className="min-h-[80px] text-sm text-gray-800 dark:text-gray-200"
              />
            </View>
          </View>

          {/* Post Button */}
          <TouchableOpacity
            className="mb-24 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-lg shadow-primary/30"
            activeOpacity={0.8}
            onPress={() => Alert.alert("Success", "Recipe Posted Successfully!")}
          >
            <Text className="ml-2 text-lg font-bold text-white">Post Recipe</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
