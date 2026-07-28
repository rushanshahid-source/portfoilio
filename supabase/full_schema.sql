-- ============================================================
-- Full schema for the portfolio site — auth + content tables,
-- seeded with your current data from src/config.ts.
--
-- Run this ONCE, top to bottom, in the Supabase SQL editor
-- (Project -> SQL Editor -> New query -> paste -> Run).
-- Safe to re-run: every statement is idempotent (create if not
-- exists / drop-then-create / on conflict do nothing).
-- ============================================================


-- ============================================================
-- PART 1 — Auth: profiles table, auto-provisioning, RLS
-- ============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  full_name   text,
  bio         text,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile data for each authenticated user. 1:1 with auth.users. role=admin can edit portfolio content.';

alter table public.profiles
  drop constraint if exists username_length;
alter table public.profiles
  add constraint username_length check (username is null or char_length(username) >= 3);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row the moment someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by the content-table policies below: is the
-- currently logged-in user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
  -- the "role =" check stops a user from promoting themselves to admin
  -- by editing their own profile row from the client.

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ============================================================
-- PART 2 — Portfolio content tables (read by
-- src/context/PortfolioContext.tsx, written by src/pages/Admin.tsx)
-- ============================================================

create table if not exists public.bio (
  id                 int primary key default 1,
  name               text,
  full_name          text,
  title              text,
  description        text,
  github             text,
  email              text,
  location           text,
  about_title        text,
  about_description  text,
  linkedin           text,
  twitter            text,
  facebook           text,
  instagram          text,
  updated_at         timestamptz not null default now(),
  constraint bio_single_row check (id = 1)
);

comment on table public.bio is 'Single-row table holding the developer bio / about / contact fields shown on the homepage.';

drop trigger if exists set_bio_updated_at on public.bio;
create trigger set_bio_updated_at
  before update on public.bio
  for each row execute function public.set_updated_at();

create table if not exists public.skills (
  id           text primary key,   -- 'develop' | 'design'
  title        text not null,
  description  text not null,
  details      text not null,
  tools        text[] not null default '{}',
  updated_at   timestamptz not null default now()
);

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

create table if not exists public.projects (
  id             bigint generated always as identity primary key,
  title          text not null,
  category       text,
  technologies   text,
  image          text,
  description    text,
  github_url     text,
  live_demo_url  text,
  created_at     timestamptz not null default now()
);

create table if not exists public.experiences (
  id                bigint generated always as identity primary key,
  position          text not null,
  company           text,
  period            text,
  location          text,
  description       text,
  responsibilities  text[] not null default '{}',
  technologies      text[] not null default '{}',
  created_at        timestamptz not null default now()
);

-- RLS: this content is public (anyone visiting the site reads it
-- with the anon key), but only an admin account can change it.
alter table public.bio enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;

drop policy if exists "Bio is publicly readable" on public.bio;
create policy "Bio is publicly readable" on public.bio for select using (true);
drop policy if exists "Bio is editable by admins" on public.bio;
create policy "Bio is editable by admins" on public.bio for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Skills are publicly readable" on public.skills;
create policy "Skills are publicly readable" on public.skills for select using (true);
drop policy if exists "Skills are editable by admins" on public.skills;
create policy "Skills are editable by admins" on public.skills for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Projects are publicly readable" on public.projects;
create policy "Projects are publicly readable" on public.projects for select using (true);
drop policy if exists "Projects are editable by admins" on public.projects;
create policy "Projects are editable by admins" on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Experiences are publicly readable" on public.experiences;
create policy "Experiences are publicly readable" on public.experiences for select using (true);
drop policy if exists "Experiences are editable by admins" on public.experiences;
create policy "Experiences are editable by admins" on public.experiences for all
  using (public.is_admin()) with check (public.is_admin());


-- ============================================================
-- PART 3 — Seed data, taken from src/config.ts
-- ============================================================

insert into public.bio (
  id, name, full_name, title, description,
  github, email, location,
  about_title, about_description,
  linkedin, twitter, facebook, instagram
) values (
  1,
  'Rushaan',
  'Rushaan Shahid',
  'Cybersecurity Enthusiast & Software Developer',
  'Cybersecurity Intern and Computer Science undergraduate building a strong foundation in C++ Object-Oriented Programming, web development, and cybersecurity fundamentals. Passionate about restructuring logical software systems, leading student-driven platforms, and applying analytical problem-solving to defensive and offensive security tasks.',
  'RushaanShahid',
  'rushanshahid@gmail.com',
  'Taxila, Punjab, Pakistan',
  'About Me',
  'I''m a Computer Science undergraduate at Pak-Austria Fachhochschule: Institute of Applied Sciences and Technology, currently in my 2nd semester. I have a strong foundation in C++ (procedural & object-oriented programming), web development with HTML5/CSS3, and an active pursuit of cybersecurity fundamentals through self-study. I''ve founded and led Campus Connect, a student marketplace and academic collaboration platform, coordinating a multidisciplinary team of 10 members. I enjoy transforming procedural code into clean, scalable, object-oriented architecture, and I''m eager to apply my debugging and analytical skills to real-world security challenges.',
  'https://linkedin.com/in/rushaanshahid',
  'https://x.com/rushaanshahid',
  'https://www.facebook.com/rushaanshahid',
  'https://www.instagram.com/rushaanshahid'
)
on conflict (id) do update set
  name = excluded.name,
  full_name = excluded.full_name,
  title = excluded.title,
  description = excluded.description,
  github = excluded.github,
  email = excluded.email,
  location = excluded.location,
  about_title = excluded.about_title,
  about_description = excluded.about_description,
  linkedin = excluded.linkedin,
  twitter = excluded.twitter,
  facebook = excluded.facebook,
  instagram = excluded.instagram;

