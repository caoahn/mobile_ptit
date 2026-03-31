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
  StyleSheet,
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

const COMMENTS_PER_PAGE = 5;
const PRIMARY = "#29a38f";

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

  const [actionComment, setActionComment] = useState<Comment | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

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
      const data = await getRecipeComments(recipeId, 1, page * COMMENTS_PER_PAGE);
      setComments(data.comments);
      setTotal(data.total);
      setHasMore(data.hasMore);
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
    const bubbleBg = isHighlighted ? "#F3F4F6" : isReply ? "#F9FAFB" : "#F3F4F6";

    return (
      <View
        key={comment.id}
        style={[
          styles.commentRow,
          isReply && depth > 0 ? styles.replyIndent : styles.commentMargin,
          isHighlighted ? styles.highlighted : null,
        ]}
      >
        {isReply && depth > 0 && <View style={styles.threadLine} />}

        <TouchableOpacity
          style={[styles.avatar, isReply ? styles.avatarSmall : null]}
          onPress={() => {
            if (comment.user?.id && String(comment.user.id) === String(currentUser?.id)) {
              router.push("/(tabs)/profile" as any);
            } else if (comment.user?.id) {
              router.push(`/user/${comment.user.id}` as any);
            }
          }}
        >
          {comment.user?.avatar_url ? (
            <Image source={{ uri: comment.user.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {comment.user?.username?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.commentBody}>
          {isEditing ? (
            <View style={[styles.bubble, { backgroundColor: bubbleBg }, styles.editRow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{comment.user?.username || "Anonymous"}</Text>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  multiline
                  maxLength={500}
                  autoFocus
                  style={styles.editInput}
                  textAlignVertical="top"
                  editable={!savingEdit}
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={() => setEditingId(null)}
                  disabled={savingEdit}
                  style={styles.editBtn}
                >
                  <MaterialIcons name="close" size={16} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSaveEdit(comment)}
                  disabled={savingEdit || !editText.trim()}
                  style={[styles.editBtn, { backgroundColor: editText.trim() && !savingEdit ? PRIMARY : "#E5E7EB" }]}
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
              style={[styles.bubble, { backgroundColor: bubbleBg }]}
              onLongPress={() => isOwn && setActionComment(comment)}
              delayLongPress={400}
              activeOpacity={isOwn ? 0.7 : 1}
            >
              <View style={styles.bubbleHeader}>
                <Text style={styles.username}>{comment.user?.username || "Anonymous"}</Text>
                {isOwn && !isDeleting && (
                  <TouchableOpacity
                    onPress={() => setActionComment(comment)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginLeft: 8 }}
                  >
                    <MaterialIcons name="more-horiz" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                {isDeleting && <ActivityIndicator size="small" color="#9CA3AF" />}
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <View style={styles.commentMeta}>
              <Text style={styles.metaText}>{formatTimeAgo(comment.updated_at || comment.created_at)}</Text>
              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <Text style={[styles.metaText, { fontStyle: "italic" }]}>đã chỉnh sửa</Text>
              )}
              {canReply && (
                <TouchableOpacity
                  onPress={() => setReplyingTo(comment)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.replyBtn}>Trả lời</Text>
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

  const renderPostHeader = useCallback(() => {
    if (!recipe) return null;
    return (
      <View style={styles.headerCard}>
        <View style={styles.chefRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.chefAvatar}>
            {recipe.chef?.avatar_url ? (
              <Image source={{ uri: recipe.chef.avatar_url }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetterLg}>{recipe.chef?.username?.[0]?.toUpperCase() || "?"}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chefName}>{recipe.chef?.username || "Anonymous"}</Text>
            <Text style={styles.chefTime}>{formatTimeAgo(recipe.created_at)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/recipe/${recipeId}` as any)}
            style={styles.detailBtn}
          >
            <Text style={styles.detailBtnText}>Chi tiết</Text>
            <MaterialIcons name="open-in-new" size={12} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <Text style={styles.recipeTitle}>{recipe.title}</Text>

        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.recipeImage} resizeMode="cover" />
        ) : (
          <View style={[styles.recipeImage, styles.recipeImagePlaceholder]}>
            <MaterialIcons name="restaurant" size={48} color="#D1D5DB" />
          </View>
        )}

        {(likesCount > 0 || total > 0) && (
          <View style={styles.countsRow}>
            {likesCount > 0 ? (
              <View style={styles.likeCount}>
                <View style={styles.likeIcon}>
                  <MaterialIcons name="favorite" size={11} color="white" />
                </View>
                <Text style={styles.countText}>{likesCount}</Text>
              </View>
            ) : <View />}
            {total > 0 && <Text style={styles.countText}>{total} bình luận</Text>}
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <MaterialIcons
              name={isLiked ? "favorite" : "favorite-border"}
              size={26}
              color={isLiked ? "#DC2626" : "#4B5563"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="chat-bubble-outline" size={26} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>TẤT CẢ BÌNH LUẬN</Text>
        </View>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, isLiked, likesCount, total, handleLike]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerCenter}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
        </View>
      );
    }
    if (!hasMore) return <View style={{ height: 16 }} />;
    const remaining = total - comments.length;
    return (
      <View style={styles.footerCenter}>
        <View style={styles.loadMoreDivider}>
          <View style={styles.dividerLine} />
          <TouchableOpacity onPress={loadMoreComments} activeOpacity={0.7} style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>
              Xem thêm{remaining > 0 ? ` ${remaining}` : ""} bình luận
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color={PRIMARY} />
          </TouchableOpacity>
          <View style={styles.dividerLine} />
        </View>
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
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
              <View style={styles.emptyState}>
                <MaterialIcons name="chat-bubble-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Chưa có bình luận</Text>
                <Text style={styles.emptySubtitle}>Hãy là người đầu tiên!</Text>
              </View>
            }
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={21}
          />
        )}

        <View style={styles.inputArea}>
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialIcons name="reply" size={15} color="#3B82F6" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.replyingLabel}>Đang trả lời</Text>
                  <Text style={styles.replyingName} numberOfLines={1}>@{replyingTo.user.username}</Text>
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
          <View style={styles.inputRow}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={replyingTo ? `Trả lời @${replyingTo.user.username}...` : "Viết bình luận..."}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              style={styles.textInput}
              editable={!submitting}
              textAlignVertical="center"
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              style={[styles.sendBtn, { backgroundColor: commentText.trim() && !submitting ? PRIMARY : "#E5E7EB" }]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="send" size={20} color={commentText.trim() ? "white" : "#9CA3AF"} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={!!actionComment}
          transparent
          animationType="fade"
          onRequestClose={() => setActionComment(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setActionComment(null)}>
            <Pressable onPress={() => { }} style={styles.modalSheet}>
              <View style={styles.modalHandle}>
                <View style={styles.handleBar} />
              </View>
              <TouchableOpacity
                onPress={() => actionComment && handleStartEdit(actionComment)}
                activeOpacity={0.7}
                style={[styles.modalAction, styles.modalActionBorder]}
              >
                <MaterialIcons name="edit" size={20} color={PRIMARY} />
                <Text style={styles.modalActionText}>Chỉnh sửa bình luận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => actionComment && handleDeleteComment(actionComment)}
                activeOpacity={0.7}
                style={styles.modalAction}
              >
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                <Text style={[styles.modalActionText, { color: "#EF4444" }]}>Xóa bình luận</Text>
              </TouchableOpacity>
              <View style={styles.modalCancel}>
                <TouchableOpacity
                  onPress={() => setActionComment(null)}
                  activeOpacity={0.7}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  commentRow: { flexDirection: "row", gap: 8 },
  commentMargin: { marginBottom: 16 },
  replyIndent: { marginLeft: 32, marginTop: 6 },
  highlighted: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
  },
  threadLine: {
    position: "absolute",
    left: -18,
    top: 0,
    width: 14,
    height: 18,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "rgba(209,213,219,0.85)",
    borderBottomLeftRadius: 8,
  },

  avatar: { width: 32, height: 32, borderRadius: 16, overflow: "hidden", backgroundColor: "#E5E7EB", flexShrink: 0 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14 },
  avatarImg: { width: "100%", height: "100%" },
  avatarFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#D1D5DB" },
  avatarLetter: { fontSize: 11, fontWeight: "700", color: "#4B5563" },
  avatarLetterLg: { fontSize: 13, fontWeight: "700", color: "#4B5563" },

  commentBody: { flex: 1, minWidth: 0 },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, flex: 1 },
  editRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bubbleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  username: { fontSize: 12, fontWeight: "700", color: "#111827" },
  commentContent: { marginTop: 2, fontSize: 14, lineHeight: 20, color: "#1F2937" },

  editInput: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1F2937",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editActions: { flexDirection: "row", gap: 6, marginBottom: 2 },
  editBtn: { borderRadius: 99, padding: 6, backgroundColor: "#E5E7EB" },

  commentMeta: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 4 },
  metaText: { fontSize: 11, color: "#9CA3AF" },
  replyBtn: { fontSize: 11, fontWeight: "600", color: PRIMARY },

  headerCard: { marginBottom: 8, backgroundColor: "#fff", marginHorizontal: -12 },
  chefRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  chefAvatar: { width: 36, height: 36, borderRadius: 18, overflow: "hidden", backgroundColor: "#E5E7EB", marginRight: 10 },
  chefName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  chefTime: { fontSize: 12, color: "#9CA3AF" },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailBtnText: { fontSize: 12, fontWeight: "600", color: PRIMARY },
  recipeTitle: { paddingHorizontal: 16, paddingBottom: 8, fontSize: 15, fontWeight: "600", color: "#111827" },
  recipeImage: { width: "100%", aspectRatio: 4 / 3 },
  recipeImagePlaceholder: { backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },

  countsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  likeCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  countText: { fontSize: 13, color: "#6B7280" },

  actionRow: { flexDirection: "row", marginHorizontal: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },

  sectionLabel: { paddingHorizontal: 16, paddingBottom: 8 },
  sectionLabelText: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", letterSpacing: 0.8 },

  footerCenter: { paddingVertical: 16, paddingHorizontal: 16 },
  loadingMoreText: { marginTop: 6, fontSize: 12, color: "#9CA3AF" },
  loadMoreDivider: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  loadMoreText: { fontSize: 12, fontWeight: "600", color: PRIMARY },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  emptyTitle: { marginTop: 12, fontSize: 14, fontWeight: "600", color: "#111827" },
  emptySubtitle: { marginTop: 4, fontSize: 12, color: "#9CA3AF" },

  inputArea: { borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#fff" },
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyingLabel: { fontSize: 11, color: "#3B82F6", fontWeight: "500" },
  replyingName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  textInput: {
    flex: 1,
    maxHeight: 96,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  sendBtn: { borderRadius: 99, padding: 10 },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  modalHandle: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  handleBar: { width: 32, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB" },
  modalAction: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  modalActionBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalActionText: { fontSize: 15, fontWeight: "500", color: "#1F2937" },
  modalCancel: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  cancelBtn: { borderRadius: 16, backgroundColor: "#F3F4F6", alignItems: "center", paddingVertical: 14 },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
});
