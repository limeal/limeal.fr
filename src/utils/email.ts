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

const port = parseInt(process.env.SMTP_PORT || "587")

// iCloud (smtp.mail.me.com) uses STARTTLS on 587, implicit TLS on 465
const smtpOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST || "",
  port,
  secure: process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
}

export const sendEmail = async (data: EmailPayload) => {
  const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"].filter(
    (key) => !process.env[key]
  )

  if (missing.length)
    throw new Error(`Missing SMTP environment variables: ${missing.join(", ")}`)

  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  })

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_MAIL || process.env.SMTP_USER,
    ...data,
  })
}