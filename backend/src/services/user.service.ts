import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";
import { IUserService } from "../interfaces/services/user.service";
import { UserProfileResponse } from "../dto/user/user.response";
import { UpdateProfileRequest } from "../dto/user/update-profile.request";

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

  async getProfile(userId: number): Promise<UserProfileResponse | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    return this.toDTO(user);
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
    return this.userRepository.followUser(followerId, followingId);
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    return this.userRepository.unfollowUser(followerId, followingId);
  }

  async getFollowers(userId: number): Promise<UserProfileResponse[]> {
    const users = await this.userRepository.getFollowers(userId);
    return users.map((u) => this.toDTO(u));
  }

  async getFollowing(userId: number): Promise<UserProfileResponse[]> {
    const users = await this.userRepository.getFollowing(userId);
    return users.map((u) => this.toDTO(u));
  }
}
