export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ward: string;
  avatar?: string;
  createdAt: string;
  role: 'citizen';
}

export interface AuthState {
  user: CitizenUser | null;
  isAuthenticated: boolean;
}
