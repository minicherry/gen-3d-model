-- 表结构包含两份 API 返回的所有 key：text-to-3d-refine 与 image-to-3d
create table if not exists public.generate_records (
  task_id text primary key,
  result_id text,
  type text not null default '',
  mode text not null default '',
  name text not null default '',
  model_type text not null default '',
  seed bigint,
  art_style text not null default '',
  texture_richness text not null default '',
  prompt text not null default '',
  negative_prompt text not null default '',
  texture_prompt text not null default '',
  texture_image_url text not null default '',
  preview_task_id text not null default '',
  status text not null default '',
  created_at bigint,
  progress integer,
  started_at bigint,
  finished_at bigint,
  expires_at bigint,
  preceding_tasks integer,
  task_error jsonb,
  source_model_urls jsonb not null default '{}'::jsonb,
  model_urls jsonb not null default '{}'::jsonb,
  texture_urls jsonb not null default '[]'::jsonb,
  thumbnail_url text not null default '',
  video_url text not null default '',
  generated_at timestamptz not null default now()
);

-- 仅对已有表做增量迁移，重复列不添加
alter table public.generate_records add column if not exists result_id text;
alter table public.generate_records add column if not exists type text not null default '';
alter table public.generate_records add column if not exists mode text not null default '';
alter table public.generate_records add column if not exists name text not null default '';
alter table public.generate_records add column if not exists model_type text not null default '';
alter table public.generate_records add column if not exists seed bigint;
alter table public.generate_records add column if not exists art_style text not null default '';
alter table public.generate_records add column if not exists texture_richness text not null default '';
alter table public.generate_records add column if not exists prompt text not null default '';
alter table public.generate_records add column if not exists negative_prompt text not null default '';
alter table public.generate_records add column if not exists texture_prompt text not null default '';
alter table public.generate_records add column if not exists texture_image_url text not null default '';
alter table public.generate_records add column if not exists preview_task_id text not null default '';
alter table public.generate_records add column if not exists status text not null default '';
alter table public.generate_records add column if not exists created_at bigint;
alter table public.generate_records add column if not exists progress integer;
alter table public.generate_records add column if not exists started_at bigint;
alter table public.generate_records add column if not exists finished_at bigint;
alter table public.generate_records add column if not exists expires_at bigint;
alter table public.generate_records add column if not exists preceding_tasks integer;
alter table public.generate_records add column if not exists task_error jsonb;
alter table public.generate_records add column if not exists source_model_urls jsonb not null default '{}'::jsonb;
alter table public.generate_records add column if not exists model_urls jsonb not null default '{}'::jsonb;
alter table public.generate_records add column if not exists texture_urls jsonb not null default '[]'::jsonb;
alter table public.generate_records add column if not exists thumbnail_url text not null default '';
alter table public.generate_records add column if not exists video_url text not null default '';
alter table public.generate_records add column if not exists generated_at timestamptz not null default now();

alter table public.generate_records enable row level security;

drop policy if exists "allow read generate_records" on public.generate_records;
create policy "allow read generate_records"
on public.generate_records
for select
to authenticated, anon
using (true);

drop policy if exists "allow insert generate_records" on public.generate_records;
create policy "allow insert generate_records"
on public.generate_records
for insert
to authenticated, anon
with check (true);

drop policy if exists "allow update generate_records" on public.generate_records;
create policy "allow update generate_records"
on public.generate_records
for update
to authenticated, anon
using (true)
with check (true);
