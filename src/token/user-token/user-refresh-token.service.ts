import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshPayload } from '@ross2p/types';
import { TokenType } from '../token-type.enum';
import { BaseTokenService } from '../base-token.service';

@Injectable()
export class UserRefreshTokenService extends BaseTokenService<RefreshPayload> {
  protected readonly tokenType = TokenType.REFRESH;

  constructor(jwtService: JwtService) {
    super(jwtService);
  }
}
