import { HStack, Text, type StackProps } from "@chakra-ui/react";

type NumberedLabelProps = StackProps & { n: number };

// "01  Label": the lime counter shared by the contact form and the approach cards
export const NumberedLabel = ({ n, children, ...rest }: NumberedLabelProps) => (
  <HStack gap="3" align="baseline" {...rest}>
    <Text as="span" color="lime" fontWeight="black" fontSize="sm">
      {String(n).padStart(2, "0")}
    </Text>
    <Text as="span">{children}</Text>
  </HStack>
);

export default NumberedLabel;
