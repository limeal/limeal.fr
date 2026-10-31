"use client";

import { useState } from "react";
import { Flex, Input, Text } from "@chakra-ui/react";
import { LuCopy, LuRefreshCcw } from "react-icons/lu";

import { changeVaultCode } from "@/firebase/store/project";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toaster";

const MIN_LENGTH = 12;

// Long enough that it can't be guessed: the code is the only lock on the vault
const randomCode = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};

// Opening it unlocks the confidential projects without typing the code
const shareLink = (code: string) => `${window.location.origin}/?access=${encodeURIComponent(code)}`;

// Admin: set or rotate the code recruiters type to see confidential projects
const RecruiterCodeModal = ({
  currentCode,
  onChanged,
  onClose,
}: {
  currentCode: string | null;
  onChanged: (code: string) => void;
  onClose: () => void;
}) => {
  const [code, setCode] = useState(currentCode ?? randomCode());
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code === currentCode) return onClose();

    setLoading(true);
    try {
      await changeVaultCode(code, currentCode);
      toast.success(currentCode ? "Code changed: the old one no longer works" : "Recruiter code saved");
      onChanged(code);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Recruiter code"
      subtitle="Give this code to recruiters so they can see your confidential projects."
      submitText="Save"
      loading={loading}
      onClose={onClose}
      onSubmit={submit}
      size="sm"
    >
      <FormField label="Code" invalid={code.length < MIN_LENGTH}>
        <Flex gap="2" w="full">
          <Input
            value={code}
            onChange={(e) => setCode(e.currentTarget.value.trim())}
            minLength={MIN_LENGTH}
            // Letters, digits, "-" and "_": the code is used in Firestore paths and URLs
            pattern="[A-Za-z0-9_\-]{12,128}"
            required
            fontFamily="mono"
            css={fieldStyles}
          />
          <Button variant="outline" h="10" px="3" aria-label="Generate" onClick={() => setCode(randomCode())}>
            <LuRefreshCcw />
          </Button>
        </Flex>
        <Text color="muted" fontSize="xs">
          At least {MIN_LENGTH} letters, digits, - or _. Changing it moves the confidential projects and revokes the old code.
        </Text>
      </FormField>
      {currentCode && (
        <FormField label="Shareable link (LinkedIn, CV…)">
          <Flex gap="2" w="full">
            <Input value={shareLink(currentCode)} readOnly fontFamily="mono" fontSize="xs" css={fieldStyles} />
            <Button
              variant="outline"
              h="10"
              px="3"
              aria-label="Copy"
              onClick={() => {
                navigator.clipboard.writeText(shareLink(currentCode));
                toast.success("Link copied");
              }}
            >
              <LuCopy />
            </Button>
          </Flex>
          <Text color="muted" fontSize="xs">
            Opens the site with recruiter access already on. Saving a new code above revokes this link.
          </Text>
        </FormField>
      )}
    </Modal>
  );
};

export default RecruiterCodeModal;
