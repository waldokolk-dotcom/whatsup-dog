-- Restore the existing account-deletion button's public RPC entrypoint.
-- The private implementation already checks auth.uid() and only deletes that identity.
create or replace function public.delete_my_account() returns void
language sql security invoker set search_path=''
as $$select private.delete_my_account()$$;
revoke all on function public.delete_my_account() from public,anon;
grant execute on function public.delete_my_account() to authenticated;
