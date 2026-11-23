alter table public.exercise_logs
  add column if not exists duration_seconds integer
  check (duration_seconds between 1 and 3600);

comment on column public.exercise_logs.duration_seconds is
  'Duration of a timed set in seconds; null for repetition-based or legacy logs.';
