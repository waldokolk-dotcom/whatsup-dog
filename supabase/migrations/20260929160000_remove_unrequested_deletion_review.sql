-- Roll back the unrequested moderator-account deletion workflow only.
-- Do not change existing moderation, reports, user profiles, chats or users.
do $$
begin
 if exists(select 1 from private.account_deletion_requests)
    or exists(select 1 from private.moderation_audit_archive) then
   raise exception 'Cannot remove deletion workflow: records exist. Stop and inspect before changing data.';
 end if;
end $$;
drop function if exists private.approve_moderator_account_deletion(uuid,text);
drop function if exists public.request_my_account_deletion();
drop table if exists private.moderation_audit_archive;
drop table if exists private.account_deletion_requests;
-- One ordinary self-deletion flow for every verified account; any existing
-- moderation action remains as an audit row with NULL actor via FK ON DELETE SET NULL.
create or replace function private.delete_my_account() returns void
language plpgsql security definer set search_path=''
as $$
declare me uuid := auth.uid();
begin
 if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
   raise exception 'Verified account required' using errcode='42501';
 end if;
 update public.chat_rooms r
 set created_by = (
   select m.user_id from public.chat_members m
   where m.room_id=r.id and m.user_id<>me order by m.user_id limit 1
 )
 where r.created_by=me and exists(
   select 1 from public.chat_members m where m.room_id=r.id and m.user_id<>me
 );
 delete from public.chat_messages msg
 where msg.room_id in (select r.id from public.chat_rooms r where r.created_by=me);
 delete from public.chat_members m
 where m.room_id in (select r.id from public.chat_rooms r where r.created_by=me);
 delete from public.chat_rooms r where r.created_by=me;
 delete from auth.users where id=me;
end $$;
revoke all on function private.delete_my_account() from public,anon;
grant execute on function private.delete_my_account() to authenticated;
