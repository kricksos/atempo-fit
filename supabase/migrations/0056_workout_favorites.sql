alter table public.manual_workout_drafts add column is_favorite boolean not null default false;
alter table public.workout_plans add column is_favorite boolean not null default false;

create table public.favorite_exercises (
  user_id uuid not null references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  primary key (user_id, exercise_id)
);

create table public.favorite_workout_templates (
  user_id uuid not null references public.users(id) on delete cascade,
  template_id text not null check (length(template_id) between 1 and 120),
  primary key (user_id, template_id)
);

alter table public.favorite_exercises enable row level security;
alter table public.favorite_workout_templates enable row level security;
revoke all on public.favorite_exercises, public.favorite_workout_templates from public, anon, authenticated;
grant all privileges on public.favorite_exercises, public.favorite_workout_templates to service_role;

create policy "Users can manage their favorite exercises" on public.favorite_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their favorite workout templates" on public.favorite_workout_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.publish_manual_workout_draft(p_user_id uuid, p_draft_id uuid)
returns text
language plpgsql security invoker set search_path = '' as $$
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
    where id = p_draft_id and user_id = p_user_id for update;
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
  insert into public.workout_plans (user_id, name, description, source, active, is_favorite)
    values (p_user_id, v_draft.name, 'Rutina creada y personalizada por ti.', v_draft.source, false, v_draft.is_favorite)
    returning id into v_plan_id;
  insert into public.workout_plan_versions (workout_plan_id, generation_run_id, version_number, profile_snapshot, reason)
    values (v_plan_id, v_run_id, 1, v_profile, 'goal_change') returning id into v_version_id;

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

revoke all on function public.publish_manual_workout_draft(uuid, uuid) from public, anon, authenticated;
grant execute on function public.publish_manual_workout_draft(uuid, uuid) to service_role;
