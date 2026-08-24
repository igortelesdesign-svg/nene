import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Family, FamilyMember, Child, ChildSex } from '../types';
import { authService } from '../services/authService';
import { familyService } from '../services/familyService';
import { childrenService } from '../services/childrenService';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase/client';

interface AppContextType {
  user: User | null;
  family: Family | null;
  familyMembers: FamilyMember[];
  childrenList: Child[];
  selectedChildId: string | 'all';
  setSelectedChildId: (id: string | 'all') => void;
  loading: boolean;
  isConfiguredSupabase: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signUp: (params: { fullName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signIn: (params: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  createFamily: (name: string) => Promise<{ family: Family | null; error?: string }>;
  addChild: (childData: {
    name: string;
    nickname?: string;
    birthDate: string;
    sex?: ChildSex | string;
    gender?: ChildSex | string;
    photoUrl?: string;
    bloodType?: string;
    allergies?: string;
    pediatrician?: string;
    notes?: string;
  }) => Promise<{ child: Child | null; error?: string }>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<{ child: Child | null; error?: string }>;
  deleteChild: (childId: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  const loadAppData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setFamily(null);
      setFamilyMembers([]);
      setChildrenList([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Obter auth.getUser() e user.id autenticado
      const client = getSupabaseClient();
      let authUserId = currentUser.id;
      if (client) {
        const { data: authData, error: authErr } = await client.auth.getUser();
        if (authErr || !authData?.user) {
          console.warn('[AppContext] Falha ao obter auth.getUser():', authErr);
          setUser(null);
          setFamily(null);
          setFamilyMembers([]);
          setChildrenList([]);
          return;
        }
        authUserId = authData.user.id;
      }

      // 2. Consultar public.family_members filtrando exclusivamente por user_id = user.id
      // 3. A partir do family_id encontrado, carregar a família correspondente em public.families
      // (com tratamento para múltiplos vínculos sem criar nova família, conforme regra 10)
      const { family: primaryFamily, familyMembers: members } = await familyService.getPrimaryFamilyForUser(authUserId);

      setFamily(primaryFamily);
      setFamilyMembers(members);

      if (primaryFamily) {
        // 4. Carregar crianças de public.children exclusivamente com family_id igual ao da família recuperada
        const children = await childrenService.getChildrenByFamily(primaryFamily.id);
        setChildrenList(children);
      } else {
        setChildrenList([]);
      }
    } catch (err) {
      console.error('[AppContext] Erro ao carregar dados do aplicativo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialização e Listener de Autenticação Supabase
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        setLoading(true);
        const initialUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(initialUser);
          if (initialUser) {
            await loadAppData(initialUser);
          } else {
            setFamily(null);
            setFamilyMembers([]);
            setChildrenList([]);
          }
        }
      } catch (err) {
        console.error('Erro na inicialização de autenticação:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const client = getSupabaseClient();
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setFamily(null);
          setChildrenList([]);
          setFamilyMembers([]);
          setSelectedChildId('all');
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const authUser = await authService.getCurrentUser();
          if (isMounted && authUser) {
            setUser(authUser);
            await loadAppData(authUser);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [loadAppData]);

  const refreshData = useCallback(async () => {
    if (user) {
      await loadAppData(user);
    }
  }, [user, loadAppData]);

  const handleSignUp = async ({
    fullName,
    email,
    password,
  }: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setAuthError(null);
    setLoading(true);
    const res = await authService.signUp({ fullName, email, password });
    if (res.error) {
      setAuthError(res.error);
      setLoading(false);
      return { success: false, error: res.error };
    }
    if (res.user) {
      setUser(res.user);
      await loadAppData(res.user);
    }
    setLoading(false);
    return { success: true };
  };

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    setAuthError(null);
    setLoading(true);
    const res = await authService.signIn({ email, password });
    if (res.error) {
      setAuthError(res.error);
      setLoading(false);
      return { success: false, error: res.error };
    }
    if (res.user) {
      setUser(res.user);
      await loadAppData(res.user);
    }
    setLoading(false);
    return { success: true };
  };

  const handleSignOut = async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setFamily(null);
    setFamilyMembers([]);
    setChildrenList([]);
    setSelectedChildId('all');
    setLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    const res = await authService.resetPassword(email);
    return res;
  };

  const handleCreateFamily = async (name: string) => {
    if (!user) {
      const errMsg = 'Usuário não autenticado.';
      console.error('[AppContext createFamily]:', errMsg);
      return { family: null, error: errMsg };
    }

    const res = await familyService.createFamily({ name, userId: user.id });
    if (res.family) {
      setFamily(res.family);
      const members = await familyService.getFamilyMembers(res.family.id);
      setFamilyMembers(members);
      const children = await childrenService.getChildrenByFamily(res.family.id);
      setChildrenList(children);
    } else {
      console.error('[AppContext createFamily failed]:', res.error);
    }
    return res;
  };

  const handleAddChild = async (childData: {
    name: string;
    nickname?: string;
    birthDate: string;
    sex?: ChildSex | string;
    gender?: ChildSex | string;
    photoUrl?: string;
    bloodType?: string;
    allergies?: string;
    pediatrician?: string;
    notes?: string;
  }) => {
    if (!family || !user) {
      const errMsg = 'Família ou usuário não encontrado.';
      console.error('[AppContext addChild]:', errMsg, { family, user });
      return { child: null, error: errMsg };
    }

    const res = await childrenService.createChild({
      familyId: family.id,
      ...childData,
      createdBy: user.id,
    });

    if (res.child) {
      setChildrenList((prev) => [...prev, res.child!]);
    } else {
      console.error('[AppContext addChild failed]:', res.error);
    }
    return res;
  };

  const handleUpdateChild = async (childId: string, updates: Partial<Child>) => {
    const res = await childrenService.updateChild(childId, updates);
    if (res.child) {
      setChildrenList((prev) =>
        prev.map((c) => (c.id === childId ? res.child! : c)).filter((c) => c.active)
      );
    }
    return res;
  };

  const handleDeleteChild = async (childId: string) => {
    const res = await childrenService.deleteChild(childId);
    if (res.success) {
      setChildrenList((prev) => prev.filter((c) => c.id !== childId));
      if (selectedChildId === childId) {
        setSelectedChildId('all');
      }
    }
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        family,
        familyMembers,
        childrenList,
        selectedChildId,
        setSelectedChildId,
        loading,
        isConfiguredSupabase: isSupabaseConfigured,
        authError,
        clearAuthError,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        createFamily: handleCreateFamily,
        addChild: handleAddChild,
        updateChild: handleUpdateChild,
        deleteChild: handleDeleteChild,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
