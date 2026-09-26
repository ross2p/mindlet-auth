import { BadRequestException, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthMessage,
  RPC_GRPC_SERVICE_NAME,
  ValidationPipe,
} from '@ross2p/common';
import type {
  BeginEnableSecondFactorMethodMessageType,
  ConfirmEnableSecondFactorMethodMessageType,
  DisableSecondFactorMethodMessageType,
  RefreshTokenType,
} from '@ross2p/types';
import {
  beginEnableSecondFactorMethodMessageSchema,
  confirmEnableSecondFactorMethodMessageSchema,
  disableSecondFactorMethodMessageSchema,
  refreshTokenSchema,
} from '@ross2p/types';
import { AuthService } from '../auth/auth.service';
import { AccessTokenDto } from '../auth/dto/access-token.dto';
import { accessTokenSchema } from '../auth/dto/access-token.schema';
import { CredentialsService } from '../credentials/credentials.service';
import { LoginWithContext } from '../credentials/dto/login-with-context.dto';
import { RegisterWithContext } from '../credentials/dto/register-with-context.dto';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { TwoFactorEnrollmentService } from '../two-factor-enrollment/two-factor-enrollment.service';
import { TwoFactorMethodService } from '../two-factor-method/two-factor-method.service';
import { ReauthService } from '../reauth/reauth.service';
import { PasswordResetService } from '../password-reset/password-reset.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { SessionService } from '../session/session.service';
import { PageRequestSessionDto } from '../session/dto/page-request-session.dto';
import { ChangePasswordDto } from '../password-reset/dto/change-password.dto';

interface RpcRequestMessage {
  method: string;
  payload: string;
  traceId: string;
  messageId: string;
  timestamp: string;
}

interface RpcResponseMessage {
  payload: string;
}

// Structural shapes of the request payloads (mirrors the DTOs the equivalent
// Kafka @MessagePattern handlers already declare — see each *.controller.ts).
interface WithUserId {
  userId: string;
}
interface WithSessionId {
  sessionId: string;
}
interface WithUserIdAndPassword {
  userId: string;
  password: string;
}
interface WithUserIdAndCode {
  userId: string;
  code: string;
}
interface EmailVerifyPayload {
  id: string;
  userId: string;
  sessionId: string;
  email: string;
  code: string;
}
interface SessionIdentityPayload {
  userId: string;
  sessionId: string;
}
interface SessionListPayload {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
}
interface TwoFactorVerifyPayload {
  userId: string;
  sessionId: string;
  code: string;
  method: 'email' | 'totp' | 'backup';
}
interface EmailPayload {
  email: string;
}
interface ResetPasswordPayload {
  token: string;
  password?: string;
  newPassword?: string;
}

type RpcHandler = (data: unknown) => unknown;

/**
 * gRPC counterpart of this app's `@MessagePattern`-based Kafka RPC controllers
 * (auth.controller.ts, credentials.controller.ts, session.controller.ts, ...).
 * Every handler here forwards to the exact same *Service call those controllers
 * already use — no business logic lives here, only transport dispatch.
 *
 * The Kafka `@MessagePattern` handlers are left in place (not removed) so the
 * old path keeps working for any caller not yet switched to gRPC.
 */
@Controller()
export class RpcController {
  private readonly handlers: Map<string, RpcHandler>;

