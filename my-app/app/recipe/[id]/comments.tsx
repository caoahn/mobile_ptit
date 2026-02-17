import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Comment } from "@/src/features/recipe/types/recipe.types";
import { getRecipeComments, createComment } from "@/src/features/recipe/services/recipeService";

const COMMENTS_PER_PAGE = 10;

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipeId = parseInt(id);

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
    loadComments(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const loadComments = async (pageNum: number, refresh: boolean = false) => {
    try {
      if (refresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await getRecipeComments(recipeId, pageNum, COMMENTS_PER_PAGE);

      if (refresh) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }

      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load comments:", error);
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await createComment(recipeId, commentText.trim(), replyingTo?.id);

      // Refresh comments from page 1
      await loadComments(1, true);
      setCommentText("");
      setReplyingTo(null);
    } catch (error: any) {
      console.error("Failed to create comment:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadComments(page + 1, false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <View
      key={comment.id}
      className={`${isReply ? "ml-12 mt-2" : "mb-4"} flex-row gap-3`}
    >
      <View className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
        {comment.user?.avatar_url ? (
          <Image
            source={{ uri: comment.user.avatar_url }}
            className="h-full w-full"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-300">
            <Text className="text-xs font-bold text-gray-600">
              {comment.user?.username?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        <View className="rounded-2xl bg-gray-100 px-4 py-2">
          <Text className="text-xs font-bold">
            {comment.user?.username || "Anonymous"}
          </Text>
          <Text className="mt-1 text-sm leading-relaxed">{comment.content}</Text>
        </View>
        <View className="mt-1 flex-row items-center gap-4 px-2">
          <Text className="text-xs text-gray-500">
            {formatTimeAgo(comment.created_at)}
          </Text>
          {!isReply && (
            <TouchableOpacity onPress={() => setReplyingTo(comment)}>
              <Text className="text-xs font-semibold text-gray-700">Reply</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Render replies */}
        {!isReply &&
          comment.replies &&
          comment.replies.map((reply) => renderComment(reply, true))}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="items-center py-4">
          <ActivityIndicator size="small" color="#29a38f" />
        </View>
      );
    }

    if (!hasMore) return null;

    return (
      <View className="items-center py-4">
        <TouchableOpacity
          onPress={handleLoadMore}
          className="rounded-lg bg-gray-100 px-6 py-3"
        >
          <Text className="text-sm font-semibold text-gray-700">
            Load more comments ({total - comments.length} remaining)
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
        {/* Header */}
        <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-bold">Comments</Text>
          {total > 0 && (
            <Text className="text-sm text-gray-500">
              {total} {total === 1 ? "comment" : "comments"}
            </Text>
          )}
        </View>

        {/* Comments List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#29a38f" />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderComment(item)}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <MaterialIcons name="chat-bubble-outline" size={64} color="#D1D5DB" />
                <Text className="mt-4 text-base font-semibold text-gray-700">No comments yet</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Be the first to comment!
                </Text>
              </View>
            }
            ListFooterComponent={renderFooter}
          />
        )}

        {/* Input Area - Fixed at bottom */}
        <View className="border-t border-gray-200 bg-white">
          {replyingTo && (
            <View className="flex-row items-center justify-between bg-gray-50 px-4 py-2">
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Replying to</Text>
                <Text className="text-sm font-semibold text-gray-700">
                  @{replyingTo.user.username}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <MaterialIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-end gap-2 px-4 py-3">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={
                replyingTo ? `Reply to @${replyingTo.user.username}...` : "Add a comment..."
              }
              multiline
              maxLength={500}
              className="max-h-24 flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm"
              editable={!submitting}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className={`rounded-full p-2.5 ${commentText.trim() && !submitting ? "bg-primary" : "bg-gray-200"
                }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons
                  name="send"
                  size={20}
                  color={commentText.trim() ? "white" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
