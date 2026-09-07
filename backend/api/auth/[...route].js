import googleHandler from '../../serverless-handlers/auth/google.js';
import loginHandler from '../../serverless-handlers/auth/login.js';
import meHandler from '../../serverless-handlers/auth/me.js';
import registerHandler from '../../serverless-handlers/auth/register.js';
import resendOtpHandler from '../../serverless-handlers/auth/resend-otp.js';
import verifyOtpHandler from '../../serverless-handlers/auth/verify-otp.js';

const routeHandlers = {
  '/google': googleHandler,
  '/login': loginHandler,
  '/me': meHandler,
  '/register': registerHandler,
  '/resend-otp': resendOtpHandler,
  '/verify-otp': verifyOtpHandler,
};

function resolveAuthPath(req) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '');
  const marker = '/auth';
  const markerIndex = pathname.lastIndexOf(marker);

  if (markerIndex === -1) {
    return '';
  }

  return pathname.slice(markerIndex + marker.length) || '/';
}

export default async function handler(req, res) {
  const authPath = resolveAuthPath(req);
  const targetHandler = routeHandlers[authPath];

  if (!targetHandler) {
    return res.status(404).json({ error: 'Auth endpoint not found' });
  }

  return targetHandler(req, res);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
