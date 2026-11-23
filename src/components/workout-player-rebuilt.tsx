"use client";

import { NavigationLink } from "@/components/navigation-control";
import { ExtendedExerciseImage } from "@/components/extended-exercise-image";
import { WorkoutIntro } from "@/components/workout-intro";
import { OrbitCompletion, OrbitSession } from "@/components/workout-orbit-session";
import { displayPrescription, isTimedPrescription } from "@/features/planning/movement-patterns";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";

export type WorkoutExercise = { id: string; name: string; sets: number; repetitions: string; restSeconds: number; media: [string, string] | null; illustration: boolean };
export type PreviousLog = { exerciseId: string; setNumber: number; weightKg: number; repetitions: number; durationSeconds: number | null };
export type SetLog = { weightKg: number; repetitions: number; durationSeconds: number | null };
type LogPayload = SetLog & { exerciseId: string; setNumber: number };
export type WorkoutSessionRequest =
  | { action: "start"; workoutDayId: string }
  | { action: "save"; sessionId: string; logs: LogPayload[] }
  | { action: "complete"; sessionId: string; durationMinutes: number; logs: LogPayload[] };
type WorkoutPlayerProps = { workoutDayId: string; workoutName: string; exercises: WorkoutExercise[]; lastPerformance: PreviousLog[] } & (
  | { mode?: "real" }
  | { mode: "preview"; requestSession: (request: WorkoutSessionRequest) => Promise<Response> }
);

