import { TokenPayloadDto } from '@ross2p/types';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import {
  TokenExpiredError,
  NotBeforeError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import type { Payload } from './payload.interface';
import type { TokenType } from './token-type.enum';

export abstract class BaseTokenService<T extends Payload> {
  protected abstract readonly tokenType: TokenType;

  constructor(protected readonly jwtService: JwtService) {}

  verifyToken(token: string): T {
    const payload = this.decodeAndVerify(token);
    this.assertTokenType(payload);
    return payload;
  }

  generateToken(
    payload: Omit<T, 'type' | 'iat' | 'exp'>,
    signOptions?: JwtSignOptions,
  ): TokenPayloadDto {
    const token = this.jwtService.sign(
      {
        ...payload,
        type: this.tokenType,
      } as T & object,
      signOptions,
    );
    const rawDecoded: unknown = this.jwtService.decode(token);
    if (
      rawDecoded === null ||
      typeof rawDecoded !== 'object' ||
      !('exp' in rawDecoded) ||
      typeof rawDecoded.exp !== 'number'
    ) {
      throw new BadRequestException('Token encode failed');
    }
    const decoded = rawDecoded as T & { exp: number };
    return {
      token,
      payload: decoded as unknown as TokenPayloadDto['payload'],
      expiresAt: new Date(decoded.exp * 1000),
    };
  }

  protected decodeAndVerify(token: string): T {
    try {
      return this.jwtService.verify<T>(token);
    } catch (err) {
      throw this.mapJwtError(err);
    }
  }

  protected assertTokenType(payload: T): void {
    if (payload.type !== this.tokenType) {
      throw new BadRequestException(
        `Expected ${this.tokenType} token, got ${payload.type}`,
      );
    }
  }

  protected mapJwtError(err: unknown): BadRequestException {
    if (err instanceof TokenExpiredError)
      return new BadRequestException('Token has expired');
    if (err instanceof NotBeforeError)
      return new BadRequestException('Token not active yet');
    if (err instanceof JsonWebTokenError)
      return new BadRequestException('Invalid token');
    return new BadRequestException('Token verification failed');
  }
}
