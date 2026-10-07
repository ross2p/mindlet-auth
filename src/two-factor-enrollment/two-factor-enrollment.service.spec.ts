import { UnauthorizedException } from '@nestjs/common';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';

describe('TwoFactorEnrollmentService challenge', () => {
  const enrollmentRepository = {
    createEnrollmentChallenge: jest.fn(),
    findByUserId: jest.fn(),
    updateEnrollmentChallenge: jest.fn(),
    deleteByUserId: jest.fn(),
  };
  let service: TwoFactorEnrollmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TwoFactorEnrollmentService(
      enrollmentRepository as never,
      {} as never,
      {} as never,
    );
  });

  it('stores a six-digit challenge and returns its code', async () => {
    const code = await service.createChallenge('u1');

    expect(code).toMatch(/^\d{6}$/);
    expect(enrollmentRepository.createEnrollmentChallenge).toHaveBeenCalledWith(
      'u1',
      code,
    );
  });

  it('consumes the challenge when the code matches', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue({
      userId: 'u1',
      code: '111111',
      attempts: 0,
    });

    await service.verifyChallenge('u1', ' 111111 ');

    expect(enrollmentRepository.deleteByUserId).toHaveBeenCalledWith('u1');
  });

  it('rejects an unknown or expired challenge', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue(null);

    await expect(
      service.verifyChallenge('u1', '111111'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('counts a wrong code as an attempt', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue({
      userId: 'u1',
      code: '111111',
      attempts: 2,
    });

    await expect(
      service.verifyChallenge('u1', '222222'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(enrollmentRepository.updateEnrollmentChallenge).toHaveBeenCalledWith(
      { userId: 'u1', attempts: 3 },
    );
    expect(enrollmentRepository.deleteByUserId).not.toHaveBeenCalled();
  });

  it('drops the challenge after too many failed attempts', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue({
      userId: 'u1',
      code: '111111',
      attempts: 5,
    });

    await expect(
      service.verifyChallenge('u1', '111111'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(enrollmentRepository.deleteByUserId).toHaveBeenCalledWith('u1');
  });
});
