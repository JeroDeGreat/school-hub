create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'teacher', 'admin');
create type public.membership_role as enum ('member', 'teacher', 'admin');
create type public.message_kind as enum ('message', 'system', 'file', 'call');
create type public.assignment_status as enum ('open', 'closed', 'archived');
create type public.submission_status as enum ('submitted', 'reviewed', 'needs_changes');
create type public.help_request_status as enum ('open', 'matched', 'resolved', 'cancelled');
create type public.notification_kind as enum (
  'assignment_posted',
  'assignment_due',
  'submission_received',
  'help_requested',
  'help_matched',
  'help_resolved',
  'announcement_posted',
  'badge_unlocked',
  'message_mention'
);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  handle text not null unique,
  avatar_url text,
  role public.app_role not null default 'student',
  headline text default 'Ready to collaborate',
  points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  emoji text,
  color text not null default '#cbb5ff',
  is_lobby boolean not null default false,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists departments_single_lobby_idx
  on public.departments (is_lobby)
  where is_lobby = true;

create table if not exists public.memberships (
  department_id uuid not null references public.departments (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.membership_role not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (department_id, user_id)
);

create table if not exists public.direct_threads (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean not null default false,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.direct_thread_members (
  thread_id uuid not null references public.direct_threads (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (thread_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users (id) on delete set null,
  body text not null default '',
  department_id uuid references public.departments (id) on delete cascade,
  direct_thread_id uuid references public.direct_threads (id) on delete cascade,
  parent_message_id uuid references public.messages (id) on delete set null,
  kind public.message_kind not null default 'message',
  attachment jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint messages_room_check check (
    ((department_id is not null)::int + (direct_thread_id is not null)::int) = 1
  )
);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (message_id, user_id, emoji)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments (id) on delete cascade,
  author_id uuid references public.users (id) on delete set null,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.department_resources (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments (id) on delete cascade,
  author_id uuid references public.users (id) on delete set null,
  title text not null,
  body text,
  link_url text,
  attachment jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments (id) on delete cascade,
  author_id uuid references public.users (id) on delete set null,
  title text not null,
  instructions text not null,
  due_at timestamptz not null,
  points integer not null default 100,
  status public.assignment_status not null default 'open',
  attachment jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  body text,
  attachment jsonb,
  status public.submission_status not null default 'submitted',
  score integer,
  feedback text,
  submitted_at timestamptz not null default timezone('utc', now()),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments (id) on delete cascade,
  author_id uuid not null references public.users (id) on delete cascade,
  volunteer_id uuid references public.users (id) on delete set null,
  title text not null,
  description text not null,
  topic_tags text[] not null default '{}',
  status public.help_request_status not null default 'open',
  points_reward integer not null default 15,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  points_threshold integer not null default 0
);

create table if not exists public.user_badges (
  user_id uuid not null references public.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default timezone('utc', now()),
  source_help_request_id uuid references public.help_requests (id) on delete set null,
  primary key (user_id, badge_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  department_id uuid references public.departments (id) on delete cascade,
  assignment_id uuid references public.assignments (id) on delete cascade,
  help_request_id uuid references public.help_requests (id) on delete cascade,
  message_id uuid references public.messages (id) on delete cascade,
  direct_thread_id uuid references public.direct_threads (id) on delete cascade,
  dedupe_key text unique,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

insert into storage.buckets (id, name, public)
values
  ('department-files', 'department-files', false),
  ('submission-files', 'submission-files', false),
  ('avatars', 'avatars', false)
on conflict (id) do nothing;

create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists direct_thread_members_user_id_idx on public.direct_thread_members (user_id);
create index if not exists messages_department_created_idx on public.messages (department_id, created_at desc)
  where department_id is not null;
create index if not exists messages_direct_thread_created_idx on public.messages (direct_thread_id, created_at desc)
  where direct_thread_id is not null;
create index if not exists messages_parent_message_id_idx on public.messages (parent_message_id);
create index if not exists announcements_department_created_idx
  on public.announcements (department_id, pinned desc, created_at desc);
create index if not exists department_resources_department_created_idx
  on public.department_resources (department_id, created_at desc);
create index if not exists assignments_department_due_idx
  on public.assignments (department_id, status, due_at);
create index if not exists submissions_assignment_submitted_idx
  on public.submissions (assignment_id, submitted_at desc);
create index if not exists submissions_student_id_idx on public.submissions (student_id);
create index if not exists help_requests_department_status_created_idx
  on public.help_requests (department_id, status, created_at desc);
create index if not exists help_requests_volunteer_status_idx
  on public.help_requests (volunteer_id, status);
create index if not exists user_badges_user_id_idx on public.user_badges (user_id, awarded_at desc);
create index if not exists notifications_user_read_created_idx
  on public.notifications (user_id, is_read, created_at desc);
create index if not exists message_reactions_message_id_idx on public.message_reactions (message_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.users where id = (select auth.uid())),
    false
  );
$$;

create or replace function public.is_department_member(target_department uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where department_id = target_department
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_department(target_department uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (select public.is_admin())
    or exists (
      select 1
      from public.memberships
      where department_id = target_department
        and user_id = (select auth.uid())
        and role in ('teacher', 'admin')
    );
$$;

create or replace function public.is_direct_thread_member(target_thread uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.direct_thread_members
    where thread_id = target_thread
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.can_access_message(target_message uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messages
    where id = target_message
      and (
        (department_id is not null and (select public.is_department_member(department_id)))
        or
        (direct_thread_id is not null and (select public.is_direct_thread_member(direct_thread_id)))
      )
  );
$$;

create or replace function public.can_manage_assignment(target_assignment uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments
    where id = target_assignment
      and (select public.can_manage_department(department_id))
  );
$$;

create or replace function public.generate_handle(seed_value text, seed_user uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
begin
  normalized := lower(regexp_replace(coalesce(seed_value, 'student'), '[^a-z0-9]+', '', 'g'));

  if normalized = '' then
    normalized := 'student';
  end if;

  return normalized || right(replace(seed_user::text, '-', ''), 4);
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, handle, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      initcap(replace(split_part(new.email, '@', 1), '.', ' '))
    ),
    public.generate_handle(
      coalesce(
        new.raw_user_meta_data ->> 'preferred_username',
        split_part(new.email, '@', 1)
      ),
      new.id
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at = timezone('utc', now());

  insert into public.memberships (department_id, user_id, role)
  select id, new.id, 'member'
  from public.departments
  where is_lobby = true
  on conflict do nothing;

  return new;
end;
$$;

create or replace function public.award_badges_for_user(target_user uuid, source_request uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  awarded record;
begin
  for awarded in
    with inserted as (
      insert into public.user_badges (user_id, badge_id, source_help_request_id)
      select target_user, badge.id, source_request
      from public.badges badge
      join public.users school_user on school_user.id = target_user
      where badge.points_threshold <= school_user.points
      on conflict do nothing
      returning badge_id
    )
    select badge.*
    from inserted
    join public.badges badge on badge.id = inserted.badge_id
  loop
    insert into public.notifications (
      user_id,
      kind,
      title,
      body,
      help_request_id,
      dedupe_key
    )
    values (
      target_user,
      'badge_unlocked',
      awarded.name || ' unlocked',
      awarded.description,
      source_request,
      'badge:' || target_user::text || ':' || awarded.id::text
    )
    on conflict (dedupe_key) do nothing;
  end loop;
end;
$$;

create or replace function public.notify_assignment_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    department_id,
    assignment_id,
    dedupe_key
  )
  select
    memberships.user_id,
    'assignment_posted',
    'New assignment in ' || departments.name,
    new.title || ' is due ' || to_char(new.due_at, 'Mon DD, HH12:MI AM'),
    new.department_id,
    new.id,
    'assignment:' || new.id::text || ':' || memberships.user_id::text
  from public.memberships memberships
  join public.departments departments on departments.id = memberships.department_id
  where memberships.department_id = new.department_id
    and memberships.user_id is distinct from new.author_id
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

create or replace function public.notify_submission_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_record record;
begin
  select assignments.id, assignments.title, assignments.department_id, assignments.author_id
  into assignment_record
  from public.assignments
  where assignments.id = new.assignment_id;

  if assignment_record.author_id is not null then
    insert into public.notifications (
      user_id,
      kind,
      title,
      body,
      assignment_id,
      department_id,
      dedupe_key
    )
    values (
      assignment_record.author_id,
      'submission_received',
      'New submission received',
      'A learner submitted work for ' || assignment_record.title,
      assignment_record.id,
      assignment_record.department_id,
      'submission:' || new.id::text || ':' || assignment_record.author_id::text
    )
    on conflict (dedupe_key) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.notify_announcement_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    department_id,
    dedupe_key
  )
  select
    memberships.user_id,
    'announcement_posted',
    new.title,
    left(new.body, 180),
    new.department_id,
    'announcement:' || new.id::text || ':' || memberships.user_id::text
  from public.memberships memberships
  where memberships.department_id = new.department_id
    and memberships.user_id is distinct from new.author_id
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

create or replace function public.notify_help_request_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    department_id,
    help_request_id,
    dedupe_key
  )
  select
    memberships.user_id,
    'help_requested',
    'A peer needs help',
    new.title,
    new.department_id,
    new.id,
    'help-open:' || new.id::text || ':' || memberships.user_id::text
  from public.memberships memberships
  where memberships.department_id = new.department_id
    and memberships.user_id is distinct from new.author_id
    and memberships.role in ('teacher', 'admin')
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

create or replace function public.notify_help_request_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.volunteer_id is null and new.volunteer_id is not null then
    insert into public.notifications (
      user_id,
      kind,
      title,
      body,
      department_id,
      help_request_id,
      dedupe_key
    )
    values (
      new.author_id,
      'help_matched',
      'A classmate picked up your request',
      new.title,
      new.department_id,
      new.id,
      'help-match:' || new.id::text || ':' || new.author_id::text
    )
    on conflict (dedupe_key) do nothing;
  end if;

  if old.status is distinct from 'resolved' and new.status = 'resolved' and new.volunteer_id is not null then
    update public.users
    set points = points + new.points_reward
    where id = new.volunteer_id;

    perform public.award_badges_for_user(new.volunteer_id, new.id);

    insert into public.notifications (
      user_id,
      kind,
      title,
      body,
      department_id,
      help_request_id,
      dedupe_key
    )
    values
      (
        new.author_id,
        'help_resolved',
        'Help request resolved',
        new.title,
        new.department_id,
        new.id,
        'help-resolved:' || new.id::text || ':' || new.author_id::text
      ),
      (
        new.volunteer_id,
        'help_resolved',
        'You earned ' || new.points_reward::text || ' points',
        'Thanks for helping with ' || new.title,
        new.department_id,
        new.id,
        'help-volunteer:' || new.id::text || ':' || new.volunteer_id::text
      )
    on conflict (dedupe_key) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.notify_message_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mentioned_user record;
begin
  for mentioned_user in
    select school_user.id, school_user.handle
    from public.users school_user
    where new.body ilike '%' || '@' || school_user.handle || '%'
      and school_user.id is distinct from new.author_id
      and (
        (new.department_id is not null and exists (
          select 1
          from public.memberships
          where department_id = new.department_id
            and user_id = school_user.id
        ))
        or
        (new.direct_thread_id is not null and exists (
          select 1
          from public.direct_thread_members
          where thread_id = new.direct_thread_id
            and user_id = school_user.id
        ))
      )
  loop
    insert into public.notifications (
      user_id,
      kind,
      title,
      body,
      department_id,
      message_id,
      direct_thread_id,
      dedupe_key
    )
    values (
      mentioned_user.id,
      'message_mention',
      'You were mentioned',
      left(new.body, 180),
      new.department_id,
      new.id,
      new.direct_thread_id,
      'mention:' || new.id::text || ':' || mentioned_user.id::text
    )
    on conflict (dedupe_key) do nothing;
  end loop;

  return new;
end;
$$;

create or replace function public.process_deadline_notifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    department_id,
    assignment_id,
    dedupe_key
  )
  select
    memberships.user_id,
    'assignment_due',
    'Deadline coming up',
    assignments.title || ' is due within the next 24 hours',
    assignments.department_id,
    assignments.id,
    'deadline:' || assignments.id::text || ':' || memberships.user_id::text
  from public.assignments assignments
  join public.memberships memberships on memberships.department_id = assignments.department_id
  left join public.submissions submissions
    on submissions.assignment_id = assignments.id
   and submissions.student_id = memberships.user_id
  where assignments.status = 'open'
    and assignments.due_at between timezone('utc', now()) and timezone('utc', now()) + interval '24 hours'
    and memberships.role = 'member'
    and submissions.id is null
  on conflict (dedupe_key) do nothing;
end;
$$;

create or replace function public.ensure_school_defaults()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user uuid := (select auth.uid());
  lobby_id uuid;
  studio_id uuid;
  science_id uuid;
begin
  if current_user is null then
    return;
  end if;

  insert into public.badges (slug, name, description, icon, points_threshold)
  values
    ('first-responder', 'First Responder', 'Answered a peer support request and kicked off your collaboration streak.', 'Sparkles', 15),
    ('study-circle', 'Study Circle', 'Reached 45 contribution points by helping your department stay active.', 'Orbit', 45),
    ('campus-guide', 'Campus Guide', 'Earned 90 points through submissions, support, and dependable follow-through.', 'Compass', 90),
    ('school-champion', 'School Champion', 'Became one of the platform leaders with 180 collaboration points.', 'ShieldCheck', 180)
  on conflict (slug) do update
  set
    name = excluded.name,
    description = excluded.description,
    icon = excluded.icon,
    points_threshold = excluded.points_threshold;

  insert into public.departments (slug, name, description, emoji, color, is_lobby)
  values (
    'general-lobby',
    'General Lobby',
    'The all-school space for updates, wins, live sessions, and quick coordination.',
    '🏫',
    '#d2c0ed',
    true
  )
  on conflict (slug) do update
  set
    name = excluded.name,
    description = excluded.description,
    emoji = excluded.emoji,
    color = excluded.color,
    is_lobby = excluded.is_lobby
  returning id into lobby_id;

  insert into public.departments (slug, name, description, emoji, color)
  values (
    'creative-studio',
    'Creative Studio',
    'A department space for visual design, project critiques, and portfolio help.',
    '🎨',
    '#efbfd3'
  )
  on conflict (slug) do update
  set
    name = excluded.name,
    description = excluded.description,
    emoji = excluded.emoji,
    color = excluded.color
  returning id into studio_id;

  insert into public.departments (slug, name, description, emoji, color)
  values (
    'science-lab',
    'Science Lab',
    'Assignments, shared notes, and peer support for experiments, problem sets, and reports.',
    '🧪',
    '#b5d4dd'
  )
  on conflict (slug) do update
  set
    name = excluded.name,
    description = excluded.description,
    emoji = excluded.emoji,
    color = excluded.color
  returning id into science_id;

  insert into public.memberships (department_id, user_id, role)
  values
    (lobby_id, current_user, 'member'),
    (studio_id, current_user, 'member'),
    (science_id, current_user, 'member')
  on conflict do nothing;

  insert into public.messages (author_id, body, department_id, kind)
  select null, 'Welcome to School Hub. Use @handles to mention classmates, drop files, and keep everything in one place.', lobby_id, 'system'
  where not exists (
    select 1 from public.messages
    where department_id = lobby_id
      and body = 'Welcome to School Hub. Use @handles to mention classmates, drop files, and keep everything in one place.'
  );

  insert into public.messages (author_id, body, department_id, kind)
  select null, 'Creative Studio is ready for critique swaps, shared references, and quick project check-ins.', studio_id, 'system'
  where not exists (
    select 1 from public.messages
    where department_id = studio_id
      and body = 'Creative Studio is ready for critique swaps, shared references, and quick project check-ins.'
  );

  insert into public.messages (author_id, body, department_id, kind)
  select null, 'Science Lab is where experiments, assignment deadlines, and study support stay visible for everyone.', science_id, 'system'
  where not exists (
    select 1 from public.messages
    where department_id = science_id
      and body = 'Science Lab is where experiments, assignment deadlines, and study support stay visible for everyone.'
  );

  insert into public.announcements (department_id, author_id, title, body, pinned)
  select lobby_id, null, 'Orientation week lives here', 'School-wide reminders, live call links, and announcements appear in the lobby so nobody has to chase them in separate group chats.', true
  where not exists (
    select 1 from public.announcements
    where department_id = lobby_id
      and title = 'Orientation week lives here'
  );

  insert into public.department_resources (department_id, author_id, title, body, link_url)
  select studio_id, null, 'Brand critique checklist', 'Keep feedback specific: concept, hierarchy, readability, and next iteration notes.', 'https://supabase.com/docs'
  where not exists (
    select 1 from public.department_resources
    where department_id = studio_id
      and title = 'Brand critique checklist'
  );

  insert into public.department_resources (department_id, author_id, title, body, link_url)
  select science_id, null, 'Lab report template', 'A reusable structure for observations, hypothesis updates, and peer review comments.', 'https://supabase.com/docs'
  where not exists (
    select 1 from public.department_resources
    where department_id = science_id
      and title = 'Lab report template'
  );

  insert into public.assignments (department_id, author_id, title, instructions, due_at, points)
  select science_id, null, 'Microscope reflection', 'Upload your notes, add one image if needed, and summarize the most surprising observation from this week''s lab.', timezone('utc', now()) + interval '3 days', 40
  where not exists (
    select 1 from public.assignments
    where department_id = science_id
      and title = 'Microscope reflection'
  );

  insert into public.help_requests (department_id, author_id, title, description, topic_tags, status, points_reward)
  select studio_id, current_user, 'Need feedback on hero layout', 'I''m looking for a quick review on spacing, hierarchy, and whether the CTA is clear on mobile.', array['design', 'feedback'], 'open', 20
  where not exists (
    select 1 from public.help_requests
    where department_id = studio_id
      and author_id = current_user
      and title = 'Need feedback on hero layout'
  );

  perform public.process_deadline_notifications();
end;
$$;

create or replace function public.toggle_message_reaction(target_message uuid, reaction_emoji text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.can_access_message(target_message)) then
    raise exception 'Not allowed';
  end if;

  delete from public.message_reactions
  where message_id = target_message
    and user_id = (select auth.uid())
    and emoji = reaction_emoji;

  if not found then
    insert into public.message_reactions (message_id, user_id, emoji)
    values (target_message, (select auth.uid()), reaction_emoji);
  end if;
end;
$$;

create or replace function public.volunteer_for_help_request(target_help_request uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.help_requests
  set
    volunteer_id = coalesce(volunteer_id, (select auth.uid())),
    status = case when volunteer_id is null then 'matched' else status end
  where id = target_help_request
    and status = 'open'
    and author_id is distinct from (select auth.uid())
    and (select public.is_department_member(department_id));
end;
$$;

create or replace function public.resolve_help_request(target_help_request uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.help_requests
  set
    status = 'resolved',
    resolved_at = timezone('utc', now())
  where id = target_help_request
    and status in ('open', 'matched')
    and (
      author_id = (select auth.uid())
      or volunteer_id = (select auth.uid())
      or (select public.can_manage_department(department_id))
    );
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
  set is_read = true
  where user_id = (select auth.uid())
    and is_read = false;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at
before update on public.departments
for each row
execute function public.set_updated_at();

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at
before update on public.messages
for each row
execute function public.set_updated_at();

drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at
before update on public.assignments
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

drop trigger if exists assignments_notify_insert on public.assignments;
create trigger assignments_notify_insert
after insert on public.assignments
for each row
execute function public.notify_assignment_created();

drop trigger if exists submissions_notify_insert on public.submissions;
create trigger submissions_notify_insert
after insert on public.submissions
for each row
execute function public.notify_submission_received();

drop trigger if exists announcements_notify_insert on public.announcements;
create trigger announcements_notify_insert
after insert on public.announcements
for each row
execute function public.notify_announcement_created();

drop trigger if exists help_requests_notify_insert on public.help_requests;
create trigger help_requests_notify_insert
after insert on public.help_requests
for each row
execute function public.notify_help_request_created();

drop trigger if exists help_requests_notify_update on public.help_requests;
create trigger help_requests_notify_update
after update on public.help_requests
for each row
execute function public.notify_help_request_updated();

drop trigger if exists messages_notify_mentions on public.messages;
create trigger messages_notify_mentions
after insert on public.messages
for each row
execute function public.notify_message_mentions();

alter table public.users enable row level security;
alter table public.users force row level security;
alter table public.departments enable row level security;
alter table public.departments force row level security;
alter table public.memberships enable row level security;
alter table public.memberships force row level security;
alter table public.direct_threads enable row level security;
alter table public.direct_threads force row level security;
alter table public.direct_thread_members enable row level security;
alter table public.direct_thread_members force row level security;
alter table public.messages enable row level security;
alter table public.messages force row level security;
alter table public.message_reactions enable row level security;
alter table public.message_reactions force row level security;
alter table public.announcements enable row level security;
alter table public.announcements force row level security;
alter table public.department_resources enable row level security;
alter table public.department_resources force row level security;
alter table public.assignments enable row level security;
alter table public.assignments force row level security;
alter table public.submissions enable row level security;
alter table public.submissions force row level security;
alter table public.help_requests enable row level security;
alter table public.help_requests force row level security;
alter table public.badges enable row level security;
alter table public.badges force row level security;
alter table public.user_badges enable row level security;
alter table public.user_badges force row level security;
alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy "Users are readable by authenticated members"
on public.users
for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Departments are visible to authenticated users"
on public.departments
for select
to authenticated
using (true);

create policy "Teachers and admins can create departments"
on public.departments
for insert
to authenticated
with check (
  (select public.is_admin())
  or exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role in ('teacher', 'admin')
  )
);

create policy "Department managers can update departments"
on public.departments
for update
to authenticated
using ((select public.can_manage_department(id)))
with check ((select public.can_manage_department(id)));

create policy "Admins can delete departments"
on public.departments
for delete
to authenticated
using ((select public.is_admin()));

create policy "Members can view department memberships"
on public.memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_department_member(department_id))
  or (select public.is_admin())
);

create policy "Users can join departments"
on public.memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  or (select public.can_manage_department(department_id))
  or (select public.is_admin())
);

create policy "Managers can update membership roles"
on public.memberships
for update
to authenticated
using ((select public.can_manage_department(department_id)))
with check ((select public.can_manage_department(department_id)));

create policy "Users can leave and managers can remove members"
on public.memberships
for delete
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.can_manage_department(department_id))
);

create policy "Direct threads are visible to participants"
on public.direct_threads
for select
to authenticated
using ((select public.is_direct_thread_member(id)));

create policy "Authenticated users can create direct threads"
on public.direct_threads
for insert
to authenticated
with check (true);

create policy "Thread creators or admins can update direct threads"
on public.direct_threads
for update
to authenticated
using (
  created_by = (select auth.uid())
  or (select public.is_admin())
);

create policy "Thread members are visible to participants"
on public.direct_thread_members
for select
to authenticated
using ((select public.is_direct_thread_member(thread_id)));

create policy "Users can add themselves to new direct threads"
on public.direct_thread_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.direct_threads
    where id = thread_id
      and created_by = (select auth.uid())
  )
);

