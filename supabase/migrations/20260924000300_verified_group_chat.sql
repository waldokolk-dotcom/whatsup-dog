begin;

-- Preserve all existing report categories and add the wheel's genuine Other choice.
alter table public.reports drop constraint if exists reports_type_check;
alter table public.reports add constraint reports_type_check
  check (type in ('danger','vegetation','dirty','road','fun','walk','spotted','lost','other'));

-- Permanent account required to create private or group conversations. Guests still see public reports.
create or replace function public.start_private_chat(target uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); room uuid;
begin
  if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
    raise exception 'Verified account required' using errcode='42501';
  end if;
  if target is null or target=me then raise exception 'Invalid chat target' using errcode='22023'; end if;
  if not exists(select 1 from public.profiles p where p.id=target and p.discoverable=true) then
    raise exception 'Profile is not discoverable' using errcode='42501';
  end if;
  select r.id into room from public.chat_rooms r
   where r.name='Privégesprek'
     and exists(select 1 from public.chat_members m where m.room_id=r.id and m.user_id=me)
     and exists(select 1 from public.chat_members m where m.room_id=r.id and m.user_id=target)
     and 2=(select count(*) from public.chat_members m where m.room_id=r.id)
   order by r.created_at limit 1;
  if room is null then
    insert into public.chat_rooms(name,created_by) values('Privégesprek',me) returning id into room;
    insert into public.chat_members(room_id,user_id) values(room,me),(room,target);
  end if;
  return room;
end $$;
revoke all on function public.start_private_chat(uuid) from public,anon;
grant execute on function public.start_private_chat(uuid) to authenticated;

create or replace function public.start_group_chat(group_name text, targets uuid[])
returns uuid language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); room uuid; participants integer; distinct_people integer;
begin
  if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
    raise exception 'Verified account required' using errcode='42501';
  end if;
  if group_name is null or char_length(trim(group_name)) not between 1 and 80 then
    raise exception 'Invalid group name' using errcode='22023';
  end if;
  if coalesce(array_length(targets,1),0) not between 2 and 19 then
    raise exception 'Groups require 2 to 19 other members' using errcode='22023';
  end if;
  select count(*),count(distinct person) into participants,distinct_people
    from unnest(targets) as person;
  if participants<>distinct_people or me=any(targets)
     or exists(select 1 from unnest(targets) as person
               where person is null or not exists
               (select 1 from public.profiles p where p.id=person and p.discoverable=true))
  then raise exception 'Only distinct, discoverable members can be invited' using errcode='42501';
  end if;
  insert into public.chat_rooms(name,created_by) values(trim(group_name),me) returning id into room;
  insert into public.chat_members(room_id,user_id) values(room,me);
  insert into public.chat_members(room_id,user_id) select room,person from unnest(targets) as person;
  return room;
end $$;
revoke all on function public.start_group_chat(text,uuid[]) from public,anon;
grant execute on function public.start_group_chat(text,uuid[]) to authenticated;
commit;
