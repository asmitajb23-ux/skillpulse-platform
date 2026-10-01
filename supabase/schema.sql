-- ============================================================
-- SkillPulse — Supabase (PostgreSQL) schema
-- Run this in the Supabase SQL editor to provision the database.
-- Row Level Security policies included for multi-role access.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------------- profiles ----------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('student', 'recruiter', 'college_admin')),
  created_at timestamptz not null default now()
);

create table public.student_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  college text not null default '',
  course text not null default '',
  graduation_year int not null default 2027,
  headline text not null default '',
  target_role_id uuid references public.roles(id) on delete set null,
  profile_completion int not null default 0 check (profile_completion between 0 and 100),
  updated_at timestamptz not null default now()
);

create table public.recruiter_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company text not null default '',
  company_size text not null default '',
  hiring_for text[] not null default '{}'
);

create table public.college_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_name text not null default '',
  department text not null default '',
  total_students int not null default 0
);

-- ---------------- skills & roles ----------------
create table public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null default 'General'
);

create table public.roles (
  id uuid primary key default uuid_generate_v4(),
  title text not null unique,
  description text not null default ''
);

create table public.role_skills (
  role_id uuid not null references public.roles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  weight int not null default 3 check (weight between 1 and 5),
  primary key (role_id, skill_id)
);

create table public.student_skills (
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level int not null default 0 check (level between 0 and 100),
  primary key (student_id, skill_id)
);

-- ---------------- assessments ----------------
create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  title text not null,
  description text not null default '',
  duration_minutes int not null default 15,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.assessment_questions (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  type text not null check (type in ('mcq', 'coding')),
  prompt text not null,
  options jsonb,
  correct_option int,
  keywords text[],
  points int not null default 10,
  explanation text not null default '',
  position int not null default 0
);

create table public.assessment_attempts (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id),
  score int not null,
  total int not null,
  percentage int not null check (percentage between 0 and 100),
  time_taken_seconds int not null default 0,
  answers jsonb not null default '[]',
  completed_at timestamptz not null default now()
);

-- ---------------- portfolio ----------------
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  technologies text[] not null default '{}',
  github_url text,
  live_url text,
  evidence text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified')),
  created_at timestamptz not null default now()
);

create table public.project_skills (
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

create table public.certificates (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  name text not null,
  issuer text not null,
  date date not null,
  credential_url text,
  skill_id uuid references public.skills(id) on delete set null,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified'))
);

-- ---------------- skill proof chain ----------------
create table public.skill_evidence (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  source_type text not null check (source_type in ('assessment', 'project', 'certificate', 'viva')),
  source_id uuid,
  label text not null,
  detail text not null default '',
  contribution int not null default 0,
  max_contribution int not null default 0,
  computed_at timestamptz not null default now(),
  unique (student_id, skill_id, source_type, source_id, label)
);

-- ---------------- AI viva ----------------
create table public.viva_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  topic_type text not null check (topic_type in ('project', 'skill')),
  topic_id uuid not null,
  topic_name text not null,
  questions jsonb not null default '[]',
  answers jsonb not null default '[]',
  score int not null default 0 check (score between 0 and 100),
  strengths jsonb not null default '[]',
  improvements jsonb not null default '[]',
  completed_at timestamptz not null default now()
);

-- ---------------- learning ----------------
create table public.learning_resources (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  title text not null,
  provider text not null,
  resource_type text not null check (resource_type in ('course', 'documentation', 'practice', 'video')),
  url text not null,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced', 'expert'))
);

-- ---------------- recruiter shortlists ----------------
create table public.shortlists (
  id uuid primary key default uuid_generate_v4(),
  recruiter_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  unique (recruiter_id, student_id)
);

-- ---------------- indexes ----------------
create index idx_attempts_student on public.assessment_attempts(student_id);
create index idx_attempts_skill on public.assessment_attempts(skill_id);
create index idx_projects_student on public.projects(student_id);
create index idx_certificates_student on public.certificates(student_id);
create index idx_viva_student on public.viva_sessions(student_id);
create index idx_evidence_student_skill on public.skill_evidence(student_id, skill_id);
create index idx_shortlists_recruiter on public.shortlists(recruiter_id);

-- ---------------- row level security ----------------
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_skills enable row level security;
alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.viva_sessions enable row level security;
alter table public.shortlists enable row level security;

create policy "profiles readable by all authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles self update" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "student profiles readable by all authenticated" on public.student_profiles
  for select to authenticated using (true);
create policy "student profile self write" on public.student_profiles
  for all to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('college_admin'))
  );

create policy "student skills readable" on public.student_skills
  for select to authenticated using (true);

