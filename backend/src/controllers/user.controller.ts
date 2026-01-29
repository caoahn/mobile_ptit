import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess, sendError } from "../utils/response";
import { UpdateProfileRequest } from "../dto/user/update-profile.request";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = (req.user as any).id;
      const user = await this.userService.getProfile(userId);
      if (!user) {
        return sendError(res, 404, "User not found");
      }
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = (req.user as any).id;
      const updateData: UpdateProfileRequest = req.body;
      const user = await this.userService.updateProfile(userId, updateData);
      sendSuccess(res, user, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  };
  followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const followerId = (req as any).user.id;
      const followingId = parseInt(req.params.id);
      await this.userService.followUser(followerId, followingId);
      sendSuccess(res, null, "Followed successfully");
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const followerId = (req as any).user.id;
      const followingId = parseInt(req.params.id);
      await this.userService.unfollowUser(followerId, followingId);
      sendSuccess(res, null, "Unfollowed successfully");
    } catch (error) {
      next(error);
    }
  };

  getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await this.userService.getFollowers(userId);
      sendSuccess(res, followers);
    } catch (error) {
      next(error);
    }
  };

  getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await this.userService.getFollowing(userId);
      sendSuccess(res, following);
    } catch (error) {
      next(error);
    }
  };
}
