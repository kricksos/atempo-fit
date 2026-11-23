export type MainMovement = "knee" | "hip" | "push" | "pull";

// Only movements reviewed as suitable for these broad slots are included.
const names: Record<MainMovement, readonly string[]> = {
  knee: [
    "Sentadilla goblet", "Sentadilla", "Sentadilla con barra", "Sentadilla con peso corporal",
    "Sentadilla goblet con mancuerna", "Sentadilla con mancuernas", "Sentadilla frontal con barra",
    "Sentadilla en máquina Smith", "Sentadilla hack en máquina", "Sentadilla búlgara con mancuernas",
    "Sentadilla con banda elástica", "Sentadilla goblet con pesa rusa", "Sentadilla cosaca", "Sentadilla a banco",
    "Prensa de piernas", "Subida al cajón con mancuernas", "Subida al cajón con barra", "Subida lateral al escalón",
    "Zancadas con barra", "Zancadas con mancuernas", "Zancada cruzada hacia atrás", "Zancada posterior con mancuerna",
    "Zancada atrás sin carga", "Zancada lateral sin carga", "Zancada con pesa rusa al pecho",
    "Sentadilla dividida con mancuernas",
  ],
  hip: [
    "Peso muerto rumano", "Peso muerto rumano clásico con barra", "Peso muerto con barra", "Peso muerto sumo con barra",
    "Peso muerto con piernas rígidas y mancuernas", "Peso muerto a una pierna con mancuerna",
    "Peso muerto con banda elástica", "Peso muerto con pesa rusa", "Peso muerto rumano con pesa rusa",
    "Peso muerto sumo con pesa rusa", "Buenos días", "Buenos días con barra",
    "Bisagra de cadera con mancuernas hasta las rodillas", "Hip thrust", "Empuje de cadera con barra",
    "Puente de glúteos con barra", "Puente de glúteos a una pierna", "Puente de glúteos con peso corporal",
    "Marcha en puente de glúteos",
  ],
  push: [
    "Press banca", "Press banca con mancuernas", "Press inclinado", "Press banca con barra",
    "Press banca declinado con mancuernas", "Press banca en máquina Smith", "Press banca en máquina",
    "Press banca inclinado en máquina Smith", "Press de pecho en polea", "Flexiones", "Flexiones de pecho",
    "Flexiones inclinadas", "Flexiones con pies elevados", "Flexiones con manos abiertas",
    "Flexiones con rodillas apoyadas", "Flexiones en pared", "Flexiones con manos juntas", "Fondos para pecho",
  ],
  pull: [
    "Jalon al pecho", "Jalón al pecho", "Jalón al pecho con agarre cerrado", "Jalón frontal al pecho con agarre cerrado", "Dominadas", "Dominada supina",
    "Remo con mancuerna", "Remo con barra", "Remo sentado en polea", "Remo inclinado con barra",
    "Remo con barra inclinado con agarre supino", "Remo a un brazo con mancuerna", "Remo invertido con peso corporal",
    "Remo con mancuernas en banco inclinado", "Remo en polea a un brazo de pie", "Remo sentado con banda elástica",
    "Remo inclinado con mochila", "Remo con pesa rusa apoyado en banco",
  ],
};

const byName = new Map(Object.entries(names).flatMap(([movement, exercises]) =>
  exercises.map((name) => [name, movement as MainMovement] as const)));

export function mainMovement(name: string): MainMovement | null {
  return byName.get(name) ?? null;
}

export function isTimedExercise(name: string) {
  return ["Plancha", "Plancha abdominal", "Plancha lateral"].includes(name);
}

export function isTimedPrescription(name: string, repetitions: string) {
  return isTimedExercise(name) || /\b(?:segundos?|segs?|seconds?)\b/i.test(repetitions);
}

export function displayPrescription(name: string, repetitions: string) {
  return isTimedExercise(name) && !isTimedPrescription("", repetitions) ? "20-30 segundos" : repetitions;
}
