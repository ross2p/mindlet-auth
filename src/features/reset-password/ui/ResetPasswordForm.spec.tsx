import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useResetPassword', () => ({
  useResetPassword: () => ({ mutate: vi.fn(), isPending: false }),
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
  PasswordVisibilityIcon: () => null,
  routes: { login: '/auth/login' },
}));

import { ResetPasswordForm } from './ResetPasswordForm';

describe('ResetPasswordForm (AC-13)', () => {
  it('asks for a new password and confirmation', () => {
    render(<ResetPasswordForm token="reset-token" />);
    expect(screen.getByText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByText(/^confirm password$/i)).toBeInTheDocument();
  });
});
