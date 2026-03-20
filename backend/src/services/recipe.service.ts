import { IRecipeRepository } from "../interfaces/repositories/recipe.repository";
import {
  Recipe,
  RecipeCreationAttributes,
  Like,
  Comment,
  Follow,
} from "../models/index";
import { IRecipeService } from "../interfaces/services/recipe.service";
import { CreateRecipeRequest } from "../dto/recipe/create-recipe.request";
import { Op } from "sequelize";
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
import { sequelize } from "../config/database";
import { INotificationService } from "../interfaces/services/notification.service";

export class RecipeService implements IRecipeService {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly notificationService: INotificationService,
  ) {}

  private async getRecipeCounts(
    recipeId: number,
  ): Promise<{ likes_count: number; comments_count: number }> {
    const [likes_count, comments_count] = await Promise.all([
      Like.count({ where: { recipe_id: recipeId } }),
      Comment.count({ where: { recipe_id: recipeId } }),
    ]);
    return { likes_count, comments_count };
  }

  private async checkUserInteractions(
    userId: number,
    recipeId: number,
  ): Promise<{ is_liked: boolean; is_saved: boolean }> {
    const [like, saved] = await Promise.all([
      Like.findOne({ where: { user_id: userId, recipe_id: recipeId } }),
      sequelize.models.SavedRecipe.findOne({
        where: { user_id: userId, recipe_id: recipeId },
      }),
    ]);
    return {
      is_liked: !!like,
      is_saved: !!saved,
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
    const likes = await this.recipeRepository.getRecipeLikes(recipeId);
    const rawLikes = likes.map((like) => like.toJSON() as any);
    const likerIds = rawLikes
      .map((like) => like.user?.id)
      .filter((id): id is number => typeof id === "number");

    let followingIds = new Set<number>();
    if (requestUserId && likerIds.length > 0) {
      const follows = await Follow.findAll({
        where: {
          follower_id: requestUserId,
          following_id: { [Op.in]: likerIds },
        },
        attributes: ["following_id"],
      });

      followingIds = new Set(follows.map((follow) => follow.following_id));
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

    return {
      users,
      total: users.length,
    };
  }

  async getRecipeComments(
    recipeId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<GetCommentsResponse> {
    // Get total count of parent comments
    const total = await Comment.count({
      where: {
        recipe_id: recipeId,
        parent_comment_id: { [Op.is]: null },
      } as any,
    });

    // Get paginated parent comments
    const comments = await Comment.findAll({
      where: {
        recipe_id: recipeId,
        parent_comment_id: { [Op.is]: null },
      } as any,
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: ["id", "username", "avatar_url"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    // Helper function to fetch replies recursively (max 3 levels: 0, 1, 2)
    const fetchReplies = async (
      parentId: number,
      currentDepth: number = 0,
    ): Promise<any[]> => {
      const maxDepth = 2;
      if (currentDepth >= maxDepth) {
        return [];
      }

      const replies = await Comment.findAll({
        where: { parent_comment_id: parentId },
        include: [
          {
            model: sequelize.models.User,
            as: "user",
            attributes: ["id", "username", "avatar_url"],
          },
        ],
        order: [["created_at", "ASC"]],
      });

      return Promise.all(
        replies.map(async (r: any) => {
          const nestedReplies = await fetchReplies(r.id, currentDepth + 1);
          return {
            id: r.id,
            content: r.content,
            user: {
              id: r.user.id,
              username: r.user.username,
              avatar_url: r.user.avatar_url,
            },
            parent_comment_id: r.parent_comment_id,
            created_at: r.created_at,
            replies: nestedReplies,
          };
        }),
      );
    };

    // Get replies for each parent comment
    const commentsData = await Promise.all(
      comments.map(async (comment: any) => {
        const replies = await fetchReplies(comment.id, 0);

        return {
          id: comment.id,
          content: comment.content,
          user: {
            id: comment.user.id,
            username: comment.user.username,
            avatar_url: comment.user.avatar_url,
          },
          parent_comment_id: comment.parent_comment_id,
          created_at: comment.created_at,
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
    const comment = await Comment.create({
      user_id: userId,
      recipe_id: recipeId,
      content: data.content,
      parent_comment_id: data.parent_comment_id,
    });

    // TẠO NOTIFICATION KHI COMMENT
    const recipe = await this.recipeRepository.findById(recipeId);
    if (recipe) {
      // Notification cho chủ bài viết
      await this.notificationService.createNotification(
        recipe.user_id, // Người nhận
        "comment",
        userId, // Người comment
        recipeId,
        comment.id,
      );
    }

    // NẾU LÀ REPLY: Tạo notification cho người được reply
    if (data.parent_comment_id) {
      const parentComment = await Comment.findByPk(data.parent_comment_id);
      if (parentComment) {
        // Chỉ tạo notification nếu người được reply khác với:
        // - userId (người reply - tránh tự thông báo cho mình)
        // - recipe.user_id (đã có notification rồi - tránh duplicate)
        if (
          parentComment.user_id !== userId &&
          parentComment.user_id !== recipe?.user_id
        ) {
          await this.notificationService.createNotification(
            parentComment.user_id, // Người nhận (owner của parent comment)
            "comment",
            userId, // Người reply
            recipeId,
            comment.id,
          );
        }
      }
    }

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: ["id", "username", "avatar_url"],
        },
      ],
    });

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
      replies: [],
    };
  }
}
