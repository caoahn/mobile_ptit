import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function EditProfileScreen() {
  const [name, setName] = useState("Alex Culinary");
  const [username, setUsername] = useState("alex_culinary");
  const [bio, setBio] = useState("Exploring plant-based fusion with AI");
  const [image, setImage] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBoIibnJOshuOXx_XIIyvpIZfazYbPiGJKnX-pGVdE4_BLd2PmG5AODJU5KrXQ054lvmJG3aJlynInH9V5dzRHH4xX25WouqEPxdyIMI2s3DzNt_beI4Vs7ZXbsBpBvMXfE3_XqBBki9gLBjM7r4vxK1k7CNRabLL_S1-42RcljeP1oUag_6PBMqhO38exWhW2myTQxZ83QZ1xOXwzp2RjH0-u4cC6FaJzwef1NKbHgpkyipADOaIMXCGcCRm9OUj-HcDM4hac_HfB5"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }, 1000);
  };

  const handlePickImage = () => {
    Alert.alert("Change Avatar", "This would open image picker in a real device.");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-base font-medium text-gray-500">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Edit Profile
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text className={`text-base font-bold ${isLoading ? "text-gray-400" : "text-primary"}`}>
            {isLoading ? "Saving..." : "Done"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="items-center py-8">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              <View className="h-28 w-28 rounded-full border-4 border-white shadow-sm dark:border-gray-800">
                <Image
                  source={{ uri: image }}
                  className="h-full w-full rounded-full"
                />
              </View>
              <View className="absolute bottom-0 right-0 rounded-full bg-primary p-2 border-2 border-white dark:border-black">
                <MaterialIcons name="camera-alt" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage} className="mt-3">
              <Text className="text-sm font-bold text-primary">
                Change Profile Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="px-4 space-y-6">
            {/* Name */}
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Your Name"
              />
            </View>

            {/* Username */}
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Username"
                autoCapitalize="none"
              />
            </View>

            {/* Bio */}
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                className="min-h-[100px] rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Write something about yourself..."
                textAlignVertical="top"
              />
            </View>

            {/* Private Information Section */}
            <View className="mt-4">
              <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Private Information
              </Text>
              
              <View className="space-y-4">
                <View>
                  <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email
                  </Text>
                  <TextInput
                    value="alex@example.com"
                    editable={false}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-base font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                  />
                </View>

                <View>
                  <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Phone
                  </Text>
                  <TextInput
                    placeholder="+1 234 567 890"
                    className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
          </View>
          
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
