"use client";

import dynamic from "next/dynamic";

import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";

// The AI SDK only downloads for visitors with recruiter access
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

// Hidden entirely when the server has no OpenAI key (see next.config.js)
const ENABLED = process.env.NEXT_PUBLIC_RECRUITER_CHAT_ENABLED === "true";

// Floating assistant for recruiters: only mounted once the recruiter code is known
const RecruiterChat = () => {
  const { vaultCode } = useRecruiterAccess();
  if (!ENABLED || !vaultCode) return null;
  return <ChatWidget code={vaultCode} />;
};

export default RecruiterChat;
