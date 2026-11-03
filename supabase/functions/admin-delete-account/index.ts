// Supabase Edge Function: permanently deletes an account. Admins only.
//
// Called by the web app with the signed-in admin's session token and { user_id }.
// 1) checks the caller is an admin, 2) clears rows that would block the delete
//    (admin_purge_account), 3) deletes the login, which cascades to the profile and its data.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "admins_only" }, 401);

  let userId: unknown;
  try {
    ({ user_id: userId } = await req.json());
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return json({ error: "invalid_user_id" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: caller } = await supabase.auth.getUser(token);
  if (!caller.user) return json({ error: "admins_only" }, 401);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return json({ error: "admins_only" }, 403);
  if (userId === caller.user.id) return json({ error: "cannot_delete_admin" }, 400);

  const { error: purgeError } = await supabase.rpc("admin_purge_account", { p_user_id: userId });
  if (purgeError) {
    const known = ["account_not_found", "cannot_delete_admin", "cancel_plan_first"].find((code) =>
      purgeError.message.includes(code)
    );
    return json({ error: known ?? "delete_failed" }, known ? 400 : 500);
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) return json({ error: "delete_failed" }, 500);

  return json({ ok: true });
});
