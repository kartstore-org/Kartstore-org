import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { OTP } from '../models/index.js';
const hash = value => crypto.createHash('sha256').update(`${value}:${process.env.JWT_SECRET}`).digest('hex');
export async function sendOtp(destination, purpose) {
  const code = String(crypto.randomInt(100000, 1000000));
  await OTP.deleteMany({ destination, purpose });
  await OTP.create({ destination, purpose, codeHash: hash(code), expiresAt: new Date(Date.now() + Number(process.env.OTP_TTL_MINUTES || 10) * 60000) });
  if (destination.includes('@')) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: String(process.env.SMTP_SECURE) === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transport.sendMail({ from: process.env.MAIL_FROM, to: destination, subject: 'Your KARTSTORE verification code', text: `Your KARTSTORE code is ${code}. It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.` });
    } else if (process.env.NODE_ENV === 'production') throw new Error('Email OTP delivery is not configured');
    else console.log(`[DEV OTP] ${purpose} ${destination}: ${code}`);
  } else {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({ body: `Your KARTSTORE verification code is ${code}.`, from: process.env.TWILIO_PHONE_NUMBER, to: destination });
    } else if (process.env.NODE_ENV === 'production') throw new Error('SMS OTP delivery is not configured');
    else console.log(`[DEV OTP] ${purpose} ${destination}: ${code}`);
  }
  return { expiresInMinutes: Number(process.env.OTP_TTL_MINUTES || 10) };
}
export async function verifyOtp(destination, purpose, code) {
  const record = await OTP.findOne({ destination, purpose, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!record || record.attempts >= 5) return false;
  if (record.codeHash !== hash(String(code))) { record.attempts += 1; await record.save(); return false; }
  await OTP.deleteMany({ destination, purpose }); return true;
}
