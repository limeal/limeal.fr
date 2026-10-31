"use client";

import { useEffect, useState } from "react";
import { Text, Textarea } from "@chakra-ui/react";

import { getAssistantNotes, setAssistantNotes } from "@/firebase/store/project";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toaster";

const PLACEHOLDER = `Availability: open to CDI from January 2027
Location: Paris area, hybrid / remote OK
Languages: French (native), English (fluent)
Looking for: product engineer role in a small product team
Salary: discuss directly with me`;

// Admin: what the recruiter assistant knows beyond the public site and the projects
const AssistantNotesModal = ({ vaultCode, onClose }: { vaultCode: string; onClose: () => void }) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAssistantNotes(vaultCode).then(setNotes);
  }, [vaultCode]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setAssistantNotes(vaultCode, notes);
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
      subtitle="Private facts the recruiter assistant can use. Recruiters with the code can read them too."
      submitText="Save"
      loading={loading}
      onClose={onClose}
      onSubmit={submit}
      size="lg"
    >
      <FormField label="Notes">
        <Textarea
          value={notes}
          placeholder={PLACEHOLDER}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={12}
          css={fieldStyles}
        />
        <Text color="muted" fontSize="xs">
          The assistant already knows your bio, skills, way of working and every project. Never put your
          last name here.
        </Text>
      </FormField>
    </Modal>
  );
};

export default AssistantNotesModal;
