import quizByIdHandler from '../../serverless-handlers/quizzes/[id].js';
import quizzesHandler from '../../serverless-handlers/quizzes/index.js';
import myQuizzesHandler from '../../serverless-handlers/quizzes/my-quizzes.js';
import publishQuizHandler from '../../serverless-handlers/quizzes/publish.js';

function resolveQuizzesPath(req) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '');
  const marker = '/quizzes';
  const markerIndex = pathname.lastIndexOf(marker);

  if (markerIndex === -1) {
    return '/';
  }

  return pathname.slice(markerIndex + marker.length) || '/';
}

export default async function handler(req, res) {
  const quizzesPath = resolveQuizzesPath(req);

  if (quizzesPath === '/') {
    return quizzesHandler(req, res);
  }

  if (quizzesPath === '/my-quizzes') {
    return myQuizzesHandler(req, res);
  }

  const publishMatch = quizzesPath.match(/^\/([^/]+)\/publish$/);
  if (publishMatch) {
    req.query = { ...(req.query || {}), id: publishMatch[1] };
    return publishQuizHandler(req, res);
  }

  const quizMatch = quizzesPath.match(/^\/([^/]+)$/);
  if (quizMatch) {
    req.query = { ...(req.query || {}), id: quizMatch[1] };
    return quizByIdHandler(req, res);
  }

  return res.status(404).json({ error: 'Quiz endpoint not found' });
}

export const config = {
  api: {
    externalResolver: true
  }
};
