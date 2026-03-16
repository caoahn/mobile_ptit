import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";
import { IUserService } from "../interfaces/services/user.service";
import { UserProfileResponse } from "../dto/user/user.response";
import { UpdateProfileRequest } from "../dto/user/update-profile.request";
import { Follow } from "../models/follow.model";
import { sequelize } from "../config/database";

export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  private toDTO(user: User): UserProfileResponse {
    const raw = user.toJSON() as any;
    // toJSON already handles exclusion of password, createdBy etc if configured,
    // but here we map explicitly to ensure contract.
    // However, User.toJSON() logic we added earlier returns snake_case props.
    // Our DTO expects snake_case timestamps?
    // Wait, DTO definition: created_at: Date.
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      full_name: raw.full_name,
      bio: raw.bio,
      avatar_url: raw.avatar_url,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      followers_count: 0, // TODO: Implement count
      following_count: 0, // TODO: Implement count
      recipes_count: 0, // TODO: Implement count
    };
  }

  async getProfile(userId: number, currentUserId?: number): Promise<UserProfileResponse | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    
    const dto = this.toDTO(user);

    dto.followers_count = await Follow.count({ where: { following_id: userId } });
    dto.following_count = await Follow.count({ where: { follower_id: userId } });
    if (sequelize.models.Recipe) {
      dto.recipes_count = await sequelize.models.Recipe.count({ where: { user_id: userId } });
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRecord = await Follow.findOne({ where: { follower_id: currentUserId, following_id: userId } });
      isFollowing = !!followRecord;
    }
    (dto as any).is_following = isFollowing;

    return dto;
  }

  async updateProfile(
    userId: number,
    data: UpdateProfileRequest,
  ): Promise<UserProfileResponse | null> {
    const updated = await this.userRepository.update(userId, data);
    if (!updated) return null;
    return this.toDTO(updated);
  }

  async followUser(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) throw new Error("Cannot follow yourself");
    await Follow.findOrCreate({
      where: { follower_id: followerId, following_id: followingId },
    });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await Follow.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });
  }

  async getFollowers(userId: number): Promise<UserProfileResponse[]> {
    const users = await this.userRepository.getFollowers(userId);
    return users.map((u) => this.toDTO(u));
  }

  async getFollowing(userId: number): Promise<UserProfileResponse[]> {
    const users = await this.userRepository.getFollowing(userId);
    return users.map((u) => this.toDTO(u));
  }

  async searchUsers(
    query: string,
    limit: number = 10,
  ): Promise<UserProfileResponse[]> {
    const users = await this.userRepository.searchByUsername(query, limit);
    return users.map((u) => this.toDTO(u));
  }
}
