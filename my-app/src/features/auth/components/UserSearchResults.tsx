import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { searchUsers } from "../services/userService";
import { UserProfileResponse } from "../types/user.response";

interface Props {
  query: string;
}

export const UserSearchResults: React.FC<Props> = ({ query }) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    searchUsers(query)
      .then((results) => setUsers(results))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query.trim()) return null;

  return (
    <View>
      {/* Result header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">
          Kết quả cho &quot;{query}&quot;
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#29a38f" />
        ) : (
          <Text className="text-sm font-bold text-primary">{users.length} kết quả</Text>
        )}
      </View>

      {/* Loading */}
      {loading && users.length === 0 && (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#29a38f" />
          <Text className="text-gray-400 mt-3 text-sm">Đang tìm kiếm...</Text>
        </View>
      )}

      {/* User list */}
      {users.map((user) => (
        <TouchableOpacity
          key={user.id}
          activeOpacity={0.85}
          className="flex-row items-center mb-3 bg-white rounded-2xl p-3 border border-gray-100"
          style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          onPress={() => router.push(`/user/${user.id}` as any)}
        >
          {/* Avatar */}
          <View className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="w-full h-full items-center justify-center bg-gray-200">
                <Text className="text-lg font-bold text-gray-400">
                  {user.username?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="flex-1 ml-3">
            <Text className="text-base font-bold text-gray-900">{user.username}</Text>
            {user.full_name ? (
              <Text className="text-sm text-gray-500">{user.full_name}</Text>
            ) : null}
            {user.bio ? (
              <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                {user.bio}
              </Text>
            ) : null}
            {user.followers_count !== undefined && (
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialIcons name="people" size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-400">{user.followers_count} người theo dõi</Text>
              </View>
            )}
          </View>

          <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
        </TouchableOpacity>
      ))}

      {/* Empty state */}
      {!loading && query.trim() && users.length === 0 && (
        <View className="items-center py-16">
          <MaterialIcons name="person-search" size={52} color="#e5e7eb" />
          <Text className="text-gray-400 mt-3 text-base font-medium">
            Không tìm thấy người dùng nào
          </Text>
          <Text className="text-gray-300 mt-1 text-sm text-center px-8">
            Thử tìm với tên đăng nhập khác
          </Text>
        </View>
      )}
    </View>
  );
};
