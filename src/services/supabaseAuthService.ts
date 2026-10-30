import type { User } from '@supabase/supabase-js';
import type { CitizenUser } from '../types';
import { supabase } from '../lib/supabase';

function mapUser(user: User): CitizenUser {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    name: metadata.name || user.email?.split('@')[0] || 'Citizen',
    email: user.email || '',
    phone: metadata.phone || undefined,
    ward: metadata.ward || 'Ward 12 - Metro Central',
    avatar: metadata.avatar || undefined,
    createdAt: user.created_at,
    role: 'citizen'
  };
}

export class SupabaseAuthService {
  static async getCurrentUser(): Promise<CitizenUser | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return mapUser(data.user);
  }

  static async login(email: string, password: string): Promise<CitizenUser> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in could not be completed.');
    return mapUser(data.user);
  }

  static async signup(data: { name: string; email: string; password: string; ward?: string; phone?: string }) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: { data: { name: data.name.trim(), ward: data.ward?.trim(), phone: data.phone?.trim() || null } }
    });
    if (error) throw error;
    if (!result.user) throw new Error('Account creation could not be completed.');
    return { user: mapUser(result.user), needsEmailConfirmation: !result.session };
  }

  static async logout(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static onAuthStateChange(callback: (user: CitizenUser | null) => void): () => void {
    if (!supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? mapUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }
}
