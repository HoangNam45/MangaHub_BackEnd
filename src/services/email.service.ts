import { RedisService } from "./redis.service";
import { transporter } from "../config/mailer";

export const saveEmailVerificationCode = async (
  email: string,
  code: string
) => {
  const key = `verify:${email}`;
  await RedisService.set(key, code, 300); // 5 minutes TTL
};

export const getEmailVerificationCode = async (email: string) => {
  const key = `verify:${email}`;
  return await RedisService.get(key);
};

export const deleteEmailVerificationCode = async (email: string) => {
  const key = `verify:${email}`;
  return await RedisService.del(key);
};

export const sendVerificationEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: `"MangaHub" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: "Your Verification Code",
    html: `
      <p>Hello,</p>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code is valid for 5 minutes.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export function generateVerificationCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
