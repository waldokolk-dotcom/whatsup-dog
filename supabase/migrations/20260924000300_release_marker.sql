-- Public non-sensitive release marker. A hosted instance has this marker only
-- after the prerequisite production migrations were successfully applied.
create or replace function public.whatsup_dog_release_marker()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select '20260924-production-schema-v1'::text;
$$;
revoke all on function public.whatsup_dog_release_marker() from public;
grant execute on function public.whatsup_dog_release_marker() to anon, authenticated;