create policy "projects readable" on public.projects
  for select to authenticated using (true);
create policy "projects owner write" on public.projects
  for all to authenticated using (
    exists (select 1 from public.student_profiles sp where sp.id = student_id and sp.user_id = auth.uid())
  );

create policy "certificates readable" on public.certificates
  for select to authenticated using (true);
create policy "certificates owner write" on public.certificates
  for all to authenticated using (
    exists (select 1 from public.student_profiles sp where sp.id = student_id and sp.user_id = auth.uid())
  );

create policy "attempts readable" on public.assessment_attempts
  for select to authenticated using (true);
create policy "attempts owner insert" on public.assessment_attempts
  for insert to authenticated with check (
    exists (select 1 from public.student_profiles sp where sp.id = student_id and sp.user_id = auth.uid())
  );

create policy "viva readable" on public.viva_sessions
  for select to authenticated using (true);
create policy "viva owner insert" on public.viva_sessions
  for insert to authenticated with check (
    exists (select 1 from public.student_profiles sp where sp.id = student_id and sp.user_id = auth.uid())
  );

create policy "shortlists recruiter access" on public.shortlists
  for all to authenticated using (recruiter_id = auth.uid());

-- ---------------- trigger: create profile row on signup ----------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  if coalesce(new.raw_user_meta_data->>'role', 'student') = 'student' then
    insert into public.student_profiles (user_id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Privacy & data governance
-- ============================================================

create table public.privacy_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_visibility text not null default 'public' check (profile_visibility in ('public', 'private')),
  passport_sharing boolean not null default true,
  allow_recruiter_access boolean not null default true,
  allow_college_analytics boolean not null default true,
  show_contact_email boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.data_deletion_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  reason text,
  requested_at timestamptz not null default now()
);

create index idx_deletion_user on public.data_deletion_requests(user_id);

-- Seed default privacy settings whenever a profile is created.
create or replace function public.handle_new_profile_privacy()
returns trigger language plpgsql security definer as $$
begin
  insert into public.privacy_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile_privacy();

-- Resolve the owning auth.uid() for a student_profiles row.
create or replace function public.student_owner_uid(sp_id uuid)
returns uuid language sql stable as $$
  select user_id from public.student_profiles where id = sp_id;
$$;

-- Role-based + consent-based authorization gate for viewing a student's data.
-- Owner always allowed. College admins allowed only with analytics consent.
-- Recruiters allowed only when the profile is public AND recruiter access is on.
create or replace function public.viewer_may_see_student(owner_uid uuid)
returns boolean language sql stable security definer as $$
  select
    owner_uid = auth.uid()
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'college_admin')
      and coalesce(
        (select allow_college_analytics from public.privacy_settings where user_id = owner_uid),
        true
      )
    )
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'recruiter')
      and coalesce(
        (select profile_visibility = 'public' and allow_recruiter_access
           from public.privacy_settings where user_id = owner_uid),
        true
      )
    );
$$;

-- RLS: privacy tables are strictly self-service.
alter table public.privacy_settings enable row level security;
alter table public.data_deletion_requests enable row level security;

create policy "privacy settings self read" on public.privacy_settings
  for select to authenticated using (user_id = auth.uid());
create policy "privacy settings self write" on public.privacy_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "deletion requests self read" on public.data_deletion_requests
  for select to authenticated using (user_id = auth.uid());
create policy "deletion requests self insert" on public.data_deletion_requests
  for insert to authenticated with check (user_id = auth.uid());
create policy "deletion requests self update" on public.data_deletion_requests
  for update to authenticated using (user_id = auth.uid());

-- Replace permissive student-data reads with privacy-aware, role-based policies.
drop policy if exists "student profiles readable by all authenticated" on public.student_profiles;
create policy "student profiles privacy-aware read" on public.student_profiles
  for select to authenticated using (public.viewer_may_see_student(user_id));

drop policy if exists "projects readable" on public.projects;
create policy "projects privacy-aware read" on public.projects
  for select to authenticated using (public.viewer_may_see_student(public.student_owner_uid(student_id)));

drop policy if exists "certificates readable" on public.certificates;
create policy "certificates privacy-aware read" on public.certificates
  for select to authenticated using (public.viewer_may_see_student(public.student_owner_uid(student_id)));

drop policy if exists "attempts readable" on public.assessment_attempts;
create policy "attempts privacy-aware read" on public.assessment_attempts
  for select to authenticated using (public.viewer_may_see_student(public.student_owner_uid(student_id)));

drop policy if exists "viva readable" on public.viva_sessions;
create policy "viva privacy-aware read" on public.viva_sessions
  for select to authenticated using (public.viewer_may_see_student(public.student_owner_uid(student_id)));
