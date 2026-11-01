"use client";

import { useState } from "react";
import { Input, SimpleGrid, Text, Textarea } from "@chakra-ui/react";

import AssistantProfile, { emptyAssistantProfile } from "@/interfaces/assistantProfile";
import { useAssistantNotes, useSaveAssistantNotes } from "@/hooks/queries/portfolio";
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

const TITLE = "Assistant notes";
const SUBTITLE =
  "What the recruiter assistant answers from. Approved recruiters can read it too; never put your last name here.";

// Mounted once the notes are loaded, so the fields start from them
const NotesForm = ({
  vaultCode,
  initial,
  onClose,
}: {
  vaultCode: string;
  initial: AssistantProfile;
  onClose: () => void;
}) => {
  const [profile, setProfile] = useState(initial);
  const save = useSaveAssistantNotes(vaultCode);

  const update = (key: keyof AssistantProfile, value: string) => setProfile((current) => ({ ...current, [key]: value }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    save.mutate(profile, {
      onSuccess: () => {
        toast.success("Assistant notes saved");
        onClose();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <Modal
      title={TITLE}
      subtitle={SUBTITLE}
      submitText="Save"
      loading={save.isPending}
      onClose={onClose}
      onSubmit={submit}
      size="lg"
    >
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
    </Modal>
  );
};

// Admin: what the recruiter assistant knows beyond the public site and the projects
const AssistantNotesModal = ({ vaultCode, onClose }: { vaultCode: string; onClose: () => void }) => {
  const { data, isError } = useAssistantNotes(vaultCode);

  if (!data && !isError) {
    return (
      <Modal title={TITLE} subtitle={SUBTITLE} onClose={onClose} size="lg">
        <Loader py="8" />
      </Modal>
    );
  }

  return <NotesForm vaultCode={vaultCode} initial={data ?? emptyAssistantProfile()} onClose={onClose} />;
};

export default AssistantNotesModal;
