import type { MainMovement } from "@/features/planning/movement-patterns";
import type { TemplateDay, TemplateExercise, WorkoutTemplate } from "@/lib/workout-templates";

const exercise = (name: string, sets = 3, repetitions = "8-12", restSeconds = 90): TemplateExercise =>
  ({ name, sets, repetitions, restSeconds });
const day = (name: string, exercises: TemplateExercise[], requiredMovements: MainMovement[], namedMuscles?: string[]): TemplateDay =>
  ({ name, exercises, requiredMovements, namedMuscles });

const pilotEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Basada en la estructura de Giannopoulos y colaboradores, A Pilot 24-Week ‘Bulk and Cut’ Dietary Protocol Combined with Resistance Training (Nutrients, 2025).",
  url: "https://doi.org/10.3390/nu17071265",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "El estudio no publicó una lista fija para cada sesión: la selección concreta de ejercicios y el descanso de 90 segundos son de Atempo Fit.",
    "Se usa únicamente la estructura de la primera fase: no se incluyen las fases posteriores, las cargas del ensayo ni su intervención alimentaria.",
    "En casa se usan flexiones, bisagra con mancuernas y press con banda en lugar de las variantes de gimnasio descritas como ejemplos.",
  ],
  guidance: [
    "Es un estudio piloto supervisado en hombres sin experiencia previa; no demuestra que esta selección concreta sea adecuada para todas las personas.",
    "Entrena en días no consecutivos. Escoge cargas que permitan mantener una técnica correcta y pide orientación profesional para progresar.",
  ],
};

const dowEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Inspirada en la estructura de Dow, Hernandez y Johnston, Eight weeks of resistance exercise improves mood state and intestinal permeability in healthy adults: A randomized controlled trial (Physiological Reports, 2025).",
  url: "https://doi.org/10.14814/phy2.70219",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "El artículo describe seis patrones, pero no publica una lista cerrada de ejercicios por sesión. La selección y el orden de esta propuesta son de Atempo Fit.",
    "Se usan dos series de 8-12 repeticiones por ejercicio y descansos de 90 segundos: el ensayo progresó de tres a cuatro series y de 12 a 6 repeticiones; no especifica aquí esos descansos.",
    "No se reproducen las cargas, la progresión ni el seguimiento por vídeo del ensayo. La propuesta no incluye trabajo directo específico de gemelos ni core.",
  ],
  guidance: [
    "El estudio incluyó 20 adultos sedentarios sanos, de ambos sexos, entre intervención y control; sus resultados no validan esta selección ni su adecuación a otras personas.",
    "Deja al menos un día completo de descanso entre sesiones. Aprende la técnica y ajusta cargas y progresión con ayuda profesional; empieza sin llegar al fallo.",
    "Son seis ejercicios en cada sesión, con trabajo repetido de empuje y tirón: la tolerancia y la recuperación deben valorarse individualmente.",
    "El tiempo es orientativo: el margen añadido puede no cubrir todos los calentamientos específicos, cambios de equipo o esperas.",
  ],
};

function dowDay(name: string): TemplateDay {
  return day(name, [
    exercise("Sentadilla goblet con mancuerna", 2),
    exercise("Bisagra de cadera con mancuernas hasta las rodillas", 2),
    exercise("Press de hombros en polea", 2),
    exercise("Press de pecho en polea", 2),
    exercise("Jalon al pecho", 2),
    exercise("Remo sentado en polea", 2),
  ], ["knee", "hip", "push", "pull"]);
}

const connellyEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Adaptación de Connelly, Gray, Rosaini y Ryde, Strength training intervention for hybrid workers: a randomised pilot feasibility trial (Scientific Reports, 2025).",
  url: "https://doi.org/10.1038/s41598-025-27567-9",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "Se eligen sentadilla sin carga y flexiones con rodillas apoyadas entre las variantes descritas; el peso muerto con banda se cambia por una bisagra con mancuernas hasta las rodillas.",
    "Se mantiene la fase inicial de dos series y 8-12 repeticiones, pero no se aplica automáticamente el aumento a tres series del ensayo. Los descansos se fijan en 60 segundos en lugar de los 0-20 segundos recomendados, ampliables a un minuto.",
    "La adaptación necesita mancuernas y banda; no reproduce el seguimiento semanal ni las instrucciones y progresión del estudio.",
  ],
  guidance: [
    "Fue un piloto de cuatro semanas en 50 trabajadores híbridos poco entrenados, mayoritariamente mujeres. No demuestra que esta adaptación sea adecuada para otras personas.",
    "Es una sesión corta de cuatro movimientos generales, no un programa completo para todos los objetivos; no incluye trabajo directo específico de hombros, brazos, gemelos ni core.",
    "Espacia las sesiones y consulta a un profesional para aprender la técnica y ajustar la carga y la progresión. El tiempo de la aplicación es estimado, no los 15 minutos indicados en el estudio.",
  ],
};

function connellyDay(name: string): TemplateDay {
  return day(name, [
    exercise("Sentadilla con peso corporal", 2, "8-12", 60),
    exercise("Flexiones con rodillas apoyadas", 2, "8-12", 60),
    exercise("Bisagra de cadera con mancuernas hasta las rodillas", 2, "8-12", 60),
    exercise("Remo sentado con banda elástica", 2, "8-12", 60),
  ], ["knee", "hip", "push", "pull"]);
}

const threeDayEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Adaptación del protocolo de Okut y colaboradores, The Effects of Omega-3 Supplementation Combined with Strength Training (Nutrients, 2025).",
  url: "https://doi.org/10.3390/nu17132088",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "Se concreta la selección de variantes y se cambia la dominada por jalón. Se emplean tres series por ejercicio dentro del rango de tres a cuatro del estudio.",
    "La aplicación no reproduce las cargas por porcentaje de repetición máxima, la progresión semanal, la supervisión ni la suplementación del ensayo.",
  ],
  guidance: [
    "El ensayo incluyó 30 hombres jóvenes sanos con al menos tres años de experiencia: esta adaptación no ha sido evaluada en otras poblaciones.",
    "Deja un día de descanso entre sesiones y ajusta la carga con ayuda profesional. El ensayo no incluye trabajo directo específico de core.",
  ],
};

const fourDayEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Adaptación de Johnsen y van den Tillaar, Effects of training frequency on muscular strength for trained men under volume matched conditions (PeerJ, 2021).",
  url: "https://doi.org/10.7717/peerj.10781",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "El peso muerto con piernas rígidas se realiza con mancuernas y se concretan las variantes de remo, zancada y ejercicios en máquina.",
    "La aplicación muestra 6-10 repeticiones en sentadilla y press en lugar de reproducir la periodización de 2-10 repeticiones y los porcentajes de carga del ensayo; los descansos son estimaciones propias.",
    "La propuesta no incluye trabajo directo de core, como en el protocolo original. Las cargas y la progresión deben ajustarse individualmente.",
  ],
  guidance: [
    "El ensayo incluyó 21 hombres entrenados, con al menos un año de experiencia y sin lesiones; los resultados no garantizan la adecuación individual.",
    "Las series principales son exigentes, especialmente en la versión torso/pierna. Organiza los descansos y consulta con un profesional antes de iniciar el programa.",
    "La estimación de tiempo no incluye necesariamente series específicas de calentamiento ni esperas de material.",
  ],
};

const araziEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Adaptación de Arazi, Asadi, Gentil, Ramírez-Campillo, Jahangiri, Ghorbani, Hackney y Zouhal, Effects of different resistance training frequencies on body composition and muscular performance adaptations in men (PeerJ, 2021).",
  url: "https://doi.org/10.7717/peerj.10537",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "Se concretan las variantes de remo y curl; el press militar se realiza con mancuernas y la extensión de tríceps tumbado se sustituye por una extensión con mancuerna.",
    "Se muestra un rango de 8-10 repeticiones por serie en vez de las secuencias 10-10-8-8 o 10-8 del estudio. Los descansos entre series se fijan en 90 segundos.",
    "No se reproducen las pruebas de fuerza, las cargas del 70-80% de 1RM, la progresión ni la supervisión del ensayo. La propuesta no incluye trabajo directo de gemelos ni core.",
  ],
  guidance: [
    "El ensayo incluyó hombres jóvenes sin lesiones, que entrenaban regularmente desde hacía al menos dos años. Esta adaptación no se ha validado individualmente ni en otras poblaciones.",
    "La clasificación avanzada es una decisión orientativa por la experiencia y la exigencia de la propuesta, no una certificación de nivel. Consulta a un profesional para ajustar técnica, cargas y recuperación.",
    "En cuatro días se alternan A y B dos veces; respeta la recuperación y no añadas trabajo intenso sin revisarlo. El estudio preveía 2-3 minutos entre ejercicios y supervisión.",
    "La duración es aproximada y puede no incluir todos los descansos entre ejercicios, calentamientos específicos, trabajo unilateral, esperas o cardio.",
  ],
};

function araziDay(name: string, version: "A" | "B", sets: number): TemplateDay {
  return version === "A"
    ? day(name, [
      exercise("Prensa de piernas", sets, "8-10"), exercise("Curl femoral tumbado en máquina", sets, "8-10"),
      exercise("Jalon al pecho", sets, "8-10"), exercise("Press banca con barra", sets, "8-10"),
      exercise("Elevaciones laterales con mancuernas", sets, "8-10"), exercise("Curl de bíceps en máquina", sets, "8-10"),
      exercise("Extensión de tríceps en máquina", sets, "8-10"),
    ], ["knee", "push", "pull"])
    : day(name, [
      exercise("Extensión de cuádriceps en máquina", sets, "8-10"), exercise("Peso muerto con barra", sets, "8-10"),
      exercise("Remo sentado en polea", sets, "8-10"), exercise("Press inclinado", sets, "8-10"),
      exercise("Press de hombros con mancuernas", sets, "8-10"), exercise("Curl de bíceps con mancuernas", sets, "8-10"),
      exercise("Extensión de tríceps con mancuerna", sets, "8-10"),
    ], ["hip", "push", "pull"]);
}

