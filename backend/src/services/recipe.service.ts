import { IRecipeRepository } from "../interfaces/repositories/recipe.repository";
import {
  Recipe,
  RecipeCreationAttributes,
  Like,
  Comment,
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
import { sequelize } from "../config/database";

export class RecipeService implements IRecipeService {
  constructor(private readonly recipeRepository: IRecipeRepository) {}

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
    console.log("Raw recipe data in toDTO:", raw);
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
    console.log("Creating recipe with data:", data);
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
  ): Promise<GetFeedResponse> {
    const { rows, count } = await this.recipeRepository.findAll(
      page,
      limit,
      category,
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
    userId?: number,
  ): Promise<RecipeResponse[]> {
    const recipes = await this.recipeRepository.search(query);
    return Promise.all(recipes.map((r) => this.toDTO(r, userId)));
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

  async getRecipeComments(recipeId: number): Promise<CommentResponse[]> {
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
    });

    const commentsData = await Promise.all(
      comments.map(async (comment: any) => {
        const replies = await Comment.findAll({
          where: { parent_comment_id: comment.id },
          include: [
            {
              model: sequelize.models.User,
              as: "user",
              attributes: ["id", "username", "avatar_url"],
            },
          ],
          order: [["created_at", "ASC"]],
        });

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
          replies: replies.map((r: any) => ({
            id: r.id,
            content: r.content,
            user: {
              id: r.user.id,
              username: r.user.username,
              avatar_url: r.user.avatar_url,
            },
            parent_comment_id: r.parent_comment_id,
            created_at: r.created_at,
          })),
        };
      }),
    );

    return commentsData;
  }
}
