import { IRecipeRepository } from "../interfaces/repositories/recipe.repository";
import { ICommentRepository } from "../interfaces/repositories/comment.repository";
import { ILikeRepository } from "../interfaces/repositories/like.repository";
import { Recipe, RecipeCreationAttributes } from "../models/index";
import { IRecipeService } from "../interfaces/services/recipe.service";
import { CreateRecipeRequest } from "../dto/recipe/create-recipe.request";
import {
  RecipeResponse,
  RecipeFeedItemResponse,
  CommentResponse,
} from "../dto/recipe/recipe.response";
import { GetFeedResponse } from "../dto/recipe/feed.response";
import { GetCommentsResponse } from "../dto/recipe/comments.response";
import {
  GetRecipeLikesResponse,
  RecipeLikeUserResponse,
} from "../dto/recipe/likes.response";
import { INotificationService } from "../interfaces/services/notification.service";

export class RecipeService implements IRecipeService {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly notificationService: INotificationService,
    private readonly commentRepository: ICommentRepository,
    private readonly likeRepository: ILikeRepository,
  ) {}

  private async getRecipeCounts(
    recipeId: number,
  ): Promise<{ likes_count: number; comments_count: number }> {
    const [likes_count, comments_count] = await Promise.all([
      this.likeRepository.countByRecipeId(recipeId),
      this.commentRepository.countByRecipeId(recipeId),
    ]);
    return { likes_count, comments_count };
  }

  private async checkUserInteractions(
    userId: number,
    recipeId: number,
  ): Promise<{ is_liked: boolean; is_saved: boolean }> {
    const [like, saved] = await Promise.all([
      this.likeRepository.findByUserAndRecipe(userId, recipeId),
      this.likeRepository.isSaved(userId, recipeId),
    ]);
    return {
      is_liked: !!like,
      is_saved: saved,
    };
  }

  private async toDTO(
    recipe: Recipe,
    userId?: number,
  ): Promise<RecipeResponse> {
    const raw = recipe.toJSON() as any;
    const counts = await this.getRecipeCounts(recipe.id);
    const interactions = userId
      ? await this.checkUserInteractions(userId, recipe.id)
      : { is_liked: false, is_saved: false };

    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      image_url: raw.image_url,
      difficulty: raw.difficulty,
      cook_time: raw.cook_time,
      servings: raw.servings,
      chef: raw.chef
        ? {
            id: raw.chef.id,
            username: raw.chef.username,
            avatar_url: raw.chef.avatar_url,
          }
        : undefined,
      ingredients: raw.ingredients
        ? raw.ingredients.map((i: any) => ({
            id: i.id,
            name: i.name,
            amount: i.amount,
            unit: i.unit,
          }))
        : [],
      steps: raw.steps
        ? raw.steps.map((s: any) => ({
            id: s.id,
            order: s.step_number,
            description: s.description,
            image_url: s.image_url,
            duration: s.duration,
          }))
        : [],
      tags: raw.tags
        ? raw.tags.map((t: any) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
          }))
        : [],
      likes_count: counts.likes_count,
      comments_count: counts.comments_count,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      is_liked: interactions.is_liked,
      is_saved: interactions.is_saved,
    };
  }

  private async toFeedItemDTO(
    recipe: Recipe,
    userId?: number,
  ): Promise<RecipeFeedItemResponse> {
    const raw = recipe.toJSON() as any;
    const counts = await this.getRecipeCounts(recipe.id);
    const interactions = userId
      ? await this.checkUserInteractions(userId, recipe.id)
      : { is_liked: false, is_saved: false };

    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      image_url: raw.image_url,
      cook_time: raw.cook_time || 0,
      chef: raw.chef
        ? {
            id: raw.chef.id,
            username: raw.chef.username,
            avatar_url: raw.chef.avatar_url,
          }
        : undefined,
      tags: raw.tags
        ? raw.tags.map((t: any) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
          }))
        : [],
      likes_count: counts.likes_count,
      comments_count: counts.comments_count,
      created_at: raw.created_at,
      is_liked: interactions.is_liked,
      is_saved: interactions.is_saved,
    };
  }

  async createRecipe(
    userId: number,
    data: CreateRecipeRequest,
  ): Promise<RecipeResponse> {
    const { ingredients, steps, tags, ...recipeData } = data;
    const newRecipe: RecipeCreationAttributes = {
      ...recipeData,
      user_id: userId,
    };

    const created = await this.recipeRepository.create(
      newRecipe,
      ingredients,
      steps,
      tags,
    );
    return this.toDTO(created, userId);
  }

  async getFeed(
    page: number,
    limit: number,
    category?: string,
    userId?: number,
    time?: string,
    sort?: string
  ): Promise<GetFeedResponse> {
    const { rows, count } = await this.recipeRepository.findAll(
      page,
      limit,
      category,
      time,
      sort
    );

    const recipes = await Promise.all(
      rows.map((r) => this.toFeedItemDTO(r, userId)),
    );

    return {
      recipes,
      total: count,
      page,
      limit,
      hasMore: page * limit < count,
    };
  }

  async getRecipeDetail(
    id: number,
    userId?: number,
  ): Promise<RecipeResponse | null> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) return null;

    return this.toDTO(recipe, userId);
  }

  async searchRecipes(
    query: string,
    page: number = 1,
    limit: number = 10,
    userId?: number,
  ): Promise<GetFeedResponse> {
    const { rows, count } = await this.recipeRepository.search(
      query,
      page,
      limit,
    );

    const recipes = await Promise.all(
      rows.map((r) => this.toFeedItemDTO(r, userId)),
    );

    return {
      recipes,
      total: count,
      page,
      limit,
      hasMore: page * limit < count,
    };
  }

  async getUserRecipes(
    userId: number,
    requestUserId?: number,
  ): Promise<RecipeResponse[]> {
    const recipes = await this.recipeRepository.findByUserId(userId);
    return Promise.all(recipes.map((r) => this.toDTO(r, requestUserId)));
  }

  async getFollowingFeed(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<GetFeedResponse> {
    const { rows, count } = await this.recipeRepository.getFollowingFeed(
      userId,
      page,
      limit,
    );

    const recipes = await Promise.all(
      rows.map((r) => this.toFeedItemDTO(r, userId)),
    );

    return {
      recipes,
      total: count,
      page,
      limit,
      hasMore: page * limit < count,
    };
  }

  async toggleLike(userId: number, recipeId: number): Promise<boolean> {
    try {
      await this.recipeRepository.likeRecipe(userId, recipeId);

      // TẠO NOTIFICATION KHI LIKE
      const recipe = await this.recipeRepository.findById(recipeId);
      if (recipe) {
        await this.notificationService.createNotification(
          recipe.user_id, // Người nhận (chủ bài viết)
          "like",
          userId, // Người thực hiện (người like)
          recipeId,
        );
      }

      return true;
    } catch (e) {
      await this.recipeRepository.unlikeRecipe(userId, recipeId);
      return false;
    }
  }

  async toggleSave(userId: number, recipeId: number): Promise<boolean> {
    try {
      await this.recipeRepository.saveRecipe(userId, recipeId);
      return true;
    } catch (e) {
      await this.recipeRepository.unsaveRecipe(userId, recipeId);
      return false;
    }
  }

  async getSavedRecipes(userId: number): Promise<RecipeResponse[]> {
    const recipes = await this.recipeRepository.getSavedRecipes(userId);
    return Promise.all(recipes.map((r) => this.toDTO(r, userId)));
  }

  async getRecipeLikes(
    recipeId: number,
    requestUserId?: number,
  ): Promise<GetRecipeLikesResponse> {
    const likes = await this.likeRepository.getLikesByRecipe(recipeId);
    const rawLikes = likes.map((like) => like.toJSON() as any);
    const likerIds = rawLikes
      .map((like) => like.user?.id)
      .filter((id): id is number => typeof id === "number");

    let followingIds = new Set<number>();
    if (requestUserId && likerIds.length > 0) {
      const ids = await this.likeRepository.findFollowingIds(
        requestUserId,
        likerIds,
      );
      followingIds = new Set(ids);
    }

    const users: RecipeLikeUserResponse[] = rawLikes
      .filter((like) => like.user)
      .map((like) => {
        const user = like.user;
        return {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          is_following: requestUserId ? followingIds.has(user.id) : false,
          is_current_user: requestUserId === user.id,
        };
      });

    return { users, total: users.length };
  }

  async getRecipeComments(
    recipeId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<GetCommentsResponse> {
    const { rows: comments, count: total } =
      await this.commentRepository.findParentComments(recipeId, page, limit);

    const fetchReplies = async (
      parentId: number,
      currentDepth: number = 0,
    ): Promise<any[]> => {
      if (currentDepth >= 2) return [];
      const replies = await this.commentRepository.findReplies(parentId);
      return Promise.all(
        replies.map(async (r: any) => {
          const nestedReplies = await fetchReplies(r.id, currentDepth + 1);
          const raw = r.toJSON() as any;
          return {
            id: raw.id,
            content: raw.content,
            user: {
              id: raw.user.id,
              username: raw.user.username,
              avatar_url: raw.user.avatar_url,
            },
            parent_comment_id: raw.parent_comment_id,
            created_at: raw.created_at,
            updated_at: raw.updated_at,
            replies: nestedReplies,
          };
        }),
      );
    };

    const commentsData = await Promise.all(
      comments.map(async (comment: any) => {
        const raw = comment.toJSON() as any;
        const replies = await fetchReplies(comment.id, 0);
        return {
          id: raw.id,
          content: raw.content,
          user: {
            id: raw.user.id,
            username: raw.user.username,
            avatar_url: raw.user.avatar_url,
          },
          parent_comment_id: raw.parent_comment_id,
          created_at: raw.created_at,
          updated_at: raw.updated_at,
          replies,
        };
      }),
    );

    return {
      comments: commentsData,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async createComment(
    userId: number,
    recipeId: number,
    data: { content: string; parent_comment_id?: number },
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.create({
      user_id: userId,
      recipe_id: recipeId,
      content: data.content,
      parent_comment_id: data.parent_comment_id,
    });

    // Notification cho chủ bài viết
    const recipe = await this.recipeRepository.findById(recipeId);
    if (recipe) {
      await this.notificationService.createNotification(
        recipe.user_id,
        "comment",
        userId,
        recipeId,
        comment.id,
      );
    }

    // Nếu là reply: notification cho người được reply
    if (data.parent_comment_id) {
      const parentComment = await this.commentRepository.findById(
        data.parent_comment_id,
      );
      if (
        parentComment &&
        parentComment.user_id !== userId &&
        parentComment.user_id !== recipe?.user_id
      ) {
        await this.notificationService.createNotification(
          parentComment.user_id,
          "comment",
          userId,
          recipeId,
          comment.id,
        );
      }
    }

    const commentWithUser = await this.commentRepository.findById(comment.id);
    const raw = commentWithUser?.toJSON() as any;

    return {
      id: raw.id,
      content: raw.content,
      user: {
        id: raw.user.id,
        username: raw.user.username,
        avatar_url: raw.user.avatar_url,
      },
      parent_comment_id: raw.parent_comment_id,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      replies: [],
    };
  }

  async updateComment(
    userId: number,
    commentId: number,
    content: string,
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw { statusCode: 404, message: "Comment not found" };
    if (comment.user_id !== userId)
      throw {
        statusCode: 403,
        message: "Không có quyền chỉnh sửa bình luận này",
      };

    const updated = await this.commentRepository.update(commentId, content);
    const raw = updated?.toJSON() as any;
    return {
      id: raw.id,
      content: raw.content,
      user: {
        id: raw.user.id,
        username: raw.user.username,
        avatar_url: raw.user.avatar_url,
      },
      parent_comment_id: raw.parent_comment_id,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      replies: [],
    };
  }

  async deleteComment(userId: number, commentId: number): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw { statusCode: 404, message: "Comment not found" };
    if (comment.user_id !== userId)
      throw { statusCode: 403, message: "Không có quyền xóa bình luận này" };
    await this.commentRepository.delete(commentId);
  }
}
