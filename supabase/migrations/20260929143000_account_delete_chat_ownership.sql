-- Preserve other participants' chat rooms when an account owner leaves.
-- Ordinary member data and listings are removed by existing ON DELETE CASCADE foreign keys.
create or replace function private.delete_my_account() returns void
language plpgsql security definer set search_path=''
as $$
declare me uuid := auth.uid();
begin
 if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
   raise exception 'Verified account required' using errcode='42501';
 end if;
 -- Hand ongoing conversations to an existing participant. Do not disclose or copy data.
 update public.chat_rooms r
 set created_by = (
   select m.user_id from public.chat_members m
   where m.room_id=r.id and m.user_id<>me
   order by m.user_id limit 1
 )
 where r.created_by=me
 and exists(select 1 from public.chat_members m where m.room_id=r.id and m.user_id<>me);
 -- A room with no other participants may safely be removed with its messages.
 delete from public.chat_messages msg
 where msg.room_id in (select r.id from public.chat_rooms r where r.created_by=me);
 delete from public.chat_members m
 where m.room_id in (select r.id from public.chat_rooms r where r.created_by=me);
 delete from public.chat_rooms r where r.created_by=me;
 -- If account has moderator audit records, preserve audit rather than silently erasing it.
 if exists(select 1 from public.moderation_actions a where a.moderator_id=me) then
   raise exception 'Account has moderation audit records: contact the administrator for audited deletion'
     using errcode='23503';
 end if;
 delete from auth.users where id=me;
end $$;
revoke all on function private.delete_my_account() from public,anon;
grant execute on function private.delete_my_account() to authenticated;
