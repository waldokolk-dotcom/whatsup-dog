-- Gratis weggeef- en ruilhoek. Additive only; no changes to existing reports or accounts.
create table if not exists public.giveaway_listings (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(trim(title)) between 3 and 90),
 description text not null check (char_length(trim(description)) between 5 and 1000),
 category text not null check (category in ('hond','kat','beide')),
 kind text not null check (kind in ('gratis','ruilen')),
 town text not null check (char_length(trim(town)) between 2 and 80),
 image_path text,
 status text not null default 'actief' check (status in ('actief','gereserveerd','afgerond')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint giveaway_image_owner check (image_path is null or image_path like owner_id::text || '/%')
);
create index if not exists giveaway_active_recent on public.giveaway_listings (created_at desc) where status='actief';
create index if not exists giveaway_owner_recent on public.giveaway_listings (owner_id,created_at desc);
alter table public.giveaway_listings enable row level security;
-- Supabase projects may grant newly created public tables to anon by default.
-- Remove default privileges before allowing only the minimum authenticated DML.
revoke all on public.giveaway_listings from anon,authenticated;
grant select,insert,update,delete on public.giveaway_listings to authenticated;
create policy giveaway_read on public.giveaway_listings for select to authenticated
 using (status='actief' or owner_id=(select auth.uid()));
create policy giveaway_insert on public.giveaway_listings for insert to authenticated
 with check (owner_id=(select auth.uid()) and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=false);
create policy giveaway_update on public.giveaway_listings for update to authenticated
 using (owner_id=(select auth.uid()) and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=false)
 with check (owner_id=(select auth.uid()) and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=false);
create policy giveaway_delete on public.giveaway_listings for delete to authenticated
 using (owner_id=(select auth.uid()) and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=false);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('giveaway-photos','giveaway-photos',false,5242880,array['image/jpeg'])
 on conflict (id) do nothing;
create policy giveaway_photo_upload on storage.objects for insert to authenticated
 with check (bucket_id='giveaway-photos' and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=false
 and name ~ ('^'||(select auth.uid())::text||'/[0-9a-f-]{36}\.jpg$'));
create policy giveaway_photo_read on storage.objects for select to authenticated
 using (bucket_id='giveaway-photos' and
 ((storage.foldername(name))[1]=(select auth.uid())::text or exists
 (select 1 from public.giveaway_listings l where l.image_path=objects.name and l.status='actief')));
create policy giveaway_photo_delete on storage.objects for delete to authenticated
 using (bucket_id='giveaway-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Prevent an old public policy from ever allowing anonymous database writes.
