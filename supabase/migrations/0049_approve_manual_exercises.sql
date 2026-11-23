-- Deploy the code that filters exercises by the selected material before applying this migration.
-- These are the existing records corresponding to the published manual catalogue.
update public.exercises
set is_momentum_approved = true
where name in (
  'Buenos días',
  'Cruce de poleas bajas',
  'Crunch abdominal',
  'Crunch en polea',
  'Curl con barra',
  'Curl de biceps',
  'Curl de bíceps con barra en agarre invertido',
  'Curl predicador',
  'Curl inclinado con mancuernas',
  'Curl femoral',
  'Curl martillo',
  'Dominadas',
  'Elevación de gemelos sentado con mancuerna',
  'Elevación de piernas colgado',
  'Elevaciones frontales',
  'Elevaciones laterales',
  'Extensión de cuádriceps',
  'Extensión de tríceps en polea',
  'Face pull',
  'Flexiones',
  'Fondos para pecho',
  'Hip thrust',
  'Hiperextensiones',
  'Jalon al pecho',
  'Jalón de brazos rectos',
  'Pallof press',
  'Peso muerto a una pierna con mancuerna',
  'Peso muerto rumano',
  'Plancha',
  'Prensa de piernas',
  'Press banca',
  'Press inclinado',
  'Press militar con mancuernas',
  'Puente de glúteos con barra',
  'Remo con barra',
  'Remo con mancuerna',
  'Remo sentado en polea',
  'Sentadilla',
  'Sentadilla búlgara con mancuernas',
  'Sentadilla goblet',
  'Zancadas con barra'
) and is_momentum_approved = false;

update public.exercises
set primary_muscle = 'quadriceps',
    muscle_groups = '["quadriceps", "glutes"]'::jsonb
where name = 'Prensa de piernas' and primary_muscle = 'hamstrings';

update public.exercises
set equipment_required = '["machine"]'::jsonb
where name = 'Prensa de piernas' and equipment_required = '[]'::jsonb;

update public.exercises
set equipment_required = '["hyperextension_bench"]'::jsonb
where name = 'Hiperextensiones lumbares' and equipment_required = '["machine"]'::jsonb;

update public.exercises
set equipment_required = equipment_required || '["preacher_bench"]'::jsonb
where name = 'Curl predicador en polea' and equipment_required = '["cable_machine"]'::jsonb;

update public.exercises
set equipment_required = equipment_required || '["incline_bench"]'::jsonb
where name = 'Elevación posterior tumbado con mancuernas' and equipment_required = '["dumbbell", "bench"]'::jsonb;

update public.exercises
set equipment_required = equipment_required || '["step"]'::jsonb
where name = 'Remo elevado en polea' and equipment_required = '["cable_machine"]'::jsonb;

update public.exercises
set restrictions = restrictions || '["shoulder_injury"]'::jsonb
where name = 'Cruce de poleas bajas' and restrictions = '[]'::jsonb;

update public.exercises
set restrictions = restrictions || '["shoulder_injury", "elbow_injury"]'::jsonb
where name in ('Flexiones', 'Flexiones de pecho', 'Flexiones inclinadas') and restrictions = '[]'::jsonb;

update public.exercises
set restrictions = restrictions || '["knee_injury"]'::jsonb
where name in ('Prensa de piernas', 'Sentadilla goblet') and restrictions = '[]'::jsonb;

update public.exercises
set description = 'Sentado en un banco Scott, flexiona los codos tirando de una polea baja y regresa de manera controlada.'
where name = 'Curl predicador en polea' and description like 'Place a preacher bench%';

update public.exercises
set description = 'Apoya el pecho en un banco inclinado y eleva las mancuernas hacia los lados para trabajar la parte posterior de los hombros.'
where name = 'Elevación posterior tumbado con mancuernas' and description like 'While holding a dumbbell%';

update public.exercises
set description = 'De pie, eleva la barra sobre la cabeza y flexiona los codos para bajarla detrás de la cabeza; vuelve a extenderlos de forma controlada.'
where name = 'Extensión de tríceps por encima de la cabeza con barra' and description like 'To begin, stand up holding a barbell%';

update public.exercises
set description = 'Tumbado sobre la máquina, eleva las piernas mediante una extensión de cadera y vuelve de forma controlada.'
where name = 'Hiperextensión inversa' and description like 'Place your feet between the pads%';

update public.exercises
set description = 'De pie entre las poleas bajas, empuja los agarres desde los hombros hacia arriba y regresa de forma controlada.'
where name = 'Press de hombros en polea' and description like 'Move the cables to the bottom%';

update public.exercises
set description = 'Sentado algo más alto frente a la polea, lleva el agarre hacia el abdomen manteniendo estable el tronco.'
where name = 'Remo elevado en polea' and description like 'Get a platform of some sort%';

update public.exercises
set description = 'De pie junto a la polea, gira el antebrazo hacia fuera manteniendo el codo cerca del cuerpo.'
where name = 'Rotación externa de hombro en polea' and description like 'Adjust the cable to the same height%';