insert into public.skills (id, title, description, details, tools) values
(
  'develop',
  'C++ DEVELOPER',
  'Building scalable, object-oriented software systems',
  'Redesigning procedural systems into clean object-oriented architecture using C++. Strong grounding in data structures, system logic analysis, and debugging for maintainable software.',
  array['C++', 'Object-Oriented Design', 'Data Structures', 'Software Engineering', 'Debugging', 'System Logic Analysis', 'Problem Solving']
),
(
  'design',
  'WEB & SECURITY',
  'Front-end development and cybersecurity fundamentals',
  'Building responsive, accessible web interfaces with HTML5 and CSS3, alongside an active self-study path in cybersecurity fundamentals for defensive and offensive security tasks.',
  array['HTML5', 'CSS3', 'Responsive Design', 'Cybersecurity Fundamentals', 'Front-End Development', 'Collaboration']
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  details = excluded.details,
  tools = excluded.tools;

-- Only seed projects/experiences if the tables are empty, so
-- re-running this script doesn't create duplicates (these tables
-- use generated ids rather than a natural key to conflict on).
insert into public.projects (title, category, technologies, image, description)
select * from (values
  ('Campus Connect', 'Full Stack / Entrepreneurship', 'Full-Stack Development, Product Design, Project Management', '/images/project-1.webp',
   'A student marketplace and academic collaboration platform connecting students for resource exchange and campus services. Founded and led as an entrepreneurial initiative, coordinating a 10-person multidisciplinary team from concept to implementation.'),
  ('Airport Management System', 'C++ / OOP', 'C++, Object-Oriented Design, Software Engineering', '/images/project-2.webp',
   'A redesign of an existing airport management application, transforming procedural code into a scalable object-oriented architecture. Improved maintainability, reusability, and system organization through applied OOP principles and rigorous debugging.'),
  ('Book Management System', 'Web Development', 'HTML5, CSS3, Responsive Design', '/images/project-3.webp',
   'An online book management and catalog platform built as ICT coursework. Focused on efficient catalog organization, accessibility, and responsive interfaces that work smoothly across devices.')
) as seed(title, category, technologies, image, description)
where not exists (select 1 from public.projects);

insert into public.experiences (position, company, period, location, description, responsibilities, technologies)
select * from (values
  (
    'Founder & Product Lead',
    'Campus Connect — Student Marketplace & Academic Collaboration Platform',
    '2026 - Present',
    'Pak-Austria Fachhochschule, Pakistan',
    'Conceived and directed the development of a digital platform designed to connect students for academic collaboration, resource exchange, and campus services, as an entrepreneurial initiative at PAF-IAST.',
    array['Led project planning, feature design, and workflow management', 'Coordinated a multidisciplinary team of 10 members', 'Conducted requirement analysis for user-focused solutions', 'Oversaw implementation to improve campus engagement'],
    array['Product Development', 'Full-Stack Development', 'Leadership', 'Project Management', 'Team Collaboration']
  ),
  (
    'Project Lead & C++ Developer',
    'Airport Management System — Object-Oriented Software Redesign',
    'Semester 2, PAF-IAST',
    'Pak-Austria Fachhochschule, Pakistan',
    'Redesigned an existing airport management application by transforming procedural code into a scalable object-oriented architecture.',
    array['Applied core OOP concepts to improve maintainability and reusability', 'Improved system organization through better software architecture', 'Investigated and resolved functional issues through testing', 'Optimized code through debugging and performance improvements'],
    array['C++', 'Object-Oriented Design', 'Software Engineering', 'Debugging', 'Problem Solving']
  ),
  (
    'Web Development Team Member',
    'Book Management System Website',
    'ICT Coursework, 2025',
    'Pak-Austria Fachhochschule, Pakistan',
    'Developed key components of an online book management platform focused on efficient catalog organization and user accessibility.',
    array['Implemented responsive web interfaces and structured layouts', 'Enhanced usability across desktop and mobile devices', 'Collaborated with team members within academic timelines', 'Delivered project objectives on schedule'],
    array['HTML5', 'CSS3', 'Responsive Design', 'Front-End Development', 'Collaboration']
  )
) as seed(position, company, period, location, description, responsibilities, technologies)
where not exists (select 1 from public.experiences);


-- ============================================================
-- PART 4 — After running this: make yourself admin
-- ============================================================
-- 1. Sign up once through the site's /register page (this creates
--    your auth.users row and, via the trigger above, a matching
--    public.profiles row with role='user').
-- 2. Then run this, replacing the email with the one you signed up
--    with, to promote that account to admin so it can edit the
--    bio/skills/projects/experiences tables from /admin:
--
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'you@example.com');
-- ============================================================
