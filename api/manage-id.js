import { kv } from '@vercel/kv';

// POST /api/manage-id
// Headers: Authorization: Bearer <ADMIN_SECRET>
// Body: { "id": "SMALLKITTYPLAYERxxxxxxxxxxxxxx", "action": "add" | "remove" }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, action } = req.body || {};

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid id' });
  }

  if (action !== 'add' && action !== 'remove') {
    return res.status(400).json({ error: 'action must be "add" or "remove"' });
  }

  try {
    if (action === 'add') {
      await kv.sadd('blocklist', id);
    } else {
      await kv.srem('blocklist', id);
    }

    const count = await kv.scard('blocklist');
    return res.status(200).json({ success: true, id, action, totalBlocked: count });
  } catch (err) {
    console.error('manage-id error:', err);
    return res.status(500).json({ error: 'Failed to update blocklist' });
  }
}
