begin;
-- Safe opt-in; never expose precise home coordinates, email or non-consenting users.
alter table public.profiles
  add column if not exists discoverable boolean not null default false,
  add column if not exists breed text check (breed is null or char_length(breed)<=80);

create or replace function public.set_profile_discoverability(
  enabled boolean, profile_name text, profile_avatar text,
  profile_place text, pet_breed text
) returns boolean
language plpgsql security definer set search_path=''
as $$
declare me uuid := auth.uid();
begin
  if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
    raise exception 'A verified account is required' using errcode='42501';
  end if;
  if enabled is null or profile_name is null or char_length(trim(profile_name)) not between 1 and 40
     or profile_avatar is null or char_length(profile_avatar) not between 1 and 16
     or (profile_place is not null and char_length(profile_place)>80)
     or (pet_breed is not null and char_length(pet_breed)>80)
  then raise exception 'Invalid public profile' using errcode='22023';
  end if;
  insert into public.profiles(id,display_name,avatar,home_place,breed,discoverable,updated_at)
  values(me,trim(profile_name),profile_avatar,nullif(trim(profile_place),''),nullif(trim(pet_breed),''),enabled,now())
  on conflict (id) do update
    set display_name=excluded.display_name,avatar=excluded.avatar,
        home_place=excluded.home_place,breed=excluded.breed,
        discoverable=excluded.discoverable,updated_at=now()
   where public.profiles.id=me;
  return enabled;
end $$;
revoke all on function public.set_profile_discoverability(boolean,text,text,text,text) from public,anon;
grant execute on function public.set_profile_discoverability(boolean,text,text,text,text) to authenticated;

create or replace function public.list_discoverable_profiles()
returns table(id uuid,display_name text,avatar text,breed text,home_place text)
language sql stable security definer set search_path=''
as $$
  select p.id,p.display_name,p.avatar,p.breed,p.home_place
    from public.profiles p
   where p.discoverable=true
     and p.id is distinct from auth.uid()
     and auth.uid() is not null
     and coalesce((auth.jwt()->>'is_anonymous')::boolean,true)=false
   order by lower(p.display_name),p.id
   limit 200;
$$;
revoke all on function public.list_discoverable_profiles() from public,anon;
grant execute on function public.list_discoverable_profiles() to authenticated;
commit;
