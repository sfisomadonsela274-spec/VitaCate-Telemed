-- ============================================================
-- VitaCare Supabase Schema Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── profiles: replaces CustomUser ──────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '0000000000',
  address text not null default 'Unknown Address',
  role text not null check (role in ('patient', 'doctor', 'admin')) default 'patient',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Authenticated users can read all profiles"
  on public.profiles for select to authenticated using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── doctors: replaces Doctor model ─────────────────────────────
create table if not exists public.doctors (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  license_number text unique not null,
  specialization text default 'General Practitioner',
  created_at timestamptz default now()
);
alter table public.doctors enable row level security;

create policy "Authenticated users can read doctors"
  on public.doctors for select to authenticated using (true);
create policy "Service role can manage doctors"
  on public.doctors for all to service_role using (true);

-- ── appointments ───────────────────────────────────────────────
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_name text not null,
  date date not null,
  time time not null,
  reason text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  unique(doctor_id, date, time)
);
alter table public.appointments enable row level security;

create policy "Patients and doctors can read own appointments"
  on public.appointments for select to authenticated
  using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "Patients can create appointments"
  on public.appointments for insert to authenticated
  with check (auth.uid() = patient_id);
create policy "Doctors can update own appointments"
  on public.appointments for update to authenticated
  using (auth.uid() = doctor_id);
create policy "Doctors or patients can delete own appointments"
  on public.appointments for delete to authenticated
  using (auth.uid() = patient_id or auth.uid() = doctor_id);

-- ── prescriptions ───────────────────────────────────────────────
create table if not exists public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  medication text not null default '',
  dosage text not null default '',
  notes text not null default '',
  signature_data text,
  date_issued timestamptz default now()
);
alter table public.prescriptions enable row level security;

create policy "Patients can read own prescriptions"
  on public.prescriptions for select to authenticated
  using (auth.uid() = patient_id);
create policy "Doctors can read all prescriptions"
  on public.prescriptions for select to authenticated
  using (auth.uid() = doctor_id);
create policy "Doctors can create prescriptions"
  on public.prescriptions for insert to authenticated
  with check (auth.uid() = doctor_id);

-- ── consultations ───────────────────────────────────────────────
create table if not exists public.consultations (
  id uuid default gen_random_uuid() primary key,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  summary text not null,
  follow_up text default '',
  date timestamptz default now()
);
alter table public.consultations enable row level security;

create policy "Patients can read own consultations"
  on public.consultations for select to authenticated
  using (auth.uid() = patient_id);
create policy "Doctors can read all consultations"
  on public.consultations for select to authenticated
  using (auth.uid() = doctor_id);
create policy "Doctors can create consultations"
  on public.consultations for insert to authenticated
  with check (auth.uid() = doctor_id);

-- ── vitals ──────────────────────────────────────────────────────
create table if not exists public.vitals (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  recorded_by uuid references public.doctors(id) on delete set null,
  heart_rate integer not null,
  spo2 integer not null,
  temperature float not null default 36.6,
  systolic integer not null default 120,
  diastolic integer not null default 80,
  timestamp timestamptz default now()
);
alter table public.vitals enable row level security;

create policy "Patients can read/write own vitals"
  on public.vitals for all to authenticated
  using (auth.uid() = patient_id);
create policy "Doctors can read patient vitals"
  on public.vitals for select to authenticated
  using (auth.uid() = recorded_by);

-- ── chat_messages ──────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  message text not null default '',
  message_type text default 'text',
  media_payload text,
  timestamp timestamptz default now(),
  is_read boolean default false
);
alter table public.chat_messages enable row level security;

create policy "Participants can read their messages"
  on public.chat_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Authenticated users can send messages"
  on public.chat_messages for insert to authenticated
  with check (auth.uid() = sender_id);
create policy "Receivers can mark messages read"
  on public.chat_messages for update to authenticated
  using (auth.uid() = receiver_id);

-- ============================================================
-- Enable Realtime on chat_messages for Broadcast
-- Dashboard > Database > Replication > enable chat_messages
-- ============================================================
