import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import { AuthProvider } from '../../context/AuthContext';
import { AlertProvider } from '../../context/AlertContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth context
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    login: mockLogin,
    currentUser: null,
    loading: false,
  }),
}));

// Mock the alert context
const mockError = jest.fn();
jest.mock('../../context/AlertContext', () => ({
  AlertProvider: ({ children }) => children,
  useAlert: () => ({
    error: mockError,
  }),
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AlertProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </AlertProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering Tests', () => {
    test('renders login form with all required elements', () => {
      renderLogin();

      // Check for main heading
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();

      // Check for form elements
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Check for additional elements
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation Tests', () => {
    test('validates email format', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      await userEvent.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission
      expect(emailInput.validity.valid).toBe(false);
    });

    test('requires both email and password', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput.validity.valid).toBe(false);
      expect(passwordInput.validity.valid).toBe(false);
    });
  });

  describe('User Interaction Tests', () => {
    test('updates form fields on user input', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    test('toggles remember me checkbox', async () => {
      renderLogin();

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(rememberMeCheckbox.checked).toBe(false);

      await userEvent.click(rememberMeCheckbox);
      expect(rememberMeCheckbox.checked).toBe(true);
    });
  });

  describe('Authentication Flow Tests', () => {
    test('successful login as athlete', async () => {
      mockLogin.mockResolvedValueOnce({ role: 'athlete' });
      renderLogin();

      // Fill in the form
      await userEvent.type(screen.getByLabelText(/email address/i), 'athlete@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify login was called with correct credentials
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('athlete@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/athlete');
      });
    });

    test('successful login as coach', async () => {
      mockLogin.mockResolvedValueOnce({ role: 'coach' });
      renderLogin();

      // Fill in the form
      await userEvent.type(screen.getByLabelText(/email address/i), 'coach@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify login was called with correct credentials
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('coach@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/coach');
      });
    });

    test('handles login failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      renderLogin();

      // Fill in the form
      await userEvent.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify error handling
      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    test('shows loading state during login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderLogin();

      // Fill in the form
      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
}); 