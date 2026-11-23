-- Apply before deploying the application version that uses these columns and functions.
alter table public.manual_workout_drafts add column if not exists published_at timestamptz;
alter table public.workout_plans add column if not exists hidden_at timestamptz;

create or replace function public.save_manual_workout_draft(
  p_user_id uuid, p_draft_id uuid, p_name text, p_days jsonb
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
begin
  perform 1 from public.manual_workout_drafts
    where id = p_draft_id and user_id = p_user_id and published_at is null
    for update;
  if not found then return 'not_found'; end if;

  if p_name is null or length(trim(p_name)) not between 1 and 80
    or p_days is null or jsonb_typeof(p_days) <> 'array'
    or jsonb_array_length(p_days) not between 1 and 7 then
    raise exception 'Invalid workout draft';
  end if;

  update public.manual_workout_drafts
    set name = trim(p_name), updated_at = now()
    where id = p_draft_id and user_id = p_user_id;
  delete from public.manual_workout_draft_days where draft_id = p_draft_id;

  for v_day, v_day_order in
    select value, ordinality from jsonb_array_elements(p_days) with ordinality
  loop
    if length(trim(coalesce(v_day->>'name', ''))) not between 1 and 80
      or jsonb_typeof(v_day->'exercises') is distinct from 'array'
      or jsonb_array_length(v_day->'exercises') not between 1 and 12 then
      raise exception 'Invalid workout day';
    end if;
    insert into public.manual_workout_draft_days (draft_id, name, order_number)
      values (p_draft_id, trim(v_day->>'name'), v_day_order)
      returning id into v_day_id;
    insert into public.manual_workout_draft_exercises
      (draft_day_id, exercise_id, sets, repetitions, rest_seconds, order_number)
      select v_day_id, (item->>'exerciseId')::uuid, (item->>'sets')::smallint,
        trim(item->>'repetitions'), (item->>'restSeconds')::smallint, ordinal
      from jsonb_array_elements(v_day->'exercises') with ordinality as exercises(item, ordinal);
    if exists (
      select 1 from public.manual_workout_draft_exercises
      where draft_day_id = v_day_id and length(trim(repetitions)) not between 1 and 30
    ) then raise exception 'Invalid repetitions'; end if;
  end loop;
  return 'saved';
end;
$$;

create or replace function public.publish_manual_workout_draft(p_user_id uuid, p_draft_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_draft public.manual_workout_drafts%rowtype;
  v_profile jsonb;
  v_run_id uuid;
  v_plan_id uuid;
  v_version_id uuid;
  v_day record;
  v_day_id uuid;
begin
  perform 1 from public.users where id = p_user_id for update;
  if not found then return 'not_found'; end if;
  select * into v_draft from public.manual_workout_drafts
    where id = p_draft_id and user_id = p_user_id
    for update;
  if not found then return 'not_found'; end if;
  if v_draft.published_at is not null then return 'already_published'; end if;
  if not exists (select 1 from public.manual_workout_draft_days where draft_id = p_draft_id)
    or exists (
      select 1 from public.manual_workout_draft_days d
      where d.draft_id = p_draft_id and not exists (
        select 1 from public.manual_workout_draft_exercises e where e.draft_day_id = d.id
      )
    ) then return 'empty_day'; end if;

  select to_jsonb(p) into v_profile from public.profiles p where p.user_id = p_user_id;
  if v_profile is null then return 'missing_profile'; end if;
  insert into public.plan_generation_runs (user_id, run_type, status, input_snapshot, engine_version)
    values (p_user_id, 'manual_regeneration', 'pending', v_profile, 'manual-builder-v1')
    returning id into v_run_id;
  insert into public.workout_plans (user_id, name, description, source, active)
    values (p_user_id, v_draft.name, 'Rutina creada y personalizada por ti.', v_draft.source, false)
    returning id into v_plan_id;
  insert into public.workout_plan_versions (workout_plan_id, generation_run_id, version_number, profile_snapshot, reason)
    values (v_plan_id, v_run_id, 1, v_profile, 'goal_change')
    returning id into v_version_id;

  for v_day in select id, name, order_number from public.manual_workout_draft_days where draft_id = p_draft_id order by order_number loop
    insert into public.workout_days (workout_plan_version_id, name, order_number)
      values (v_version_id, v_day.name, v_day.order_number) returning id into v_day_id;
    insert into public.workout_exercises (workout_day_id, exercise_id, sets, repetitions, rest_seconds, order_number)
      select v_day_id, exercise_id, sets, repetitions, rest_seconds, order_number
      from public.manual_workout_draft_exercises where draft_day_id = v_day.id;
  end loop;

  update public.workout_plans set active = false, updated_at = now()
    where user_id = p_user_id and active = true;
  update public.workout_plans set active = true, updated_at = now() where id = v_plan_id;
  update public.manual_workout_drafts set published_at = now() where id = p_draft_id;
  update public.plan_generation_runs set status = 'completed', completed_at = now() where id = v_run_id;
  return 'published';
end;
$$;

revoke all on function public.save_manual_workout_draft(uuid, uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.publish_manual_workout_draft(uuid, uuid) from public, anon, authenticated;
grant execute on function public.save_manual_workout_draft(uuid, uuid, text, jsonb) to service_role;
grant execute on function public.publish_manual_workout_draft(uuid, uuid) to service_role;
