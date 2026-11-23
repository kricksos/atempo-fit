/* eslint-disable @typescript-eslint/no-require-imports -- Dependencies are replaced for isolated route tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");
const { workoutTemplates, reviewWorkoutTemplate } = require("../src/lib/workout-templates.ts");
const { workoutTemplateToken } = require("../src/lib/workout-template-token.ts");
const { continuityOptions, techniqueOptions } = require("../src/lib/training-experience.ts");

const template = workoutTemplates[0];
const names = [...new Set(template.days.flatMap((day) => day.exercises.map((exercise) => exercise.name)))];
let planning = names.map((name) => ({
  name, primaryMuscle: "core", muscleGroups: ["core"], restrictions: name.includes("mochila") ? ["back_injury"] : [],
  equipment: name.includes("mochila") ? ["backpack"] : [], difficulty: "beginner", hasTrustedMedia: true,
}));
const cards = names.map((name, index) => ({ id: `exercise-${index}`, name }));
let profile = { experience: "Nunca he entrenado", training_place: "Casa", training_equipment: ["backpack"], restrictions: [] };
let authenticated = true;
let writes = [];
let saveResult = "saved";
let publishResult = "published";
class Query {
  constructor(table) { this.table = table; this.operation = "read"; }
  select() { return this; }
  eq() { return this; }
  insert(value) { this.operation = "insert"; writes.push({ action: "insert", table: this.table, value }); return this; }
  maybeSingle() { return Promise.resolve({ data: profile, error: null }); }
  single() { return Promise.resolve({ data: { id: "draft-1" }, error: null }); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: authenticated ? { id: "fixture-user" } : null } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({
    from: (table) => new Query(table),
    rpc: async (name, args) => { writes.push({ action: name, args }); return { data: name === "save_manual_workout_draft" ? saveResult : publishResult, error: null }; },
  }) };
  if (request === "@/lib/manual-exercise-catalog-server") return { getWorkoutTemplateCatalogs: async () => ({ planning, manual: { catalog: cards, exerciseDetails: [] } }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/workouts/templates/route.ts");
Module._load = originalLoad;

async function submit(body) {
  const response = await POST(new Request("http://localhost/api/workouts/templates", { method: "POST", headers: { "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }));
  return { status: response.status, data: await response.json() };
}
async function main() {
  const token = () => workoutTemplateToken(reviewWorkoutTemplate(template, profile, planning, cards));
  authenticated = false;
  assert.equal((await submit({ templateId: template.id, action: "edit" })).status, 401);
  authenticated = true;
  assert.equal((await submit("{")).status, 400);
  assert.equal((await submit({ templateId: "no-existe", action: "edit", reviewToken: "a".repeat(64) })).status, 404);
  assert.equal((await submit({ templateId: template.id, action: "activate" })).status, 400);
  assert.equal(writes.length, 0);

  const originalToken = token();
  profile = { ...profile, restrictions: ["shoulder_injury"] };
  const incompatible = await submit({ templateId: template.id, action: "activate", confirmActivation: true, reviewToken: originalToken });
  assert.equal(incompatible.status, 409);
  assert.ok(incompatible.data.issues.some((issue) => issue.includes("compatible")));
  assert.equal(writes.length, 0);

  profile = { ...profile, restrictions: [] };
  const stale = await submit({ templateId: template.id, action: "edit", reviewToken: "a".repeat(64) });
  assert.equal(stale.status, 409);
  assert.equal(writes.length, 0);
  const savedPlanning = planning;
  const currentToken = token();
  planning = planning.filter((exercise) => exercise.name !== template.days[0].exercises[0].name);
  const changed = await submit({ templateId: template.id, action: "edit", reviewToken: currentToken });
  assert.equal(changed.status, 409);
  assert.equal(writes.length, 0);
  planning = savedPlanning;
  const edited = await submit({ templateId: template.id, action: "edit", reviewToken: token() });
  assert.equal(edited.status, 200);
  assert.equal(edited.data.draftId, "draft-1");
  assert.deepEqual(writes.map((write) => write.action), ["insert", "save_manual_workout_draft"]);
  assert.equal(writes[1].args.p_days.length, template.days.length);
  assert.equal(writes[1].args.p_user_id, "fixture-user");

  writes = [];
  const activated = await submit({ templateId: template.id, action: "activate", confirmActivation: true, reviewToken: token() });
  assert.equal(activated.status, 200);
  assert.equal(activated.data.published, true);
  assert.deepEqual(writes.map((write) => write.action), ["insert", "save_manual_workout_draft", "publish_manual_workout_draft"]);

  writes = [];
  const matchingDaysToken = token();
  profile = { ...profile, days_per_week: 4 };
  const dayReview = reviewWorkoutTemplate(template, profile, planning, cards);
  assert.deepEqual(dayReview.issues, []);
  assert.ok(dayReview.warnings.some((warning) => warning.includes("2 días") && warning.includes("perfil indica 4")));
  assert.equal((await submit({ templateId: template.id, action: "activate", confirmActivation: true, reviewToken: matchingDaysToken })).status, 409);
  assert.equal(writes.length, 0);
  const dayActivation = await submit({ templateId: template.id, action: "activate", confirmActivation: true, reviewToken: token() });
  assert.equal(dayActivation.status, 200);
  assert.equal(dayActivation.data.published, true);
  assert.deepEqual(writes[1].args.p_days, dayReview.resolvedDays);
  assert.equal(writes[1].args.p_days.length, 2);
  writes = [];
  const dayEdit = await submit({ templateId: template.id, action: "edit", reviewToken: token() });
  assert.equal(dayEdit.status, 200);
  assert.equal(writes[1].args.p_days.length, 2);
  profile = { ...profile, days_per_week: undefined };
  writes = [];
  const advanced = { ...template, id: "fixture-advanced", level: "advanced" };
  workoutTemplates.push(advanced);
  const advancedReview = () => reviewWorkoutTemplate(advanced, profile, planning, cards);
  assert.deepEqual(advancedReview().issues, []);
  assert.ok(advancedReview().warnings.some((warning) => warning.includes("Faltan datos")));
  const oldAdvancedToken = workoutTemplateToken(advancedReview());
  profile = { ...profile, experience: "Más de 5 años", training_continuity: continuityOptions[1], training_technique: techniqueOptions[0] };
  assert.ok(advancedReview().warnings.some((warning) => warning.includes("puede no encajar")));
  assert.equal((await submit({ templateId: advanced.id, action: "activate", confirmActivation: true, reviewToken: oldAdvancedToken })).status, 409);
  assert.equal(writes.length, 0);
  const mismatchedResult = await submit({ templateId: advanced.id, action: "activate", confirmActivation: true, reviewToken: workoutTemplateToken(advancedReview()) });
  assert.equal(mismatchedResult.status, 200);
  assert.equal(mismatchedResult.data.published, true);
  writes = [];
  profile = { ...profile, training_continuity: continuityOptions[0] };
  assert.ok(advancedReview().warnings.some((warning) => warning.includes("autodeclaradas")));
  const advancedResult = await submit({ templateId: advanced.id, action: "activate", confirmActivation: true, reviewToken: workoutTemplateToken(advancedReview()) });
  assert.equal(advancedResult.status, 200);
  assert.equal(advancedResult.data.published, true);
  workoutTemplates.pop();
  profile = { experience: "Nunca he entrenado", training_place: "Casa", training_equipment: ["backpack"], restrictions: [] };
  writes = [];
  const retired = await submit({ templateId: "base-casa-beginner-2-breve", action: "edit", reviewToken: token() });
  assert.equal(retired.status, 404);
  assert.equal(writes.length, 0);

  const study = workoutTemplates.find((item) => item.id === "estudio-pedersen-gimnasio-principiante-4");
  const muscleByName = {
    "Prensa de piernas": "quadriceps",
    "Peso muerto rumano con pesa rusa": "hamstrings",
    "Extensión de cuádriceps en máquina": "quadriceps",
    "Puente de glúteos con peso corporal": "glutes",
    "Jalon al pecho": "lats",
    "Press banca en máquina": "pectorals",
    "Remo sentado en polea": "lats",
    "Extensión de tríceps en polea": "triceps",
    "Curl de bíceps en máquina": "biceps",
  };
  const originalProfile = profile;
  const originalCards = cards.slice();
  planning = Object.entries(muscleByName).map(([name, primaryMuscle]) => ({
    name, primaryMuscle, muscleGroups: [primaryMuscle], restrictions: [], equipment: [], difficulty: "beginner",
  }));
  cards.splice(0, cards.length, ...planning.map((item, index) => ({ id: `study-${index}`, name: item.name })));
  profile = { ...profile, training_place: "Gimnasio", days_per_week: 4 };
  const studyToken = workoutTemplateToken(reviewWorkoutTemplate(study, profile, planning, cards));
  const studyResult = await submit({ templateId: study.id, action: "edit", reviewToken: studyToken });
  assert.equal(studyResult.status, 200);
  assert.deepEqual(writes[1].args.p_days.map((day) => day.exercises.length), [4, 5, 4, 5]);
  writes = [];
  planning = planning.filter((exercise) => exercise.name !== "Puente de glúteos con peso corporal");
  const incompleteStudy = await submit({ templateId: study.id, action: "activate", confirmActivation: true, reviewToken: studyToken });
  assert.equal(incompleteStudy.status, 409);
  assert.ok(incompleteStudy.data.issues.some((issue) => issue.includes("Puente de glúteos")));
  assert.equal(writes.length, 0);
  profile = originalProfile;
  planning = savedPlanning;
  cards.splice(0, cards.length, ...originalCards);

  writes = [];
  saveResult = "not_found";
  assert.equal((await submit({ templateId: template.id, action: "activate", confirmActivation: true, reviewToken: token() })).status, 500);
  assert.ok(!writes.some((write) => write.action === "publish_manual_workout_draft"));
  saveResult = "saved";
  writes = [];
  publishResult = "missing_profile";
  assert.equal((await submit({ templateId: template.id, action: "activate", confirmActivation: true, reviewToken: token() })).status, 500);
  console.log("Rutinas preparadas: autenticación, confirmación, compatibilidad y activación simuladas correctas.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
