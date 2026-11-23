-- Deploy the code that excludes this source from automatic planning first.
insert into public.exercises
  (name, description, category, difficulty, equipment_required, restrictions, alternatives, muscle_groups, primary_muscle, is_momentum_approved, media_source, media_license, media_author)
values
  ('Plancha lateral', 'Estabilización lateral del tronco con apoyo sobre un antebrazo.', 'strength', 'intermediate', '["none_(bodyweight_exercise)"]', '["shoulder_injury","back_injury"]', '[]', '["core"]', 'core', true, 'atempo-illustration-pending', 'CC0-1.0', 'Open Exercise Illustrations')
on conflict (name) do nothing;
