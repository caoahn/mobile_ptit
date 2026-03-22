import { Op } from "sequelize";
import { Comment, User } from "../models/index";
import { sequelize } from "../config/database";
import { ICommentRepository } from "../interfaces/repositories/comment.repository";

export class CommentRepository implements ICommentRepository {
  async findParentComments(
    recipeId: number,
    page: number,
    limit: number,
  ): Promise<{ rows: Comment[]; count: number }> {
    const { rows, count } = await Comment.findAndCountAll({
      where: {
        recipe_id: recipeId,
        parent_comment_id: { [Op.is]: null },
      } as any,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar_url"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    return { rows, count };
  }

  async findReplies(parentId: number): Promise<Comment[]> {
    return Comment.findAll({
      where: { parent_comment_id: parentId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar_url"],
        },
      ],
      order: [["created_at", "ASC"]],
    });
  }

  async findById(id: number): Promise<Comment | null> {
    return Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar_url"],
        },
      ],
    });
  }

  async create(data: {
    user_id: number;
    recipe_id: number;
    content: string;
    parent_comment_id?: number;
  }): Promise<Comment> {
    return Comment.create(data);
  }

  async countByRecipeId(recipeId: number): Promise<number> {
    return Comment.count({ where: { recipe_id: recipeId } });
  }
}