export const researchWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: "estudio-connelly-casa-principiante-3",
    name: "Cuerpo completo · 3 días · sesión corta",
    description: "Cuatro movimientos generales con mancuernas y banda, pensados como punto de partida.",
    level: "beginner", place: "Casa", variant: "study", minutes: 0,
    equipment: "Mancuernas y banda elástica", evidence: connellyEvidence, estimatedExtraMinutes: 5,
    days: [connellyDay("Cuerpo completo A"), connellyDay("Cuerpo completo B"), connellyDay("Cuerpo completo C")],
  },
  {
    id: "estudio-dow-gimnasio-principiante-3",
    name: "Cuerpo completo · 3 días · seis patrones",
    description: "Tres sesiones iguales con sentadilla, bisagra y empujes y tirones verticales y horizontales.",
    level: "beginner", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Mancuernas y poleas", evidence: dowEvidence, estimatedExtraMinutes: 10,
    days: [dowDay("Cuerpo completo A"), dowDay("Cuerpo completo B"), dowDay("Cuerpo completo C")],
  },
  {
    id: "estudio-arazi-gimnasio-avanzado-2",
    name: "Cuerpo completo · 2 días · sesiones largas",
    description: "Dos sesiones completas de siete ejercicios y cuatro series por ejercicio para personas entrenadas.",
    level: "advanced", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Barra, banco, mancuernas, máquinas y poleas", evidence: araziEvidence, estimatedExtraMinutes: 20,
    days: [araziDay("Cuerpo completo A", "A", 4), araziDay("Cuerpo completo B", "B", 4)],
  },
  {
    id: "estudio-arazi-gimnasio-avanzado-4",
    name: "Cuerpo completo · 4 días · volumen distribuido",
    description: "Dos sesiones A y dos B, con dos series por ejercicio y el volumen semanal repartido.",
    level: "advanced", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Barra, banco, mancuernas, máquinas y poleas", evidence: araziEvidence, estimatedExtraMinutes: 20,
    automaticEligible: true,
    days: [
      araziDay("Cuerpo completo A", "A", 2), araziDay("Cuerpo completo B", "B", 2),
      araziDay("Cuerpo completo A", "A", 2), araziDay("Cuerpo completo B", "B", 2),
    ],
  },
  {
    id: "estudio-giannopoulos-casa-principiante-2",
    name: "Cuerpo completo · 2 días · material doméstico",
    description: "Dos sesiones alternas con mancuernas, banda y ejercicios de cuerpo completo.",
    level: "beginner", place: "Casa", variant: "study", minutes: 0,
    equipment: "Mancuernas, banco, banda y escalón", evidence: pilotEvidence,
    days: [
      day("Cuerpo completo A", [
        exercise("Sentadilla goblet con mancuerna"), exercise("Flexiones con rodillas apoyadas"),
        exercise("Remo a un brazo con mancuerna"), exercise("Extensión de tríceps con mancuerna"),
        exercise("Elevación de gemelos en escalón"), exercise("Plancha abdominal", 3, "20-30 segundos"),
      ], ["knee", "push", "pull"]),
      day("Cuerpo completo B", [
        exercise("Bisagra de cadera con mancuernas hasta las rodillas"), exercise("Press de hombros con banda elástica"),
        exercise("Remo a un brazo con mancuerna"), exercise("Curl de bíceps con mancuernas"),
        exercise("Elevaciones laterales con mancuernas"), exercise("Plancha abdominal", 3, "20-30 segundos"),
      ], ["hip", "pull"]),
    ],
  },
  {
    id: "estudio-giannopoulos-gimnasio-principiante-2",
    name: "Cuerpo completo · 2 días · movimientos alternos",
    description: "Dos sesiones alternas con ejercicios principales de pierna, empuje y tirón.",
    level: "beginner", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Mancuernas, máquinas, poleas y pesa rusa", evidence: pilotEvidence,
    days: [
      day("Cuerpo completo A", [
        exercise("Sentadilla goblet con mancuerna"), exercise("Press banca en máquina"),
        exercise("Remo sentado en polea"), exercise("Extensión de tríceps en polea"),
        exercise("Elevación de gemelos de pie en máquina"), exercise("Plancha abdominal", 3, "20-30 segundos"),
      ], ["knee", "push", "pull"]),
      day("Cuerpo completo B", [
        exercise("Peso muerto rumano con pesa rusa"), exercise("Press de hombros en polea"),
        exercise("Jalon al pecho"), exercise("Curl de bíceps con mancuernas"),
        exercise("Elevaciones laterales con mancuernas"), exercise("Plancha abdominal", 3, "20-30 segundos"),
      ], ["hip", "pull"]),
    ],
  },
  {
    id: "estudio-okut-gimnasio-intermedio-3",
    name: "Torso, pierna y cuerpo completo · 3 días",
    description: "Una sesión de torso, una de pierna y una de cuerpo completo para personas con experiencia.",
    level: "intermediate", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Barra, banco, mancuernas, máquinas y poleas", evidence: threeDayEvidence,
    days: [
      day("Torso", [
        exercise("Press banca con barra", 3, "8-12", 120), exercise("Press de hombros con mancuernas", 3, "8-12", 120),
        exercise("Remo con barra", 3, "8-12", 120), exercise("Jalon al pecho", 3, "8-12", 120),
        exercise("Curl de bíceps con mancuernas", 3, "8-12", 60), exercise("Extensión de tríceps en polea", 3, "8-12", 60),
      ], ["push", "pull"], ["pectorals", "deltoids", "lats", "biceps", "triceps"]),
      day("Pierna", [
        exercise("Sentadilla con barra", 3, "8-12", 120), exercise("Peso muerto con barra", 3, "8-12", 120),
        exercise("Prensa de piernas", 3, "8-12", 120), exercise("Peso muerto rumano", 3, "8-12", 120),
        exercise("Elevación de gemelos de pie en máquina", 3, "8-12", 60),
      ], ["knee", "hip"], ["quadriceps", "hamstrings", "calves"]),
      day("Cuerpo completo", [
        exercise("Sentadilla con barra", 3, "8-12", 120), exercise("Press banca con barra", 3, "8-12", 120),
        exercise("Peso muerto con barra", 3, "8-12", 120), exercise("Jalon al pecho", 3, "8-12", 120),
        exercise("Press de hombros con mancuernas", 3, "8-12", 120),
      ], ["knee", "hip", "push", "pull"]),
    ],
  },
  {
    id: "estudio-johnsen-gimnasio-intermedio-4-torso-pierna",
    name: "Torso y pierna · 4 días · fuerza",
    description: "Distribución alterna de torso y pierna con mayor volumen en los movimientos principales.",
    level: "intermediate", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Barra, banco, mancuernas, máquinas y poleas", evidence: fourDayEvidence,
    days: [
      day("Torso A", [
        exercise("Press banca con barra", 6, "6-10", 120), exercise("Remo con barra"),
        exercise("Remo a un brazo con mancuerna"), exercise("Press de hombros con mancuernas"),
        exercise("Curl de bíceps con mancuernas"), exercise("Face pull en polea"),
      ], ["push", "pull"], ["pectorals", "lats", "deltoids", "biceps"]),
      day("Pierna A", [
        exercise("Sentadilla con barra", 6, "6-10", 120), exercise("Peso muerto con piernas rígidas y mancuernas"),
        exercise("Zancadas con mancuernas"), exercise("Extensión de cuádriceps en máquina"),
      ], ["knee", "hip"], ["quadriceps", "hamstrings"]),
      day("Torso B", [
        exercise("Press banca con barra", 5, "6-10", 120), exercise("Jalon al pecho"),
        exercise("Remo sentado en polea"), exercise("Elevaciones laterales con mancuernas"),
        exercise("Extensión de tríceps en polea"), exercise("Face pull en polea"),
      ], ["push", "pull"], ["pectorals", "lats", "deltoids", "triceps"]),
      day("Pierna B", [
        exercise("Sentadilla con barra", 5, "6-10", 120), exercise("Prensa de piernas"),
        exercise("Curl femoral tumbado en máquina"), exercise("Elevación de gemelos de pie en máquina"),
      ], ["knee"], ["quadriceps", "hamstrings", "calves"]),
    ],
  },
  {
    id: "estudio-johnsen-gimnasio-intermedio-4-cuerpo-completo",
    name: "Cuerpo completo · 4 días · fuerza",
    description: "Cuatro sesiones que distribuyen semanalmente el trabajo de sentadilla y press.",
    level: "intermediate", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Barra, banco, mancuernas, máquinas y poleas", evidence: fourDayEvidence,
    days: [
      day("Cuerpo completo A", [
        exercise("Sentadilla con barra", 3, "6-10", 120), exercise("Press banca con barra", 3, "6-10", 120),
        exercise("Remo con barra"), exercise("Curl femoral tumbado en máquina"),
        exercise("Curl de bíceps con mancuernas"), exercise("Face pull en polea"),
      ], ["knee", "push", "pull"]),
      day("Cuerpo completo B", [
        exercise("Press banca con barra", 3, "6-10", 120), exercise("Sentadilla con barra", 3, "6-10", 120),
        exercise("Remo sentado en polea"), exercise("Extensión de cuádriceps en máquina"),
        exercise("Press de hombros con mancuernas"), exercise("Elevación de gemelos de pie en máquina"),
      ], ["knee", "push", "pull"]),
      day("Cuerpo completo C", [
        exercise("Sentadilla con barra", 3, "6-10", 120), exercise("Press banca con barra", 2, "6-10", 120),
        exercise("Remo a un brazo con mancuerna"), exercise("Prensa de piernas"),
        exercise("Extensión de tríceps en polea"), exercise("Face pull en polea"),
      ], ["knee", "push", "pull"]),
      day("Cuerpo completo D", [
        exercise("Press banca con barra", 3, "6-10", 120), exercise("Sentadilla con barra", 2, "6-10", 120),
        exercise("Jalon al pecho"), exercise("Peso muerto con piernas rígidas y mancuernas"),
        exercise("Zancadas con mancuernas"), exercise("Elevaciones laterales con mancuernas"),
      ], ["knee", "hip", "push", "pull"]),
    ],
  },
];
