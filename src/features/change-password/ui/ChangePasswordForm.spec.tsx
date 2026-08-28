import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useChangePassword', () => ({
  useChangePassword: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  }),
  useRequestChangePassword2fa: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@ross2p/shared', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  FormItem: ({
    label,
    children,
  }: {
    label?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <label>
      {label}
      {children}
    </label>
  ),
  Button: ({
    children,
    htmlType,
  }: {
    children: React.ReactNode;
    htmlType?: 'submit' | 'button';
  }) => <button type={htmlType ?? 'button'}>{children}</button>,
}));

import { ChangePasswordForm } from './ChangePasswordForm';

describe('ChangePasswordForm (AC-17)', () => {
  it('shows current and new password fields plus update control', () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText(/^current password$/i)).toBeInTheDocument();
    expect(screen.getByText(/^new password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update password/i }),
    ).toBeInTheDocument();
  });
});
