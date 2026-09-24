-- A read-only, server-verified moderator gate for the production maintenance UI.
-- Membership is controlled by trusted operators in private.moderators.
-- Never derive administrator permissions from client metadata, email or localStorage.
create or replace function public.is_report_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from private.moderators as m
    where m.user_id = auth.uid()
  );
$$;
revoke all on function public.is_report_moderator() from public, anon;
grant execute on function public.is_report_moderator() to authenticated;
