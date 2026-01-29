import Button from "@/src/components/ui/Button";
import Container from "@/src/components/ui/Container";
import Input from "@/src/components/ui/Input";
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
    setIsLoading(true);
    // TODO: Implement register logic
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
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
