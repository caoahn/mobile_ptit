import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Recipe, RecipeLikeUser } from "../types/recipe.types";
import { followUser, unfollowUser } from "../../auth/services/userService";
import { getRecipeLikes, toggleLike, toggleSave } from "../services/recipeService";
import { useAuthStore } from "../../auth/store/authStore";
import { useRecommendationStore } from "../../recommendation/store/recommendationStore";
import { LoadingSpinner } from "@/src/shared/components";

interface RecipeCardProps {
  recipe: Recipe;
  onUpdate?: () => void;
}

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày`;
  return `${Math.floor(seconds / 604800)} tuần`;
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onUpdate }) => {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { trackInteraction } = useRecommendationStore();
  const [isLiked, setIsLiked] = useState(recipe.is_liked || false);

  // Track dwell time in feed: send dwell_10s if card is visible for >= 10s
  const trackInteractionRef = React.useRef(trackInteraction);
  React.useEffect(() => { trackInteractionRef.current = trackInteraction; }, [trackInteraction]);
  useEffect(() => {
    const recipeId = recipe.id;
    const startTime = Date.now();
    return () => {
      const duration_s = Math.round((Date.now() - startTime) / 1000);
      if (duration_s >= 10) {
        trackInteractionRef.current({ recipe_id: recipeId, event: "dwell_10s", duration_s });
      }
    };
  }, [recipe.id]);

  const [isSaved, setIsSaved] = useState(recipe.is_saved || false);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [likesModalMounted, setLikesModalMounted] = useState(false);
  const [likedUsers, setLikedUsers] = useState<RecipeLikeUser[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [followLoadingUserId, setFollowLoadingUserId] = useState<number | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(36)).current;
  const sheetOpacity = React.useRef(new Animated.Value(0)).current;

  const animateLikesModal = (visible: boolean) => {
    if (visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(36);
      sheetOpacity.setValue(0);
      setLikesModalMounted(true);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 32,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setLikesModalMounted(false);
      }
    });
  };

  const loadRecipeLikes = async () => {
    try {
      setLoadingLikes(true);
      const response = await getRecipeLikes(recipe.id);
      const sortedUsers = [...response.users].sort((a, b) => {
        if (a.is_current_user) return -1;
        if (b.is_current_user) return 1;
        return 0;
      });

      setLikedUsers(sortedUsers);
    } catch (error) {
      console.error("Failed to load recipe likes:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách người đã thích",
      });
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = await toggleLike(recipe.id);
      setIsLiked(result.liked);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
      if (result.liked) {
        trackInteraction({ recipe_id: recipe.id, event: "like" });
      }
      if (likesModalVisible) {
        await loadRecipeLikes();
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSave = async () => {
    try {
      const result = await toggleSave(recipe.id);
      setIsSaved(result.saved);
      if (result.saved) {
        trackInteraction({ recipe_id: recipe.id, event: "save" });
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleOpenComments = () => {
    router.push(`/recipe/${recipe.id}/comments`);
  };

  const handleOpenLikes = () => {
    setLikesModalVisible(true);
    animateLikesModal(true);
    loadRecipeLikes();
  };

  const handleCloseLikesModal = () => {
    setLikesModalVisible(false);
    animateLikesModal(false);
  };

  const handleToggleFollow = async (likedUser: RecipeLikeUser) => {
    if (likedUser.is_current_user || followLoadingUserId === likedUser.id) {
      return;
    }

    try {
      setFollowLoadingUserId(likedUser.id);

      if (likedUser.is_following) {
        await unfollowUser(likedUser.id);
      } else {
        await followUser(likedUser.id);
      }

      setLikedUsers((prev) =>
        prev.map((user) =>
          user.id === likedUser.id
            ? { ...user, is_following: !user.is_following }
            : user,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật theo dõi",
      });
    } finally {
      setFollowLoadingUserId(null);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}p`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
  };

  const renderLikedUser = ({ item }: { item: RecipeLikeUser }) => {
    const isFollowLoading = followLoadingUserId === item.id;

    const handleNavigateToProfile = () => {
      handleCloseLikesModal();
      if (item.is_current_user) {
        router.push("/(tabs)/profile" as any);
      } else {
        router.push(`/user/${item.id}` as any);
      }
    };

    return (
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="flex-row flex-1 items-center gap-3" onPress={handleNavigateToProfile}>
          <View className="h-11 w-11 overflow-hidden rounded-full bg-gray-200">
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} className="h-full w-full" />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-300">
                <Text className="text-sm font-bold text-gray-600">
                  {item.username?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900">{item.username}</Text>
          </View>
        </TouchableOpacity>

        {!item.is_current_user && (
          <TouchableOpacity
            onPress={() => handleToggleFollow(item)}
            disabled={isFollowLoading}
            className={`min-w-[96px] items-center rounded-full px-4 py-2 ${item.is_following ? "border border-gray-200 bg-white" : "bg-primary"}`}
          >
            {isFollowLoading ? (
              <ActivityIndicator size="small" color={item.is_following ? "#4B5563" : "white"} />
            ) : (
              <Text className={`text-xs font-semibold ${item.is_following ? "text-gray-700" : "text-white"}`}>
                {item.is_following ? "Đang theo dõi" : "Theo dõi"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-col">
      {/* Post Header */}
      <View className="flex-row items-center justify-between px-3 py-3">
        <TouchableOpacity
          className="flex-row items-center gap-3"
          onPress={() => {
            if (recipe.chef?.id) {
              if (String(currentUser?.id) === String(recipe.chef.id)) {
                router.push("/(tabs)/profile" as any);
              } else {
                router.push(`/user/${recipe.chef.id}` as any);
              }
            }
          }}
        >
          <View className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            {recipe.chef?.avatar_url ? (
              <Image
                source={{ uri: recipe.chef.avatar_url }}
                className="h-full w-full"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-300">
                <Text className="text-xs font-bold text-gray-600">
                  {recipe.chef?.username?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text className="text-base font-bold">
              {recipe.chef?.full_name || recipe.chef?.username || "Ẩn danh"}
            </Text>
            <Text className="text-sm text-gray-500">{recipe.category}</Text>
            {/* <Text className="text-sm text-gray-500">
              {recipe.category ? `${recipe.category} • ` : ""}
              {formatTimeAgo(recipe.created_at)}
            </Text> */}
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <MaterialIcons name="more-horiz" size={24} color="black" />
        </TouchableOpacity> */}
      </View>

      {/* Post Image */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => recipe.image_url && setPreviewImage(recipe.image_url)}
      >
        <View className="relative aspect-[4/5] w-full bg-gray-100">
          {recipe.image_url ? (
            <Image
              source={{ uri: recipe.image_url }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-200">
              <MaterialIcons name="restaurant" size={48} color="#9CA3AF" />
            </View>
          )}
          {recipe.cook_time > 0 && (
            <View className="absolute right-4 top-4 rounded bg-black/40 px-2 py-1 backdrop-blur-md">
              <Text className="text-base font-bold text-white">
                {formatTime(recipe.cook_time)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row items-center justify-between px-3 pb-2 pt-3">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleLike}>
            <MaterialIcons
              name={isLiked ? "favorite" : "favorite-border"}
              size={28}
              color={isLiked ? "#EF4444" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenComments}>
            <MaterialIcons name="chat-bubble-outline" size={28} color="black" />
          </TouchableOpacity>
          {/* <TouchableOpacity>
            <MaterialIcons name="share" size={28} color="#6B7280" />
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity onPress={handleSave}>
          <MaterialIcons
            name={isSaved ? "bookmark" : "bookmark-border"}
            size={28}
            color={isSaved ? "#F59E0B" : "black"}
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View className="border-b border-gray-50 px-3 pb-6">
        <TouchableOpacity
          className="mb-1 self-start"
          onPress={handleOpenLikes}
          disabled={likesCount === 0}
        >
          <Text className={`text-base font-bold ${likesCount > 0 ? "text-gray-900" : "text-gray-400"}`}>
            {likesCount.toLocaleString()} lượt thích
          </Text>
        </TouchableOpacity>
        <Text className="text-base leading-relaxed">
          <Text className="mr-2 font-bold">{recipe.title}</Text>{" "}
          <Text numberOfLines={2}>{recipe.description}</Text>
        </Text>
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="mt-1 flex-row flex-wrap items-center gap-1 overflow-hidden">
            {(isTagsExpanded ? recipe.tags : recipe.tags.slice(0, 3)).map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => router.push(`/tag/${tag.slug || tag.name}` as any)}
              >
                <Text className="text-base text-blue-600">#{tag.name}</Text>
              </TouchableOpacity>
            ))}
            {!isTagsExpanded && recipe.tags.length > 3 && (
              <TouchableOpacity
                className="rounded-full bg-gray-100 px-2 py-0.3"
                onPress={() => setIsTagsExpanded(true)}
              >
                <Text className="text-base font-medium text-gray-600">+{recipe.tags.length - 3}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {recipe.comments_count > 0 && (
          <TouchableOpacity className="mt-2" onPress={handleOpenComments}>
            <Text className="text-xs text-gray-500">
              Xem tất cả {recipe.comments_count} bình luận
            </Text>
          </TouchableOpacity>
        )}
        <Link href={`/recipe/${recipe.id}`} asChild>
          <TouchableOpacity className="mt-3 w-full rounded-lg border border-gray-100 bg-gray-50 py-2.5">
            <Text className="text-center text-base font-bold uppercase tracking-widest text-primary">
              Xem chi tiết
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={previewImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View className="flex-1 bg-black">
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-12 pb-4">
            <View className="absolute inset-0 bg-black/80" />
            <Text className="text-lg font-bold text-white z-10">{recipe.title}</Text>
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="bg-white/20 p-2 rounded-full z-10"
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View className="flex-1 items-center justify-center">
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>

          {/* Info */}
          <View className="absolute bottom-0 left-0 right-0 px-4 py-6">
            <View className="absolute inset-0 bg-black/80" />
            <View className="flex-row items-center justify-between z-10">
              <View className="flex-1">
                <Text className="text-sm text-white/80">Bởi {recipe.chef?.username || "Ẩn danh"}</Text>
                {recipe.cook_time > 0 && (
                  <Text className="text-xs text-white/60 mt-1">
                    Thời gian: {formatTime(recipe.cook_time)}
                  </Text>
                )}
              </View>
              <Link href={`/recipe/${recipe.id}`} asChild>
                <TouchableOpacity
                  className="bg-primary px-4 py-2 rounded-lg"
                  onPress={() => setPreviewImage(null)}
                >
                  <Text className="text-white font-bold text-xs">Xem công thức</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={likesModalMounted}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseLikesModal}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black/35"
            style={{ opacity: backdropOpacity }}
          />

          <TouchableOpacity
            activeOpacity={1}
            className="flex-1"
            onPress={handleCloseLikesModal}
          />

          <Animated.View
            className="w-full rounded-t-[28px] bg-white pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            style={{
              height: '60%',
              backgroundColor: 'white', // Đảm bảo nền luôn là màu trắng trên mọi thiết bị
              opacity: sheetOpacity,
              transform: [{ translateY: sheetTranslateY }],
            }}
          >
            <View className="items-center pt-3">
              <View className="h-1.5 w-12 rounded-full bg-gray-300" />
            </View>

            <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-4">
              <View>
                <Text className="text-base font-bold text-gray-900">Lượt thích</Text>
                <Text className="mt-0.5 text-xs text-gray-500">{likesCount.toLocaleString()} người đã thích công thức này</Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseLikesModal}
                className="rounded-full bg-gray-100 p-2"
              >
                <MaterialIcons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            {loadingLikes ? (
              <LoadingSpinner
                text="Đang tải danh sách người thích"
                className="items-center justify-center py-10"
              />
            ) : likedUsers.length > 0 ? (
              <FlatList
                data={likedUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderLikedUser}
                ItemSeparatorComponent={() => <View className="ml-[72px] h-px bg-gray-100" />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View className="items-center justify-center px-6 py-12">
                <View className="mb-3 rounded-full bg-gray-100 p-4">
                  <MaterialIcons name="favorite-border" size={24} color="#9CA3AF" />
                </View>
                <Text className="text-sm font-semibold text-gray-900">Chưa có lượt thích</Text>
                <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
                  Khi có người thả tim công thức này, danh sách sẽ xuất hiện ở đây.
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};
