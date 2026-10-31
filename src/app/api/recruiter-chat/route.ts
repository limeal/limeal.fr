import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

import { buildInstructions, isWellFormedCode, loadRecruiterVault } from "@/utils/recruiterAssistant";

// Keeps a conversation (and its cost) bounded
const MAX_MESSAGES = 30;
const MAX_CHARS = 8000;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: "Chat disabled" }, { status: 503 });
  }

  const { messages, code }: { messages?: UIMessage[]; code?: unknown } = await request
    .json()
    .catch(() => ({}));

  if (!Array.isArray(messages) || !isWellFormedCode(code)) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  // Only the visitor's and the assistant's turns: the instructions are set here, server-side
  const conversation = messages.filter((m) => m.role === "user" || m.role === "assistant");
  const chars = conversation
    .flatMap((m) => m.parts)
    .reduce((n, part) => n + (part.type === "text" ? part.text.length : 0), 0);

  if (conversation.length > MAX_MESSAGES || chars > MAX_CHARS) {
    return NextResponse.json({ message: "Conversation too long" }, { status: 413 });
  }

  // The recruiter code is checked on every call, so the endpoint costs nothing without it
  const vault = await loadRecruiterVault(code);
  if (!vault) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-5.4-mini"),
    instructions: buildInstructions(vault),
    messages: await convertToModelMessages(conversation),
    maxOutputTokens: 800,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
