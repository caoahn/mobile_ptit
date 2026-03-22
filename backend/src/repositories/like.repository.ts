import { Op } from "sequelize";
import { Like, Follow, User } from "../models/index";
import { SavedRecipe } from "../models/saved_recipe.model";
import { ILikeRepository } from "../interfaces/repositories/like.repository";

export class LikeRepository implements ILikeRepository {
  async countByRecipeId(recipeId: number): Promise<number> {
    return Like.count({ where: { recipe_id: recipeId } });
  }

  async findByUserAndRecipe(
    userId: number,
    recipeId: number,
  ): Promise<Like | null> {
    return Like.findOne({ where: { user_id: userId, recipe_id: recipeId } });
  }

  async getLikesByRecipe(recipeId: number): Promise<Like[]> {
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

  async findFollowingIds(
    followerId: number,
    targetIds: number[],
  ): Promise<number[]> {
    if (targetIds.length === 0) return [];
    const follows = await Follow.findAll({
      where: {
        follower_id: followerId,
        following_id: { [Op.in]: targetIds },
      },
      attributes: ["following_id"],
    });
    return follows.map((f) => f.following_id);
  }

  async isSaved(userId: number, recipeId: number): Promise<boolean> {
    const saved = await SavedRecipe.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });
    return !!saved;
  }
}
