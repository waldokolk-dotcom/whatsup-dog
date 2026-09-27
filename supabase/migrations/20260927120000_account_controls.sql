-- Let a participant remove a conversation from their own list.
grant delete on public.chat_members to authenticated;
create policy members_delete_self on public.chat_members for delete to authenticated using (user_id=(select auth.uid()));

-- Account self-deletion is intentionally scoped to the signed-in user.
create or replace function private.delete_my_account() returns void
language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then raise exception 'Not signed in' using errcode='42501'; end if;
  delete from auth.users where id=auth.uid();
end $$;
revoke all on function private.delete_my_account() from public, anon;
grant execute on function private.delete_my_account() to authenticated;
