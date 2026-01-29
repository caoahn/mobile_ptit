import { User } from "./user.model";
import { Recipe } from "./recipe.model";
import { Ingredient } from "./ingredient.model";
import { RecipeStep } from "./recipe_step.model";
import { Like } from "./like.model";
import { SavedRecipe } from "./saved_recipe.model";
import { Follow } from "./follow.model";

// User <-> Recipe
User.hasMany(Recipe, { foreignKey: "user_id", as: "recipes" });
Recipe.belongsTo(User, { foreignKey: "user_id", as: "chef" });

// Recipe <-> Ingredient
Recipe.hasMany(Ingredient, { foreignKey: "recipe_id", as: "ingredients" });
Ingredient.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

// Recipe <-> RecipeStep
Recipe.hasMany(RecipeStep, { foreignKey: "recipe_id", as: "steps" });
RecipeStep.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

// Like
User.hasMany(Like, { foreignKey: "user_id", as: "likes" });
Recipe.hasMany(Like, { foreignKey: "recipe_id", as: "likes" });
Like.belongsTo(User, { foreignKey: "user_id", as: "user" });
Like.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

// SavedRecipe
User.hasMany(SavedRecipe, { foreignKey: "user_id", as: "saved_recipes" });
Recipe.hasMany(SavedRecipe, { foreignKey: "recipe_id", as: "saved_by_users" });
SavedRecipe.belongsTo(User, { foreignKey: "user_id", as: "user" });
SavedRecipe.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

// Follow
User.hasMany(Follow, { foreignKey: "follower_id", as: "following" });
User.hasMany(Follow, { foreignKey: "following_id", as: "followers" });
Follow.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
Follow.belongsTo(User, { foreignKey: "following_id", as: "following_user" });

export * from "./user.model";
export * from "./recipe.model";
export * from "./ingredient.model";
export * from "./recipe_step.model";
export * from "./like.model";
export * from "./saved_recipe.model";
export * from "./follow.model";
