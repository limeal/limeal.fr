import { Box, Container, type BoxProps } from "@chakra-ui/react";

type SectionProps = BoxProps & {
  id?: string;
  // Skip the centered container, for edge-to-edge content
  fullBleed?: boolean;
};

export const Section = ({ id, fullBleed, children, ...rest }: SectionProps) => (
  <Box
    as="section"
    id={id}
    position="relative"
    py={{ base: 16, md: 24, xl: 32 }}
    scrollMarginTop="72px"
    {...rest}
  >
    {fullBleed ? (
      children
    ) : (
      <Container maxW="7xl" px={{ base: 4, md: 8, xl: 12 }}>
        {children}
      </Container>
    )}
  </Box>
);

export default Section;
