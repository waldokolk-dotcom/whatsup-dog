-- Preserve the existing dog/cat/both relevance choice across shared reports.
-- Legacy reports predate the species choice and keep their existing dog context.
alter table public.reports
  add column if not exists species text not null default 'dog';
alter table public.reports
  drop constraint if exists reports_species_valid;
alter table public.reports
  add constraint reports_species_valid check (species in ('dog','cat','both'));
create index if not exists reports_active_species_created_idx
  on public.reports (species, created_at desc) where status='active';
