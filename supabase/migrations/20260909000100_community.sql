begin;
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
grant usage on schema extensions to authenticated;

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar text not null default '🐶' check (char_length(avatar)<=16),
  home_place text check (char_length(home_place)<=80),
  home_lat double precision check (home_lat between -90 and 90),
  home_lng double precision check (home_lng between -180 and 180),
  updated_at timestamptz not null default now()
);
-- Home location is private. Public attribution is a per-report snapshot.
create table private.moderators (user_id uuid primary key references auth.users on delete cascade);
create function private.is_moderator() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.moderators where user_id=(select auth.uid()));
$$;
revoke all on function private.is_moderator() from public;
grant execute on function private.is_moderator() to authenticated;

create table public.reports (
  id text primary key check (id ~ '^[A-Za-z0-9-]{1,64}$'),
  user_id uuid not null references auth.users on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 40),
  author_avatar text not null default '🐶' check (char_length(author_avatar)<=16),
  type text not null check (type in ('danger','vegetation','dirty','road','fun','walk','spotted','lost')),
  subtype text check (char_length(subtype)<=80),
  text text not null check (char_length(text)<=220),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  geometry_type text not null default 'point' check (geometry_type in ('point','polygon')),
  polygon jsonb,
  geom extensions.geometry(Geometry,4326) not null,
  photo_path text,
  ai_suggestion jsonb check (octet_length(ai_suggestion::text)<=8000),
  status text not null default 'active' check (status in ('active','resolved','hidden')),
  confirmed_count integer not null default 0 check (confirmed_count>=0),
  created_at timestamptz not null default now(),
  check (photo_path is null or photo_path=user_id::text||'/'||id||'.jpg')
);
create index reports_geom_idx on public.reports using gist(geom);
create index reports_status_created_idx on public.reports(status,created_at desc);
create index reports_owner_idx on public.reports(user_id);

create function private.report_geometry() returns trigger language plpgsql set search_path='' as $$
declare p jsonb; pts extensions.geometry[] := '{}';
begin
  if new.geometry_type='point' then
    if new.polygon is not null then raise exception 'Point cannot contain polygon'; end if;
    new.geom:=extensions.st_setsrid(extensions.st_makepoint(new.lng,new.lat),4326);
  else
    if new.polygon is null or jsonb_typeof(new.polygon)<>'array' then raise exception 'Polygon required'; end if;
    if jsonb_array_length(new.polygon) not between 3 and 120 then raise exception 'Polygon requires 3..120 points'; end if;
    for p in select value from jsonb_array_elements(new.polygon) loop
      if jsonb_typeof(p)<>'array' then raise exception 'Invalid coordinate'; end if;
      if jsonb_array_length(p)<>2 or jsonb_typeof(p->0)<>'number' or jsonb_typeof(p->1)<>'number' then raise exception 'Invalid coordinate'; end if;
      if not ((p->>0)::float8 between -90 and 90 and (p->>1)::float8 between -180 and 180) then raise exception 'Coordinate out of range'; end if;
      -- Browser/Leaflet uses [latitude,longitude]; PostGIS uses x=longitude.
      pts:=array_append(pts,extensions.st_setsrid(extensions.st_makepoint((p->>1)::float8,(p->>0)::float8),4326));
    end loop;
    if not extensions.st_equals(pts[1],pts[array_length(pts,1)]) then pts:=array_append(pts,pts[1]); end if;
    new.geom:=extensions.st_makepolygon(extensions.st_makeline(pts));
    if not extensions.st_isvalid(new.geom) or extensions.st_isempty(new.geom) then raise exception 'Invalid polygon'; end if;
  end if;
  return new;
end $$;
create trigger report_geometry before insert or update of lat,lng,geometry_type,polygon on public.reports for each row execute function private.report_geometry();

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now()
);
create table public.chat_members (
  room_id uuid references public.chat_rooms on delete cascade,
  user_id uuid references auth.users on delete cascade,
  primary key(room_id,user_id)
);
create index chat_members_user_idx on public.chat_members(user_id);
create function private.is_member(room uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.chat_members where room_id=room and user_id=(select auth.uid()));
$$;
revoke all on function private.is_member(uuid) from public;
grant execute on function private.is_member(uuid) to authenticated;
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index chat_messages_room_time_idx on public.chat_messages(room_id,created_at);
-- Membership is provisioned by trusted server code; clients cannot join private rooms themselves.
create table public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  report_id text not null references public.reports on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now(),
  unique(report_id,user_id)
);
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id text not null references public.reports on delete cascade,
  moderator_id uuid not null references auth.users,
  previous_status text not null,
  new_status text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null check (endpoint ~ '^https://' and char_length(endpoint)<=2048),
  p256dh text not null check (char_length(p256dh) between 1 and 256),
  auth text not null check (char_length(auth) between 1 and 256),
  created_at timestamptz not null default now(),
  unique(user_id,endpoint)
);

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.moderation_flags enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table private.moderators enable row level security;

