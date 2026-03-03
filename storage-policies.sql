-- Storage RLS：generated-thumbnail-images 桶
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 允许插入（上传）
drop policy if exists "allow insert generated-thumbnail-images" on storage.objects;
create policy "allow insert generated-thumbnail-images"
on storage.objects for insert
to authenticated, anon
with check (bucket_id = 'generated-thumbnail-images');

-- 允许更新（upsert 时会先查再更新）
drop policy if exists "allow update generated-thumbnail-images" on storage.objects;
create policy "allow update generated-thumbnail-images"
on storage.objects for update
to authenticated, anon
using (bucket_id = 'generated-thumbnail-images')
with check (bucket_id = 'generated-thumbnail-images');

-- 允许读取（公开 URL / getPublicUrl）
drop policy if exists "allow read generated-thumbnail-images" on storage.objects;
create policy "allow read generated-thumbnail-images"
on storage.objects for select
to authenticated, anon
using (bucket_id = 'generated-thumbnail-images');
