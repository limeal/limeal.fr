import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"

type EmailPayload = {
  to: string
  subject: string
  html: string
  attachments?: {
    filename: string
    path: string
  }[];
  bcc?: string | string[];
  ccs?: string | string[];
}

// Replace with your SMTP credentials
const smtpOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true" ?? false,
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASSWORD || "password",
  },
}

export const sendEmail = async (data: EmailPayload) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  })

  return await transporter.sendMail({
    from: process.env.SMTP_USER,
    ...data,
  })
}