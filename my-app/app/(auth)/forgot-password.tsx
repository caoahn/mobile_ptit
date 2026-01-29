import Button from "@/src/components/ui/Button";
import Container from "@/src/components/ui/Container";
import Input from "@/src/components/ui/Input";
import { router } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(auth)/login" as any);
    }, 1000);
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
          <View className="mb-10 mt-4">
            <TouchableOpacity
              onPress={() => (step === 1 ? router.back() : setStep(step - 1))}
              className="mb-6"
            >
              <Text className="text-gray-500 text-lg">← Quay lại</Text>
            </TouchableOpacity>

            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Text className="text-3xl">
                {step === 1 ? "🔑" : step === 2 ? "✉️" : "🔒"}
              </Text>
            </View>

            <Text className="text-2xl font-bold text-text mb-2">
              {step === 1
                ? "Quên Mật Khẩu?"
                : step === 2
                  ? "Nhập Mã Xác Thực"
                  : "Đặt Mật Khẩu Mới"}
            </Text>
            <Text className="text-gray-500">
              {step === 1
                ? "Nhập email của bạn để nhận mã xác thực"
                : step === 2
                  ? `Mã đã được gửi đến: ${email || "user@example.com"}`
                  : "Nhập mật khẩu mới cho tài khoản của bạn"}
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            {step === 1 && (
              <>
                <Input
                  label="Email"
                  placeholder="user@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Button
                  title="GỬI MÃ XÁC THỰC"
                  onPress={handleSendCode}
                  isLoading={isLoading}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="OTP Code"
                  placeholder="1234"
                  keyboardType="number-pad"
                  className="text-center text-xl tracking-widest"
                />
                <Button
                  title="XÁC NHẬN"
                  onPress={handleVerifyOtp}
                  isLoading={isLoading}
                />
              </>
            )}

            {step === 3 && (
              <>
                <Input
                  label="Mật khẩu mới"
                  placeholder="••••••••"
                  secureTextEntry
                />
                <Input
                  label="Xác nhận mật khẩu mới"
                  placeholder="••••••••"
                  secureTextEntry
                />
                <Button
                  title="ĐẶT LẠI MẬT KHẨU"
                  onPress={handleResetPassword}
                  isLoading={isLoading}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
