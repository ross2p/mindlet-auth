import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useVerifyTwoFactor', () => ({
  useVerifyTwoFactor: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));

vi.mock('../model/hooks/useResendTwoFactorCode', () => ({
  useResendTwoFactorCode: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../api/two-factor', () => ({
  listTwoFactorMethods: () => Promise.resolve({ methods: [] }),
}));

vi.mock('@widgets/otp-input', () => ({
  OtpInput: () => <input aria-label="otp" />,
  ResendCountdownButton: () => <button type="button">Resend</button>,
}));

vi.mock('@ross2p/shared', () => ({
  Button: ({
    children,
    htmlType,
    disabled,
  }: {
    children: React.ReactNode;
    htmlType?: 'submit' | 'button';
    disabled?: boolean;
  }) => (
    <button type={htmlType ?? 'button'} disabled={disabled}>
      {children}
    </button>
  ),
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div role="tablist">{children}</div>
  ),
  Tab: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button type="button" role="tab" disabled={disabled}>
      {children}
    </button>
  ),
  TabPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { TwoFactorForm } from './TwoFactorForm';

describe('TwoFactorForm picker (AC-10)', () => {
  it('renders Email enabled and Authenticator disabled', () => {
    render(<TwoFactorForm />);
    expect(screen.getByRole('tab', { name: 'Email' })).toBeEnabled();
    expect(screen.getByRole('tab', { name: 'Authenticator' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Backup' })).toBeDisabled();
  });
});
