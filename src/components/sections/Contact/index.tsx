"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, chakra, Grid, Input, NativeSelect, Stack, Textarea, VStack } from "@chakra-ui/react";
import { LuArrowUpRight } from "react-icons/lu";

import { useLangContext } from "@/contexts/LangContext";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import SocialLinks from "@/components/ui/SocialLinks";
import Reveal from "@/components/ui/Reveal";
import { toast } from "@/components/ui/Toaster";

// Values are sent as-is in the email subject
const SUBJECTS = [
  { value: "Opportunity", tid: "contact-me--subject--opportunity" },
  { value: "Collaboration", tid: "contact-me--subject--collaboration" },
  { value: "Question", tid: "contact-me--subject--question" },
  { value: "Other", tid: "contact-me--subject--other" },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0].value);
  const [loading, setLoading] = useState(false);

  const { getTranslation } = useLangContext();

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    toast.promise(
      fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "contact",
          to: email,
          name,
          service: subject,
          content,
        }),
      })
        .then(async (res) => {
          // fetch only rejects on network errors, so surface HTTP failures too
          if (!res.ok) {
            const { message } = await res.json().catch(() => ({}));
            throw new Error(message || res.statusText);
          }
          return res;
        })
        .finally(() => setLoading(false)),
      {
        pending: getTranslation("contact-me--pending"),
        success: getTranslation("contact-me--success"),
        error: getTranslation("contact-me--error"),
      }
    );
  };

  return (
    <Section id="contact-me">
      <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={{ base: 12, xl: 20 }} alignItems="center">
        <Box>
          <SectionHeader
            title={getTranslation("contact-me--title")}
            description={getTranslation("contact-me--description")}
          />
          <Reveal>
            <chakra.form onSubmit={onFormSubmit}>
              <Stack gap="6">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6">
                  <FormField n={1} label={getTranslation("contact-me--q1")} required disabled={loading}>
                    <Input
                      placeholder={getTranslation("contact-me--placeholder-name")}
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      css={fieldStyles}
                    />
                  </FormField>
                  <FormField n={2} label={getTranslation("contact-me--q2")} required disabled={loading}>
                    <Input
                      type="email"
                      placeholder="exemple@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      css={fieldStyles}
                    />
                  </FormField>
                </Grid>
                <FormField n={3} label={getTranslation("contact-me--q3")} disabled={loading}>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={subject}
                      onChange={(e) => setSubject(e.currentTarget.value)}
                      css={{ ...fieldStyles, "& option": { bg: "#1d1c1f" } }}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {getTranslation(s.tid)}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator color="muted" />
                  </NativeSelect.Root>
                </FormField>
                <FormField n={4} label={getTranslation("contact-me--q4")} required disabled={loading}>
                  <Textarea
                    placeholder={getTranslation("contact-me--placeholder-message")}
                    value={content}
                    onChange={(e) => setContent(e.currentTarget.value)}
                    minH="160px"
                    css={fieldStyles}
                  />
                </FormField>
                <Box>
                  <Button type="submit" loading={loading} icon={<LuArrowUpRight />}>
                    {getTranslation("contact-me--button")}
                  </Button>
                </Box>
              </Stack>
            </chakra.form>
          </Reveal>
        </Box>

        <Reveal delay={0.2}>
          <VStack gap="8">
            <Box display={{ base: "none", xl: "block" }}>
              <Image src="/assets/images/intouch.png" alt="" width={196} height={200} />
            </Box>
            <SocialLinks size="lg" />
          </VStack>
        </Reveal>
      </Grid>
    </Section>
  );
};

export default Contact;
