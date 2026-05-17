import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '@ross2p/types';
import { TokenType } from '../token-type.enum';
import { BaseTokenService } from '../base-token.service';

@Injectable()
export class UserAccessTokenService extends BaseTokenService<UserPayload> {
  protected readonly tokenType = TokenType.ACCESS;

  constructor(jwtService: JwtService) {
    super(jwtService);
  }
}
