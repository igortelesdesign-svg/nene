import { getSupabaseClient } from '../lib/supabase/client';
import { Family, FamilyMember } from '../types';

const LOCAL_FAMILIES_KEY = 'nene_sprint2_families';
const LOCAL_MEMBERS_KEY = 'nene_sprint2_family_members';

function getLocalFamilies(): Family[] {
  try {
    const raw = localStorage.getItem(LOCAL_FAMILIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'family-default-1',
      name: 'Família Silva',
      createdBy: 'demo-user-1',
      createdAt: '2026-01-10T10:00:00Z',
    },
  ];
}

function saveLocalFamilies(families: Family[]) {
  localStorage.setItem(LOCAL_FAMILIES_KEY, JSON.stringify(families));
}

function getLocalMembers(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEMBERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'member-1',
      familyId: 'family-default-1',
      userId: 'demo-user-1',
      role: 'admin',
      relation: 'Mãe',
      name: 'Ana Silva',
      email: 'responsavel@nene.app.br',
      createdAt: '2026-01-10T10:00:00Z',
    },
  ];
}

function saveLocalMembers(members: FamilyMember[]) {
  localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(members));
}

export interface UserFamilyData {
  family: Family | null;
  familyMembers: FamilyMember[];
}

export const familyService = {
  /**
   * Recupera a família primária do usuário autenticado no Supabase seguindo as regras:
   * 1. Obtém auth.getUser() e usa o user.id autenticado.
   * 2. Consulta public.family_members filtrando exclusivamente por user_id = user.id.
   * 3. A partir do family_id encontrado, carrega a família correspondente em public.families.
   * 10. Se múltiplos vínculos forem encontrados, não cria outra família; seleciona a que possui crianças.
   */
  async getPrimaryFamilyForUser(userId: string): Promise<UserFamilyData> {
    const client = getSupabaseClient();
    if (!client) {
      const allFamilies = getLocalFamilies();
      const allMembers = getLocalMembers();
      const userFamilyIds = allMembers.filter((m) => m.userId === userId).map((m) => m.familyId);
      const foundFamily = allFamilies.find((f) => userFamilyIds.includes(f.id) || f.createdBy === userId) || null;
      const members = foundFamily ? allMembers.filter((m) => m.familyId === foundFamily.id) : [];
      return { family: foundFamily, familyMembers: members };
    }

    try {
      // 1. Obter auth.getUser() obrigatoriamente
      const { data: authData, error: authErr } = await client.auth.getUser();
      if (authErr || !authData?.user) {
        console.warn('[familyService] auth.getUser() não retornou usuário autenticado:', authErr);
        return { family: null, familyMembers: [] };
      }

      const authenticatedUserId = authData.user.id;
      const effectiveUserId = authenticatedUserId || userId;

      // 2. Consultar public.family_members filtrando EXCLUSIVAMENTE por user_id = user.id
      const { data: memberRows, error: memberErr } = await (client
        .from('family_members') as any)
        .select('id, family_id, user_id, role, relation, created_at')
        .eq('user_id', effectiveUserId);

      if (memberErr) {
        console.error('[Supabase Error - getPrimaryFamilyForUser family_members]:', memberErr);
        return { family: null, familyMembers: [] };
      }

      if (!memberRows || memberRows.length === 0) {
        // Usuário realmente não possui nenhum vínculo em family_members
        return { family: null, familyMembers: [] };
      }

      // 10. Se múltiplos vínculos forem encontrados para o mesmo usuário
      let targetFamilyId = memberRows[0].family_id;

      if (memberRows.length > 1) {
        console.warn(
          `[NENÊ Auth/Family] Múltiplos vínculos (${memberRows.length}) encontrados em public.family_members para o usuário ${effectiveUserId}:`,
          memberRows
        );

        const allFamilyIds = memberRows.map((r: any) => r.family_id).filter(Boolean);

        // Consultar public.children para verificar qual das famílias possui crianças cadastradas
        try {
          const { data: childrenRows, error: childrenErr } = await (client
            .from('children') as any)
            .select('id, family_id, active')
            .in('family_id', allFamilyIds);

          if (!childrenErr && childrenRows && childrenRows.length > 0) {
            const counts: Record<string, number> = {};
            childrenRows.forEach((c: any) => {
              if (c.family_id) {
                counts[c.family_id] = (counts[c.family_id] || 0) + (c.active !== false ? 2 : 1);
              }
            });

            let bestFamilyId = allFamilyIds[0];
            let maxCount = -1;
            for (const fid of allFamilyIds) {
              const count = counts[fid] || 0;
              if (count > maxCount) {
                maxCount = count;
                bestFamilyId = fid;
              }
            }
            targetFamilyId = bestFamilyId;
            console.info(
              `[NENÊ Auth/Family] Família selecionada para recuperação dos dados existentes: ${targetFamilyId} (com crianças).`
            );
          }
        } catch (childCheckErr) {
          console.error('[NENÊ Auth/Family] Erro ao consultar crianças para resolução de múltiplos vínculos:', childCheckErr);
        }
      }

      if (!targetFamilyId) {
        return { family: null, familyMembers: [] };
      }

      // 3. A partir do family_id encontrado, carregar a família correspondente em public.families
      const { data: familyRow, error: famErr } = await (client
        .from('families') as any)
        .select('*')
        .eq('id', targetFamilyId)
        .single();

      if (famErr || !familyRow) {
        console.error('[Supabase Error - getPrimaryFamilyForUser public.families]:', famErr);
        return { family: null, familyMembers: [] };
      }

      const loadedFamily: Family = {
        id: familyRow.id,
        name: familyRow.name,
        createdBy: familyRow.created_by || '',
        createdAt: familyRow.created_at,
        updatedAt: familyRow.updated_at,
      };

      // Carregar os membros dessa família
      const members = await familyService.getFamilyMembers(targetFamilyId);

      return { family: loadedFamily, familyMembers: members };
    } catch (err) {
      console.error('[Supabase Exception - getPrimaryFamilyForUser]:', err);
      return { family: null, familyMembers: [] };
    }
  },

  async getFamiliesForUser(userId: string): Promise<Family[]> {
    const primary = await this.getPrimaryFamilyForUser(userId);
    if (primary.family) {
      return [primary.family];
    }
    return [];
  },

  async createFamily({
    name,
    userId,
    userRelation = 'Responsável',
  }: {
    name: string;
    userId: string;
    userRelation?: string;
  }): Promise<{ family: Family | null; error: string | null }> {
    const client = getSupabaseClient();

    // Modo local (apenas se Supabase não estiver configurado)
    if (!client) {
      const newFamily: Family = {
        id: `family-${Date.now()}`,
        name: name.trim() || 'Minha Família',
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      const families = getLocalFamilies();
      families.push(newFamily);
      saveLocalFamilies(families);

      const members = getLocalMembers();
      members.push({
        id: `member-${Date.now()}`,
        familyId: newFamily.id,
        userId,
        role: 'admin',
        relation: userRelation,
        createdAt: new Date().toISOString(),
      });
      saveLocalMembers(members);

      return { family: newFamily, error: null };
    }

    try {
      // 1. Obter o usuário autenticado atual diretamente do Supabase Auth para garantir auth.uid()
      const { data: authData, error: authUserErr } = await client.auth.getUser();
      if (authUserErr || !authData?.user) {
        console.error('[Supabase Auth Error - createFamily]: Usuário não autenticado:', authUserErr);
        return {
          family: null,
          error: authUserErr?.message || 'Sessão expirada. Por favor, entre novamente.',
        };
      }

      const authUser = authData.user;
      const effectiveUserId = authUser.id;

      // 5. Se o usuário já possuir vínculo em family_members, NUNCA crie uma nova família.
      const { data: existingMembers } = await (client.from('family_members') as any)
        .select('family_id')
        .eq('user_id', effectiveUserId);

      if (existingMembers && existingMembers.length > 0) {
        console.warn('[familyService.createFamily] Usuário já possui vínculo em family_members. Recuperando família existente.');
        const primary = await this.getPrimaryFamilyForUser(effectiveUserId);
        if (primary.family) {
          return { family: primary.family, error: null };
        }
      }

      // 2. Garantir que a linha correspondente em public.profiles exista (necessária pela foreign key)
      const userFullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Responsável';
      const { error: profileUpsertErr } = await (client.from('profiles') as any).upsert(
        {
          id: effectiveUserId,
          full_name: userFullName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (profileUpsertErr) {
        console.error('[Supabase Error - createFamily ensure profile]:', profileUpsertErr);
      }

      // 3. Inserir linha em public.families com created_by = auth.uid()
      const { data: familyRow, error: famErr } = await (client
        .from('families') as any)
        .insert({
          name: name.trim() || 'Minha Família',
          created_by: effectiveUserId,
        })
        .select()
        .single();

      if (famErr || !familyRow) {
        console.error('[Supabase Error - public.families insert]:', famErr);
        return {
          family: null,
          error: famErr?.message || 'Não foi possível cadastrar a família no Supabase.',
        };
      }

      // 4. Inserir vínculo correspondente em public.family_members
      const { data: memberRow, error: memberErr } = await (client
        .from('family_members') as any)
        .insert({
          family_id: familyRow.id,
          user_id: effectiveUserId,
          role: 'admin',
          relation: userRelation || 'Responsável',
        })
        .select()
        .single();

      if (memberErr) {
        console.error('[Supabase Error - public.family_members insert]:', memberErr);
        return {
          family: null,
          error: memberErr?.message || 'A família foi criada, mas ocorreu um erro ao registrar o vínculo de administrador.',
        };
      }

      return {
        family: {
          id: familyRow.id,
          name: familyRow.name,
          createdBy: familyRow.created_by || effectiveUserId,
          createdAt: familyRow.created_at,
          updatedAt: familyRow.updated_at,
        },
        error: null,
      };
    } catch (err: any) {
      console.error('[Supabase Exception - createFamily]:', err);
      return { family: null, error: err.message || 'Erro inesperado ao criar família no Supabase.' };
    }
  },

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    const client = getSupabaseClient();
    if (!client) {
      const members = getLocalMembers().filter((m) => m.familyId === familyId);
      return members;
    }

    try {
      const { data, error } = await (client
        .from('family_members') as any)
        .select(`
          id,
          family_id,
          user_id,
          role,
          relation,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('family_id', familyId);

      if (error || !data) {
        if (error) console.error('[Supabase Error - getFamilyMembers]:', error);
        return [];
      }

      return (data as any[]).map((item: any) => ({
        id: item.id,
        familyId: item.family_id,
        userId: item.user_id,
        role: item.role,
        relation: item.relation || 'Membro',
        name: item.profiles?.full_name || 'Responsável',
        avatarUrl: item.profiles?.avatar_url || undefined,
        createdAt: item.created_at,
      }));
    } catch (err) {
      console.error('[Supabase Exception - getFamilyMembers]:', err);
      return [];
    }
  },
};

