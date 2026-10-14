import { CitizenUser } from '../types';

const STORAGE_KEY_USERS = 'letsfix_registered_users_v1';
const STORAGE_KEY_CURRENT_USER = 'letsfix_active_user_session_v1';

export const DEMO_CITIZENS: CitizenUser[] = [
  {
    id: 'user-priya-01',
    name: 'Priya Desai',
    email: 'priya.desai@example.com',
    phone: '+1 (555) 234-5678',
    ward: 'Ward 4 - Green Valley',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00Z',
    role: 'citizen'
  },
  {
    id: 'user-rahul-02',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@civicmail.org',
    phone: '+1 (555) 345-6789',
    ward: 'Ward 12 - Metro Central',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T14:30:00Z',
    role: 'citizen'
  },
  {
    id: 'user-anita-03',
    name: 'Anita Patel',
    email: 'anita.patel@community.net',
    phone: '+1 (555) 456-7890',
    ward: 'Ward 7 - Riverside North',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T11:15:00Z',
    role: 'citizen'
  }
];

export class AuthService {
  private static initUsers(): CitizenUser[] {
    if (typeof window === 'undefined') return DEMO_CITIZENS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEMO_CITIZENS));
        return DEMO_CITIZENS;
      }
      return JSON.parse(stored);
    } catch {
      return DEMO_CITIZENS;
    }
  }

  static getCurrentUser(): CitizenUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (!session) return null;
      return JSON.parse(session);
    } catch {
      return null;
    }
  }

  static getRegisteredUsers(): CitizenUser[] {
    return this.initUsers();
  }

  static login(email: string, _password?: string): { success: boolean; user?: CitizenUser; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }

    const users = this.getRegisteredUsers();
    let found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      // If user entered a new email during login, create or allow friendly citizen entry
      const defaultName = cleanEmail.split('@')[0]
        .replace(/[^a-zA-Z]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()).trim() || 'Citizen User';

      found = {
        id: `user-${Date.now()}`,
        name: defaultName,
        email: cleanEmail,
        ward: 'Ward 4 - Civic Central',
        createdAt: new Date().toISOString(),
        role: 'citizen'
      };

      const updatedUsers = [...users, found];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(found));
    }

    return { success: true, user: found };
  }

  static signup(data: {
    name: string;
    email: string;
    password?: string;
    ward?: string;
    phone?: string;
  }): { success: boolean; user?: CitizenUser; error?: string } {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const users = this.getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // Sign them in directly to the existing account
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(existing));
      }
      return { success: true, user: existing };
    }

    const newUser: CitizenUser = {
      id: `citizen-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: data.phone?.trim() || undefined,
      ward: data.ward?.trim() || 'Ward 12 - Metro Central',
      createdAt: new Date().toISOString(),
      role: 'citizen'
    };

    const updatedUsers = [newUser, ...users];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
    }

    return { success: true, user: newUser };
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }

  static loginAsDemo(citizenId: string): CitizenUser | null {
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.id === citizenId) || DEMO_CITIZENS.find(u => u.id === citizenId);
    if (found) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(found));
      }
      return found;
    }
    return null;
  }
}
