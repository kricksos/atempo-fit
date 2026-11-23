begin;

select plan(8);

insert into auth.users (id, email)
values ('00000000-0000-4000-8000-000000000101', 'workout-adjustment-test@example.invalid');
insert into public.exercises (id, name, description, category, difficulty)
values ('00000000-0000-4000-8000-000000000102', 'Ejercicio de prueba transaccional', 'Prueba', 'test', 'beginner');
insert into public.plan_generation_runs (id, user_id, run_type, engine_version)
values ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000101', 'progress_adjustment', 'test');
insert into public.workout_plans (id, user_id, name)
values ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000101', 'Rutina de prueba');
insert into public.workout_plan_versions (id, workout_plan_id, generation_run_id, version_number, reason)
values ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000103', 1, 'onboarding');

select has_column('public', 'exercise_logs', 'duration_seconds', 'Las series temporizadas tienen un campo propio');
select is(has_function_privilege('authenticated', 'public.publish_adjusted_workout(uuid,uuid,uuid,uuid,jsonb,jsonb)', 'execute'), false, 'La publicación no es ejecutable por clientes');
select is(public.publish_adjusted_workout(
  '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000103', '{}',
  '[{"name":"Día uno","exercises":[{"exercise_id":"00000000-0000-4000-8000-000000000102","sets":3,"repetitions":"8-12","rest_seconds":60,"progression_level":1}]}]'
), 'published', 'El ajuste válido se publica');
select is((select count(*) from public.workout_plan_versions where workout_plan_id = '00000000-0000-4000-8000-000000000104' and active), 1::bigint, 'Solo queda una versión activa');
select is((select e.sets from public.workout_exercises e join public.workout_days d on d.id = e.workout_day_id join public.workout_plan_versions v on v.id = d.workout_plan_version_id where v.workout_plan_id = '00000000-0000-4000-8000-000000000104' and v.active), 3::smallint, 'Se conservan los ejercicios y series');
select is(public.publish_adjusted_workout(
  '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000103', '{}', '[]'
), 'version_changed', 'Una versión desactualizada no se activa');
select throws_ok($test$
  select public.publish_adjusted_workout(
    '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000104',
    (select id from public.workout_plan_versions where workout_plan_id = '00000000-0000-4000-8000-000000000104' and active),
    '00000000-0000-4000-8000-000000000103', '{}',
    '[{"name":"Primero","exercises":[{"exercise_id":"00000000-0000-4000-8000-000000000102","sets":3,"repetitions":"8-12","rest_seconds":60,"progression_level":1}]},{"name":"Inválido","exercises":[]}]'
  )
$test$, 'P0001', 'Invalid adjusted workout day', 'Un fallo intermedio revierte la publicación');
select is((select count(*) from public.workout_plan_versions where workout_plan_id = '00000000-0000-4000-8000-000000000104'), 2::bigint, 'El fallo no deja una versión parcial');

select * from finish();
rollback;
