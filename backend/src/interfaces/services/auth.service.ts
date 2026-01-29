import { User } from "../../models/user.model";
import { RegisterRequest } from "../../dto/auth/register.request";
import { LoginRequest } from "../../dto/auth/login.request";
import { AuthResponse } from "../../dto/auth/auth.response";
import { UserProfileResponse } from "../../dto/user/user.response";

export interface IAuthService {
  register(data: RegisterRequest): Promise<UserProfileResponse>;
  login(data: LoginRequest): Promise<AuthResponse>;
  refreshToken(token: string): Promise<AuthResponse>;
}
