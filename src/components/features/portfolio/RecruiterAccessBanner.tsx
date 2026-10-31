"use client";

import { useEffect, useState } from "react";
import { Box, Flex, IconButton, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { LuClock, LuLock, LuMailCheck, LuX } from "react-icons/lu";

import { useLangContext } from "@/contexts/LangContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import useIsAdmin from "@/hooks/useIsAdmin";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import { EASE_OUT } from "@/components/ui/Reveal";
import { toast } from "@/components/ui/Toaster";

const DISMISSED_KEY = "access-bar-dismissed";

// Bar fixed at the bottom of the screen for visitors without access: explains
// what is hidden and lets a recruiter ask for access with a verified e-mail
const RecruiterAccessBanner = () => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { request, requestAccess, leave, vaultCode, channelBlocked, ready } = useRecruiterAccess();
  const isAdmin = useIsAdmin();
  const { getTranslation } = useLangContext();

  useEffect(() => {
    try {
      setDismissed(!!sessionStorage.getItem(DISMISSED_KEY));
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  };

  // Never shown to blocked channels (e.g. Discord), nor once access is granted
  const visible = ready && !dismissed && !vaultCode && !channelBlocked && !isAdmin;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestAccess({ email: email.trim(), name: name.trim(), company: company.trim() });
      setSentTo(email.trim());
      setOpen(false);
    } catch {
      toast.error(getTranslation("access--send-error"));
    }
    setLoading(false);
  };

  const status = request?.status;
  const waiting = !!sentTo || status === "pending";
  const icon = sentTo ? <LuMailCheck /> : status === "pending" ? <LuClock /> : <LuLock />;
  const title = sentTo
    ? getTranslation("access--sent-title")
    : status === "pending"
    ? getTranslation("access--pending-title")
    : status === "refused"
    ? getTranslation("access--refused-title")
    : getTranslation("portfolio--banner-title");
  const text = sentTo
    ? `${getTranslation("access--sent-text")} ${sentTo}`
    : status === "pending"
    ? getTranslation("access--pending-text")
    : status === "refused"
    ? getTranslation("access--refused-text")
    : getTranslation("portfolio--banner-text");

  return (
    <>
      {open && (
        <Modal
          title={getTranslation("access--form-title")}
          subtitle={getTranslation("access--form-subtitle")}
          submitText={getTranslation("access--form-submit")}
          loading={loading}
          onClose={() => setOpen(false)}
          onSubmit={submit}
          size="sm"
        >
          <FormField label={getTranslation("access--form-email")} required>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} css={fieldStyles} />
          </FormField>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <FormField label={getTranslation("access--form-name")}>
              <Input autoComplete="name" value={name} onChange={(e) => setName(e.currentTarget.value)} css={fieldStyles} />
            </FormField>
            <FormField label={getTranslation("access--form-company")}>
              <Input autoComplete="organization" value={company} onChange={(e) => setCompany(e.currentTarget.value)} css={fieldStyles} />
            </FormField>
          </SimpleGrid>
          <Text color="muted" fontSize="xs">
            {getTranslation("access--form-privacy")}
          </Text>
        </Modal>
      )}

      <AnimatePresence>
        {visible && (
          <Box
            asChild
            position="fixed"
            zIndex="1200"
            left="0"
            right="0"
            bottom={{ base: 3, md: 5 }}
            px={{ base: 3, md: 6 }}
            pointerEvents="none"
          >
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.4 }}
            >
              <Flex
                role="region"
                aria-label={title}
                pointerEvents="auto"
                maxW="4xl"
                mx="auto"
                align="center"
                gap={{ base: 3, md: 4 }}
                p={{ base: 3, md: 4 }}
                pl={{ base: 3, md: 5 }}
                bg="rgba(29, 28, 31, 0.85)"
                backdropFilter="saturate(180%) blur(20px)"
                borderWidth="1px"
                borderColor="line"
                borderRadius="20px"
                boxShadow="0 24px 64px -16px rgba(0, 0, 0, 0.9)"
              >
                <Box
                  display={{ base: "none", sm: "grid" }}
                  placeItems="center"
                  w="10"
                  h="10"
                  flexShrink="0"
                  borderRadius="full"
                  bg={waiting ? "lime" : "rose"}
                  color={waiting ? "ink" : "white"}
                  fontSize="lg"
                >
                  {icon}
                </Box>
                <Stack gap="0.5" flex="1" minW="0">
                  <Text fontWeight="black" fontSize={{ base: "sm", md: "md" }}>
                    {title}
                  </Text>
                  <Text color="muted" fontSize={{ base: "xs", md: "sm" }} lineClamp={{ base: 2, md: 1 }}>
                    {text}
                  </Text>
                </Stack>
                {!sentTo && !status && (
                  <Button h="10" px="4" fontSize="sm" flexShrink="0" onClick={() => setOpen(true)}>
                    {getTranslation("portfolio--teaser-request")}
                  </Button>
                )}
                {status && (
                  <Button variant="ghost" h="10" px="3" fontSize="sm" flexShrink="0" onClick={leave}>
                    {getTranslation("logout")}
                  </Button>
                )}
                <IconButton
                  aria-label={getTranslation("chat--close")}
                  variant="plain"
                  size="sm"
                  color="muted"
                  _hover={{ color: "white" }}
                  flexShrink="0"
                  onClick={dismiss}
                >
                  <LuX />
                </IconButton>
              </Flex>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruiterAccessBanner;
