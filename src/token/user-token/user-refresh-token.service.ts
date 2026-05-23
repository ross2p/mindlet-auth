import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshPayloadDto } from '../../auth/dto/refresh-payload.dto';
import { TokenType } from '../token-type.enum';
import { BaseTokenService } from '../base-token.service';

@Injectable()
export class UserRefreshTokenService extends BaseTokenService<RefreshPayloadDto> {
  protected readonly tokenType = TokenType.REFRESH;

  constructor(jwtService: JwtService) {
    super(jwtService);
  }
}
