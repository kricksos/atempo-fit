alter table public.profiles
  add column training_continuity text,
  add column training_technique text,
  add constraint profiles_training_continuity_check check (
    training_continuity is null or training_continuity in (
      'Entreno fuerza de forma regular actualmente',
      'He entrenado de forma irregular o llevo tiempo sin entrenar'
    )
  ),
  add constraint profiles_training_technique_check check (
    training_technique is null or training_technique in (
      'Puedo ejecutar los movimientos básicos y ajustar las cargas con autonomía',
      'Necesito ayuda con la técnica o las cargas'
    )
  );
