import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LoginPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe('LoginPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('shows backend error when login fails', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    }) as unknown as typeof fetch;

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'principal@classbridge.edu');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST'
    }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('redirects to dashboard on successful login', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    }) as unknown as typeof fetch;

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'principal@classbridge.edu');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  });
});
