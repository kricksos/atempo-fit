import { loadEnvConfig } from "@next/env";
import catalog from "../data/illustration-library/catalog.json";
import mapping from "../data/illustration-library/candidate-mapping.json";
import { requiredEquipment } from "../src/lib/exercise-equipment";
import { getManualIllustrationCatalog } from "../src/lib/manual-illustration-catalog";
import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  loadEnvConfig(process.cwd());
  const { data, error, count } = await createAdminClient().from("exercises")
    .select("id, name, description, difficulty, primary_muscle, muscle_groups, equipment_required, restrictions, is_momentum_approved, media_source", { count: "exact" })
    .order("name");
  if (error) throw error;
  if (!data || count !== data.length) throw new Error("No se ha podido cargar el catálogo completo.");
  const rows = new Map(data.map((row) => [row.id, row]));
  const illustrations = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
  const assignments: Record<string, string> = mapping.assignments;
  for (const exercise of getManualIllustrationCatalog(data).catalog) {
    const row = rows.get(exercise.id);
    if (!row) {
      console.log(JSON.stringify({ display: exercise.name, missing: true }));
      continue;
    }
    const image = illustrations.get(assignments[exercise.name]);
    console.log(JSON.stringify({
      display: exercise.name, name: row.name, approved: row.is_momentum_approved,
      database: row.equipment_required, image: image?.equipment ?? null,
      required: requiredEquipment(row.equipment_required, image?.equipment ?? null, { name: exercise.name, illustrationId: image?.id }),
      description: row.description, muscle: row.primary_muscle,
      illustrationMuscle: exercise.primaryMuscle,
      difficulty: row.difficulty, restrictions: row.restrictions,
      illustration: image?.id ?? null,
      displayedImage: exercise.image,
      displayedImageEnd: exercise.imageEnd ?? null,
    }));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