create policy "Members can leave direct threads"
on public.direct_thread_members
for delete
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.direct_threads
    where id = thread_id
      and created_by = (select auth.uid())
  )
);

create policy "Messages are visible in joined rooms"
on public.messages
for select
to authenticated
using (
  (department_id is not null and (select public.is_department_member(department_id)))
  or
  (direct_thread_id is not null and (select public.is_direct_thread_member(direct_thread_id)))
);

create policy "Users can send messages in joined rooms"
on public.messages
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and (
    (department_id is not null and (select public.is_department_member(department_id)))
    or
    (direct_thread_id is not null and (select public.is_direct_thread_member(direct_thread_id)))
  )
);

create policy "Authors and managers can update messages"
on public.messages
for update
to authenticated
using (
  author_id = (select auth.uid())
  or (department_id is not null and (select public.can_manage_department(department_id)))
  or (select public.is_admin())
)
with check (
  author_id = (select auth.uid())
  or (department_id is not null and (select public.can_manage_department(department_id)))
  or (select public.is_admin())
);

create policy "Authors and managers can delete messages"
on public.messages
for delete
to authenticated
using (
  author_id = (select auth.uid())
  or (department_id is not null and (select public.can_manage_department(department_id)))
  or (select public.is_admin())
);

create policy "Reactions are visible where messages are visible"
on public.message_reactions
for select
to authenticated
using ((select public.can_access_message(message_id)));

