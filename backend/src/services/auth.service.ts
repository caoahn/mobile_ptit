import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { TokenService } from "./token.service";
import { RegisterRequest } from "../dto/auth/register.request";
import { LoginRequest } from "../dto/auth/login.request";
import { AuthResponse } from "../dto/auth/auth.response";
import { User, UserCreationAttributes } from "../models/user.model";
import { IAuthService } from "../interfaces/services/auth.service";
import { UserProfileResponse } from "../dto/user/user.response";
import { OAuth2Client } from "google-auth-library";

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}
  
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      full_name: data.full_name,
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

  async loginWithGoogle(token: string): Promise<AuthResponse> {
    try {
      // 1. Xác thực idToken với Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new Error("Invalid Google token");
      }

      const { email, name, picture } = payload;

      // 2. Kiểm tra xem user đã tồn tại chưa
      let user = await this.userRepository.findByEmail(email);

      // 3. Nếu chưa tồn tại -> Tự động đăng ký
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-10); 
        const hashedPassword = await bcrypt.hash(randomPassword, 10);        
        
        const prefix = email.split("@")[0].substring(0, 4); 
        const randomString = Math.random().toString(36).substring(2, 8); 
        const uniqueUsername = `${prefix}_${randomString}`;

        const newUser: UserCreationAttributes = {
          email: email,
          username: uniqueUsername,
          full_name: name || "Google User",
          password_hash: hashedPassword,
        };
        user = await this.userRepository.create(newUser);
      }

      // 4. Tạo JWT token của riêng hệ thống (giống lúc login thường)
      const tokens = this.tokenService.generateAuthTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: this.mapUserToProfile(user),
      };
    } catch (error) {
      console.error("Google verify error:", error);
      throw new Error("Google authentication failed");
    }
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
