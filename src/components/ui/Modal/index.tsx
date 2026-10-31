"use client";

import { chakra, CloseButton, Dialog, Portal, Stack, Text } from "@chakra-ui/react";

import Button from "../Button";

type ModalProps = {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  // Both omitted for a read-only dialog (no footer button)
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  submitText?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
};

// Base of every form dialog; callers mount it only while it is open
export const Modal = ({
  title,
  subtitle,
  onClose,
  onSubmit,
  submitText,
  loading,
  size = "md",
  children,
}: ModalProps) => (
  <Dialog.Root
    open
    onOpenChange={(e) => !e.open && onClose()}
    size={size}
    placement="center"
    scrollBehavior="inside"
    motionPreset="slide-in-bottom"
  >
    <Portal>
      <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <Dialog.Positioner>
        <Dialog.Content
          bg="surface"
          color="white"
          borderWidth="1px"
          borderColor="line"
          borderRadius="card"
          // Keep a gutter on phones; height follows the content
          mx={{ base: "4", md: "auto" }}
        >
          <chakra.form onSubmit={onSubmit} display="contents">
            <Dialog.Header flexDirection="column" alignItems="flex-start" gap="1">
              <Dialog.Title fontSize="2xl" fontWeight="black" textTransform="uppercase">
                {title}
              </Dialog.Title>
              {subtitle && <Text color="muted">{subtitle}</Text>}
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="5">{children}</Stack>
            </Dialog.Body>
            {submitText && (
              <Dialog.Footer>
                <Button type="submit" loading={loading} w={{ base: "full", md: "auto" }}>
                  {submitText}
                </Button>
              </Dialog.Footer>
            )}
          </chakra.form>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" color="muted" _hover={{ color: "white" }} />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);

export default Modal;
