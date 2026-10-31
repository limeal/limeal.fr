import { Field, type SystemStyleObject } from "@chakra-ui/react";

import NumberedLabel from "../NumberedLabel";

// Shared look of every Input / Textarea / NativeSelect.Field, passed through `css`
export const fieldStyles: SystemStyleObject = {
  bg: "surface",
  color: "white",
  borderWidth: "1px",
  borderColor: "line",
  borderRadius: "12px",
  _placeholder: { color: "whiteAlpha.500" },
  _focusVisible: {
    borderColor: "lime",
    outline: "none",
    boxShadow: "0 0 0 1px var(--chakra-colors-lime)",
  },
};

type FormFieldProps = Field.RootProps & {
  label?: React.ReactNode;
  // Numbered like the contact form questions
  n?: number;
};

export const FormField = ({ label, n, children, ...rest }: FormFieldProps) => (
  <Field.Root gap="2" {...rest}>
    {label && (
      <Field.Label fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
        {n ? <NumberedLabel n={n}>{label}</NumberedLabel> : label}
      </Field.Label>
    )}
    {children}
  </Field.Root>
);

export default FormField;
