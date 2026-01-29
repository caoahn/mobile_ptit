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
}
