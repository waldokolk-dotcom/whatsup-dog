begin;

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

commit;
