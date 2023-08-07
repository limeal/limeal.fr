import nodemailer from "nodemailer"

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
const smtpOptions = {
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: false,
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
    from: process.env.SMTP_EMAIL_SENDER,
    ...data,
  })
}
