import crypto from 'node:crypto';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

const getOtpSecret = () => process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp-fallback-secret';

export const generateNumericOtp = (length = OTP_LENGTH) => {
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};

export const hashOtp = (email, otp) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return crypto
    .createHash('sha256')
    .update(`${normalizedEmail}:${otp}:${getOtpSecret()}`)
    .digest('hex');
};

export const buildOtpPayload = (email) => {
  const otp = generateNumericOtp();
  const otpHash = hashOtp(email, otp);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  return { otp, otpHash, otpExpiresAt };
};

export const isOtpExpired = (expiresAt) => !expiresAt || new Date(expiresAt).getTime() <= Date.now();

export const isValidOtpFormat = (otp) => /^\d{6}$/.test(String(otp || '').trim());
