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
import { QueryTypes, Op } from "sequelize";

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
          duration: step.duration,
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
    time?: string,
    sort?: string,
  ): Promise<{ rows: Recipe[]; count: number }> {
    const whereClause: any = {};

    if (category) {
      const categoryList = category.split(",");
      whereClause.category = { [Op.in]: categoryList };
    }

    if (time) {
      if (time === "under_15") whereClause.cook_time = { [Op.lt]: 15 };
      else if (time === "15_to_30")
        whereClause.cook_time = { [Op.between]: [15, 30] };
      else if (time === "30_to_60")
        whereClause.cook_time = { [Op.between]: [30, 60] };
      else if (time === "over_60") whereClause.cook_time = { [Op.gt]: 60 };
    }

    let orderClause: any = [["created_at", "DESC"]];
    if (sort === "oldest") {
      orderClause = [["created_at", "ASC"]];
    } else if (sort === "most_liked") {
      orderClause = [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.recipe_id = Recipe.id)",
          ),
          "DESC",
        ],
      ];
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
      order: orderClause,
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

  async replaceIngredients(
    recipeId: number,
    ingredients: any[],
  ): Promise<void> {
    const existingIngredients = await Ingredient.findAll({
      where: { recipe_id: recipeId },
    });
    const incomingIngredientIds = ingredients
      .map((ing) => ing.id)
      .filter((id) => id !== undefined);

    const ingredientIdsToDelete = existingIngredients
      .map((ing) => (ing as any).id)
      .filter((id) => !incomingIngredientIds.includes(id));

    if (ingredientIdsToDelete.length > 0) {
      await Ingredient.destroy({
        where: { id: ingredientIdsToDelete, recipe_id: recipeId },
      });
    }

    for (const ing of ingredients) {
      if (ing.id) {
        await Ingredient.update(
          { name: ing.name, amount: ing.amount, unit: ing.unit },
          { where: { id: ing.id, recipe_id: recipeId } },
        );
      } else {
        await Ingredient.create({
          recipe_id: recipeId,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        } as any);
      }
    }
  }

  async replaceSteps(recipeId: number, steps: any[]): Promise<void> {
    const existingSteps = await RecipeStep.findAll({
      where: { recipe_id: recipeId },
    });
    const incomingStepIds = steps
      .map((step) => step.id)
      .filter((id) => id !== undefined);

    const stepIdsToDelete = existingSteps
      .map((step) => (step as any).id)
      .filter((id) => !incomingStepIds.includes(id));

    if (stepIdsToDelete.length > 0) {
      await RecipeStep.destroy({
        where: { id: stepIdsToDelete, recipe_id: recipeId },
      });
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.id) {
        await RecipeStep.update(
          {
            step_number: step.order || step.step_number || i + 1,
            title: step.title,
            description: step.description,
            image_url: step.image_url,
            duration: step.duration,
          },
          { where: { id: step.id, recipe_id: recipeId } },
        );
      } else {
        await RecipeStep.create({
          recipe_id: recipeId,
          step_number: step.order || step.step_number || i + 1,
          title: step.title,
          description: step.description,
          image_url: step.image_url,
          duration: step.duration,
        } as any);
      }
    }
  }

  async replaceTags(recipeId: number, tags: string[]): Promise<void> {
    await RecipeTag.destroy({ where: { recipe_id: recipeId } });

    if (tags && tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map((tagName) => findOrCreateTag(tagName)),
      );
      const recipeTagData = tagInstances.map((tag) => ({
        recipe_id: recipeId,
        tag_id: tag.id,
      }));
      await RecipeTag.bulkCreate(recipeTagData);
    }
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ rows: Recipe[]; count: number }> {
    // Split query into individual terms (comma or comma+space separated)
    const terms = query
      .split(/[,，]\s*/)
      .map((t) => t.trim())
      .filter(Boolean);

    // For each term, find matching recipe IDs via ingredients and track match count
    const ingredientMatchCount = new Map<number, number>();

    for (const term of terms) {
      const matches = await Ingredient.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ["recipe_id"],
        group: ["recipe_id"],
      });
      matches.forEach((i: any) => {
        const rid = i.recipe_id as number;
        ingredientMatchCount.set(rid, (ingredientMatchCount.get(rid) ?? 0) + 1);
      });
    }

    const ingredientRecipeIds = [...ingredientMatchCount.keys()];

    // WHERE: any term matches title OR description OR ingredient
    const titleDescConditions = terms.map((term) => ({
      [Op.or]: [
        { title: { [Op.like]: `%${term}%` } },
        { description: { [Op.like]: `%${term}%` } },
      ],
    }));

    const whereClause: any = {
      [Op.or]: [
        ...titleDescConditions,
        ...(ingredientRecipeIds.length > 0
          ? [{ id: { [Op.in]: ingredientRecipeIds } }]
          : []),
      ],
    };

    const { rows, count } = await Recipe.findAndCountAll({
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

    // Sort: recipes matching more ingredients rank higher
    const sortedRows = [...rows].sort((a, b) => {
      const scoreA = ingredientMatchCount.get(a.id) ?? 0;
      const scoreB = ingredientMatchCount.get(b.id) ?? 0;
      return scoreB - scoreA;
    });

    return { rows: sortedRows, count };
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
