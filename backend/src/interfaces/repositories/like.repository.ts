import { Like } from "../../models/index";
import { Follow } from "../../models/index";

export interface ILikeRepository {
  countByRecipeId(recipeId: number): Promise<number>;
  findByUserAndRecipe(userId: number, recipeId: number): Promise<Like | null>;
  getLikesByRecipe(recipeId: number): Promise<Like[]>;
  findFollowingIds(followerId: number, targetIds: number[]): Promise<number[]>;
  isSaved(userId: number, recipeId: number): Promise<boolean>;
}
