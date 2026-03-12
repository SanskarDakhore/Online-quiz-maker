import resultByIdHandler from '../../serverless-handlers/results/[id].js';
import resultsHandler from '../../serverless-handlers/results/index.js';
import myResultsHandler from '../../serverless-handlers/results/my-results.js';
import quizResultsHandler from '../../serverless-handlers/results/quiz.js';

function resolveResultsPath(req) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '');
  const marker = '/results';
  const markerIndex = pathname.lastIndexOf(marker);

  if (markerIndex === -1) {
    return '/';
  }

  return pathname.slice(markerIndex + marker.length) || '/';
}

export default async function handler(req, res) {
  const resultsPath = resolveResultsPath(req);

  if (resultsPath === '/') {
    return resultsHandler(req, res);
  }

  if (resultsPath === '/my-results') {
    return myResultsHandler(req, res);
  }

  const quizMatch = resultsPath.match(/^\/quiz\/([^/]+)$/);
  if (quizMatch) {
    req.query = { ...(req.query || {}), quizId: quizMatch[1] };
    return quizResultsHandler(req, res);
  }

  const resultMatch = resultsPath.match(/^\/([^/]+)$/);
  if (resultMatch) {
    req.query = { ...(req.query || {}), id: resultMatch[1] };
    return resultByIdHandler(req, res);
  }

  return res.status(404).json({ error: 'Result endpoint not found' });
}

export const config = {
  api: {
    externalResolver: true
  }
};
