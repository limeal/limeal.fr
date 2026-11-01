import { Box, type BoxProps } from "@chakra-ui/react";

// Long-form reading styles for the compiled MDX
const styles = {
  fontSize: { base: "md", md: "lg" },
  lineHeight: "1.8",
  color: "whiteAlpha.900",
  "& > * + *": { mt: "6" },
  "& h2, & h3, & h4": {
    color: "white",
    fontWeight: "black",
    lineHeight: "short",
    letterSpacing: "-0.01em",
    scrollMarginTop: "96px",
  },
  "& h2": { fontSize: { base: "2xl", md: "3xl" }, mt: "14" },
  "& h3": { fontSize: { base: "xl", md: "2xl" }, mt: "10" },
  "& h4": { fontSize: "lg", mt: "8" },
  // Headings are wrapped in their own anchor (rehype-autolink-headings)
  "& :is(h2, h3, h4) > a": { color: "inherit", textDecoration: "none" },
  "& :is(h2, h3, h4) > a:hover::after": { content: '" #"', color: "lime" },
  "& a": {
    color: "lime",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    _hover: { color: "white" },
  },
  "& strong": { color: "white", fontWeight: "bold" },
  "& ul, & ol": { pl: "6" },
  "& ul": { listStyleType: "disc" },
  "& ol": { listStyleType: "decimal" },
  "& li + li": { mt: "2" },
  "& li::marker": { color: "lime" },
  "& blockquote": {
    borderLeftWidth: "3px",
    borderColor: "lime",
    pl: "5",
    color: "muted",
    fontStyle: "italic",
  },
  "& hr": { borderColor: "line", my: "12" },
  // Full column width: also sizes SVGs that only carry a viewBox
  "& img": { width: "full", height: "auto", borderRadius: "card", borderWidth: "1px", borderColor: "line", mx: "auto" },
  "& :not(pre) > code": {
    fontSize: "0.9em",
    bg: "surface.raised",
    px: "1.5",
    py: "0.5",
    borderRadius: "md",
    color: "white",
  },
  // Highlighted by Shiki, which sets the colors inline
  "& pre": {
    fontSize: "sm",
    lineHeight: "1.7",
    p: { base: 4, md: 6 },
    borderRadius: "card",
    borderWidth: "1px",
    borderColor: "line",
    overflowX: "auto",
  },
  "& table": { width: "full", fontSize: "md", borderCollapse: "collapse", display: "block", overflowX: "auto" },
  "& th, & td": { borderBottomWidth: "1px", borderColor: "line", px: "3", py: "2", textAlign: "left" },
  "& th": { color: "white", fontWeight: "bold" },
} as const;

export const Prose = (props: BoxProps) => <Box css={styles} {...props} />;

export default Prose;
