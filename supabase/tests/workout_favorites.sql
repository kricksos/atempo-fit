begin;
select plan(8);

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000201', 'favorite-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000202', 'favorite-b@example.invalid');
insert into public.profiles (user_id, name, sex, age, height_cm, current_weight_kg, primary_goal, experience, daily_activity, sleep_hours, sleep_quality, stress_level)
values ('00000000-0000-4000-8000-000000000201', 'Prueba', 'male', 30, 175, 75, 'Mantener peso', 'Nunca he entrenado', 'Ligera', 8, 'Buena', 'Bajo');
insert into public.exercises (id, name, description, category, difficulty)
values ('00000000-0000-4000-8000-000000000203', 'Ejercicio favorito de prueba', 'Prueba', 'test', 'beginner');
insert into public.manual_workout_drafts (id, user_id, name, source, is_favorite)
values ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000201', 'Rutina favorita', 'manual', true);
insert into public.manual_workout_draft_days (id, draft_id, name, order_number)
values ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000204', 'Día 1', 1);
insert into public.manual_workout_draft_exercises (draft_day_id, exercise_id, order_number, sets, repetitions, rest_seconds)
values ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000203', 1, 3, '8-12', 60);

select is(has_table_privilege('authenticated', 'public.favorite_exercises', 'insert'), false, 'Los clientes no pueden saltarse la validación del catálogo');
select is(has_table_privilege('authenticated', 'public.favorite_workout_templates', 'insert'), false, 'Los clientes no pueden insertar plantillas arbitrarias');
select is(has_function_privilege('authenticated', 'public.publish_manual_workout_draft(uuid,uuid)', 'execute'), false, 'Solo el servidor puede publicar');
select is(public.publish_manual_workout_draft('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000204'), 'not_found', 'No se publica el borrador de otra persona');
select is(public.publish_manual_workout_draft('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000204'), 'published', 'El borrador favorito se publica');
select is((select is_favorite from public.workout_plans where user_id = '00000000-0000-4000-8000-000000000201' and active), true, 'La rutina publicada conserva el favorito');
select is((select count(*) from public.workout_exercises e join public.workout_days d on d.id = e.workout_day_id join public.workout_plan_versions v on v.id = d.workout_plan_version_id join public.workout_plans p on p.id = v.workout_plan_id where p.user_id = '00000000-0000-4000-8000-000000000201'), 1::bigint, 'La publicación conserva los ejercicios');
select is(public.publish_manual_workout_draft('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000204'), 'already_published', 'No se publica dos veces');

select * from finish();
rollback;
