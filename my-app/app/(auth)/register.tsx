import { Button, Input } from "@/src/shared/components";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import * as authApi from "@/src/features/auth/services/authService";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng điền đầy đủ thông tin" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Mật khẩu không khớp" });
      return;
    }

    if (formData.password.length < 8) {
      Toast.show({ type: "error", text1: "Lỗi", text2: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Registration successful, redirect to login
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Tài khoản của bạn đã được tạo! Vui lòng đăng nhập.",
      });
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    } catch (error: any) {
      console.error("Register error:", error);
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2: error.response?.data?.message || error.message || "Không thể đăng ký. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 w-10 h-10 items-center justify-center"
            >
              <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-primary/10 rounded-3xl items-center justify-center mb-4 shadow-sm">
                <MaterialIcons name="person-add" size={40} color="#29a38f" />
              </View>
            </View>

            <Text className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Tạo Tài Khoản
            </Text>
            <Text className="text-gray-500 text-base">
              Đăng ký để bắt đầu với DishGram
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full space-y-4">
            <Input
              label="Tên người dùng"
              placeholder="johndoe"
              value={formData.username}
              onChangeText={(text) => handleChange("username", text)}
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mb-4"
            />

            <Input
              label="Địa chỉ Email"
              placeholder="chef@example.com"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mb-4"
            />

            <Input
              label="Mật khẩu"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry
              containerClassName="mb-2"
            />

            <Input
              label="Xác nhận mật khẩu"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              secureTextEntry
              containerClassName="mb-4"
            />

            <View className="mb-6">
              <Text className="text-xs text-gray-400 mb-1">
                • Ít nhất 8 ký tự
              </Text>
              <Text className="text-xs text-gray-400 mb-1">
                • Kết hợp chữ hoa và chữ thường
              </Text>
              <Text className="text-xs text-gray-400">
                • Bao gồm số và ký tự đặc biệt
              </Text>
            </View>

            <Button
              title="Đăng ký"
              onPress={handleRegister}
              isLoading={isLoading}
              className="shadow-lg shadow-primary/30 rounded-xl py-4"
            />

            <Text className="text-gray-400 text-xs text-center mt-4">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Text className="text-primary font-bold">Điều khoản dịch vụ</Text>
              {"\n"}và{" "}
              <Text className="text-primary font-bold">Chính sách bảo mật</Text>
            </Text>
          </View>

          {/* Footer Section */}
          <View className="flex-row justify-center mt-auto pt-10">
            <Text className="text-gray-500 font-medium">
              Đã có tài khoản?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
