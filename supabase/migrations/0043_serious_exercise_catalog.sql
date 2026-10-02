-- Serious, hand-picked exercise catalog: 113 common, recognizable exercises
-- covering every muscle category with home/basic-gym/full-gym equipment variety. Combined with the
-- 45 originally curated local-photo exercises (see src/lib/local-exercise-media.ts), the planning
-- engine now selects from 113 + 45 trusted, professionally named exercises.
-- Resets approval so only this curated list is used for automatic plan generation and the manual builder.
update public.exercises set is_momentum_approved = false where media_source = 'free-exercise-db';

update public.exercises set
  name = 'Flexiones de pecho',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps","core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Pushups';

update public.exercises set
  name = 'Flexiones inclinadas',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Incline Push-Up';

update public.exercises set
  name = 'Flexiones con pies elevados',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps","core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Push-Ups With Feet Elevated';

update public.exercises set
  name = 'Flexiones con manos abiertas',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Push-Up Wide';

update public.exercises set
  name = 'Press banca con barra',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["barbell","bench"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Bench Press - Medium Grip';

update public.exercises set
  name = 'Press banca declinado con mancuernas',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Decline Dumbbell Bench Press';

update public.exercises set
  name = 'Press banca en máquina Smith',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["smith_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Smith Machine Bench Press';

update public.exercises set
  name = 'Aperturas inclinadas con mancuernas',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals"]'::jsonb,
  equipment_required = '["dumbbell","incline_bench"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Incline Dumbbell Flyes';

update public.exercises set
  name = 'Apertura de pecho con mancuernas en banco',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Flyes';

update public.exercises set
  name = 'Aperturas inclinadas en polea',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Incline Cable Flye';

update public.exercises set
  name = 'Cruce de poleas de pie para pectoral',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Crossover';

update public.exercises set
  name = 'Press banca en máquina',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Machine Bench Press';

update public.exercises set
  name = 'Press banca inclinado en máquina Smith',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["smith_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Smith Machine Incline Bench Press';

update public.exercises set
  name = 'Press de pecho en polea',
  primary_muscle = 'pectorals',
  muscle_groups = '["pectorals","triceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Chest Press';

update public.exercises set
  name = 'Dominada supina',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["pull-up_bar"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Chin-Up';

update public.exercises set
  name = 'Jalón al pecho con agarre amplio',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Wide-Grip Lat Pulldown';

update public.exercises set
  name = 'Jalón frontal al pecho con agarre cerrado',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Close-Grip Front Lat Pulldown';

update public.exercises set
  name = 'Jalón de brazos rectos con cuerda',
  primary_muscle = 'lats',
  muscle_groups = '["lats"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Rope Straight-Arm Pulldown';

update public.exercises set
  name = 'Remo con cuerda para espalda alta',
  primary_muscle = 'lats',
  muscle_groups = '["lats","deltoids"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Rope Rear-Delt Rows';

update public.exercises set
  name = 'Remo elevado en polea',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Elevated Cable Rows';

update public.exercises set
  name = 'Remo en polea alta de rodillas',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Kneeling High Pulley Row';

update public.exercises set
  name = 'Remo inclinado con barra',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Bent Over Barbell Row';

update public.exercises set
  name = 'Remo inclinado con agarre supino',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Reverse Grip Bent-Over Rows';

update public.exercises set
  name = 'Remo inclinado con dos mancuernas',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Bent Over Two-Dumbbell Row';

update public.exercises set
  name = 'Remo a un brazo con mancuerna',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'One-Arm Dumbbell Row';

update public.exercises set
  name = 'Remo invertido con peso corporal',
  primary_muscle = 'lats',
  muscle_groups = '["lats","biceps"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Inverted Row';

update public.exercises set
  name = 'Press de hombros con mancuernas',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Shoulder Press';

update public.exercises set
  name = 'Press de hombros a un brazo con mancuerna',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell One-Arm Shoulder Press';

update public.exercises set
  name = 'Press militar con barra',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Shoulder Press';

update public.exercises set
  name = 'Press militar de pie',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Military Press';

update public.exercises set
  name = 'Press Arnold con mancuernas',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Arnold Dumbbell Press';

update public.exercises set
  name = 'Press de hombros en polea',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Shoulder Press';

update public.exercises set
  name = 'Press de hombros en máquina Smith',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids","triceps"]'::jsonb,
  equipment_required = '["smith_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Smith Machine Overhead Shoulder Press';

update public.exercises set
  name = 'Elevaciones laterales con mancuernas',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Side Lateral Raise';

update public.exercises set
  name = 'Elevación posterior tumbado con mancuernas',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Lying Rear Lateral Raise';

update public.exercises set
  name = 'Aperturas posteriores con mancuernas',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Reverse Flyes';

update public.exercises set
  name = 'Face pull en polea',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Face Pull';

update public.exercises set
  name = 'Remo vertical de pie con mancuernas',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Dumbbell Upright Row';

update public.exercises set
  name = 'Rotación externa de hombro en polea',
  primary_muscle = 'deltoids',
  muscle_groups = '["deltoids"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["shoulder_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'External Rotation with Cable';

update public.exercises set
  name = 'Curl de bíceps con mancuernas',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Bicep Curl';

update public.exercises set
  name = 'Curl de bíceps alterno con mancuernas',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Alternate Bicep Curl';

update public.exercises set
  name = 'Curl martillo con mancuernas',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Hammer Curls';

update public.exercises set
  name = 'Curl martillo inclinado con mancuernas',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell","incline_bench"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Incline Hammer Curls';

update public.exercises set
  name = 'Curl martillo en polea con cuerda',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Hammer Curls - Rope Attachment';

update public.exercises set
  name = 'Curl predicador con barra',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["barbell","bench"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Preacher Curl';

update public.exercises set
  name = 'Curl predicador en polea',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Preacher Curl';

update public.exercises set
  name = 'Curl de concentración con mancuerna',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Concentration Curls';

update public.exercises set
  name = 'Curl de bíceps sentado con mancuerna',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Seated Dumbbell Curl';

update public.exercises set
  name = 'Curl inverso de pie con mancuernas',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Dumbbell Reverse Curl';

update public.exercises set
  name = 'Curl de bíceps en máquina',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Machine Bicep Curl';

update public.exercises set
  name = 'Curl Zottman con mancuernas',
  primary_muscle = 'biceps',
  muscle_groups = '["biceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Zottman Curl';

update public.exercises set
  name = 'Extensión de tríceps en polea con agarre de cuerda',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Triceps Pushdown - Rope Attachment';

update public.exercises set
  name = 'Extensión de tríceps por encima de la cabeza en polea con cuerda',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["elbow_injury","shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Rope Overhead Triceps Extension';

update public.exercises set
  name = 'Extensión de tríceps por encima de la cabeza con barra',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["elbow_injury","shoulder_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Overhead Barbell Triceps Extension';

update public.exercises set
  name = 'Extensión de tríceps con mancuerna',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Dumbbell Triceps Extension';

update public.exercises set
  name = 'Extensión de tríceps a un brazo con mancuerna',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'One Arm Pronated Dumbbell Triceps Extension';

update public.exercises set
  name = 'Press de tríceps sentado con mancuerna',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Seated Triceps Press';

update public.exercises set
  name = 'Extensión de tríceps en máquina',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Machine Triceps Extension';

update public.exercises set
  name = 'Patada de tríceps con mancuerna',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Tricep Dumbbell Kickback';

update public.exercises set
  name = 'Fondos en banco para tríceps',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["bench"]'::jsonb,
  restrictions = '["shoulder_injury","elbow_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Bench Dips';

update public.exercises set
  name = 'Press francés con barra Z',
  primary_muscle = 'triceps',
  muscle_groups = '["triceps"]'::jsonb,
  equipment_required = '["barbell","bench"]'::jsonb,
  restrictions = '["elbow_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'EZ-Bar Skullcrusher';

update public.exercises set
  name = 'Sentadilla con barra',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Squat';

update public.exercises set
  name = 'Sentadilla con peso corporal',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Bodyweight Squat';

update public.exercises set
  name = 'Sentadilla goblet con mancuerna',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Goblet Squat';

update public.exercises set
  name = 'Sentadilla con mancuernas',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Squat';

update public.exercises set
  name = 'Sentadilla frontal con barra',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Front Barbell Squat';

update public.exercises set
  name = 'Sentadilla en máquina Smith',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["smith_machine"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Smith Machine Squat';

update public.exercises set
  name = 'Sentadilla hack en máquina',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Hack Squat';

update public.exercises set
  name = 'Prensa de piernas con postura estrecha',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Narrow Stance Leg Press';

update public.exercises set
  name = 'Extensión de cuádriceps en máquina',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Leg Extensions';

update public.exercises set
  name = 'Zancadas con mancuernas',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Lunges';

update public.exercises set
  name = 'Zancadas caminando con peso corporal',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Bodyweight Walking Lunge';

update public.exercises set
  name = 'Zancada cruzada hacia atrás',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes","adductors"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Crossover Reverse Lunge';

update public.exercises set
  name = 'Sentadilla con mancuerna a banco',
  primary_muscle = 'quadriceps',
  muscle_groups = '["quadriceps","glutes"]'::jsonb,
  equipment_required = '["dumbbell","bench"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Squat To A Bench';

update public.exercises set
  name = 'Peso muerto rumano clásico con barra',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Romanian Deadlift';

update public.exercises set
  name = 'Peso muerto con barra',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes","lower_back"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Deadlift';

update public.exercises set
  name = 'Peso muerto sumo con barra',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes","adductors"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Sumo Deadlift';

update public.exercises set
  name = 'Peso muerto con piernas rígidas y mancuernas',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Stiff-Legged Dumbbell Deadlift';

update public.exercises set
  name = 'Peso muerto a una pierna con kettlebell',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes","core"]'::jsonb,
  equipment_required = '["kettlebell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Kettlebell One-Legged Deadlift';

update public.exercises set
  name = 'Peso muerto en polea',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Deadlifts';

update public.exercises set
  name = 'Curl femoral tumbado en máquina',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Lying Leg Curls';

update public.exercises set
  name = 'Curl femoral sentado en máquina',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Seated Leg Curl';

update public.exercises set
  name = 'Curl femoral de pie en máquina',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Leg Curl';

update public.exercises set
  name = 'Elevación natural de glúteo-isquiotibial',
  primary_muscle = 'hamstrings',
  muscle_groups = '["hamstrings","glutes"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Natural Glute Ham Raise';

update public.exercises set
  name = 'Empuje de cadera con barra',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes","hamstrings"]'::jsonb,
  equipment_required = '["barbell","bench"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Hip Thrust';

update public.exercises set
  name = 'Puente de glúteos a una pierna',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Single Leg Glute Bridge';

update public.exercises set
  name = 'Patada de glúteo en polea',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Glute Kickback';

update public.exercises set
  name = 'Patada de glúteo a una pierna en polea',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'One-Legged Cable Kickback';

update public.exercises set
  name = 'Zancada posterior con mancuerna',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes","quadriceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Rear Lunge';

update public.exercises set
  name = 'Subida al cajón con barra',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes","quadriceps"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Step Ups';

update public.exercises set
  name = 'Subida al cajón con mancuernas',
  primary_muscle = 'glutes',
  muscle_groups = '["glutes","quadriceps"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["knee_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dumbbell Step Ups';

update public.exercises set
  name = 'Aductor en máquina',
  primary_muscle = 'adductors',
  muscle_groups = '["adductors"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Adductor';

update public.exercises set
  name = 'Aducción de cadera con banda',
  primary_muscle = 'adductors',
  muscle_groups = '["adductors"]'::jsonb,
  equipment_required = '["resistance_band"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Band Hip Adductions';

update public.exercises set
  name = 'Elevación de gemelos de pie con mancuernas',
  primary_muscle = 'calves',
  muscle_groups = '["calves"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Dumbbell Calf Raise';

update public.exercises set
  name = 'Elevación de gemelos sentado con barra',
  primary_muscle = 'calves',
  muscle_groups = '["calves"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Barbell Seated Calf Raise';

update public.exercises set
  name = 'Elevación de gemelos estilo burro',
  primary_muscle = 'calves',
  muscle_groups = '["calves"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Donkey Calf Raises';

update public.exercises set
  name = 'Prensa de gemelos en máquina de piernas',
  primary_muscle = 'calves',
  muscle_groups = '["calves"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Calf Press On The Leg Press Machine';

update public.exercises set
  name = 'Hiperextensiones lumbares',
  primary_muscle = 'lower_back',
  muscle_groups = '["lower_back","glutes","hamstrings"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Hyperextensions (Back Extensions)';

update public.exercises set
  name = 'Buenos días con barra',
  primary_muscle = 'lower_back',
  muscle_groups = '["lower_back","hamstrings","glutes"]'::jsonb,
  equipment_required = '["barbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Good Morning';

update public.exercises set
  name = 'Hiperextensión inversa',
  primary_muscle = 'lower_back',
  muscle_groups = '["lower_back","glutes"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Reverse Hyperextension';

update public.exercises set
  name = 'Extensión de espalda tipo Superman',
  primary_muscle = 'lower_back',
  muscle_groups = '["lower_back","glutes"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Superman';

update public.exercises set
  name = 'Plancha abdominal',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Plank';

update public.exercises set
  name = 'Encogimientos abdominales',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Crunches';

update public.exercises set
  name = 'Crunch inverso',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Reverse Crunch';

update public.exercises set
  name = 'Giro ruso',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Russian Twist';

update public.exercises set
  name = 'Giro ruso en polea',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Cable Russian Twists';

update public.exercises set
  name = 'Crunch en máquina',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Ab Crunch Machine';

update public.exercises set
  name = 'Giro de leñador en polea de pie',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'intermediate',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Standing Cable Wood Chop';

update public.exercises set
  name = 'Estabilización de core tumbado',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Dead Bug';

update public.exercises set
  name = 'Escaladores',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Mountain Climbers';

update public.exercises set
  name = 'Press Pallof en polea',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["cable_machine"]'::jsonb,
  restrictions = '[]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Pallof Press';

update public.exercises set
  name = 'Patada de tijera',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["none_(bodyweight_exercise)"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Flutter Kicks';

update public.exercises set
  name = 'Paseo del granjero con mancuernas',
  primary_muscle = 'core',
  muscle_groups = '["core"]'::jsonb,
  equipment_required = '["dumbbell"]'::jsonb,
  restrictions = '["back_injury"]'::jsonb,
  difficulty = 'beginner',
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = 'Farmer''s Walk';
