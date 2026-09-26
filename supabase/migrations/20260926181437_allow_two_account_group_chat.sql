begin;

-- A named group can start with two people (creator plus one invited member).
-- This keeps the upper bound and all verified/discoverable/distinct-member gates.
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
  if coalesce(array_length(targets,1),0) not between 1 and 19 then
    raise exception 'Groups require 1 to 19 other members' using errcode='22023';
  end if;
  select count(*),count(distinct requested.member_id) into participants,distinct_people
    from unnest(targets) as requested(member_id);
  if participants<>distinct_people or me=any(targets)
     or exists(select 1 from unnest(targets) as requested(member_id)
               where requested.member_id is null or not exists
               (select 1 from public.profiles p where p.id=requested.member_id and p.discoverable=true))
  then raise exception 'Only distinct, discoverable members can be invited' using errcode='42501';
  end if;
  insert into public.chat_rooms(name,created_by) values(trim(group_name),me) returning id into room;
  insert into public.chat_members(room_id,user_id) values(room,me);
  insert into public.chat_members(room_id,user_id) select room,requested.member_id from unnest(targets) as requested(member_id);
  return room;
end $$;
revoke all on function public.start_group_chat(text,uuid[]) from public,anon;
grant execute on function public.start_group_chat(text,uuid[]) to authenticated;

commit;
