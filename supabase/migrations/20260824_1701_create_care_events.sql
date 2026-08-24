-- ============================================================
-- NENÊ
-- Migration: eventos gerais de cuidado
-- Fralda, alimentação, sono, temperatura, crescimento,
-- consultas, vacinas e observações.
--
-- Medicações permanecerão em estrutura própria.
-- ============================================================

create table if not exists public.care_events (
  id uuid primary key default gen_random_uuid(),

  family_id uuid not null
    references public.families(id)
    on delete cascade,

  child_id uuid not null
    references public.children(id)
    on delete cascade,

  category text not null
    check (
      category in (
        'feeding',
        'sleep',
        'diaper',
        'temperature',
        'growth',
        'appointment',
        'vaccine',
        'note'
      )
    ),

  occurred_at timestamptz not null default now(),

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  notes text,

  -- Dados específicos de cada tipo de cuidado.
  -- Ex:
  -- diaper: {"diaperType":"wet"}
  -- feeding: {"feedingType":"bottle","amountMl":120}
  -- sleep: {"durationMinutes":60}
  data jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices
create index if not exists care_events_family_id_idx
  on public.care_events(family_id);

create index if not exists care_events_child_id_idx
  on public.care_events(child_id);

create index if not exists care_events_child_occurred_at_idx
  on public.care_events(child_id, occurred_at desc);

-- ============================================================
-- Função auxiliar de autorização
-- SECURITY DEFINER evita depender das policies de
-- family_members durante a validação e previne recursão RLS.
-- ============================================================

create or replace function public.can_access_child(
  p_child_id uuid,
  p_family_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.children c
    join public.family_members fm
      on fm.family_id = c.family_id
    where c.id = p_child_id
      and c.family_id = p_family_id
      and fm.user_id = auth.uid()
  );
$$;

revoke all on function public.can_access_child(uuid, uuid) from public;
grant execute on function public.can_access_child(uuid, uuid) to authenticated;

-- ============================================================
-- RLS
-- ============================================================

alter table public.care_events enable row level security;

revoke all on table public.care_events from anon;

grant select, insert, update, delete
on table public.care_events
to authenticated;

create policy "care_events_select_family"
on public.care_events
for select
to authenticated
using (
  public.can_access_child(child_id, family_id)
);

create policy "care_events_insert_family"
on public.care_events
for insert
to authenticated
with check (
  public.can_access_child(child_id, family_id)
  and created_by = auth.uid()
);

create policy "care_events_update_family"
on public.care_events
for update
to authenticated
using (
  public.can_access_child(child_id, family_id)
)
with check (
  public.can_access_child(child_id, family_id)
);

create policy "care_events_delete_family"
on public.care_events
for delete
to authenticated
using (
  public.can_access_child(child_id, family_id)
);
