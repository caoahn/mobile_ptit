import {
  Recipe,
  RecipeAttributes,
  RecipeCreationAttributes,
  Ingredient,
  RecipeStep,
  Like,
  SavedRecipe,
  User,
  Follow,
} from "../models/index";
import { Tag, RecipeTag } from "../models/tag.model";
import { findOrCreateTag } from "../helpers/tag";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

import { IRecipeRepository } from "../interfaces/repositories/recipe.repository";

export class RecipeRepository implements IRecipeRepository {
  async create(
    data: RecipeCreationAttributes,
    ingredients: any[],
    steps: any[],
    tags?: string[],
  ): Promise<Recipe> {
    const transaction = await sequelize.transaction();

    try {
      // Create recipe
      const recipe = await Recipe.create(data, { transaction });

      // Create ingredients
      if (ingredients && ingredients.length > 0) {
        const ingredientData = ingredients.map((ing) => ({
          ...ing,
          recipe_id: recipe.id,
        }));
        await Ingredient.bulkCreate(ingredientData, { transaction });
      }

      // Create steps
      if (steps && steps.length > 0) {
        const stepData = steps.map((step) => ({
          recipe_id: recipe.id,
          step_number: step.order,
          description: step.description,
          image_url: step.image_url,
        }));
        await RecipeStep.bulkCreate(stepData, { transaction });
      }

      // Create or find tags and create recipe_tags relations
      if (tags && tags.length > 0) {
        const tagInstances = await Promise.all(
          tags.map((tagName) => findOrCreateTag(tagName, transaction)),
        );
        const recipeTagData = tagInstances.map((tag) => ({
          recipe_id: recipe.id,
          tag_id: tag.id,
        }));
        await RecipeTag.bulkCreate(recipeTagData, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      return this.findById(recipe.id) as Promise<Recipe>;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
  ): Promise<{ rows: Recipe[]; count: number }> {
    const whereClause: any = {};
    if (category) {
      whereClause.category = category;
    }

    return Recipe.findAndCountAll({
      where: whereClause,
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "username", "avatar_url"],
        },
        { model: Ingredient, as: "ingredients" },
        { model: RecipeStep, as: "steps" },
        { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    });
  }

  async findById(id: number): Promise<Recipe | null> {
    return Recipe.findByPk(id, {
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "username", "avatar_url"],
        },
        { model: Ingredient, as: "ingredients" },
        { model: RecipeStep, as: "steps" },
        { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
      ],
    });
  }

  async update(
    id: number,
    data: Partial<RecipeAttributes>,
  ): Promise<Recipe | null> {
    await Recipe.update(data, { where: { id } });
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await Promise.all([
      RecipeStep.destroy({ where: { recipe_id: id } }),
      Ingredient.destroy({ where: { recipe_id: id } }),
    ]);
    await Recipe.destroy({ where: { id } });
  }

  async replaceSteps(
    recipeId: number,
    steps: {
      recipe_id: number;
      step_number: number;
      title?: string;
      description?: string;
      image_url?: string;
    }[],
  ): Promise<void> {
    await RecipeStep.destroy({ where: { recipe_id: recipeId } });
    if (steps.length > 0) {
      await RecipeStep.bulkCreate(steps);
    }
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ rows: Recipe[]; count: number }> {
    const { Op } = require("sequelize");
    const likeQuery = `%${query}%`;

    // Tìm các recipe_id có nguyên liệu khớp với query
    const ingredientMatches = await Ingredient.findAll({
      where: { name: { [Op.like]: likeQuery } },
      attributes: ["recipe_id"],
      group: ["recipe_id"],
    });
    const ingredientRecipeIds = ingredientMatches.map(
      (i: any) => i.recipe_id as number,
    );

    // WHERE: tên công thức OR mô tả OR có nguyên liệu khớp
    const whereClause: any = {
      [Op.or]: [
        { title: { [Op.like]: likeQuery } },
        { description: { [Op.like]: likeQuery } },
        ...(ingredientRecipeIds.length > 0
          ? [{ id: { [Op.in]: ingredientRecipeIds } }]
          : []),
      ],
    };

    return Recipe.findAndCountAll({
      where: whereClause,
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "username", "avatar_url"],
        },
        { model: Ingredient, as: "ingredients" },
        { model: RecipeStep, as: "steps" },
        { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    });
  }

  async findByUserId(userId: number): Promise<Recipe[]> {
    return Recipe.findAll({
      where: { user_id: userId },
      include: [
        { model: Ingredient, as: "ingredients" },
        { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async getFollowingFeed(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ rows: Recipe[]; count: number }> {
    // Get list of users that current user is following
    const following = await Follow.findAll({
      where: { follower_id: userId },
      attributes: ["following_id"],
    });

    const followingIds = following.map((f: any) => f.following_id);

    // If not following anyone, return empty result
    if (followingIds.length === 0) {
      return { rows: [], count: 0 };
    }

    // Get recipes from followed users
    return Recipe.findAndCountAll({
      where: { user_id: followingIds },
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "username", "avatar_url"],
        },
        { model: Ingredient, as: "ingredients" },
        { model: RecipeStep, as: "steps" },
        { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    });
  }

  async likeRecipe(userId: number, recipeId: number): Promise<void> {
    await Like.create({ user_id: userId, recipe_id: recipeId });
  }

  async unlikeRecipe(userId: number, recipeId: number): Promise<void> {
    await Like.destroy({ where: { user_id: userId, recipe_id: recipeId } });
  }

  async getRecipeLikes(recipeId: number): Promise<Like[]> {
    return Like.findAll({
      where: { recipe_id: recipeId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "full_name", "avatar_url"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async saveRecipe(userId: number, recipeId: number): Promise<void> {
    await SavedRecipe.create({ user_id: userId, recipe_id: recipeId });
  }

  async unsaveRecipe(userId: number, recipeId: number): Promise<void> {
    await SavedRecipe.destroy({
      where: { user_id: userId, recipe_id: recipeId },
    });
  }

  async getSavedRecipes(userId: number): Promise<Recipe[]> {
    const saved = await SavedRecipe.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Recipe,
          as: "recipe",
          include: [
            {
              model: User,
              as: "chef",
              attributes: ["id", "username", "avatar_url"],
            },
            { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
          ],
        },
      ],
    });
    return saved.map((s: any) => s.recipe);
  }
}
