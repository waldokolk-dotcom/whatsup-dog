begin;

-- Public, non-sensitive compatibility signal used by the Pages release gate.
create or replace function public.whatsup_dog_release_marker()
returns text
language sql
stable
security invoker
set search_path=''
as $$ select '20260926-production-schema-v2'::text $$;

revoke all on function public.whatsup_dog_release_marker() from public;
grant execute on function public.whatsup_dog_release_marker() to anon, authenticated;

commit;
