create extension if not exists "pgcrypto";

create table if not exists resident (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id),
  name text not null,
  building_name text not null,
  unit_no text not null,
  region_gu text not null,
  consent_privacy boolean not null default false,
  consent_push boolean not null default false,
  consent_message boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists management_fee (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid references resident(id),
  bill_month text not null,
  total_amount integer not null,
  due_date date not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID')),
  account_bank text not null,
  account_no text not null,
  account_holder text not null,
  items jsonb not null,
  created_at timestamptz default now()
);

create table if not exists notification (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'NOTICE' check (type in ('NOTICE', 'PUSH')),
  title text not null,
  summary text,
  link_url text,
  pinned boolean not null default false,
  scheduled_at timestamptz,
  created_at timestamptz default now()
);

-- Phase 2: schema reservation only. The app does not read or write these tables yet.
create table if not exists mood_history (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid references resident(id),
  answers jsonb not null,
  raw_score integer not null check (raw_score between 0 and 25),
  checked_at timestamptz default now()
);

create table if not exists risk_assessment (
  id uuid primary key default gen_random_uuid(),
  mood_id uuid references mood_history(id),
  resident_id uuid references resident(id),
  level_code text not null check (level_code in ('LEVEL_1', 'LEVEL_2', 'LEVEL_3')),
  assessed_at timestamptz default now()
);

-- Phase 3: schema reservation only. Region matching will use registered district data.
create table if not exists support_center (
  id uuid primary key default gen_random_uuid(),
  region_gu text not null,
  name text not null,
  intro text,
  address text,
  phone text,
  homepage text,
  level_tag text check (level_tag in ('LEVEL_1', 'LEVEL_2', 'LEVEL_3')),
  created_at timestamptz default now()
);
