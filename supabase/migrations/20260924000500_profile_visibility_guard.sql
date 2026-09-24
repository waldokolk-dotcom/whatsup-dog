begin;
-- Defense in depth: an anonymous Auth user has the Postgres "authenticated" role,
-- so a direct Data API UPDATE must not circumvent the opt-in RPC's verification gate.
create or replace function private.enforce_verified_profile_visibility()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.discoverable=true
     and auth.uid() is not null
     and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=true
  then raise exception 'Verified account required for profile discoverability' using errcode='42501';
  end if;
  return new;
end $$;
drop trigger if exists enforce_verified_profile_visibility on public.profiles;
create trigger enforce_verified_profile_visibility
before insert or update of discoverable on public.profiles
for each row execute function private.enforce_verified_profile_visibility();
commit;
