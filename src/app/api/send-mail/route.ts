import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

import ContactEmail from "../../../../emails/ContactEmail";

export async function POST(request: Request) {

    // TODO
    // Veriy the request body (type of document, name, service, from)
    // Create another path for sending mail + link firebase

    const {
        to,
        name,
        service,
        documentPath,
        documentName
    } = await request.json();

    if (!documentName || !documentPath || !name || !service || !to) return NextResponse.json({ message: "Missing parameters" }, { status: 400 });

    await sendEmail({
        html: render(ContactEmail({
            name,
            service,
        })),
        to,
        bcc: process.env.SMTP_EMAIL_RECEIVER || "",
        subject: `Website (${service}) - ${name}`,
        attachments: [
            {
                filename: documentName,
                path: documentPath,
            }
        ]
    })

    return NextResponse.json({ message: "The mail has been sent !" });
}