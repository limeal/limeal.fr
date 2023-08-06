import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

import ContactEmail from "../../../emails/ContactEmail";

export async function POST(request: Request) {

    // TODO
    // Veriy the request body (type of document, name, service, from)
    // Create another path for sending mail + link firebase

    const {
        from,
        name,
        service,
        document
    } = await request.json();

    await sendEmail(from, {
        html: render(ContactEmail({
            name,
            service,
        })),
        to: process.env.SMTP_EMAIL_RECEIVER || "",
        subject: `Website (${service}) - ${name}`,
        attachments: [
            {
                filename: document.split("/").pop() || "default." + document.split(".").pop(),
                path: document,
            }
        ]
    })

    return NextResponse.json({ message: "Hello World (POST)" });
}