  constructor(
    private readonly authService: AuthService,
    private readonly credentialsService: CredentialsService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly twoFactorEnrollmentService: TwoFactorEnrollmentService,
    private readonly twoFactorMethodService: TwoFactorMethodService,
    private readonly reauthService: ReauthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly twoFactorService: TwoFactorService,
    private readonly sessionService: SessionService,
  ) {
    this.handlers = new Map<string, RpcHandler>([
      [
        AuthMessage.USER_VALIDATE,
        (data) =>
          this.authService.validateUserByToken(
            new ValidationPipe(accessTokenSchema).transform(
              data as AccessTokenDto,
            ).accessToken,
          ),
      ],
      [
        AuthMessage.REFRESH,
        (data) =>
          this.authService.refreshAccessToken(
            new ValidationPipe(refreshTokenSchema).transform(
              data as RefreshTokenType,
            ),
          ),
      ],
      [
        AuthMessage.LOGIN,
        (data) => this.credentialsService.emailLogin(data as LoginWithContext),
      ],
      [
        AuthMessage.REGISTER,
        (data) =>
          this.credentialsService.emailRegister(data as RegisterWithContext),
      ],
      [
        AuthMessage.EMAIL_RESEND_CODE,
        (data) =>
          this.emailVerificationService.sendCode({
            sessionId: (data as WithSessionId).sessionId,
          }),
      ],
      [
        AuthMessage.EMAIL_VERIFY,
        (data) => {
          const dto = data as EmailVerifyPayload;
          return this.emailVerificationService.checkCode({
            id: dto.id,
            userId: dto.userId,
            sessionId: dto.sessionId,
            email: dto.email,
            code: dto.code,
          });
        },
      ],
      [
        AuthMessage.TWO_FACTOR_ENABLE,
        (data) =>
          this.twoFactorEnrollmentService.beginEnable(
            (data as WithUserId).userId,
          ),
      ],
      [
        AuthMessage.TWO_FACTOR_CONFIRM,
        (data) => {
          const dto = data as WithUserIdAndCode;
          return this.twoFactorEnrollmentService.confirmEnable(
            dto.userId,
            dto.code,
          );
        },
      ],
      [
        AuthMessage.TWO_FACTOR_DISABLE,
        (data) => {
          const dto = data as WithUserIdAndPassword;
          return this.twoFactorEnrollmentService.disable(
            dto.userId,
            dto.password,
          );
        },
      ],
      [
        AuthMessage.TWO_FACTOR_METHOD_LIST,
        (data) =>
          this.twoFactorMethodService.listMethods((data as WithUserId).userId),
      ],
      [
        AuthMessage.TWO_FACTOR_METHOD_BEGIN_ENABLE,
        (data) => {
          const dto = new ValidationPipe(
            beginEnableSecondFactorMethodMessageSchema,
          ).transform(data as BeginEnableSecondFactorMethodMessageType);
          return this.twoFactorMethodService.beginEnable(dto.userId, dto.type);
        },
      ],
      [
        AuthMessage.TWO_FACTOR_METHOD_CONFIRM_ENABLE,
        (data) => {
          const dto = new ValidationPipe(
            confirmEnableSecondFactorMethodMessageSchema,
          ).transform(data as ConfirmEnableSecondFactorMethodMessageType);
          return this.twoFactorMethodService.confirmEnable(
            dto.userId,
            dto.type,
            dto.code,
          );
        },
      ],
      [
        AuthMessage.TWO_FACTOR_METHOD_DISABLE,
        (data) => {
          const dto = new ValidationPipe(
            disableSecondFactorMethodMessageSchema,
          ).transform(data as DisableSecondFactorMethodMessageType);
          return this.twoFactorMethodService.disable(dto.userId, dto.type);
        },
      ],
      [
        AuthMessage.BACKUP_CODES_REGENERATE,
        (data) =>
          this.twoFactorMethodService.regenerateBackupCodes(
            (data as WithUserId).userId,
          ),
      ],
      [
        AuthMessage.REAUTH_VERIFY,
        (data) => {
          const dto = data as WithUserIdAndPassword;
          return this.reauthService.verifyPassword(dto.userId, dto.password);
        },
      ],
      [
        AuthMessage.REAUTH_CHECK,
        (data) => this.reauthService.isVerified((data as WithUserId).userId),
      ],
      [
        AuthMessage.FORGOT_PASSWORD,
        (data) =>
          this.passwordResetService.forgotPassword(data as EmailPayload),
      ],
      [
        AuthMessage.RESET_PASSWORD,
        (data) =>
          this.passwordResetService.resetPassword(data as ResetPasswordPayload),
      ],
      [
        AuthMessage.CHANGE_PASSWORD_REQUEST_2FA,
        (data) =>
          this.passwordResetService.requestChangePassword2fa(
            (data as WithSessionId).sessionId,
          ),
      ],
      [
        AuthMessage.CHANGE_PASSWORD,
        (data) => {
          const dto = data as SessionIdentityPayload & ChangePasswordDto;
          return this.passwordResetService.changePasswordFromDto(
            dto.userId,
            dto.sessionId,
            dto,
          );
        },
      ],
      [
        AuthMessage.TWO_FACTOR_METHODS,
        (data) =>
          this.twoFactorService.listTwoFactorMethods(
            data as SessionIdentityPayload,
          ),
      ],
      [
        AuthMessage.TWO_FACTOR_RESEND,
        (data) =>
          this.twoFactorService.sendCode({
            sessionId: (data as WithSessionId).sessionId,
          }),
      ],
      [
        AuthMessage.TWO_FACTOR_VERIFY,
        (data) => {
          const dto = data as TwoFactorVerifyPayload;
          return this.twoFactorService.checkCode({
            userId: dto.userId,
            sessionId: dto.sessionId,
            code: dto.code,
            method: dto.method,
          });
        },
      ],
      [
        AuthMessage.SESSION_LIST,
        (data) => {
          const payload = data as SessionListPayload;
          const dto = Object.assign(new PageRequestSessionDto(), {
            userId: payload.userId,
            pageNumber: payload.pageNumber ?? 1,
            pageSize: payload.pageSize ?? 200,
          });
          return this.sessionService.findSessionsPageByUserId(dto);
        },
      ],
      [
        AuthMessage.SESSION_SIGN_OUT,
        (data) => {
          const dto = data as SessionIdentityPayload;
          return this.sessionService.signOut(
            dto.userId,
            dto.sessionId,
            'sign-out',
          );
        },
      ],
      [
        AuthMessage.SESSION_SIGN_OUT_ALL,
        (data) => this.sessionService.signOutAll((data as WithUserId).userId),
      ],
      [
        AuthMessage.SESSION_REVOKE,
        (data) => {
          const dto = data as SessionIdentityPayload;
          return this.sessionService.signOut(
            dto.userId,
            dto.sessionId,
            'revoked',
          );
        },
      ],
    ]);
  }

  @GrpcMethod(RPC_GRPC_SERVICE_NAME, 'Call')
  async call(request: RpcRequestMessage): Promise<RpcResponseMessage> {
    const handler = this.handlers.get(request.method);
    if (!handler) {
      throw new BadRequestException(
        `No gRPC RPC handler registered for method "${request.method}"`,
      );
    }

    const data: unknown = request.payload ? JSON.parse(request.payload) : {};
    const result = await handler(data);
    return { payload: result === undefined ? '' : JSON.stringify(result) };
  }
}
