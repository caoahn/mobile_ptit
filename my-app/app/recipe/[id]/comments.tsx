import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { Comment, RecipeDetail } from "@/src/features/recipe/types/recipe.types";
import {
  getRecipeComments,
  createComment,
  getRecipeById,
  toggleLike,
} from "@/src/features/recipe/services/recipeService";

const COMMENTS_PER_PAGE = 10;

export default function CommentsScreen() {
  const { id, commentId } = useLocalSearchParams<{ id: string; commentId?: string }>();
  const router = useRouter();
  const recipeId = parseInt(id);
  const targetCommentId = commentId ? parseInt(commentId) : null;

  const flatListRef = useRef<FlatList>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(targetCommentId);

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  // Scroll đến comment được highlight sau khi load xong
  useEffect(() => {
    if (!targetCommentId || loading || comments.length === 0) return;

    const findParentIndex = (targetId: number): number => {
      for (let i = 0; i < comments.length; i++) {
        const c = comments[i];
        if (c.id === targetId) return i;
        if (c.replies?.some((r) => r.id === targetId || r.replies?.some((r2) => r2.id === targetId)))
          return i;
      }
      return -1;
    };

    const index = findParentIndex(targetCommentId);
    if (index >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
      }, 400);
    }

    const timer = setTimeout(() => setHighlightedId(null), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, comments.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipeData, commentsData] = await Promise.all([
        getRecipeById(recipeId),
        getRecipeComments(recipeId, 1, COMMENTS_PER_PAGE),
      ]);
      setRecipe(recipeData);
      setIsLiked(recipeData.is_liked || false);
      setLikesCount(recipeData.likes_count || 0);
      setComments(commentsData.comments);
      setTotal(commentsData.total);
      setHasMore(commentsData.hasMore);
      setPage(1);
    } catch (error) {
      console.error("Failed to load data:", error);
      Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể tải dữ liệu" });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const data = await getRecipeComments(recipeId, page + 1, COMMENTS_PER_PAGE);
      setComments((prev) => [...prev, ...data.comments]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = await toggleLike(recipeId);
      setIsLiked(result.liked);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      let finalContent = commentText.trim();
      if (replyingTo) {
        const mention = `@${replyingTo.user.username}`;
        if (!finalContent.startsWith(mention)) {
          finalContent = `${mention} ${finalContent}`;
        }
      }
      await createComment(recipeId, finalContent, replyingTo?.id);
      const data = await getRecipeComments(recipeId, 1, COMMENTS_PER_PAGE);
      setComments(data.comments);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(1);
      setCommentText("");
      setReplyingTo(null);
    } catch (error: any) {
      console.error("Failed to create comment:", error);
      Toast.show({ type: "error", text1: "Lỗi", text2: error?.response?.data?.message || "Không thể đăng bình luận" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày`;
    return `${Math.floor(seconds / 604800)} tuần`;
  };

  const renderComment = (comment: Comment, isReply: boolean = false, depth: number = 0) => {
    const maxDepth = 2;
    const canReply = depth < maxDepth;
    const isHighlighted = highlightedId === comment.id;
    const containerClassName = [
      isReply && depth > 0 ? "ml-8 mt-2 border-l-2 border-gray-200 pl-2.5" : "mb-3",
      "flex-row gap-2.5 rounded-2xl",
      isHighlighted ? "border border-gray-200 bg-gray-50 px-2 py-2" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const contentClassName = [
      "rounded-2xl px-3 py-2",
      isReply ? "bg-gray-50" : "bg-gray-100",
      isHighlighted ? "bg-gray-100" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <View
        key={comment.id}
        className={containerClassName}
      >
        <View className={`${isReply ? "h-7 w-7" : "h-8 w-8"} overflow-hidden rounded-full bg-gray-200 flex-shrink-0`}>
          {comment.user?.avatar_url ? (
            <Image source={{ uri: comment.user.avatar_url }} className="h-full w-full" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-300">
              <Text className="text-xs font-bold text-gray-600">
                {comment.user?.username?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 min-w-0">
          <View className={contentClassName}>
            <Text className="text-xs font-bold text-gray-900">
              {comment.user?.username || "Anonymous"}
            </Text>
            <Text className="mt-0.5 text-sm leading-relaxed text-gray-800">
              {comment.content}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center gap-3 px-1">
            <Text className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</Text>
            {canReply && (
              <TouchableOpacity
                onPress={() => setReplyingTo(comment)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="text-xs font-semibold text-primary">Trả lời</Text>
              </TouchableOpacity>
            )}
          </View>
          {comment.replies && comment.replies.length > 0 &&
            comment.replies.map((reply) => renderComment(reply, true, depth + 1))}
        </View>
      </View>
    );
  };

  // Header: ảnh bài viết + thông tin + like/comment
  const renderPostHeader = () => {
    if (!recipe) return null;
    return (
      <View className="mb-2 bg-white -mx-3">
        {/* Chef info */}
        <View className="flex-row items-center px-3 pt-3 pb-2">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-2 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="chevron-left" size={28} color="#111" />
          </TouchableOpacity>

          {/* Avatar */}
          <View className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 mr-2.5">
            {recipe.chef?.avatar_url ? (
              <Image source={{ uri: recipe.chef.avatar_url }} className="h-full w-full" />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-300">
                <Text className="text-sm font-bold text-gray-600">
                  {recipe.chef?.username?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-900">{recipe.chef?.username || "Anonymous"}</Text>
            <Text className="text-xs text-gray-400">{formatTimeAgo(recipe.created_at)}</Text>
          </View>

          {/* Xem chi tiết */}
          <TouchableOpacity
            onPress={() => router.push(`/recipe/${recipeId}` as any)}
            className="flex-row items-center gap-1 rounded-full border border-primary px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-primary">Chi tiết</Text>
            <MaterialIcons name="open-in-new" size={12} color="#29a38f" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text className="px-4 pb-2 text-base font-semibold text-gray-900">{recipe.title}</Text>

        {/* Post Image */}
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            style={{ width: "100%", aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ width: "100%", aspectRatio: 4 / 3 }} className="bg-gray-100 items-center justify-center">
            <MaterialIcons name="restaurant" size={48} color="#D1D5DB" />
          </View>
        )}

        {/* Counts row */}
        {(likesCount > 0 || total > 0) && (
          <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
            {likesCount > 0 ? (
              <View className="flex-row items-center gap-1">
                <View className="h-5 w-5 rounded-full bg-red-500 items-center justify-center">
                  <MaterialIcons name="favorite" size={11} color="white" />
                </View>
                <Text className="text-sm text-gray-500">{likesCount}</Text>
              </View>
            ) : <View />}
            {total > 0 && (
              <Text className="text-sm text-gray-500">{total} bình luận</Text>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row border-b border-gray-100 mx-2 mb-2">
          <TouchableOpacity
            onPress={handleLike}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5"
          >
            <MaterialIcons
              name={isLiked ? "favorite" : "favorite-border"}
              size={26}
              color={isLiked ? "#DC2626" : "#4B5563"}
            />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5">
            <MaterialIcons name="chat-bubble-outline" size={26} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Comments section label */}
        <View className="px-4 pb-2">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Tất cả bình luận
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return <View className="items-center py-3"><ActivityIndicator size="small" color="#29a38f" /></View>;
    }
    if (!hasMore) return <View className="h-4" />;
    return (
      <View className="items-center py-3">
        <TouchableOpacity onPress={loadMoreComments} className="rounded-full bg-gray-100 px-6 py-2">
          <Text className="text-xs font-semibold text-gray-700">
            Xem thêm ({total - comments.length} bình luận)
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#29a38f" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderComment(item)}
            ListHeaderComponent={renderPostHeader}
            onScrollToIndexFailed={({ index }) => {
              flatListRef.current?.scrollToOffset({ offset: index * 100, animated: true });
            }}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <MaterialIcons name="chat-bubble-outline" size={48} color="#D1D5DB" />
                <Text className="mt-3 text-sm font-semibold text-gray-900">Chưa có bình luận</Text>
                <Text className="mt-1 text-xs text-gray-400">Hãy là người đầu tiên!</Text>
              </View>
            }
            ListFooterComponent={renderFooter}
            onEndReached={loadMoreComments}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Area */}
        <View className="border-t border-gray-200 bg-white">
          {replyingTo && (
            <View className="flex-row items-center justify-between bg-blue-50 px-4 py-2">
              <View className="flex-1 flex-row items-center gap-2">
                <MaterialIcons name="reply" size={15} color="#3B82F6" />
                <View className="flex-1">
                  <Text className="text-xs text-blue-500 font-medium">Đang trả lời</Text>
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    @{replyingTo.user.username}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row items-end gap-2 px-3 py-2.5">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={replyingTo ? `Trả lời @${replyingTo.user.username}...` : "Viết bình luận..."}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              className="max-h-24 flex-1 rounded-3xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900"
              editable={!submitting}
              style={{ textAlignVertical: "center" }}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className={`rounded-full p-2.5 ${commentText.trim() && !submitting ? "bg-primary" : "bg-gray-200"}`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="send" size={20} color={commentText.trim() ? "white" : "#9CA3AF"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}