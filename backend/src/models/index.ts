import { User } from "./user.model";
import { Recipe } from "./recipe.model";
import { Ingredient } from "./ingredient.model";
import { RecipeStep } from "./recipe_step.model";
import { Like } from "./like.model";
import { SavedRecipe } from "./saved_recipe.model";
import { Follow } from "./follow.model";
import { Comment } from "./comment.model";
import { Rating } from "./rating.model";
import { Tag, RecipeTag } from "./tag.model";
import { Collection, CollectionRecipe } from "./collection.model";
import { Notification } from "./notification.model";

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

// Comment
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Recipe.hasMany(Comment, { foreignKey: "recipe_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });
Comment.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });
Comment.hasMany(Comment, { foreignKey: "parent_comment_id", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parent_comment_id", as: "parent" });

// Rating
User.hasMany(Rating, { foreignKey: "user_id", as: "ratings" });
Recipe.hasMany(Rating, { foreignKey: "recipe_id", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "user_id", as: "user" });
Rating.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

// Tag <-> Recipe (Many-to-Many via RecipeTag)
Recipe.belongsToMany(Tag, {
  through: RecipeTag,
  foreignKey: "recipe_id",
  otherKey: "tag_id",
  as: "tags",
});
Tag.belongsToMany(Recipe, {
  through: RecipeTag,
  foreignKey: "tag_id",
  otherKey: "recipe_id",
  as: "recipes",
});

// Collection
User.hasMany(Collection, { foreignKey: "user_id", as: "collections" });
Collection.belongsTo(User, { foreignKey: "user_id", as: "owner" });

// Collection <-> Recipe (Many-to-Many via CollectionRecipe)
Collection.belongsToMany(Recipe, {
  through: CollectionRecipe,
  foreignKey: "collection_id",
  otherKey: "recipe_id",
  as: "recipes",
});
Recipe.belongsToMany(Collection, {
  through: CollectionRecipe,
  foreignKey: "recipe_id",
  otherKey: "collection_id",
  as: "collections",
});

// Notification
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
User.hasMany(Notification, {
  foreignKey: "actor_id",
  as: "sent_notifications",
});
Notification.belongsTo(User, { foreignKey: "user_id", as: "recipient" });
Notification.belongsTo(User, { foreignKey: "actor_id", as: "actor" });
Notification.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });
Notification.belongsTo(Comment, { foreignKey: "comment_id", as: "comment" });

export * from "./user.model";
export * from "./recipe.model";
export * from "./ingredient.model";
export * from "./recipe_step.model";
export * from "./like.model";
export * from "./saved_recipe.model";
export * from "./follow.model";
export * from "./comment.model";
export * from "./rating.model";
export * from "./tag.model";
export * from "./collection.model";
export * from "./notification.model";
