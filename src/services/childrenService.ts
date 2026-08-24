import { getSupabaseClient } from '../lib/supabase/client';
import { Child, ChildSex } from '../types';
import { normalizeChildSex } from '../utils/childUtils';

const LOCAL_CHILDREN_KEY = 'nene_sprint2_children_list';

function getInitialDemoChildren(): Child[] {
  return [
    {
      id: 'child-samyr-1',
      familyId: 'family-default-1',
      name: 'Samyr',
      nickname: 'Samyr',
      sex: 'male',
      gender: 'male',
      birthDate: '2026-03-12',
      avatarBgColor: '#E8F2EC',
      bloodType: 'O+',
      allergies: 'Nenhuma conhecida',
      pediatrician: 'Dra. Camila Barros (CRM 12845)',
      pediatricianPhone: '(11) 98765-4321',
      notes: 'Gosta de ouvir ruído branco para adormecer.',
      active: true,
      createdAt: '2026-03-12T08:30:00Z',
    },
    {
      id: 'child-suayla-2',
      familyId: 'family-default-1',
      name: 'Suayla',
      nickname: 'Suayla',
      sex: 'female',
      gender: 'female',
      birthDate: '2026-03-12',
      avatarBgColor: '#FFF1E8',
      bloodType: 'O+',
      allergies: 'Sensibilidade leve a sabonetes comuns',
      pediatrician: 'Dra. Camila Barros (CRM 12845)',
      pediatricianPhone: '(11) 98765-4321',
      notes: 'Acalma-se no colo com embalo ritmado.',
      active: true,
      createdAt: '2026-03-12T08:35:00Z',
    },
  ];
}

function getLocalChildren(): Child[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHILDREN_KEY);
    if (raw) {
      const parsed: Child[] = JSON.parse(raw);
      const isLegacy = parsed.some((c) => /Theo|Luna/i.test(c.name));
      if (!isLegacy && parsed.length > 0) {
        return parsed.map((c) => {
          const norm = normalizeChildSex(c.sex || c.gender);
          return {
            ...c,
            sex: norm,
            gender: norm,
            avatarBgColor: c.avatarBgColor || (norm === 'female' ? '#FFF1E8' : '#E8F2EC'),
          };
        });
      }
    }
  } catch {}
  const defaults = getInitialDemoChildren();
  saveLocalChildren(defaults);
  return defaults;
}

function saveLocalChildren(children: Child[]) {
  localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(children));
}

