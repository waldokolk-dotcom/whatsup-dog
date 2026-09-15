begin;

-- Reassert the owner lifecycle RPC because the hosted project was proven on
-- 2026-09-15 to be behind the repository migration state (PostgREST PGRST202).
create or replace function public.set_own_report_status(target text, next_status text)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if next_status not in ('resolved','hidden') then
    raise exception 'Invalid report status' using errcode='22023';
  end if;

  update public.reports
     set status=next_status
   where id=target
     and user_id=(select auth.uid());

  if not found then
    raise exception 'Report not found or not owner' using errcode='42501';
  end if;
end $$;

revoke all on function public.set_own_report_status(text,text) from public,anon;
grant execute on function public.set_own_report_status(text,text) to authenticated;

-- Exact cleanup of the single synthetic live E2E report that remained active
-- when the missing RPC was discovered. The predicates intentionally make this
-- a no-op everywhere else and prevent broad production cleanup.
update public.reports
   set status='hidden'
 where id='17bfd990-6e69-4861-be8d-1ecf6b7adea4'
   and user_id='22bf3e24-3602-4187-a7f1-57c0fb78b1df'
   and text='Synthetic production check wd-live-e2e-1789433828650';

commit;
