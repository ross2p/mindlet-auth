import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useLogin', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false }),
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
  routes: { forgotPassword: '/auth/forgot-password' },
}));

import { LoginForm } from './LoginForm';

describe('LoginForm (AC-07)', () => {
  it('shows email, password, and a forgot-password link', () => {
    render(<LoginForm />);
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /forgot password/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
