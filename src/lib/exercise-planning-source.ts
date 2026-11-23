import reviewed from "../../data/illustration-library/automatic-reviewed.json";
import candidates from "../../data/illustration-library/candidate-mapping.json";
import releases from "../../data/illustration-library/release-names.json";

export const pendingManualExerciseSource = "atempo-illustration-pending";

export function isAutomaticPlanningSource(mediaSource: string | null, name?: string, description?: string | null) {
  if (mediaSource !== pendingManualExerciseSource) return true;
  const entries: Record<string, { id: string; description: string }> = reviewed;
  const assignments: Record<string, string> = candidates.assignments;
  if (!name) return false;
  const entry = entries[name];
  return Boolean(entry && entry.description === description && assignments[name] === entry.id && releases.includes(name));
}
