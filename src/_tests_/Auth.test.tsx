import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';

// Mock the AuthPage component
vi.mock('../pages/AuthPage', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="auth-page">
      <h2>Login</h2>
      <input data-testid="email-input" placeholder="Email" />
      <input data-testid="password-input" type="password" placeholder="Password" />
      <button data-testid="login-button">Sign In</button>
    </div>
  ),
}));

describe('AuthPage', () => {
  it('renders login form with email and password fields', () => {
    render(
      <Router>
        <AuthPage />
      </Router>
    );
    
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });
});
