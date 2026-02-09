import { Button, Input } from "@/src/shared/components";
import { MaterialIcons } from "@expo/vector-icons";
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
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
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
      Alert.alert(
        "Success",
        "Your account has been created successfully! Please log in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login")
          }
        ]
      );
    } catch (error: any) {
      console.error("Register error:", error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || error.message || "Unable to register. Please try again."
      );
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
              <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-4 shadow-sm rotate-3">
                <MaterialIcons name="person-add" size={40} color="#29a38f" />
              </View>
            </View>

            <Text className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Create Account
            </Text>
            <Text className="text-gray-500 text-base">
              Sign up to get started with DishGram
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full space-y-4">
            <Input
              label="Username"
              placeholder="johndoe"
              value={formData.username}
              onChangeText={(text) => handleChange("username", text)}
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mb-4"
            />

            <Input
              label="Email Address"
              placeholder="chef@example.com"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mb-4"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry
              containerClassName="mb-2"
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              secureTextEntry
              containerClassName="mb-4"
            />

            <View className="mb-6">
              <Text className="text-xs text-gray-400 mb-1">
                • At least 8 characters
              </Text>
              <Text className="text-xs text-gray-400 mb-1">
                • Mix of uppercase and lowercase letters
              </Text>
              <Text className="text-xs text-gray-400">
                • Include numbers and special characters
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              className="shadow-lg shadow-primary/30 rounded-xl py-4"
            />

            <Text className="text-gray-400 text-xs text-center mt-4">
              By signing up, you agree to our{" "}
              <Text className="text-primary font-bold">Terms of Service</Text>
              {"\n"}and{" "}
              <Text className="text-primary font-bold">Privacy Policy</Text>
            </Text>
          </View>

          {/* Footer Section */}
          <View className="flex-row justify-center mt-auto pt-10">
            <Text className="text-gray-500 font-medium">
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
