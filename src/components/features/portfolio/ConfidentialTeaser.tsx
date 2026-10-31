"use client";

import { useState } from "react";
import { Box, Flex, Grid, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { LuKeyRound, LuLock } from "react-icons/lu";

import { useLangContext } from "@/contexts/LangContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";

// Placeholder for the pro projects a visitor can't see, with the way in for recruiters
const ConfidentialTeaser = ({
  count,
  onUnlock,
}: {
  count: number;
  // Resolves to false when the code opens nothing
  onUnlock: (code: string) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { getTranslation } = useLangContext();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const ok = await onUnlock(code.trim());
    setLoading(false);
    setInvalid(!ok);
    if (ok) setOpen(false);
  };

  return (
    <Card position="relative" mt={{ base: 6, xl: 8 }}>
      {open && (
        <Modal
          title={getTranslation("portfolio--access-title")}
          subtitle={getTranslation("portfolio--access-subtitle")}
          submitText={getTranslation("portfolio--access-submit")}
          loading={loading}
          onClose={() => setOpen(false)}
          onSubmit={submit}
          size="sm"
        >
          <FormField label={getTranslation("portfolio--access-code")} invalid={invalid}>
            <Input
              value={code}
              autoComplete="off"
              onChange={(e) => {
                setCode(e.currentTarget.value);
                setInvalid(false);
              }}
              css={fieldStyles}
            />
            {invalid && (
              <Text color="rose" fontSize="sm">
                {getTranslation("portfolio--access-invalid")}
              </Text>
            )}
          </FormField>
        </Modal>
      )}

      {/* Blurred fake cards: hints at content without revealing any */}
      <Grid
        position="absolute"
        inset="0"
        p="6"
        gap="6"
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        filter="blur(14px)"
        opacity="0.5"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <Stack key={i} gap="3" display={{ base: i ? "none" : "flex", md: "flex" }}>
            <Box h="60%" borderRadius="12px" bg={i === 1 ? "rose" : "surface.raised"} />
            <Box h="5" w="70%" borderRadius="pill" bg="whiteAlpha.300" />
            <Box h="4" w="90%" borderRadius="pill" bg="whiteAlpha.200" />
          </Stack>
        ))}
      </Grid>

      <Stack
        position="relative"
        align="center"
        textAlign="center"
        gap="4"
        py={{ base: 12, md: 16 }}
        px="6"
        bg="rgba(17, 16, 19, 0.55)"
      >
        <Box display="grid" placeItems="center" w="14" h="14" borderRadius="full" bg="rose" color="white" fontSize="2xl">
          <LuLock />
        </Box>
        <Heading as="h3" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" textTransform="uppercase" letterSpacing="-0.02em">
          {count} {getTranslation(count > 1 ? "portfolio--teaser-title-many" : "portfolio--teaser-title-one")}
        </Heading>
        <Text color="muted" maxW="lg">
          {getTranslation("portfolio--teaser-text")}
        </Text>
        <Flex gap="3" wrap="wrap" justify="center" pt="2">
          <Button onClick={() => setOpen(true)}>
            <LuKeyRound />
            {getTranslation("portfolio--teaser-code")}
          </Button>
          <Button href="#contact-me" variant="outline">
            {getTranslation("portfolio--teaser-request")}
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
};

export default ConfidentialTeaser;
