import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useVerifyEmail', () => ({
  useVerifyEmail: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../model/hooks/useResendEmailCode', () => ({
  useResendEmailCode: () => ({ mutate: vi.fn(), isPending: false }),
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
}));

import { VerifyEmailForm } from './VerifyEmailForm';

describe('VerifyEmailForm (AC-04)', () => {
  it('offers a verify-email submit control', () => {
    render(<VerifyEmailForm />);
    expect(
      screen.getByRole('button', { name: /verify email/i }),
    ).toBeInTheDocument();
  });
});
