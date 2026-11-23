/* eslint-disable @typescript-eslint/no-require-imports -- Isolated route test with mocked services. */
const assert = require("node:assert/strict");
const Module = require("node:module");
let profile;
let failSave;
let updates;
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user", email: "example@example.test" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile }) }) }),
    update: (values) => ({ eq: () => ({ select: () => ({ maybeSingle: async () => {
      if (failSave) return { data: null, error: { message: "write failed" } };
      Object.assign(profile, values);
      return { data: { user_id: "user" }, error: null };
    } }) }) }),
  }) }) };
  if (request === "@/lib/stripe") return { getStripeClient: () => ({ subscriptions: {
    retrieve: async () => ({ id: "sub", status: "active" }),
    update: async (_id, values) => { updates.push(values); return { cancel_at_period_end: values.cancel_at_period_end, current_period_end: 1800000000 }; },
  } }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/stripe/manage/route.ts");
Module._load = originalLoad;

async function submit(action) {
  const response = await POST(new Request("http://localhost/api/stripe/manage", { method: "POST", body: JSON.stringify({ action }) }));
  return { status: response.status, body: await response.json() };
}
async function main() {
  profile = { stripe_subscription_id: "sub", subscription_renews_at: null };
  updates = [];
  failSave = false;
  const cancelled = await submit("cancel");
  assert.equal(cancelled.status, 200);
  assert.equal(profile.subscription_auto_renew, false);
  assert.equal(profile.subscription_renews_at, new Date(1800000000 * 1000).toISOString());
  assert.deepEqual(updates[0], { cancel_at_period_end: true });
  const reactivated = await submit("reactivate");
  assert.equal(reactivated.status, 200);
  assert.equal(profile.subscription_auto_renew, true);
  assert.deepEqual(updates[1], { cancel_at_period_end: false });
  failSave = true;
  const partial = await submit("cancel");
  assert.equal(partial.status, 502);
  assert.match(partial.body.error, /Stripe ha aplicado el cambio/);
  console.log("Stripe: renovación, persistencia y fallo de sincronización comprobados.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
