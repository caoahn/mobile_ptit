import { Button, Container, Input } from "@/src/shared/components";
import {
  sendOtp,
  verifyOtp,
  resetPassword,
} from "@/src/shared/services/api/authServices";
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
  Alert,
} from "react-native";


export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // gửi OTP
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    try {
      setIsLoading(true);

      await sendOtp(email);

      Alert.alert("Thành công", "OTP đã được gửi vào email");

      setStep(2);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không gửi được OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // xác thực OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập OTP");
      return;
    }

    try {
      setIsLoading(true);

      await verifyOtp(email, otp);

      setStep(3);
    } catch (error: any) {
      Alert.alert(
        "OTP sai",
        error?.response?.data?.message || "OTP không hợp lệ"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // reset password
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp");
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword(email, password);

      Alert.alert("Thành công", "Đổi mật khẩu thành công");

      router.replace("/(auth)/login" as any);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể đổi mật khẩu"
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
          <View className="mb-10 mt-4">
            <TouchableOpacity
              onPress={() => (step === 1 ? router.back() : setStep(step - 1))}
              className="mb-6"
            >
              <Text className="text-gray-500 text-lg">← Quay lại</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-text mb-2">
              {step === 1
                ? "Quên Mật Khẩu?"
                : step === 2
                ? "Nhập Mã OTP"
                : "Đặt Mật Khẩu Mới"}
            </Text>

            <Text className="text-gray-500">
              {step === 1
                ? "Nhập email để nhận mã OTP"
                : step === 2
                ? `OTP đã gửi tới: ${email}`
                : "Nhập mật khẩu mới"}
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
                />

                <Button
                  title="GỬI MÃ OTP"
                  onPress={handleSendCode}
                  isLoading={isLoading}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="OTP"
                  placeholder="123456"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />

                <Button
                  title="XÁC NHẬN OTP"
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
                  value={password}
                  onChangeText={setPassword}
                />

                <Input
                  label="Xác nhận mật khẩu"
                  placeholder="••••••••"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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