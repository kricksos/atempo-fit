-- Align Free Exercise DB muscle labels with Momentum's internal filters.
update public.exercises
set primary_muscle = case lower(primary_muscle)
  when 'chest' then 'pectorals'
  when 'pectorals' then 'pectorals'
  when 'shoulders' then 'deltoids'
  when 'deltoids' then 'deltoids'
  when 'quads' then 'quadriceps'
  when 'quadriceps' then 'quadriceps'
  when 'abs' then 'core'
  when 'abdominals' then 'core'
  when 'lower back' then 'lower_back'
  when 'middle back' then 'lats'
  else primary_muscle
end
where media_source = 'free-exercise-db';

update public.exercises
set muscle_groups = (
  select coalesce(jsonb_agg(case lower(value)
    when 'chest' then '"pectorals"'::jsonb
    when 'pectorals' then '"pectorals"'::jsonb
    when 'shoulders' then '"deltoids"'::jsonb
    when 'deltoids' then '"deltoids"'::jsonb
    when 'quads' then '"quadriceps"'::jsonb
    when 'quadriceps' then '"quadriceps"'::jsonb
    when 'abs' then '"core"'::jsonb
    when 'abdominals' then '"core"'::jsonb
    when 'lower back' then '"lower_back"'::jsonb
    when 'middle back' then '"lats"'::jsonb
    else to_jsonb(value)
  end), '[]'::jsonb)
  from jsonb_array_elements_text(muscle_groups)
)
where media_source = 'free-exercise-db';