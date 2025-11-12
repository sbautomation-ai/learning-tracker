# Teacher Rating Manager

Minimal Vite + React + Supabase starter for managing students, subjects, and twice-yearly ratings with a compact dashboard and Excel export.

## Quickstart

1. **Clone & install**

   ```bash
   npm install
Environment Copy .env.example → .env and fill in:
env
Copy
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
Supabase schema Run the SQL from schema in your Supabase project.
Run
bash
Copy
npm run dev
Seed demo (optional) Use the “Seed demo data” button in the app header.
Features
Students & subjects CRUD
Ratings grid (Mid/End, Excellent/Moderate/Low) with Supabase upserts
Dashboard with KPIs, Chart.js bar chart, and subject summaries
Excel export via SheetJS for current filter or all data
Demo seeding for quick exploration
Tech stack
Vite + React (JavaScript)
Supabase JavaScript client
Chart.js via react-chartjs-2
SheetJS (xlsx) for export
Lightweight CSS (no Tailwind build step)
Database schema
sql
Copy
create type term as enum ('MID','END');
create type level as enum ('EXCELLENT','MODERATE','LOW');

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  term term not null,
  level level not null,
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  created_at timestamptz default now(),
  unique (student_id, subject_id, year, term)
);

alter table students enable row level security;
alter table subjects enable row level security;
alter table ratings  enable row level security;

create policy "public rw students" on students for all using (true) with check (true);
create policy "public rw subjects" on subjects for all using (true) with check (true);
create policy "public rw ratings"  on ratings  for all using (true) with check (true);
Future enhancements
Optional Supabase Auth for multi-teacher access
Editable rating scales or notes per rating
Bulk import/export for roster management

### SQL Seed
```sql
create type term as enum ('MID','END');
create type level as enum ('EXCELLENT','MODERATE','LOW');

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  term term not null,
  level level not null,
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  created_at timestamptz default now(),
  unique (student_id, subject_id, year, term)
);

alter table students enable row level security;
alter table subjects enable row level security;
alter table ratings  enable row level security;

create policy "public rw students" on students for all using (true) with check (true);
create policy "public rw subjects" on subjects for all using (true) with check (true);
create policy "public rw ratings"  on ratings  for all using (true) with check (true);