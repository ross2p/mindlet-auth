import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayloadDto } from '../../auth/dto/user-payload.dto';
import { TokenType } from '../token-type.enum';
import { BaseTokenService } from '../base-token.service';

@Injectable()
export class UserAccessTokenService extends BaseTokenService<UserPayloadDto> {
  protected readonly tokenType = TokenType.ACCESS;

  constructor(jwtService: JwtService) {
    super(jwtService);
  }
}
