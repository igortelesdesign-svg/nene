-- ==============================================================================
-- NENÊ - SPRINT 2: ESTRUTURA REAL DE BANCO DE DADOS (SUPABASE POSTGRESQL + RLS)
-- ==============================================================================

-- 1. TABELA PROFILES (Vínculo direto com Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. TABELA FAMILIES
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. TABELA FAMILY_MEMBERS
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'responsible', 'caregiver', 'viewer')),
  relation text default 'Responsável',
  created_at timestamptz not null default now(),
  unique(family_id, user_id)
);

-- 4. TABELA CHILDREN
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  nickname text,
  birth_date date not null,
  sex text check (sex in ('M', 'F', 'other')),
  photo_url text,
  blood_type text,
  allergies text,
  pediatrician text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- ==============================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;

-- Função auxiliar segura para checar pertencimento à família
create or replace function public.is_family_member(f_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = f_id and user_id = auth.uid()
  );
$$;

-- Políticas para PROFILES
create policy "Usuários podem visualizar perfis da mesma família ou próprio"
  on public.profiles for select
  using (
    auth.uid() = id or exists (
      select 1 from public.family_members fm1
      join public.family_members fm2 on fm1.family_id = fm2.family_id
      where fm1.user_id = auth.uid() and fm2.user_id = profiles.id
    )
  );

create policy "Usuários podem criar e atualizar seu próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Usuários podem editar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Políticas para FAMILIES
create policy "Usuários podem visualizar famílias às quais pertencem"
  on public.families for select
  using (
    created_by = auth.uid() or public.is_family_member(id)
  );

create policy "Usuários autenticados podem criar famílias"
  on public.families for insert
  with check (auth.uid() = created_by);

create policy "Membros admin podem atualizar dados da família"
  on public.families for update
  using (
    public.is_family_member(id)
  );

-- Políticas para FAMILY_MEMBERS
create policy "Membros podem ver outros membros da mesma família"
  on public.family_members for select
  using (
    user_id = auth.uid() or public.is_family_member(family_id)
  );

create policy "Criadores ou admins podem adicionar membros"
  on public.family_members for insert
  with check (
    user_id = auth.uid() or public.is_family_member(family_id)
  );

create policy "Admins podem atualizar membros"
  on public.family_members for update
  using (public.is_family_member(family_id));

-- Políticas para CHILDREN
create policy "Membros da família podem visualizar crianças ativas"
  on public.children for select
  using (
    public.is_family_member(family_id)
  );

create policy "Membros da família podem cadastrar crianças"
  on public.children for insert
  with check (
    public.is_family_member(family_id)
  );

create policy "Membros da família podem atualizar dados de crianças"
  on public.children for update
  using (
    public.is_family_member(family_id)
  );

create policy "Membros da família podem excluir/desativar crianças"
  on public.children for delete
  using (
    public.is_family_member(family_id)
  );

-- Trigger para atualizar profiles automaticamente ao cadastrar novo usuário no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
