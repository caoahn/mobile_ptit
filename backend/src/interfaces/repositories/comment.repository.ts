import { Comment } from "../../models/index";

export interface ICommentRepository {
  findParentComments(
    recipeId: number,
    page: number,
    limit: number,
  ): Promise<{ rows: Comment[]; count: number }>;
  findReplies(parentId: number): Promise<Comment[]>;
  findById(id: number): Promise<Comment | null>;
  create(data: {
    user_id: number;
    recipe_id: number;
    content: string;
    parent_comment_id?: number;
  }): Promise<Comment>;
  countByRecipeId(recipeId: number): Promise<number>;
  update(id: number, content: string): Promise<Comment | null>;
  delete(id: number): Promise<void>;
}
