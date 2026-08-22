import { kv } from '@vercel/kv';

// GET /api/check-id?id=SMALLKITTYPLAYERxxxxxxxxxxxxxx
// Returns: { blocked: boolean }
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = (req.query.id || '').toString().trim();

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    // Blocked IDs are stored as members of a set called "blocklist"
    const isBlocked = await kv.sismember('blocklist', id);
    return res.status(200).json({ blocked: Boolean(isBlocked) });
  } catch (err) {
    console.error('check-id error:', err);
    // Fail CLOSED or OPEN depending on how strict you want this.
    // Failing open (blocked: false) avoids locking out legit players if KV hiccups.
    return res.status(200).json({ blocked: false, error: 'lookup_failed' });
  }
}