create policy "Users can react in rooms they can access"
on public.message_reactions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.can_access_message(message_id))
);

create policy "Users can remove their own reactions"
on public.message_reactions
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and (select public.can_access_message(message_id))
);

create policy "Announcements are visible to department members"
on public.announcements
for select
to authenticated
using ((select public.is_department_member(department_id)));

create policy "Managers can publish announcements"
on public.announcements
for insert
to authenticated
with check ((select public.can_manage_department(department_id)));

create policy "Managers can update announcements"
on public.announcements
for update
to authenticated
using ((select public.can_manage_department(department_id)))
with check ((select public.can_manage_department(department_id)));

create policy "Managers can delete announcements"
on public.announcements
for delete
to authenticated
using ((select public.can_manage_department(department_id)));

create policy "Resources are visible to department members"
on public.department_resources
for select
to authenticated
using ((select public.is_department_member(department_id)));

create policy "Managers can create resources"
on public.department_resources
for insert
to authenticated
with check ((select public.can_manage_department(department_id)));

create policy "Managers can update resources"
on public.department_resources
for update
to authenticated
using ((select public.can_manage_department(department_id)))
with check ((select public.can_manage_department(department_id)));

create policy "Managers can delete resources"
on public.department_resources
for delete
to authenticated
using ((select public.can_manage_department(department_id)));

