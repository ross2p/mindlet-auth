import { AuthCoreProto } from '@ross2p/common';
import { TokenPayloadDto } from './dto/token-payload.dto';

/**
 * TokenPayloadDto already matches AuthCoreProto.TokenPayload field-for-field
 * except `payload.type`: this app's TokenType is a plain string-literal union
 * ('access' | 'refresh'), while the proto's is a real TS enum with the same
 * values — string enums aren't structurally assignable from a literal union
 * even when the values match, so that's the one field that needs a cast.
 */
export function toTokenPayload(
  dto: TokenPayloadDto,
): AuthCoreProto.TokenPayload {
  return {
    ...dto,
    payload: {
      ...dto.payload,
      type: dto.payload.type as AuthCoreProto.TokenType,
    },
  };
}
