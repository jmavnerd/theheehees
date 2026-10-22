// Weekly snapshot of the live Hee Hees season row into a PRIVATE Vercel Blob
// store, so there's an off-machine, off-GitHub copy (the repo is public).
// Triggered by the Vercel cron in vercel.json; Vercel sends
// "Authorization: Bearer $CRON_SECRET", and anything else is rejected.

import { put } from '@vercel/blob';

const SB_URL = process.env.SUPABASE_URL || 'https://cvecpzmeqtitvaltrmzh.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZWNwem1lcXRpdHZhbHRybXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTIyNTUsImV4cCI6MjA5NTk4ODI1NX0.xNpWkCVq1x-FnTNovGnpEGL0SPWTumK5eI5sqyqD6ec';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  try {
    const r = await fetch(`${SB_URL}/rest/v1/hee_hees_state?id=eq.hh12&select=state,updated_at`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    if (!r.ok) throw new Error(`Supabase HTTP ${r.status}`);
    const rows = await r.json();
    // Never store an empty / malformed snapshot.
    if (!Array.isArray(rows) || !rows[0]?.state?.weeks) throw new Error('Unexpected state shape');

    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '');   // 20261022T090000
    const blob = await put(`backups/hh12-${stamp}.json`, JSON.stringify(rows), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    return res.status(200).json({
      ok: true,
      path: blob.pathname,
      weeks: Object.keys(rows[0].state.weeks).length,
      at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, at: new Date().toISOString() });
  }
}
