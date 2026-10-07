import type { RefreshPayloadDto } from '../types/token.types';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCoreProto } from '@ross2p/common';
import { BaseTokenService } from '../base-token.service';

@Injectable()
export class UserRefreshTokenService extends BaseTokenService<RefreshPayloadDto> {
  protected readonly tokenType = AuthCoreProto.TokenType.refresh;

  constructor(jwtService: JwtService) {
    super(jwtService);
  }
}
