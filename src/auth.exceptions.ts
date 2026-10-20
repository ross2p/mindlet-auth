import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthErrorCode } from './auth-error';

export class ResetCodeInvalid extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.resetCodeInvalid,
      message: 'Reset code expired or already used — request a new one',
    });
  }
}

export class SignInUnavailable extends UnauthorizedException {
  constructor() {
    super({
      code: AuthErrorCode.signInUnavailable,
      message: 'Sign-in is unavailable for these credentials',
    });
  }
}

export class RefreshBlockedPendingChallenge extends ForbiddenException {
  constructor() {
    super({
      code: AuthErrorCode.refreshBlockedPendingChallenge,
      message: 'Complete verification before refreshing access',
    });
  }
}

export class TwoFactorAlreadyVerified extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.twoFactorNotRequired,
      message:
        'Two-factor authentication is already verified for this session.',
    });
  }
}

export class TwoFactorNotEnabled extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.twoFactorNotRequired,
      message: 'Two-factor authentication is not enabled',
    });
  }
}

export class TwoFactorChallengeNotPending extends ConflictException {
  constructor() {
    super({
      code: AuthErrorCode.twoFactorNotRequired,
      message: 'Two-factor challenge is not pending',
    });
  }
}

export class TwoFactorMethodUnavailable extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.twoFactorCodeInvalid,
      message: 'This two-factor method is not available.',
    });
  }
}

export class TwoFactorCodeExpired extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.twoFactorCodeInvalid,
      message:
        'This two-factor code is invalid or has expired. Request a new code.',
    });
  }
}

export class TwoFactorCodeIncorrect extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.twoFactorCodeInvalid,
      message: 'The two-factor code is incorrect.',
    });
  }
}

export class TwoFactorAttemptsExceeded extends HttpException {
  constructor() {
    super(
      {
        code: AuthErrorCode.twoFactorAttemptsExceeded,
        message: 'Too many incorrect two-factor codes. Try again later.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class PasswordChangeRejected extends BadRequestException {
  constructor() {
    super({
      code: AuthErrorCode.passwordChangeRejected,
      message: 'Current credentials were not confirmed',
    });
  }
}
