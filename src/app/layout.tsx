import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

import { brandFor } from "@/data/brand";
import Providers from "./providers";

const satoshi = localFont({
  src: "../../public/assets/fonts/Satoshi.ttf",
  weight: "300 900",
  variable: "--font-satoshi",
  display: "swap",
});

// Every page depends on the request host (see brandFor), so none can be
// prerendered once at build time
export const dynamic = "force-dynamic";

// Depends on the domain: pauldev.fr must not mention the pseudonym anywhere
export async function generateMetadata(): Promise<Metadata> {
  const brand = brandFor((await headers()).get("host"));

  return {
    title: `${brand.name} — Software & Product Engineer`,
    description:
      "Software & product engineer : du besoin utilisateur à la prod, avec Go, React et Claude Code.",
    keywords: [
      ...(brand.discreet ? [] : ["Limeal"]),
      "Software Engineer",
      "Product Engineer",
      "Claude Code",
      "Next.js",
      "Go",
    ],
    applicationName: brand.discreet ? "Paul" : "Limeal",
    category: "Portfolio",
    icons: [{ url: brand.logo }],
    authors: [{ name: brand.name, url: `https://${brand.domain}` }],
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = brandFor((await headers()).get("host"));

  return (
    <html lang="en" className={`${satoshi.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Chakra's cascade layers, declared before any style. The first mention
            of a layer fixes its priority: if Emotion injects a component style
            (layer "recipes") ahead of Chakra's global sheet, the reset layer
            would win over the recipes (e.g. Container margins/padding lost). */}
        <style>{"@layer reset, base, tokens, recipes;"}</style>
      </head>
      <body>
        <Providers brand={brand}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
