import { UserProfileResponse } from "../../dto/user/user.response";
import { UpdateProfileRequest } from "../../dto/user/update-profile.request";

export interface IUserService {
  getProfile(userId: number): Promise<UserProfileResponse | null>;
  updateProfile(
    userId: number,
    data: UpdateProfileRequest,
  ): Promise<UserProfileResponse | null>;
  followUser(followerId: number, followingId: number): Promise<void>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<UserProfileResponse[]>;
  getFollowing(userId: number): Promise<UserProfileResponse[]>;
}
