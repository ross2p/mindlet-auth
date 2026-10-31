import { Injectable } from '@nestjs/common';
import {
  UserCoreProto,
  UserPasswordProto,
  UserPrivateDataProto,
} from '../../generated/protos';
import { UserCoreGrpcClient } from './user-core-grpc.client';
import { UserPasswordGrpcClient } from './user-password-grpc.client';
import { UserPrivateDataGrpcClient } from './user-private-data-grpc.client';
import { UserGrpcResponseMapper } from './user-grpc-response.mapper';

/**
 * The single facade every auth class injects for the user service. Every
 * method is a one-line delegation to the matching gRPC client — no business
 * logic, no response transformation (that lives in user-grpc-response.mapper.ts
 * at the call site, mirroring gateway-web's AuthClient/auth-response.mapper.ts).
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userCore: UserCoreGrpcClient,
    private readonly userPassword: UserPasswordGrpcClient,
    private readonly userPrivateData: UserPrivateDataGrpcClient,
    private readonly userMapper: UserGrpcResponseMapper,
  ) {}

  async findUserByEmail(email: string) {
    return this.userMapper.toAuthUserView(
      await this.userCore.findUserByEmail({ email }),
    );
  }

  async findUserById(userId: string) {
    return this.userMapper.toAuthUserView(
      await this.userCore.findUserById({ userId }),
    );
  }

  async createUser(req: UserCoreProto.CreateRequest) {
    return this.userMapper.toAuthUserView(await this.userCore.createUser(req));
  }

  markEmailVerified(req: UserCoreProto.MarkEmailVerifiedRequest) {
    return this.userCore.markEmailVerified(req);
  }

  setTwoFactorEnabled(req: UserCoreProto.SetTwoFactorEnabledRequest) {
    return this.userCore.setTwoFactorEnabled(req);
  }

  verifyPassword(req: UserPasswordProto.VerifyPasswordRequest) {
    return this.userPassword.verifyPassword(req);
  }

  updateUserPrivateData(req: UserPrivateDataProto.UpdateRequest) {
    return this.userPrivateData.updateUserPrivateData(req);
  }
}
