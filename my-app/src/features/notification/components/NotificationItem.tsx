import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Notification } from "../types/notification.types";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Đánh dấu đã đọc
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Like → đến trang comment của bài viết đó
    if (notification.type === "like" && notification.recipe) {
      router.push(`/recipe/${notification.recipe.id}/comments` as any);
      return;
    }

    // Comment/reply → đến thẳng màn comment với highlight
    if (notification.type === "comment" && notification.recipe && notification.comment) {
      router.push(`/recipe/${notification.recipe.id}/comments?commentId=${notification.comment.id}` as any);
      return;
    }

    // Các loại còn lại → recipe detail
    if (notification.recipe) {
      router.push(`/recipe/${notification.recipe.id}` as any);
    }
  };

  const getMessage = () => {
    const { actor, type, recipe, comment } = notification;

    switch (type) {
      case "like":
        return `${actor.username} đã thích bài viết "${recipe?.title}"`;
      case "comment":
        return `${actor.username} đã bình luận: "${comment?.content.slice(0, 50)}${comment && comment.content.length > 50 ? "..." : ""}"`;
      case "follow":
        return `${actor.username} đã theo dõi bạn`;
      case "rating":
        return `${actor.username} đã đánh giá bài viết "${recipe?.title}"`;
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "rating":
        return "⭐";
      default:
        return "";
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`flex-row p-4 border-b border-gray-100 items-center ${!notification.is_read ? "bg-blue-50" : "bg-white"}`}
    >
      {/* Unread Dot */}
      {!notification.is_read && (
        <View className="w-2 h-2 rounded-full bg-blue-500 absolute top-4 left-2" />
      )}

      {/* Avatar with Icon */}
      <View className="relative mr-3">
        <Image
          source={{
            uri:
              notification.actor.avatar_url ||
              "https://via.placeholder.com/50",
          }}
          className="w-12 h-12 rounded-full"
        />
        <View className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 justify-center items-center">
          <Text className="text-sm">{getIcon()}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <Text className="text-sm text-gray-800 mb-1">{getMessage()}</Text>
        <Text className="text-xs text-gray-500">{timeAgo}</Text>
      </View>

      {/* Recipe Thumbnail */}
      {notification.recipe?.image_url && (
        <Image
          source={{ uri: notification.recipe.image_url }}
          className="w-16 h-16 rounded-lg"
        />
      )}
    </TouchableOpacity>
  );
};
