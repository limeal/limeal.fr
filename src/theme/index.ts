import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    html: {
      scrollBehavior: "smooth",
      colorScheme: "dark",
      "@media (prefers-reduced-motion: reduce)": { scrollBehavior: "auto" },
    },
    "html, body": {
      bg: "ink",
      color: "white",
      fontFamily: "body",
    },
    "::selection": {
      bg: "lime",
      color: "ink",
    },
  },
  theme: {
    tokens: {
      colors: {
        ink: { value: "#111013" },
        lime: { value: "#fbd52b" },
        rose: { value: "#ff007f" },
        surface: {
          DEFAULT: { value: "#1d1c1f" },
          raised: { value: "#29282c" },
        },
        muted: { value: "rgba(255, 255, 255, 0.6)" },
        line: { value: "rgba(255, 255, 255, 0.1)" },
      },
      fonts: {
        heading: { value: "var(--font-satoshi), system-ui, sans-serif" },
        body: { value: "var(--font-satoshi), system-ui, sans-serif" },
      },
      radii: {
        card: { value: "16px" },
        pill: { value: "9999px" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
