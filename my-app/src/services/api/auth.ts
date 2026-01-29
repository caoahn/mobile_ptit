import { LoginRequest, RegisterRequest } from "../../types/auth.request";
import { AuthResponse } from "../../types/auth.response";

export const login = async ({
  email,
  password,
}: LoginRequest): Promise<AuthResponse> => {
  // SIMULATION: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          user: { id: "1", name: "Nguyen Van A", email: "user@example.com" },
          token: "mock-jwt-token-123",
        },
      });
    }, 1000);
  });
  // return client.post('/auth/login', { email, password });
};

export const register = async ({
  username,
  email,
  password,
}: RegisterRequest): Promise<AuthResponse> => {
  // SIMULATION
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          user: { id: "2", name: username, email },
          token: "mock-jwt-token-456",
        },
      });
    }, 1000);
  });
  // return client.post('/auth/register', { username, email, password });
};

export const logout = async (): Promise<void> => {
  // return client.post('/auth/logout');
  return Promise.resolve();
};
