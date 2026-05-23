import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PASSWORD_RESET_TTL_SECONDS } from '../../password-reset/password-reset.constants';
import { PasswordResetTokenRepository } from './password-reset-token.repository';

@Injectable()
export class PasswordResetTokenService {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async create(email: string): Promise<{ token: string }> {
    const token = randomBytes(32).toString('hex');
    await this.passwordResetTokenRepository.save(
      token,
      { email },
      PASSWORD_RESET_TTL_SECONDS,
    );
    return { token };
  }

  async consume(token: string): Promise<{ email: string }> {
    const record = await this.passwordResetTokenRepository.find(token);
    if (!record) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    await this.passwordResetTokenRepository.delete(token);
    return { email: record.email };
  }
}
