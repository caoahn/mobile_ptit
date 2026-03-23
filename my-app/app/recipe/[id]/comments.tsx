import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Modal,
  Pressable,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { Comment, RecipeDetail } from "@/src/features/recipe/types/recipe.types";
import { LoadingSpinner } from "@/src/shared/components";
import { useAuthStore } from "@/src/features/auth/store/authStore";
import {
  getRecipeComments,
  createComment,
  updateComment,
  deleteComment,
  getRecipeById,
  toggleLike,
} from "@/src/features/recipe/services/recipeService";

const COMMENTS_PER_PAGE = 10;

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

export default function CommentsScreen() {
  const { id, commentId } = useLocalSearchParams<{ id: string; commentId?: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
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

  // Edit / delete state
  const [actionComment, setActionComment] = useState<Comment | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleLike = useCallback(async () => {
    try {
      const result = await toggleLike(recipeId);
      setIsLiked(result.liked);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }, [recipeId]);

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

  const handleStartEdit = (comment: Comment) => {
    setActionComment(null);
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = async (comment: Comment) => {
    if (!editText.trim() || editText.trim() === comment.content) {
      setEditingId(null);
      return;
    }
    try {
      setSavingEdit(true);
      await updateComment(recipeId, comment.id, editText.trim());
      // Update comment in-place in state tree
      const patchContent = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.id === comment.id) return { ...c, content: editText.trim() };
          if (c.replies) return { ...c, replies: patchContent(c.replies) };
          return c;
        });
      setComments((prev) => patchContent(prev));
      setEditingId(null);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Lỗi", text2: error?.response?.data?.message || "Không thể chỉnh sửa" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    setActionComment(null);
    try {
      setDeletingId(comment.id);
      await deleteComment(recipeId, comment.id);
      // Remove comment and any in-tree occurrence
      const removeById = (list: Comment[]): Comment[] =>
        list.filter((c) => c.id !== comment.id).map((c) => ({
          ...c,
          replies: c.replies ? removeById(c.replies) : c.replies,
        }));
      setComments((prev) => removeById(prev));
      setTotal((t) => t - 1);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Lỗi", text2: error?.response?.data?.message || "Không thể xóa bình luận" });
    } finally {
      setDeletingId(null);
    }
  };



  const renderComment = (comment: Comment, isReply: boolean = false, depth: number = 0) => {
    const maxDepth = 2;
    const canReply = depth < maxDepth;
    const isHighlighted = highlightedId === comment.id;
    const isOwn = String(comment.user?.id) === String(currentUser?.id);
    const isEditing = editingId === comment.id;
    const isDeleting = deletingId === comment.id;

    const containerClassName = [
      isReply && depth > 0 ? "ml-8 mt-1.5" : "mb-4",
      "flex-row gap-2",
      isHighlighted ? "border border-gray-200 bg-gray-50 px-2 py-2 rounded-2xl" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const contentClassName = [
      "rounded-2xl px-3 py-2 flex-1",
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
        {/* Thread connector: L-shaped curved line cho reply */}
        {isReply && depth > 0 && (
          <View
            style={{
              position: "absolute",
              left: -18,
              top: 0,
              width: 14,
              height: 18,
              borderLeftWidth: 1.5,
              borderBottomWidth: 1.5,
              borderColor: "rgba(209,213,219,0.85)",
              borderBottomLeftRadius: 8,
            }}
          />
        )}
        <TouchableOpacity
          className={`${isReply ? "h-7 w-7" : "h-8 w-8"} overflow-hidden rounded-full bg-gray-200 flex-shrink-0`}
          onPress={() => {
            if (comment.user?.id && String(comment.user.id) === String(currentUser?.id)) {
              router.push("/(tabs)/profile" as any);
            } else if (comment.user?.id) {
              router.push(`/user/${comment.user.id}` as any);
            }
          }}
        >
          {comment.user?.avatar_url ? (
            <Image source={{ uri: comment.user.avatar_url }} className="h-full w-full" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-300">
              <Text className="text-xs font-bold text-gray-600">
                {comment.user?.username?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-1 min-w-0">
          {isEditing ? (
            <View className={`${contentClassName} flex-row items-end gap-2`}>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-900 mb-1">
                  {comment.user?.username || "Anonymous"}
                </Text>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  multiline
                  maxLength={500}
                  autoFocus
                  className="text-sm leading-relaxed text-gray-800 bg-white rounded-xl px-2 py-1.5"
                  style={{ textAlignVertical: "top" }}
                  editable={!savingEdit}
                />
              </View>
              <View className="flex-row gap-1.5 mb-0.5">
                <TouchableOpacity
                  onPress={() => setEditingId(null)}
                  disabled={savingEdit}
                  className="rounded-full p-1.5 bg-gray-200"
                >
                  <MaterialIcons name="close" size={16} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSaveEdit(comment)}
                  disabled={savingEdit || !editText.trim()}
                  className={`rounded-full p-1.5 ${editText.trim() && !savingEdit ? "bg-primary" : "bg-gray-200"}`}
                >
                  {savingEdit ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <MaterialIcons name="check" size={16} color={editText.trim() ? "white" : "#9CA3AF"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className={contentClassName}
              onLongPress={() => isOwn && setActionComment(comment)}
              delayLongPress={400}
              activeOpacity={isOwn ? 0.7 : 1}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-gray-900">
                  {comment.user?.username || "Anonymous"}
                </Text>
                {isOwn && !isDeleting && (
                  <TouchableOpacity
                    onPress={() => setActionComment(comment)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="ml-2"
                  >
                    <MaterialIcons name="more-horiz" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                {isDeleting && <ActivityIndicator size="small" color="#9CA3AF" />}
              </View>
              <Text className="mt-0.5 text-sm leading-relaxed text-gray-800">
                {comment.content}
              </Text>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <View className="mt-1 flex-row items-center gap-3 px-1">
              <Text className="text-xs text-gray-400">
                {formatTimeAgo(comment.updated_at || comment.created_at)}
              </Text>
              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <Text className="text-xs text-gray-400 italic">đã chỉnh sửa</Text>
              )}
              {canReply && (
                <TouchableOpacity
                  onPress={() => setReplyingTo(comment)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="text-xs font-semibold text-primary">Trả lời</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {comment.replies && comment.replies.length > 0 &&
            comment.replies.map((reply) => renderComment(reply, true, depth + 1))}
        </View>
      </View>
    );
  };

  // Header: ảnh bài viết + thông tin + like/comment
  // Dùng useCallback để giữ reference ổn định → FlatList không remount header khi gõ comment
  const renderPostHeader = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, isLiked, likesCount, total, handleLike]);

  const renderFooter = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, total, comments.length]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Content */}
        {loading ? (
          <LoadingSpinner text="" />
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

        {/* Action Sheet Modal for edit / delete */}
        <Modal
          visible={!!actionComment}
          transparent
          animationType="fade"
          onRequestClose={() => setActionComment(null)}
        >
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onPress={() => setActionComment(null)}
          >
            <Pressable onPress={() => { }} className="bg-white rounded-t-3xl overflow-hidden">
              {/* Handle bar */}
              <View className="items-center pt-2.5 pb-1">
                <View className="h-1 w-8 rounded-full bg-gray-200" />
              </View>

              {/* Edit action */}
              <TouchableOpacity
                onPress={() => actionComment && handleStartEdit(actionComment)}
                activeOpacity={0.7}
                className="flex-row items-center gap-3.5 px-5 py-4 border-b border-gray-100"
              >
                <MaterialIcons name="edit" size={20} color="#29a38f" />
                <Text className="text-[15px] font-medium text-gray-800">Chỉnh sửa bình luận</Text>
              </TouchableOpacity>

              {/* Delete action */}
              <TouchableOpacity
                onPress={() => actionComment && handleDeleteComment(actionComment)}
                activeOpacity={0.7}
                className="flex-row items-center gap-3.5 px-5 py-4"
              >
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                <Text className="text-[15px] font-medium text-red-500">Xóa bình luận</Text>
              </TouchableOpacity>

              {/* Cancel */}
              <View className="px-4 pt-2 pb-8">
                <TouchableOpacity
                  onPress={() => setActionComment(null)}
                  activeOpacity={0.7}
                  className="rounded-2xl bg-gray-100 items-center py-3.5"
                >
                  <Text className="text-sm font-semibold text-gray-500">Hủy</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}