function postWorkoutSession(request: WorkoutSessionRequest) {
  return fetch("/api/workouts/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
}

function initialRepetitions(value: string, setIndex: number, totalSets: number) {
  const values = value.match(/\d+/g)?.map(Number) ?? [8];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (totalSets <= 1 || minimum === maximum) return maximum;
  return Math.round(maximum - (setIndex * (maximum - minimum)) / (totalSets - 1));
}

function firstExerciseMessage(exercise: WorkoutExercise, preview: boolean) {
  if (preview) return "Muestra con datos ficticios: ningún registro se guarda.";
  return isTimedPrescription(exercise.name, exercise.repetitions)
    ? "Primera vez con este ejercicio: puedes indicar los segundos realizados en cada serie."
    : "Primera vez con este ejercicio: el peso que registres quedará como referencia para tus próximos entrenamientos.";
}

function ExerciseMotion({ exercise, heightClass = "h-72" }: { exercise: WorkoutExercise; heightClass?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  return <ExerciseMotionContent key={String(reducedMotion)} exercise={exercise} heightClass={heightClass} reducedMotion={reducedMotion} />;
}

function ExerciseMotionContent({ exercise, heightClass, reducedMotion }: { exercise: WorkoutExercise; heightClass: string; reducedMotion: boolean }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const markLoaded = useCallback((src: string) => {
    setLoadedImages((current) => current.includes(src) ? current : [...current, src]);
  }, []);
  if (!exercise.media) {
    return <div className={`grid ${heightClass} place-items-center bg-[#18313c] px-6 text-center text-sm font-semibold text-[#c5dddd]`}>Demostración no disponible para este ejercicio.</div>;
  }
  if (failedImage === exercise.media[0]) {
    return <div className={`grid ${heightClass} place-items-center bg-[#18313c] px-6 text-center text-sm font-semibold text-[#c5dddd]`}>No se ha podido cargar la imagen de este ejercicio.</div>;
  }
  const hasSecondFrame = !reducedMotion && exercise.media[0] !== exercise.media[1] && failedImage !== exercise.media[1];
  const animated = hasSecondFrame && exercise.media.every((src) => loadedImages.includes(src));

  return (
    <>
    <div className={`relative ${heightClass} overflow-hidden ${exercise.illustration ? "bg-[#090a0d]" : "bg-[#25352e]"}`}>
      <motion.div
        className="absolute inset-0"
        animate={animated ? { opacity: [1, 1, 0, 0, 1] } : { opacity: 1 }}
        transition={animated ? { duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.36, 0.5, 0.86, 1] } : undefined}
      ><ExtendedExerciseImage key={exercise.media[0]} src={exercise.media[0]} alt={`${exercise.name}, posición inicial`} onLoad={markLoaded} onError={setFailedImage} /></motion.div>
      {hasSecondFrame && <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={animated ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={animated ? { duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.36, 0.5, 0.86, 1] } : undefined}
      ><ExtendedExerciseImage key={exercise.media[1]} src={exercise.media[1]} alt={`${exercise.name}, posición final`} onLoad={markLoaded} onError={setFailedImage} /></motion.div>}
    </div>
    <p className="px-4 pt-3 text-xs font-semibold text-[#d8e0d9]">{failedImage === exercise.media[1] && exercise.media[0] !== exercise.media[1] ? "Movimiento no disponible. " : ""}{exercise.illustration ? "Ilustración orientativa con IA; no es una guía técnica" : "Demostración del movimiento"}</p>
    </>
  );
}

export function WorkoutPlayerRebuilt(props: WorkoutPlayerProps) {
  const { workoutDayId, workoutName, exercises, lastPerformance } = props;
  const preview = props.mode === "preview";
  const requestSession = props.mode === "preview" ? props.requestSession : postWorkoutSession;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [logs, setLogs] = useState<Record<string, SetLog[]>>(() => Object.fromEntries(exercises.map((exercise) => [exercise.id, Array.from({ length: exercise.sets }, (_, index) => {
    const previous = lastPerformance.find((log) => log.exerciseId === exercise.id && log.setNumber === index + 1);
    const timed = isTimedPrescription(exercise.name, exercise.repetitions);
    return { weightKg: timed ? 0 : previous?.weightKg ?? 0, repetitions: timed ? 0 : previous?.repetitions ?? initialRepetitions(exercise.repetitions, index, exercise.sets), durationSeconds: null };
  })])));
  const [isBusy, setIsBusy] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(() => lastPerformance.some((log) => log.exerciseId === exercises[0]?.id) ? null : firstExerciseMessage(exercises[0], preview));
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completedDuration, setCompletedDuration] = useState<number | null>(null);
  const [recordExerciseIds, setRecordExerciseIds] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const activeExercise = exercises[activeIndex];
  const timed = isTimedPrescription(activeExercise.name, activeExercise.repetitions);
  const prescription = displayPrescription(activeExercise.name, activeExercise.repetitions);
  const previousExerciseLogs = lastPerformance.filter((log) => log.exerciseId === activeExercise.id && (!timed || log.durationSeconds !== null));

  async function startWorkout() {
    setIsBusy(true);
    setError(null);
    try {
      const response = await requestSession({ action: "start", workoutDayId });
      const result = await response.json();
      if (!response.ok) setError(typeof result.error === "string" ? result.error : "No hemos podido iniciar la sesión. Inténtalo de nuevo.");
      else { setSessionId(result.sessionId); setStartedAt(Date.now()); }
    } catch (caught) {
      console.error("No se pudo iniciar la sesión", caught);
      setError("No hemos podido iniciar la sesión. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setIsBusy(false);
    }
  }

  function updateSet<K extends keyof SetLog>(setIndex: number, field: K, value: SetLog[K]) {
    setLogs((current) => ({ ...current, [activeExercise.id]: current[activeExercise.id].map((set, index) => index === setIndex ? { ...set, [field]: value } : set) }));
  }

  function payloadFor(exerciseId: string) {
    return logs[exerciseId].map((set, index) => ({ exerciseId, setNumber: index + 1, weightKg: set.weightKg, repetitions: set.repetitions, durationSeconds: set.durationSeconds }));
  }

  async function saveExercise() {
    if (!sessionId) return true;
    if (logs[activeExercise.id].some((set) => set.durationSeconds !== null && (!Number.isInteger(set.durationSeconds) || set.durationSeconds < 1 || set.durationSeconds > 3600))) {
      setError("Los segundos indicados deben ser un número entero entre 1 y 3600.");
      return false;
    }
    setIsBusy(true);
    setError(null);
    setSavedMessage(null);
    try {
      const response = await requestSession({ action: "save", sessionId, logs: payloadFor(activeExercise.id) });
      if (!response.ok) { setError("No hemos podido guardar este ejercicio. Inténtalo de nuevo."); return false; }
      setSavedMessage(preview ? "Registro de ejemplo; no se guarda." : "Ejercicio guardado");
      return true;
    } catch (caught) {
      console.error("No se pudo guardar el ejercicio", caught);
      setError("No hemos podido guardar este ejercicio. Comprueba tu conexión e inténtalo de nuevo.");
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function nextExercise() {
    if (await saveExercise()) {
      setActiveIndex((index) => {
        const nextIndex = Math.min(index + 1, exercises.length - 1);
        setSavedMessage(lastPerformance.some((log) => log.exerciseId === exercises[nextIndex]?.id) ? null : firstExerciseMessage(exercises[nextIndex], preview));
        return nextIndex;
      });
    }
  }

  async function completeWorkout() {
    if (!sessionId || !startedAt) return;
    if (Object.values(logs).some((sets) => sets.some((set) => set.durationSeconds !== null && (!Number.isInteger(set.durationSeconds) || set.durationSeconds < 1 || set.durationSeconds > 3600)))) {
      setError("Los segundos indicados deben ser un número entero entre 1 y 3600.");
      return;
    }
    setIsBusy(true);
    setError(null);
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    try {
      const response = await requestSession({ action: "complete", sessionId, durationMinutes, logs: exercises.flatMap((exercise) => payloadFor(exercise.id)) });
      if (!response.ok) setError("No hemos podido confirmar que la sesión se haya guardado. Comprueba tu entrenamiento antes de repetir.");
      else {
        const result = await response.json() as { recordExerciseIds?: string[]; streak?: number };
        setRecordExerciseIds(result.recordExerciseIds ?? []);
        setCurrentStreak(result.streak ?? 0);
        setCompletedDuration(durationMinutes);
        setCompleted(true);
      }
    } catch (caught) {
      console.error("No se pudo confirmar la sesión", caught);
      setError("No hemos podido confirmar que la sesión se haya guardado. Comprueba tu entrenamiento antes de repetir.");
    } finally {
      setIsBusy(false);
    }
  }

  if (completed) {
    const recordNames = recordExerciseIds.map((id) => exercises.find((exercise) => exercise.id === id)?.name).filter((name): name is string => Boolean(name));
    return <OrbitCompletion duration={completedDuration} exerciseCount={exercises.length} preview={preview} recordNames={recordNames} streak={currentStreak} />;
  }

  if (!sessionId) {
    const overviewExercises = exercises.map((exercise) => {
      const isTimed = isTimedPrescription(exercise.name, exercise.repetitions);
      return {
        name: exercise.name,
        prescription: `${exercise.sets} ${exercise.sets === 1 ? "serie" : "series"} · ${displayPrescription(exercise.name, exercise.repetitions)}${isTimed ? "" : " repeticiones"}`,
        restSeconds: exercise.restSeconds,
        media: exercise.media,
        illustration: exercise.illustration,
      };
    });
    return <WorkoutIntro workoutName={workoutName} exercises={overviewExercises} onStart={startWorkout} isBusy={isBusy} error={error} navigation={<NavigationLink href="/dashboard" kind="back" className="border-transparent bg-transparent px-0 text-[#c5d8df] shadow-none hover:border-transparent hover:bg-transparent hover:text-white focus-visible:outline-[#20b9a2]">Volver al dashboard</NavigationLink>} />;
  }

  const progress = ((activeIndex + 1) / exercises.length) * 100;
  return <OrbitSession
    workoutName={workoutName}
    exercise={activeExercise}
    activeIndex={activeIndex}
    exerciseCount={exercises.length}
    progress={progress}
    prescription={prescription}
    timed={timed}
    previousLogs={previousExerciseLogs}
    sets={logs[activeExercise.id]}
    media={<ExerciseMotion key={activeExercise.id} exercise={activeExercise} heightClass="h-72 sm:h-96" />}
    onUpdateSet={updateSet}
    onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
    onNext={nextExercise}
    onComplete={completeWorkout}
    isBusy={isBusy}
    savedMessage={savedMessage}
    error={error}
  />;
}
