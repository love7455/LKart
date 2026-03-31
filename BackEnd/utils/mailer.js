import nodemailer from "nodemailer";
import "dotenv/config";

const getMailConfig = () => {
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASS?.trim()?.replace(/\s+/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  if (!user || !pass) {
    throw new Error("MAIL_USER or MAIL_PASS is missing");
  }

  return {
    host,
    port: Number.isNaN(port) ? 587 : port,
    secure,
    auth: { user, pass },
    from: process.env.MAIL_FROM?.trim() || user,
  };
};

const createMailer = () => {
  const config = getMailConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return { transporter, from: config.from };
};

export { createMailer };

