import { User } from "../../models/user.model";

export interface ITokenService {
  generateAuthTokens(user: User): {
    access_token: string;
    refresh_token: string;
  };
  verifyToken(token: string, type: "access" | "refresh"): any;
}
