import { NextResponse } from "next/server";

import { sendEmail } from "@/utils/email";
import { brandFor } from "@/data/brand";
import { isWellFormedIdToken, readDocument, uidOf } from "@/utils/recruiterAssistant";

const escape = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Tells the admin about a new access request. The request is re-read from
// Firestore with the visitor's own token, so only a real, signed-in request
// can trigger the e-mail (and its content can't be forged in the body).
export async function POST(request: Request) {
  const { idToken }: { idToken?: unknown } = await request.json().catch(() => ({}));
  const uid = isWellFormedIdToken(idToken) ? uidOf(idToken) : null;

  if (!uid || !isWellFormedIdToken(idToken)) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  const filed = await readDocument(`access_requests/${encodeURIComponent(uid)}`, idToken);
  if (!filed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const receiver = process.env.SMTP_EMAIL_RECEIVER;
  if (!receiver) {
    return NextResponse.json({ message: "No receiver configured" }, { status: 503 });
  }

  try {
    await sendEmail({
      to: receiver,
      subject: `Access request (${filed.status}) - ${filed.name || filed.email}`,
      html: `
        <p>New access request on ${escape(brandFor(request.headers.get("host")).domain)}</p>
        <ul>
          <li><b>E-mail</b> (verified): ${escape(filed.email)}</li>
          <li><b>Name</b>: ${escape(filed.name) || "—"}</li>
          <li><b>Company</b>: ${escape(filed.company) || "—"}</li>
          <li><b>Channel</b>: ${escape(filed.ref) || "none"}</li>
          <li><b>Status</b>: ${escape(filed.status)}</li>
        </ul>
        <p>Review it in Portfolio → Access &amp; tracking.</p>
      `,
    });
    return NextResponse.json({ message: "Sent" });
  } catch (err: any) {
    console.error("[access-request] failed to send", err?.message);
    return NextResponse.json({ message: "Mail failed" }, { status: 500 });
  }
}
