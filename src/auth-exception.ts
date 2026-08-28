import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthErrorCode,
  authError,
  type AuthErrorCodeValue,
} from './auth-error';

export function throwAuthBadRequest(
  code: AuthErrorCodeValue,
  message: string,
): never {
  throw new BadRequestException(authError(code, message));
}

export function throwAuthConflict(
  code: AuthErrorCodeValue,
  message: string,
): never {
  throw new ConflictException(authError(code, message));
}

export function throwAuthForbidden(
  code: AuthErrorCodeValue,
  message: string,
): never {
  throw new ForbiddenException(authError(code, message));
}

export function throwAuthUnauthorized(
  code: AuthErrorCodeValue,
  message: string,
): never {
  throw new UnauthorizedException(authError(code, message));
}

export function throwAuthTooManyRequests(
  code: AuthErrorCodeValue,
  message: string,
): never {
  throw new HttpException(
    authError(code, message),
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

export { AuthErrorCode };
