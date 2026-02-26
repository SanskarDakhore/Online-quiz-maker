import nodemailer from 'nodemailer';

const OTP_SUBJECT = 'Your QuizMaster verification code';
let transporter = null;

const getOtpText = (otp) =>
  `Your QuizMaster OTP is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;

const getOtpHtml = (otp, fullName) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
    <p>Hello${fullName ? ` ${fullName}` : ''},</p>
    <p>Your QuizMaster verification code is:</p>
    <p style="font-size: 24px; letter-spacing: 4px; font-weight: 700; margin: 16px 0;">${otp}</p>
    <p>This code expires in 10 minutes.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  </div>
`;

export const sendOtpEmail = async ({ to, otp, fullName }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.OTP_FROM_EMAIL || user;

  if (host && user && pass && fromEmail) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    await transporter.sendMail({
      from: fromEmail,
      to,
      subject: OTP_SUBJECT,
      text: getOtpText(otp),
      html: getOtpHtml(otp, fullName)
    });

    return { delivery: 'smtp' };
  }

  console.warn(`[OTP DEV MODE] OTP for ${to}: ${otp}`);
  return { delivery: 'console' };
};
