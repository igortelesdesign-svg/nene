import { getSupabaseClient } from '../lib/supabase/client';
import { Profile, User } from '../types';

const LOCAL_USER_KEY = 'nene_sprint2_auth_user';

function getLocalStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocalUser(user: User | null) {
  if (user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalStoredUser() || {
        id: 'demo-user-1',
        email: 'responsavel@nene.app.br',
        name: 'Ana Silva',
        fullName: 'Ana Silva',
        role: 'admin',
        relation: 'Mãe',
        avatarUrl: null,
        createdAt: '2026-01-10T10:00:00Z',
      };
    }

    try {
      const { data: { user }, error: authErr } = await client.auth.getUser();
      if (authErr || !user) return null;

      const { data: profileRow } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profile = profileRow as any;

      if (!profile) {
        // Garantir que a linha de perfil exista em public.profiles
        const nameFallback = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Responsável';
        await (client.from('profiles') as any).upsert(
          {
            id: user.id,
            full_name: nameFallback,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        return {
          id: user.id,
          email: user.email || '',
          name: nameFallback,
          fullName: nameFallback,
          role: 'admin',
          relation: 'Responsável',
          avatarUrl: null,
          createdAt: user.created_at || new Date().toISOString(),
        };
      }

      return {
        id: profile.id,
        email: user.email || '',
        name: profile.full_name,
        fullName: profile.full_name,
        phone: profile.phone || undefined,
        avatarUrl: profile.avatar_url || undefined,
        role: 'admin',
        relation: 'Responsável',
        createdAt: profile.created_at,
      };
    } catch (err) {
      console.warn('Erro ao obter usuário autenticado:', err);
      return null;
    }
  },

  async signUp({
    fullName,
    email,
    password,
  }: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ user: User | null; error: string | null; requiresEmailConfirmation?: boolean }> {
    const client = getSupabaseClient();

    if (!client) {
      const id = `user-${Date.now()}`;
      const newUser: User = {
        id,
        email,
        name: fullName,
        fullName,
        role: 'admin',
        relation: 'Responsável',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };
      saveLocalUser(newUser);
      return { user: newUser, error: null };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Criar ou garantir perfil na tabela profiles se já houver sessão ativa
        if (data.session) {
          await (client.from('profiles') as any).upsert({
            id: data.user.id,
            full_name: fullName,
            avatar_url: null,
            phone: null,
          }, { onConflict: 'id' });
        }

        const appUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: fullName,
          fullName,
          role: 'admin',
          relation: 'Responsável',
          avatarUrl: null,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        const requiresConfirmation = !data.session && Boolean(data.user);
        return { user: appUser, error: null, requiresEmailConfirmation: requiresConfirmation };
      }

      return { user: null, error: 'Não foi possível completar o cadastro.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro inesperado ao cadastrar.' };
    }
  },

  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: User | null; error: string | null }> {
    const client = getSupabaseClient();

    if (!client) {
      const existing = getLocalStoredUser();
      if (existing && existing.email === email) {
        return { user: existing, error: null };
      }
      const demoUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        fullName: email.split('@')[0],
        role: 'admin',
        relation: 'Responsável',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };
      saveLocalUser(demoUser);
      return { user: demoUser, error: null };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: 'E-mail ou senha incorretos.' };
      }

      if (data.user) {
        const { data: profileRow } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        let profile = profileRow as any;

        if (!profile) {
          const nameFallback = data.user.user_metadata?.full_name || email.split('@')[0];
          await (client.from('profiles') as any).upsert(
            {
              id: data.user.id,
              full_name: nameFallback,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        }

        const appUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
          fullName: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
          phone: profile?.phone || undefined,
          avatarUrl: profile?.avatar_url || undefined,
          role: 'admin',
          relation: 'Responsável',
          createdAt: profile?.created_at || data.user.created_at,
        };

        return { user: appUser, error: null };
      }

      return { user: null, error: 'Erro ao autenticar usuário.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro ao conectar com o serviço de autenticação.' };
    }
  },

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    saveLocalUser(null);
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: true, error: null };
    }
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao solicitar recuperação de senha.' };
    }
  },

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | null> {
    const client = getSupabaseClient();
    if (!client) {
      const current = getLocalStoredUser();
      if (current && current.id === userId) {
        const updated = {
          ...current,
          fullName: data.fullName || current.fullName,
          name: data.fullName || current.name,
          phone: data.phone ?? current.phone,
          avatarUrl: data.avatarUrl ?? current.avatarUrl,
        };
        saveLocalUser(updated);
      }
      return {
        id: userId,
        fullName: data.fullName || 'Usuário',
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (data.fullName !== undefined) payload.full_name = data.fullName;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;

      const { data: updated, error } = await (client.from('profiles') as any)
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error || !updated) return null;

      return {
        id: updated.id,
        fullName: updated.full_name,
        phone: updated.phone,
        avatarUrl: updated.avatar_url,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      return null;
    }
  },
};
