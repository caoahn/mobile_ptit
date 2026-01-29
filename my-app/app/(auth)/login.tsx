import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulation of login
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
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
            justifyContent: "center",
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-primary/10 rounded-3xl items-center justify-center mb-6 shadow-sm rotate-3">
              <MaterialIcons name="restaurant-menu" size={48} color="#29a38f" />
            </View>
            <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              DishGram
            </Text>
            <Text className="text-gray-500 text-center text-base font-medium">
              Discover, Cook, and Share{"\n"}Your Culinary Masterpieces
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full space-y-4">
            <Input
              label="Email Address"
              placeholder="chef@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerClassName="mb-4"
            />

            <View className="mb-2">
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerClassName="mb-2"
              />
              <TouchableOpacity
                className="self-end mt-1 p-1"
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text className="text-primary font-bold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              className="shadow-lg shadow-primary/30 mt-4 rounded-xl py-4"
            />
          </View>

          {/* Social Login Section */}
          <View className="mt-10">
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-gray-100" />
              <Text className="mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                Or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-gray-100" />
            </View>

            <View className="flex-row justify-center gap-4">
              <TouchableOpacity className="w-14 h-14 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
                  }}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                <MaterialIcons name="facebook" size={28} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                <MaterialIcons name="apple" size={28} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <View className="flex-row justify-center mt-auto pt-10">
            <Text className="text-gray-500 font-medium">
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
