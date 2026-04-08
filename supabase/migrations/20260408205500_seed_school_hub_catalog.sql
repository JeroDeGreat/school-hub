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
  is_lobby = excluded.is_lobby;

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
  color = excluded.color;

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
  color = excluded.color;

with lobby as (
  select id from public.departments where slug = 'general-lobby'
),
studio as (
  select id from public.departments where slug = 'creative-studio'
),
science as (
  select id from public.departments where slug = 'science-lab'
)
insert into public.messages (author_id, body, department_id, kind)
select null, message.body, message.department_id, 'system'
from (
  select
    'Welcome to School Hub. Use @handles to mention classmates, drop files, and keep everything in one place.' as body,
    (select id from lobby) as department_id
  union all
  select
    'Creative Studio is ready for critique swaps, shared references, and quick project check-ins.',
    (select id from studio)
  union all
  select
    'Science Lab is where experiments, assignment deadlines, and study support stay visible for everyone.',
    (select id from science)
) as message
where message.department_id is not null
  and not exists (
    select 1
    from public.messages existing
    where existing.department_id = message.department_id
      and existing.body = message.body
  );
