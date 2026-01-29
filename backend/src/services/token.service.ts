import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/user.model";
import { ITokenService } from "../interfaces/services/token.service";

export class TokenService implements ITokenService {
  generateAuthTokens(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      env.jwt.secret as string,
      { expiresIn: env.jwt.accessExpiration as any },
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      env.jwt.refreshSecret as string,
      {
        expiresIn: env.jwt.refreshExpiration as any,
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  verifyToken(token: string, type: "access" | "refresh") {
    const secret = type === "access" ? env.jwt.secret : env.jwt.refreshSecret;
    return jwt.verify(token, secret);
  }
}
