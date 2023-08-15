import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

import ContactEmail from "../../../../emails/ContactEmail";
import NewArticle from "../../../../emails/NewArticle";

export async function POST(request: Request) {

    // TODO
    // Veriy the request body (type of document, name, service, from)
    // Create another path for sending mail + link firebase

    const data = await request.json();

    if (!data || !data.type || !data.to || !data.name) {
        return NextResponse.json({ message: "Bad Request" }, { status: 500 });
    }

    if (data.type === "contact" && (!data.service || !data.content)) {
        return NextResponse.json({ message: "Bad Request" }, { status: 500 });
    }

    if (data.type === "new-article" && (!data.slug)) {
        return NextResponse.json({ message: "Bad Request" }, { status: 500 });
    }

    try {
    await sendEmail({
        html: render(data.type === "contact" ? ContactEmail({
            name: data.name,
            service: data.service,
            content: data.content
        }) : NewArticle({
            slug: data.slug,
        })),
        to: data.to,
        bcc: process.env.SMTP_EMAIL_RECEIVER || "",
        subject: (data.type === "contact" ? `Website (${data.service}) - ${data.name}` : `New article - ${data.name}`),
    })

    return NextResponse.json({ message: "The mail has been sent !" }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: 'message' in err ? err.message : 'An error occured' }, { status: 500})
    }
}