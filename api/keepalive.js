// Keeps the Supabase project from auto-pausing.
//
// Supabase free-tier projects pause after 7 days with no activity. A paused
// project rejects every read and write, which is how a whole bowling night of
// data got lost. This endpoint makes one trivial authenticated request so the
// project never idles out. Wired to a daily Vercel cron in vercel.json.
//
// NOTE: this only PREVENTS future pauses. If the project is already paused it
// must be restored once by hand from the Supabase dashboard.

const SB_URL = process.env.SUPABASE_URL || 'https://cvecpzmeqtitvaltrmzh.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZWNwem1lcXRpdHZhbHRybXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTIyNTUsImV4cCI6MjA5NTk4ODI1NX0.xNpWkCVq1x-FnTNovGnpEGL0SPWTumK5eI5sqyqD6ec';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/hee_hees_state?id=eq.hh12&select=id`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    const body = await r.text();
    return res.status(200).json({
      ok: r.ok,
      status: r.status,
      body: body.slice(0, 200),
      at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, at: new Date().toISOString() });
  }
}
