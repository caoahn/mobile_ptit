import React, { useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNotificationStore } from "../store/notificationStore";
import { NotificationItem } from "./NotificationItem";

export const NotificationList: React.FC = () => {
  const {
    notifications,
    isLoading,
    hasMore,
    page,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchNotifications(1);
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-6xl mb-4">🔔</Text>
      <Text className="text-base text-gray-400 font-medium">Chưa có thông báo nào</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      )}
      ListEmptyComponent={!isLoading ? renderEmpty : null}
      ListFooterComponent={renderFooter}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && page === 1}
          onRefresh={handleRefresh}
          tintColor="#3B82F6"
        />
      }
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-gray-50"
    />
  );
};
