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
        content
    } = await request.json();

    try {
    await sendEmail({
        html: render(ContactEmail({
            name,
            service,
            content
        })),
        to,
        bcc: process.env.SMTP_EMAIL_RECEIVER || "",
        subject: `Website (${service}) - ${name}`,
    })

    return NextResponse.json({ message: "The mail has been sent !" }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: 'message' in err ? err.message : 'An error occured' }, { status: 500})
    }
}