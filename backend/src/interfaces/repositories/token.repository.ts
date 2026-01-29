import {
  RefreshToken,
  RefreshTokenAttributes,
  PasswordResetToken,
  PasswordResetTokenAttributes,
} from "../../models/token.model";

export interface ITokenRepository {
  createRefreshToken(token: RefreshTokenAttributes): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllRefreshTokens(userId: number): Promise<void>;
  createPasswordResetToken(token: PasswordResetTokenAttributes): Promise<void>;
  findPasswordResetToken(otpHash: string): Promise<PasswordResetToken | null>;
}
