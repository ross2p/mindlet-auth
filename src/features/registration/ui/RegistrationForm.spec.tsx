import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../model/hooks/useRegistration', () => ({
  useRegistration: () => ({ mutate: vi.fn(), isPending: false }),
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
}));

import { RegistrationForm } from './RegistrationForm';

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <RegistrationForm />
    </QueryClientProvider>,
  );
}

describe('RegistrationForm (AC-01)', () => {
  it('shows email and password fields', () => {
    renderForm();
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByText(/first name/i)).toBeInTheDocument();
  });
});
