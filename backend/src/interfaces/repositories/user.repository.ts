import {
  User,
  UserAttributes,
  UserCreationAttributes,
} from "../../models/user.model";

export interface IUserRepository {
  create(user: UserCreationAttributes): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  update(id: number, user: Partial<UserAttributes>): Promise<User | null>;
  followUser(followerId: number, followingId: number): Promise<void>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  searchByUsername(query: string, limit?: number): Promise<User[]>;
  countFollowers(userId: number): Promise<number>;
  countFollowing(userId: number): Promise<number>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowingIds(userId: number): Promise<number[]>;
  countUserRecipes(userId: number): Promise<number>;
}
