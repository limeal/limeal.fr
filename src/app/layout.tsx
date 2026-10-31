import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

import Providers from "./providers";

const satoshi = localFont({
  src: "../../public/assets/fonts/Satoshi.ttf",
  weight: "300 900",
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paul (Limeal) — Software & Product Engineer",
  description:
    "Software & product engineer : du besoin utilisateur à la prod, avec Go, React et Claude Code.",
  keywords: [
    "Limeal",
    "Software Engineer",
    "Product Engineer",
    "Claude Code",
    "Next.js",
    "Go",
  ],
  applicationName: "Limeal",
  category: "Portfolio",
  icons: [
    {
      url: "/assets/images/logo.png",
    },
  ],
  authors: [
    {
      name: "Paul (Limeal)",
      url: "https://limeal.fr",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} dark`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
