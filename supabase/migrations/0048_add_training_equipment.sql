-- NULL means the user has not selected equipment; an empty array means no equipment.
alter table public.profiles
  add column if not exists training_equipment jsonb
  check (training_equipment is null or jsonb_typeof(training_equipment) = 'array');
