begin;

alter table public.profiles
  add column if not exists discoverable boolean not null default false,
  add column if not exists breed text check (breed is null or char_length(breed)<=80);

create or replace function public.list_discoverable_profiles()
returns table(
  id uuid,
  display_name text,
  avatar text,
  breed text,
  home_place text
)
language sql
stable
security definer
set search_path=''
as $$
  select p.id,p.display_name,p.avatar,p.breed,p.home_place
  from public.profiles p
  where p.discoverable=true
    and p.id<>(select auth.uid())
  order by lower(p.display_name),p.id;
$$;
revoke all on function public.list_discoverable_profiles() from public,anon;
grant execute on function public.list_discoverable_profiles() to authenticated;

create or replace function public.start_private_chat(target uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  me uuid := auth.uid();
  room uuid;
begin
  if me is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if target is null or target=me then raise exception 'Invalid chat target'; end if;
  if not exists(select 1 from public.profiles p where p.id=target and p.discoverable=true) then
    raise exception 'Profile is not discoverable' using errcode='42501';
  end if;

  select r.id into room
  from public.chat_rooms r
  where exists(select 1 from public.chat_members m where m.room_id=r.id and m.user_id=me)
    and exists(select 1 from public.chat_members m where m.room_id=r.id and m.user_id=target)
    and 2=(select count(*) from public.chat_members m where m.room_id=r.id)
  order by r.created_at
  limit 1;

  if room is null then
    insert into public.chat_rooms(name,created_by) values('Privégesprek',me) returning id into room;
    insert into public.chat_members(room_id,user_id) values(room,me),(room,target);
  end if;
  return room;
end $$;
revoke all on function public.start_private_chat(uuid) from public,anon;
grant execute on function public.start_private_chat(uuid) to authenticated;

commit;
