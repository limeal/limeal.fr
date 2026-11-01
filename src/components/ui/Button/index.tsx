"use client";

import NextLink from "next/link";
import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
  type SystemStyleObject,
} from "@chakra-ui/react";

type Variant = "primary" | "outline" | "ghost" | "danger";

const variants: Record<Variant, SystemStyleObject> = {
  primary: {
    bg: "lime",
    color: "ink",
    _hover: {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 32px -12px rgba(251, 213, 43, 0.7)",
    },
  },
  outline: {
    bg: "transparent",
    color: "white",
    borderWidth: "1px",
    borderColor: "line",
    _hover: { borderColor: "lime", color: "lime" },
  },
  ghost: {
    bg: "transparent",
    color: "muted",
    _hover: { color: "white", bg: "whiteAlpha.100" },
  },
  danger: {
    bg: "rose",
    color: "white",
    _hover: { opacity: 0.9 },
  },
};

export type ButtonProps = Omit<ChakraButtonProps, "variant"> & {
  variant?: Variant;
  // Renders a link styled as a button
  href?: string;
  external?: boolean;
  icon?: React.ReactNode;
};

export const Button = ({
  variant = "primary",
  href,
  external,
  icon,
  children,
  ...rest
}: ButtonProps) => {
  const content = (
    <>
      {children}
      {icon}
    </>
  );

  const shared: ChakraButtonProps = {
    variant: "plain",
    borderRadius: "pill",
    fontWeight: "bold",
    px: { base: 5, md: 6 },
    h: { base: 11, md: 12 },
    gap: 2,
    transition: "all 0.25s ease",
    css: variants[variant],
    ...rest,
  };

  // Outside the app (another site, a feed): a plain link in a new tab
  if (href && external) {
    return (
      <ChakraButton asChild {...shared}>
        <a href={href} target="_blank" rel="noreferrer">
          {content}
        </a>
      </ChakraButton>
    );
  }

  if (href) {
    return (
      <ChakraButton asChild {...shared}>
        <NextLink href={href}>{content}</NextLink>
      </ChakraButton>
    );
  }

  return <ChakraButton {...shared}>{content}</ChakraButton>;
};

export default Button;
