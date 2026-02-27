create table if not exists public.generate_records (
  task_id text primary key,
  result_id text,
  mode text not null default '',
  texture_prompt text not null default '',
  preview_task_id text not null default '',
  prompt text not null default '',
  source_model_urls jsonb not null default '{}'::jsonb,
  model_urls jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);
alter table public.generate_records
add column if not exists result_id text;
alter table public.generate_records
add column if not exists source_model_urls jsonb not null default '{}'::jsonb;
alter table public.generate_records
add column if not exists mode text not null default '';
alter table public.generate_records
add column if not exists texture_prompt text not null default '';
alter table public.generate_records
add column if not exists preview_task_id text not null default '';
alter table public.generate_records
add column if not exists prompt text not null default '';

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
