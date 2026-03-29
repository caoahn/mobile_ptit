import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/src/features/auth/services/userService";
import {
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
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";


import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/src/shared/services/uploadService";


export default function EditProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getProfile();

        setFullName(user.full_name);
        setUsername(user.username);
        setBio(user.bio || "");
        setImage(user.avatar_url || "");
        setEmail(user.email || "");
      } catch (error) {
        console.log("Load profile error", error);
      }
    };
    loadProfile();
  }, []);


  const handleSave = async () => {
    try {
      setIsLoading(true);

      await updateProfile({
        full_name: fullName,
        username: username,
        bio: bio,
        avatar_url: image,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
      });

      setTimeout(() => router.back(), 1200);

    } catch (error) {
      console.log(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Update failed",
      });

    } finally {
      setIsLoading(false);
    }
  };


  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;

        console.log("LOCAL URI:", localUri);

        const uploadResult = await uploadImage(localUri);

        console.log("UPLOAD RESULT:", uploadResult);

        setImage(uploadResult.url);

        Toast.show({
          type: "success",
          text1: "Upload success",
        });
      }
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error?.response?.data || error);

      Toast.show({
        type: "error",
        text1: "Upload failed",
      });
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-base font-medium text-gray-500">Hủy</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Chỉnh sửa profile
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text className={`text-base font-bold ${isLoading ? "text-gray-400" : "text-primary"}`}>
            {isLoading ? "Đang lưu..." : "Lưu"}
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
              <View className="h-28 w-28 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white">
                {image ? (
                  <Image
                    source={{ uri: image }}
                    className="h-full w-full"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-gray-200">
                    <Text className="text-4xl font-bold text-gray-500">
                      {username?.[0]?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 rounded-full bg-primary p-2 border-2 border-white">
                <MaterialIcons name="camera-alt" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage} className="mt-3">
              <Text className="text-sm font-bold text-primary">
                Đổi ảnh đại diện
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="px-4 space-y-6">
            {/* Name */}
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Tên
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary"
                placeholder="Nhập tên"
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
                className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary"
                placeholder="Nhập username"
              />
            </View>

            {/* Bio */}
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Tiểu sử
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary"
                placeholder="Nhập tiểu sử"
              />
            </View>

            {/* Private Information Section */}
            <View className="mt-4">
              <Text className="mb-4 text-lg font-bold text-gray-900">
                Thông tin riêng tư
              </Text>

              <View className="space-y-4">
                <View>
                  <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    className="rounded-xl border border-gray-200 bg-white p-4 text-base font-medium text-gray-900 focus:border-primary"
                    placeholder="Your Email"
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
