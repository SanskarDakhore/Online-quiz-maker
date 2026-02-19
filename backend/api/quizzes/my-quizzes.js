import Quiz from '../../server/models/Quiz.js';
import { connectToDatabase } from '../../server/utils/connectDb.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { serializeQuizForTeacher } from '../_lib/serializers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, 'teacher')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get quizzes created by the user
    const quizzes = await Quiz.find({ createdBy: user.uid }).sort({ createdAt: -1 });
    
    res.status(200).json(quizzes.map(serializeQuizForTeacher));
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({ error: 'Server error getting user quizzes' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
