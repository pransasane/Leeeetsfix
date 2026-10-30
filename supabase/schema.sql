create extension if not exists pgcrypto;

create table if not exists public.civic_reports (
  id text primary key,
  complaint_id text unique not null,
  title text not null,
  category text not null check (category in ('roads_potholes','footpaths','streetlights','water_leakage','drainage','garbage','other')),
  description text not null,
  image_url text not null default '',
  additional_images text[] not null default '{}',
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  severity text not null check (severity in ('low','medium','high','critical')),
  suggested_solution text not null,
  status text not null default 'reported' check (status in ('reported','under_verification','reported_to_authority','in_progress','resolved','reopened')),
  date_observed date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verification_notes text,
  resolution_notes text,
  reporter_name text,
  is_sample boolean not null default false,
  concerned_department text,
  dispatch_ticket_number text,
  authority_acknowledgment_date timestamptz,
  sla_window text,
  assigned_ward text
);

create table if not exists public.civic_report_history (
  id text primary key,
  report_id text not null references public.civic_reports(id) on delete cascade,
  previous_status text,
  new_status text not null,
  notes text not null default '',
  changed_by text not null default 'Citizen',
  created_at timestamptz not null default now()
);

create index if not exists civic_reports_created_at_idx on public.civic_reports(created_at desc);
create index if not exists civic_reports_status_idx on public.civic_reports(status);
create index if not exists civic_report_history_report_id_idx on public.civic_report_history(report_id, created_at);

alter table public.civic_reports enable row level security;
alter table public.civic_report_history enable row level security;

drop policy if exists "Public can read civic reports" on public.civic_reports;
create policy "Public can read civic reports" on public.civic_reports for select to anon, authenticated using (true);

drop policy if exists "Anyone can submit civic reports" on public.civic_reports;
create policy "Anyone can submit civic reports" on public.civic_reports for insert to anon, authenticated with check (true);

drop policy if exists "Authenticated users can update reports" on public.civic_reports;
create policy "Authenticated users can update reports" on public.civic_reports for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete reports" on public.civic_reports;
create policy "Authenticated users can delete reports" on public.civic_reports for delete to authenticated using (true);

drop policy if exists "Public can read report history" on public.civic_report_history;
create policy "Public can read report history" on public.civic_report_history for select to anon, authenticated using (true);

drop policy if exists "Anyone can add report history" on public.civic_report_history;
create policy "Anyone can add report history" on public.civic_report_history for insert to anon, authenticated with check (true);

-- Prototype policies above keep the existing demo admin flow working.
-- Before production use, restrict update/delete/history writes to a verified admin role.
