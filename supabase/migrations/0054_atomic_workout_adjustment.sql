create or replace function public.publish_adjusted_workout(
  p_user_id uuid, p_plan_id uuid, p_expected_version_id uuid,
  p_run_id uuid, p_profile jsonb, p_days jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_day jsonb;
  v_day_order bigint;
  v_day_id uuid;
  v_version_id uuid;
  v_version_number integer;
begin
  perform 1 from public.users where id = p_user_id for update;
  if not found then return 'not_found'; end if;
  perform 1 from public.workout_plans
    where id = p_plan_id and user_id = p_user_id and active = true for update;
  if not found then return 'not_found'; end if;
  perform 1 from public.workout_plan_versions
    where id = p_expected_version_id and workout_plan_id = p_plan_id and active = true for update;
  if not found then return 'version_changed'; end if;
  if not exists (select 1 from public.plan_generation_runs where id = p_run_id and user_id = p_user_id) then
    return 'not_found';
  end if;
  if p_profile is null or jsonb_typeof(p_profile) <> 'object'
    or p_days is null or jsonb_typeof(p_days) <> 'array'
    or jsonb_array_length(p_days) not between 1 and 7 then
    raise exception 'Invalid adjusted workout';
  end if;

  select coalesce(max(version_number), 0) + 1 into v_version_number
    from public.workout_plan_versions where workout_plan_id = p_plan_id;
  insert into public.workout_plan_versions
    (workout_plan_id, generation_run_id, version_number, profile_snapshot, reason, active)
    values (p_plan_id, p_run_id, v_version_number, p_profile, 'progress_adjustment', false)
    returning id into v_version_id;
  for v_day, v_day_order in select value, ordinality from jsonb_array_elements(p_days) with ordinality loop
    if length(trim(coalesce(v_day->>'name', ''))) not between 1 and 80
      or jsonb_typeof(v_day->'exercises') is distinct from 'array'
      or jsonb_array_length(v_day->'exercises') not between 1 and 12 then
      raise exception 'Invalid adjusted workout day';
    end if;
    insert into public.workout_days (workout_plan_version_id, name, order_number)
      values (v_version_id, trim(v_day->>'name'), v_day_order) returning id into v_day_id;
    insert into public.workout_exercises
      (workout_day_id, exercise_id, sets, repetitions, rest_seconds, order_number, progression_level)
      select v_day_id, (item->>'exercise_id')::uuid, (item->>'sets')::smallint,
        trim(item->>'repetitions'), (item->>'rest_seconds')::smallint,
        ordinal, (item->>'progression_level')::smallint
      from jsonb_array_elements(v_day->'exercises') with ordinality as exercises(item, ordinal);
    if exists (select 1 from public.workout_exercises
      where workout_day_id = v_day_id and length(trim(repetitions)) not between 1 and 30) then
      raise exception 'Invalid adjusted workout repetitions';
    end if;
  end loop;
  update public.workout_plan_versions set active = false where id = p_expected_version_id;
  update public.workout_plan_versions set active = true where id = v_version_id;
  return 'published';
end;
$$;

revoke all on function public.publish_adjusted_workout(uuid, uuid, uuid, uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.publish_adjusted_workout(uuid, uuid, uuid, uuid, jsonb, jsonb) to service_role;