revoke all on public.profiles,public.reports,public.chat_rooms,public.chat_members,public.chat_messages,public.moderation_flags,public.moderation_actions,public.push_subscriptions from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select on public.reports to authenticated;
grant insert(id,user_id,author_name,author_avatar,type,subtype,text,lat,lng,geometry_type,polygon,photo_path,ai_suggestion) on public.reports to authenticated;
grant select on public.chat_rooms,public.chat_members,public.chat_messages,public.moderation_flags,public.moderation_actions,public.push_subscriptions to authenticated;
grant insert(room_id,user_id,body) on public.chat_messages to authenticated;
grant insert(report_id,user_id,reason) on public.moderation_flags to authenticated;
grant insert(user_id,endpoint,p256dh,auth),delete on public.push_subscriptions to authenticated;
grant all on public.profiles,public.reports,public.chat_rooms,public.chat_members,public.chat_messages,public.moderation_flags,public.moderation_actions,public.push_subscriptions to service_role;

create policy profile_self on public.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy reports_read on public.reports for select to authenticated using(status='active' or user_id=(select auth.uid()) or private.is_moderator());
create policy reports_insert on public.reports for insert to authenticated with check(user_id=(select auth.uid()) and status='active' and confirmed_count=0);
create policy rooms_read on public.chat_rooms for select to authenticated using(private.is_member(id));
create policy members_read on public.chat_members for select to authenticated using(private.is_member(room_id));
create policy messages_read on public.chat_messages for select to authenticated using(private.is_member(room_id));
create policy messages_insert on public.chat_messages for insert to authenticated with check(user_id=(select auth.uid()) and private.is_member(room_id));
create policy flags_read on public.moderation_flags for select to authenticated using(user_id=(select auth.uid()) or private.is_moderator());
create policy flags_insert on public.moderation_flags for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.reports where id=report_id and status='active'));
create policy actions_read on public.moderation_actions for select to authenticated using(private.is_moderator());
create policy push_self on public.push_subscriptions for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create function public.moderate_report(target text, next_status text, explanation text) returns void language plpgsql security definer set search_path='' as $$
declare previous text;
begin
  if not private.is_moderator() then raise exception 'Moderator required' using errcode='42501'; end if;
  if next_status not in ('active','resolved','hidden') or next_status is null or explanation is null or char_length(explanation) not between 1 and 500 then raise exception 'Invalid moderation action'; end if;
  select status into previous from public.reports where id=target for update;
  if not found then raise exception 'Report not found'; end if;
  update public.reports set status=next_status where id=target;
  insert into public.moderation_actions(report_id,moderator_id,previous_status,new_status,reason) values(target,auth.uid(),previous,next_status,explanation);
end $$;
revoke all on function public.moderate_report(text,text,text) from public,anon;
grant execute on function public.moderate_report(text,text,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('report-photos','report-photos',false,5242880,array['image/jpeg']);
create policy photo_insert on storage.objects for insert to authenticated with check(
  bucket_id='report-photos' and name ~ ('^'||(select auth.uid())::text||'/[A-Za-z0-9-]{1,64}\.jpg$')
);
create policy photo_read on storage.objects for select to authenticated using(
  bucket_id='report-photos' and (
    (storage.foldername(name))[1]=(select auth.uid())::text
    or exists(select 1 from public.reports r where r.photo_path=name and r.status='active')
    or private.is_moderator()
  )
);
-- No overwrite: a published photo is immutable. Only unattached uploads can be removed.
create policy photo_delete_orphan on storage.objects for delete to authenticated using(
  bucket_id='report-photos' and (storage.foldername(name))[1]=(select auth.uid())::text
  and not exists(select 1 from public.reports r where r.photo_path=name)
);
alter publication supabase_realtime add table public.reports,public.chat_messages;
commit;
