import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { NotificationList } from "@/src/features/notification/components/NotificationList";
import { useNotificationStore } from "@/src/features/notification/store/notificationStore";

export default function NotificationsScreen() {
  const { initSocketListener, cleanupSocketListener, markAllAsRead, notifications } = useNotificationStore();
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.is_read);

  useEffect(() => {
    // Kết nối socket nếu chưa connected (đã được connect ở _layout.tsx rồi)
    // Chỉ cần init socket listener
    initSocketListener();

    return () => {
      cleanupSocketListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Thông báo</Text>
          </View>

          {hasUnread && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="px-3 py-1.5 bg-blue-50 rounded-full"
            >
              <Text className="text-xs text-blue-600 font-semibold">Đọc hết</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notification List */}
      <NotificationList />
    </SafeAreaView>
  );
}