create policy "Assignments are visible to department members"
on public.assignments
for select
to authenticated
using ((select public.is_department_member(department_id)));

create policy "Managers can create assignments"
on public.assignments
for insert
to authenticated
with check ((select public.can_manage_department(department_id)));

create policy "Managers can update assignments"
on public.assignments
for update
to authenticated
using ((select public.can_manage_department(department_id)))
with check ((select public.can_manage_department(department_id)));

create policy "Managers can delete assignments"
on public.assignments
for delete
to authenticated
using ((select public.can_manage_department(department_id)));

create policy "Students and managers can view submissions"
on public.submissions
for select
to authenticated
using (
  student_id = (select auth.uid())
  or (select public.can_manage_assignment(assignment_id))
);

create policy "Students can submit their own work"
on public.submissions
for insert
to authenticated
with check (
  student_id = (select auth.uid())
  and exists (
    select 1
    from public.assignments
    where id = assignment_id
      and status = 'open'
      and (select public.is_department_member(department_id))
  )
);

create policy "Students and managers can update submissions"
on public.submissions
for update
to authenticated
using (
  student_id = (select auth.uid())
  or (select public.can_manage_assignment(assignment_id))
)
with check (
  student_id = (select auth.uid())
  or (select public.can_manage_assignment(assignment_id))
);

