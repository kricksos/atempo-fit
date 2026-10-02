-- Remove the bulk Free Exercise DB import rows that never made it into the curated catalog
-- (migrations 0040/0041 added 873 rows; only 113 were kept as is_momentum_approved = true by 0043).
-- Only deletes rows that are safe to remove: not approved, and not referenced by any real workout
-- data (workout_exercises, exercise_logs, manual_workout_draft_exercises), so nobody's already
-- generated or logged workout ever loses an exercise it points to.
delete from public.exercises exercises
where exercises.media_source = 'free-exercise-db'
  and exercises.is_momentum_approved = false
  and not exists (select 1 from public.workout_exercises we where we.exercise_id = exercises.id)
  and not exists (select 1 from public.exercise_logs el where el.exercise_id = exercises.id)
  and not exists (select 1 from public.manual_workout_draft_exercises mwde where mwde.exercise_id = exercises.id);
