-- Deploy the code that excludes this source from automatic planning first.
insert into public.exercises
  (name, description, category, difficulty, equipment_required, restrictions, alternatives, muscle_groups, primary_muscle, is_momentum_approved, media_source, media_license, media_author)
values
  ('Pájaros con mancuernas de pie', 'Apertura posterior con mancuernas y el tronco inclinado de pie.', 'strength', 'intermediate', '["dumbbell"]', '["shoulder_injury","back_injury"]', '[]', '["deltoids","traps"]', 'deltoids', true, 'atempo-illustration-pending', 'CC0-1.0', 'Open Exercise Illustrations'),
  ('Press francés con mancuernas tumbado', 'Extensión de codos con mancuernas tumbado en un banco.', 'strength', 'intermediate', '["dumbbell","bench"]', '["shoulder_injury","elbow_injury"]', '[]', '["triceps"]', 'triceps', true, 'atempo-illustration-pending', 'CC0-1.0', 'Open Exercise Illustrations'),
  ('Peso muerto con banda elástica', 'Peso muerto con una banda elástica mediante una bisagra de cadera.', 'strength', 'intermediate', '["resistance_band"]', '["back_injury","hip_injury"]', '[]', '["hamstrings","glutes","lower_back"]', 'hamstrings', true, 'atempo-illustration-pending', 'CC0-1.0', 'Open Exercise Illustrations'),
  ('Elevación de gemelos de pie en máquina', 'Elevación de talones de pie en máquina para gemelos.', 'strength', 'beginner', '["machine"]', '[]', '[]', '["calves"]', 'calves', true, 'atempo-illustration-pending', 'CC0-1.0', 'Open Exercise Illustrations'),
  ('Giro de tronco en polea de pie', 'Rotación horizontal del tronco de pie con resistencia de polea.', 'strength', 'intermediate', '["cable_machine"]', '["back_injury"]', '[]', '["core"]', 'core', true, 'atempo-illustration-pending', 'CC0-1.0', 'Open Exercise Illustrations')
on conflict (name) do nothing;
