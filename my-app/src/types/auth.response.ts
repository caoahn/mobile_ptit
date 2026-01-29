export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}
