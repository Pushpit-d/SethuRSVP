-- Run this in the Supabase SQL Editor (supabase.com > SQL Editor)

create table rsvps (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  guest_count integer not null default 1,
  meal_preferences jsonb not null default '[]',
  submitted_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table rsvps enable row level security;

-- Allow inserts from the anon key (public form submissions)
create policy "Allow public inserts" on rsvps
  for insert with check (true);

-- Only allow reads through the service role (admin API)
-- The anon key cannot read RSVP data
create policy "Deny public reads" on rsvps
  for select using (false);
