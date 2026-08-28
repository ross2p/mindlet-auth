import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useForgotPassword', () => ({
  useForgotPassword: () => ({ mutate: vi.fn(), isPending: false }),
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
  EnvelopeIcon: () => null,
}));

import { ForgotPasswordForm } from './ForgotPasswordForm';

describe('ForgotPasswordForm (AC-13 / AC-14)', () => {
  it('shows an email field for the forgot-password request', () => {
    render(<ForgotPasswordForm onSuccess={() => undefined} />);
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
  });
});
