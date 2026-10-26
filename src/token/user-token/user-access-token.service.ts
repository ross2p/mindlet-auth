import type { UserPayloadDto } from '../types/token.types';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCoreProto } from '../../../generated/protos';
import { BaseTokenService } from '../base-token.service';

@Injectable()
export class UserAccessTokenService extends BaseTokenService<UserPayloadDto> {
  protected readonly tokenType = AuthCoreProto.TokenType.access;

  constructor(jwtService: JwtService) {
    super(jwtService);
  }
}
