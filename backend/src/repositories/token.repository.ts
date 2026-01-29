import { Op } from "sequelize";
import {
  RefreshToken,
  PasswordResetToken,
  RefreshTokenAttributes,
  PasswordResetTokenAttributes,
} from "../models/token.model";
import { ITokenRepository } from "../interfaces/repositories/token.repository";

export class TokenRepository implements ITokenRepository {
  async createRefreshToken(token: RefreshTokenAttributes): Promise<void> {
    await RefreshToken.create(token);
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { token_hash: tokenHash, is_revoked: false },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await RefreshToken.update(
      { is_revoked: true },
      { where: { token_hash: tokenHash } },
    );
  }

  async revokeAllRefreshTokens(userId: number): Promise<void> {
    await RefreshToken.update(
      { is_revoked: true },
      { where: { user_id: userId } },
    );
  }

  async createPasswordResetToken(
    token: PasswordResetTokenAttributes,
  ): Promise<void> {
    await PasswordResetToken.create(token);
  }

  async findPasswordResetToken(
    otpHash: string,
  ): Promise<PasswordResetToken | null> {
    return PasswordResetToken.findOne({
      where: {
        otp_hash: otpHash,
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });
  }
}
