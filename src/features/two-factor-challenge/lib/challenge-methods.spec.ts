import { describe, expect, it } from 'vitest';
import {
  defaultChallengeMethods,
  methodLabel,
} from './challenge-methods';

describe('2FA method picker (AC-10)', () => {
  it('lists email as available and totp/backup as disabled', () => {
    const methods = defaultChallengeMethods();
    expect(methods.find((m) => m.id === 'email')?.available).toBe(true);
    expect(methods.find((m) => m.id === 'totp')?.available).toBe(false);
    expect(methods.find((m) => m.id === 'backup')?.available).toBe(false);
  });

  it('labels methods for the picker tabs', () => {
    expect(methodLabel('email')).toBe('Email');
    expect(methodLabel('totp')).toBe('Authenticator');
    expect(methodLabel('backup')).toBe('Backup');
  });
});
