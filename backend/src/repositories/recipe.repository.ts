import {
  Recipe,
  RecipeAttributes,
  RecipeCreationAttributes,
  Ingredient,
  RecipeStep,
  Like,
  SavedRecipe,
  User,
  Comment,
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
    await Recipe.destroy({ where: { id } });
  }

  async search(query: string): Promise<Recipe[]> {
    // Need Op from sequelize
    const { Op } = require("sequelize");
    return Recipe.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "username", "avatar_url"],
        },
        { model: Tag, as: "tags", attributes: ["id", "name", "slug"] },
      ],
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

  async likeRecipe(userId: number, recipeId: number): Promise<void> {
    await Like.create({ user_id: userId, recipe_id: recipeId });
  }

  async unlikeRecipe(userId: number, recipeId: number): Promise<void> {
    await Like.destroy({ where: { user_id: userId, recipe_id: recipeId } });
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
