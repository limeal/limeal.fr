"use client";

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

// Same surface as the old react-toastify calls, so call sites stay one-liners
export const toast = {
  success: (title: string) => toaster.create({ type: "success", title }),
  error: (title: string) => toaster.create({ type: "error", title }),
  info: (title: string) => toaster.create({ type: "info", title }),
  promise: <T,>(
    promise: Promise<T>,
    messages: { pending: string; success: string; error: string }
  ) =>
    toaster.promise(promise, {
      loading: { title: messages.pending },
      success: { title: messages.success },
      error: { title: messages.error },
    }),
};

export const Toaster = () => (
  <Portal>
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
      {(t) => (
        <Toast.Root
          width={{ md: "sm" }}
          bg="surface.raised"
          color="white"
          borderWidth="1px"
          borderColor="line"
          borderRadius="card"
        >
          {t.type === "loading" ? (
            <Spinner size="sm" color="lime" />
          ) : (
            <Toast.Indicator />
          )}
          <Stack gap="1" flex="1" maxWidth="100%">
            {t.title && <Toast.Title>{t.title}</Toast.Title>}
            {t.description && (
              <Toast.Description>{t.description}</Toast.Description>
            )}
          </Stack>
          {t.closable && <Toast.CloseTrigger />}
        </Toast.Root>
      )}
    </ChakraToaster>
  </Portal>
);

export default Toaster;
