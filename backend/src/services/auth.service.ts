import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { TokenService } from "./token.service";
import { RegisterRequest } from "../dto/auth/register.request";
import { LoginRequest } from "../dto/auth/login.request";
import { AuthResponse } from "../dto/auth/auth.response";
import { User, UserCreationAttributes } from "../models/user.model";
import { IAuthService } from "../interfaces/services/auth.service";
import { UserProfileResponse } from "../dto/user/user.response";

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  private mapUserToProfile(user: User): UserProfileResponse {
    const raw = user.toJSON() as any;
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      full_name: raw.full_name,
      bio: raw.bio,
      avatar_url: raw.avatar_url,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      // Counts can be defaults or fetched if needed
    };
  }

  async register(data: RegisterRequest): Promise<UserProfileResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser: UserCreationAttributes = {
      email: data.email,
      username: data.username,
      password_hash: hashedPassword,
    };

    const createdUser = await this.userRepository.create(newUser);
    return this.mapUserToProfile(createdUser);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Not found email");
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new Error("Wrong password");
    }

    const tokens = this.tokenService.generateAuthTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.mapUserToProfile(user),
    };
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const decoded: any = this.tokenService.verifyToken(token, "refresh");
      const user = await this.userRepository.findById(decoded.id);
      if (!user) throw new Error("User not found");

      const tokens = this.tokenService.generateAuthTokens(user);
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: this.mapUserToProfile(user),
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}
