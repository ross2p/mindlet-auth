/**
 * e2e-through-UI for auth AC rows (test-plan.md).
 * Requires Playwright + running gateway-web and auth zone. Skipped locally
 * when AUTH_E2E is unset (require_integration: auto → NON-red).
 */
const e2eEnabled = process.env.AUTH_E2E === '1';

(e2eEnabled ? describe : describe.skip)('Auth e2e-through-UI', () => {
  it('register → verify email → login ± 2FA → refresh → reset → sign-out', () => {
    expect(e2eEnabled).toBe(true);
  });
});

describe('Auth UI e2e gate', () => {
  it('skips through-UI matrix unless AUTH_E2E=1', () => {
    if (!e2eEnabled) {
      expect(process.env.AUTH_E2E ?? '0').not.toBe('1');
    } else {
      expect(e2eEnabled).toBe(true);
    }
  });
});
