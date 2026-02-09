import { Button, Container, Input } from "@/src/shared/components";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as authApi from "@/src/features/auth/services/authService";
import { useAuthStore } from "@/src/features/auth/store/authStore";

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
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Registration successful, now login automatically
      const loginResponse = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Save to store
      const { login } = useAuthStore.getState();
      await login(loginResponse.user, loginResponse.access_token, loginResponse.refresh_token);

      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") }
      ]);
    } catch (error: any) {
      console.error("Register error:", error);
      Alert.alert(
        "Đăng ký thất bại",
        error.response?.data?.message || error.message || "Không thể đăng ký. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container safe>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Header */}
          <View className="mb-8 mt-4">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-gray-500 text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-text mb-2">
              Tạo Tài Khoản
            </Text>
            <Text className="text-gray-500">
              Đăng ký để bắt đầu trải nghiệm
            </Text>
          </View>

          {/* Form */}
          <View className="w-full space-y-4">
            <Input
              label="Tên người dùng"
              placeholder="NguyenVanA"
              value={formData.username}
              onChangeText={(text) => handleChange("username", text)}
              autoCorrect={false}
            />

            <Input
              label="Email"
              placeholder="user@example.com"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View>
              <Input
                label="Mật khẩu"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry
              />
              <View className="ml-1 mb-4">
                <Text className="text-xs text-gray-400">• Ít nhất 8 ký tự</Text>
                <Text className="text-xs text-gray-400">
                  • Có chữ hoa và chữ thường
                </Text>
                <Text className="text-xs text-gray-400">
                  • Có số và ký tự đặc biệt
                </Text>
              </View>
            </View>

            <Input
              label="Xác nhận mật khẩu"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              secureTextEntry
            />

            <View className="flex-row items-center mb-6">
              {/* Terms checkbox placeholder */}
              <Text className="text-gray-600 text-sm">
                Tôi đồng ý với{" "}
                <Text className="text-primary font-bold">
                  Điều khoản dịch vụ
                </Text>
              </Text>
            </View>

            <Button
              title="ĐĂNG KÝ"
              onPress={handleRegister}
              isLoading={isLoading}
              className="mt-2 shadow-lg shadow-blue-500/30"
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-10 mb-8">
            <Text className="text-gray-600">Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
