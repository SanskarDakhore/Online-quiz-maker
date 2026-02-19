import express from 'express';
const router = express.Router();

// POST /api/activate-db
// Attempts to resume a paused MongoDB Atlas cluster using Atlas API.
// Requires these environment variables to be set on the server:
// ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, ATLAS_GROUP_ID, ATLAS_CLUSTER_NAME

router.post('/', async (req, res) => {
  const { ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, ATLAS_GROUP_ID, ATLAS_CLUSTER_NAME } = process.env;

  if (!ATLAS_PUBLIC_KEY || !ATLAS_PRIVATE_KEY || !ATLAS_GROUP_ID || !ATLAS_CLUSTER_NAME) {
    return res.status(400).json({ error: 'Missing Atlas API environment variables on server' });
  }

  const auth = Buffer.from(`${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}`).toString('base64');
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_GROUP_ID}/clusters/${ATLAS_CLUSTER_NAME}/resume`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      // Atlas accepts an empty body for resume
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return res.status(response.status).json({ error: `Atlas API error: ${response.status} ${response.statusText}`, body: text });
    }

    const data = await response.json().catch(() => ({}));
    return res.json({ message: 'Resume request sent to Atlas', atlas: data });
  } catch (err) {
    console.error('Error calling Atlas resume API:', err);
    return res.status(500).json({ error: 'Failed to call Atlas API', details: err.message });
  }
});

export default router;
