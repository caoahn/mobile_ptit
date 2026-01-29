import {
  User,
  UserAttributes,
  UserCreationAttributes,
  Follow,
} from "../models/index";
import { IUserRepository } from "../interfaces/repositories/user.repository";

export class UserRepository implements IUserRepository {
  async create(user: UserCreationAttributes): Promise<User> {
    return User.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async update(
    id: number,
    userData: Partial<UserAttributes>,
  ): Promise<User | null> {
    await User.update(userData, {
      where: { id },
    });
    return this.findById(id);
  }

  async followUser(followerId: number, followingId: number): Promise<void> {
    await Follow.create({ follower_id: followerId, following_id: followingId });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await Follow.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });
  }

  async getFollowers(userId: number): Promise<User[]> {
    const follows = await Follow.findAll({
      where: { following_id: userId },
      include: [{ model: User, as: "follower" }],
    });
    return follows.map((f: any) => f.follower);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const follows = await Follow.findAll({
      where: { follower_id: userId },
      include: [{ model: User, as: "following_user" }],
    });
    return follows.map((f: any) => f.following_user);
  }
}