export const childrenService = {
  async getChildrenByFamily(familyId: string, includeInactive = false): Promise<Child[]> {
    const client = getSupabaseClient();
    if (!client) {
      const all = getLocalChildren();
      return all.filter((c) => (c.familyId === familyId || familyId === 'all') && (includeInactive || c.active));
    }

    try {
      let query = (client.from('children') as any)
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: true });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      if (error || !data) {
        if (error) console.error('[Supabase Error - getChildrenByFamily]:', error);
        return [];
      }

      return (data as any[]).map((row) => {
        const normSex = normalizeChildSex(row.sex);
        return {
          id: row.id,
          familyId: row.family_id,
          name: row.name,
          nickname: row.nickname || undefined,
          birthDate: row.birth_date,
          sex: normSex,
          gender: normSex,
          photoUrl: row.photo_url || undefined,
          bloodType: row.blood_type || undefined,
          allergies: row.allergies || undefined,
          pediatrician: row.pediatrician || undefined,
          notes: row.notes || undefined,
          active: row.active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by || undefined,
          avatarBgColor: normSex === 'female' ? '#FFF1E8' : '#E8F2EC',
        };
      });
    } catch (err) {
      console.error('[Supabase Exception - getChildrenByFamily]:', err);
      return [];
    }
  },

  async createChild(data: {
    familyId: string;
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
    createdBy?: string;
  }): Promise<{ child: Child | null; error: string | null }> {
    const client = getSupabaseClient();
    const mappedSex = normalizeChildSex(data.sex || data.gender);

    if (!client) {
      const newChild: Child = {
        id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        familyId: data.familyId,
        name: data.name.trim(),
        nickname: data.nickname?.trim() || undefined,
        birthDate: data.birthDate,
        sex: mappedSex,
        gender: mappedSex,
        photoUrl: data.photoUrl || undefined,
        bloodType: data.bloodType?.trim() || undefined,
        allergies: data.allergies?.trim() || undefined,
        pediatrician: data.pediatrician?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: data.createdBy,
        avatarBgColor: mappedSex === 'female' ? '#FFF1E8' : '#E8F2EC',
      };

      const children = getLocalChildren();
      children.push(newChild);
      saveLocalChildren(children);

      return { child: newChild, error: null };
    }

    try {
      // Obter id do usuário autenticado no Supabase
      const { data: authData } = await client.auth.getUser();
      const creatorId = authData?.user?.id || data.createdBy || null;

      const { data: row, error } = await (client
        .from('children') as any)
        .insert({
          family_id: data.familyId,
          name: data.name.trim(),
          nickname: data.nickname?.trim() || null,
          birth_date: data.birthDate,
          sex: mappedSex,
          photo_url: data.photoUrl || null,
          blood_type: data.bloodType?.trim() || null,
          allergies: data.allergies?.trim() || null,
          pediatrician: data.pediatrician?.trim() || null,
          notes: data.notes?.trim() || null,
          active: true,
          created_by: creatorId,
        })
        .select()
        .single();

      if (error || !row) {
        console.error('[Supabase Error - public.children insert]:', error);
        return { child: null, error: error?.message || 'Não foi possível cadastrar a criança no banco de dados.' };
      }

      const returnedSex = normalizeChildSex(row.sex);
      return {
        child: {
          id: row.id,
          familyId: row.family_id,
          name: row.name,
          nickname: row.nickname || undefined,
          birthDate: row.birth_date,
          sex: returnedSex,
          gender: returnedSex,
          photoUrl: row.photo_url || undefined,
          bloodType: row.blood_type || undefined,
          allergies: row.allergies || undefined,
          pediatrician: row.pediatrician || undefined,
          notes: row.notes || undefined,
          active: row.active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by || undefined,
          avatarBgColor: returnedSex === 'female' ? '#FFF1E8' : '#E8F2EC',
        },
        error: null,
      };
    } catch (err: any) {
      console.error('[Supabase Exception - createChild]:', err);
      return { child: null, error: err.message || 'Erro inesperado ao salvar criança.' };
    }
  },

  async updateChild(
    childId: string,
    updates: Partial<Child>
  ): Promise<{ child: Child | null; error: string | null }> {
    const client = getSupabaseClient();
    const updatedSex = updates.sex !== undefined || updates.gender !== undefined
      ? normalizeChildSex(updates.sex || updates.gender)
      : undefined;

    if (!client) {
      const children = getLocalChildren();
      const idx = children.findIndex((c) => c.id === childId);
      if (idx === -1) return { child: null, error: 'Criança não encontrada.' };

      const currentNorm = normalizeChildSex(children[idx].sex || children[idx].gender);
      const finalSex = updatedSex !== undefined ? updatedSex : currentNorm;

      const updated: Child = {
        ...children[idx],
        ...updates,
        name: updates.name ? updates.name.trim() : children[idx].name,
        birthDate: updates.birthDate || children[idx].birthDate,
        sex: finalSex,
        gender: finalSex,
        avatarBgColor: finalSex === 'female' ? '#FFF1E8' : '#E8F2EC',
      };
      children[idx] = updated;
      saveLocalChildren(children);

      return { child: updated, error: null };
    }

    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.nickname !== undefined) payload.nickname = updates.nickname?.trim() || null;
      if (updates.birthDate !== undefined) payload.birth_date = updates.birthDate;
      if (updatedSex !== undefined) {
        payload.sex = updatedSex;
      }
      if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl || null;
      if (updates.bloodType !== undefined) payload.blood_type = updates.bloodType?.trim() || null;
      if (updates.allergies !== undefined) {
        payload.allergies = Array.isArray(updates.allergies)
          ? updates.allergies.join(', ')
          : updates.allergies || null;
      }
      if (updates.pediatrician !== undefined) payload.pediatrician = updates.pediatrician?.trim() || null;
      if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null;
      if (updates.active !== undefined) payload.active = updates.active;

      const { data: row, error } = await (client
        .from('children') as any)
        .update(payload)
        .eq('id', childId)
        .select()
        .single();

      if (error || !row) {
        console.error('[Supabase Error - updateChild]:', error);
        return { child: null, error: error?.message || 'Não foi possível atualizar as informações da criança.' };
      }

      const returnedSex = normalizeChildSex(row.sex);
      return {
        child: {
          id: row.id,
          familyId: row.family_id,
          name: row.name,
          nickname: row.nickname || undefined,
          birthDate: row.birth_date,
          sex: returnedSex,
          gender: returnedSex,
          photoUrl: row.photo_url || undefined,
          bloodType: row.blood_type || undefined,
          allergies: row.allergies || undefined,
          pediatrician: row.pediatrician || undefined,
          notes: row.notes || undefined,
          active: row.active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by || undefined,
          avatarBgColor: returnedSex === 'female' ? '#FFF1E8' : '#E8F2EC',
        },
        error: null,
      };
    } catch (err: any) {
      console.error('[Supabase Exception - updateChild]:', err);
      return { child: null, error: err.message || 'Erro inesperado ao atualizar.' };
    }
  },

  async deleteChild(childId: string): Promise<{ success: boolean; error: string | null }> {
    return this.updateChild(childId, { active: false }).then((res) => ({
      success: Boolean(res.child),
      error: res.error,
    }));
  },
};
