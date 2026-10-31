"use client";

import { useEffect, useState } from "react";
import { Input, SimpleGrid, Text, Textarea } from "@chakra-ui/react";

import AssistantProfile, { emptyAssistantProfile } from "@/interfaces/assistantProfile";
import { getAssistantNotes, setAssistantNotes } from "@/firebase/store/project";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toaster";

type TextField = Exclude<keyof AssistantProfile, "notes">;

// The questions recruiters ask first, each with an example of answer
const FIELDS: { key: TextField; label: string; placeholder: string }[] = [
  { key: "availability", label: "Availability", placeholder: "Open to offers, available from January 2027" },
  { key: "location", label: "Location / remote", placeholder: "Paris area, hybrid or full remote" },
  { key: "languages", label: "Languages", placeholder: "French (native), English (fluent)" },
  { key: "lookingFor", label: "Looking for", placeholder: "Product engineer, permanent contract, small product team" },
  { key: "salary", label: "Salary expectations", placeholder: "To discuss directly" },
];

// Admin: what the recruiter assistant knows beyond the public site and the projects
const AssistantNotesModal = ({ vaultCode, onClose }: { vaultCode: string; onClose: () => void }) => {
  const [profile, setProfile] = useState<AssistantProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAssistantNotes(vaultCode).then(setProfile).catch(() => setProfile(emptyAssistantProfile()));
  }, [vaultCode]);

  const update = (key: keyof AssistantProfile, value: string) =>
    setProfile((current) => (current ? { ...current, [key]: value } : current));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await setAssistantNotes(vaultCode, profile);
      toast.success("Assistant notes saved");
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Assistant notes"
      subtitle="What the recruiter assistant answers from. Approved recruiters can read it too; never put your last name here."
      submitText="Save"
      loading={loading}
      onClose={onClose}
      onSubmit={submit}
      size="lg"
    >
      {!profile ? (
        <Loader py="8" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {FIELDS.map((field) => (
              <FormField key={field.key} label={field.label} required>
                <Input
                  value={profile[field.key]}
                  placeholder={field.placeholder}
                  maxLength={200}
                  onChange={(e) => update(field.key, e.currentTarget.value)}
                  css={fieldStyles}
                />
              </FormField>
            ))}
          </SimpleGrid>
          <FormField label="Other notes">
            <Textarea
              value={profile.notes}
              placeholder="Anything else worth knowing: notice period, preferred industries, what motivates you…"
              rows={4}
              onChange={(e) => update("notes", e.currentTarget.value)}
              css={fieldStyles}
            />
            <Text color="muted" fontSize="xs">
              The assistant already knows your bio, skills, way of working and every project.
            </Text>
          </FormField>
        </>
      )}
    </Modal>
  );
};

export default AssistantNotesModal;