create policy "Students can delete their own submissions"
on public.submissions
for delete
to authenticated
using (
  student_id = (select auth.uid())
  or (select public.can_manage_assignment(assignment_id))
);

create policy "Help requests are visible to department members"
on public.help_requests
for select
to authenticated
using ((select public.is_department_member(department_id)));

create policy "Members can create help requests"
on public.help_requests
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and (select public.is_department_member(department_id))
);

create policy "Authors volunteers and managers can update help requests"
on public.help_requests
for update
to authenticated
using (
  author_id = (select auth.uid())
  or volunteer_id = (select auth.uid())
  or (select public.can_manage_department(department_id))
)
with check (
  author_id = (select auth.uid())
  or volunteer_id = (select auth.uid())
  or (select public.can_manage_department(department_id))
);

create policy "Authors and managers can delete help requests"
on public.help_requests
for delete
to authenticated
using (
  author_id = (select auth.uid())
  or (select public.can_manage_department(department_id))
);

create policy "Badges are visible to authenticated users"
on public.badges
for select
to authenticated
using (true);

create policy "Earned badges are visible to authenticated users"
on public.user_badges
for select
to authenticated
using (true);

create policy "Notifications belong to the signed-in user"
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can mark their notifications as read"
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Authenticated users can read School Hub files"
on storage.objects
for select
to authenticated
using (bucket_id in ('department-files', 'submission-files', 'avatars'));

create policy "Authenticated users can upload School Hub files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('department-files', 'submission-files', 'avatars')
  and owner = (select auth.uid())
);

create policy "Users can update their uploaded files"
on storage.objects
for update
to authenticated
using (owner = (select auth.uid()))
with check (owner = (select auth.uid()));

create policy "Users can delete their uploaded files"
on storage.objects
for delete
to authenticated
using (owner = (select auth.uid()));
