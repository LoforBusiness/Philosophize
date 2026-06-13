// Supabase Edge Function: full account deletion (right-to-erasure).
//
// Deletes the caller's user_state row AND their auth.users record, using the
// service role. The caller is identified from their own JWT, so a user can only
// ever delete THEMSELVES — the service key never leaves the server.
//
// Deploy:
//   supabase functions deploy delete-account
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.)
//
// The app calls this best-effort from lib/supabase/auth.ts → deleteAccountCloud().
// If it isn't deployed, the app still deletes the user_state row directly via the
// RLS "delete own" policy (migration 0002); only the auth.users row would remain.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    if (!jwt) return json({ error: 'missing token' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Identify the caller from their JWT (server-validated).
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) return json({ error: 'invalid token' }, 401);
    const uid = userData.user.id;

    await admin.from('user_state').delete().eq('user_id', uid);
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
