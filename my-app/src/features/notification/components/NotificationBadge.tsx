import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useNotificationStore } from "../store/notificationStore";

export const NotificationBadge: React.FC = () => {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  if (unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1.5">
      <Text className="text-white text-xs font-bold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};
