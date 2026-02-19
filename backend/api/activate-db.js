// Vercel serverless function: /api/activate-db
// Resumes a MongoDB Atlas cluster using Atlas API keys stored in environment variables.
// Adds a small in-memory cooldown to avoid repeated resume requests.

let lastAttempt = 0;
let lastResponse = null;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  if (lastAttempt && (now - lastAttempt) < COOLDOWN_MS) {
    return res.json({ message: 'Cooldown active, skipped resume', cached: true, result: lastResponse });
  }

  const { ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, ATLAS_GROUP_ID, ATLAS_CLUSTER_NAME } = process.env;
  if (!ATLAS_PUBLIC_KEY || !ATLAS_PRIVATE_KEY || !ATLAS_GROUP_ID || !ATLAS_CLUSTER_NAME) {
    return res.status(400).json({ error: 'Missing Atlas API environment variables on server' });
  }

  lastAttempt = now;

  try {
    const auth = Buffer.from(`${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}`).toString('base64');
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_GROUP_ID}/clusters/${ATLAS_CLUSTER_NAME}/resume`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const text = await response.text().catch(() => '');
    let parsed = null;
    try { parsed = text ? JSON.parse(text) : {}; } catch(e) { parsed = { raw: text }; }

    if (!response.ok) {
      lastResponse = { ok: false, status: response.status, statusText: response.statusText, body: parsed };
      return res.status(response.status).json({ error: 'Atlas API error', detail: lastResponse });
    }

    lastResponse = { ok: true, status: response.status, body: parsed };
    return res.json({ message: 'Resume request sent to Atlas', atlas: parsed });
  } catch (err) {
    lastResponse = { ok: false, error: err.message };
    console.error('activate-db error:', err);
    return res.status(500).json({ error: 'Failed to call Atlas API', details: err.message });
  }
}
