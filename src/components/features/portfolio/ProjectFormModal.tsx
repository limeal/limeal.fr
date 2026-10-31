"use client";

import { useState } from "react";
import moment from "moment";
import { Flex, Input, InputGroup, SimpleGrid, Stack, Text, Textarea } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { LuCamera, LuGlobe } from "react-icons/lu";

import Project from "@/interfaces/project";
import { uploadFile } from "@/firebase/storage";
import { addProject, deleteProject, updateProject } from "@/firebase/store/project";
import { useLangContext } from "@/contexts/LangContext";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import ImageDrop from "@/components/ui/ImageDrop";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { toast } from "@/components/ui/Toaster";
import { captureWebsite } from "@/utils/screenshot";
import { hasThumbnail } from "@/utils/project";

const CATEGORIES = [
  { value: "Web_Development", label: "Web" },
  { value: "Mobile_Development", label: "Mobile" },
  { value: "Software_Development", label: "Software" },
  { value: "Game_Development", label: "Game" },
  { value: "Minecraft_Addons", label: "Minecraft" },
  { value: "Other", label: "Other" },
];

type When = "date" | "period" | "ongoing";

// Dates are picked by month; Firestore keeps the YYYY-MM-DD format
const toMonth = (date?: string) => (date ? date.slice(0, 7) : "");
const fromMonth = (month: string) => (month ? `${month}-01` : "");

// One-click choice between a few options
const Choice = <T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) => (
  <Flex gap="2" wrap="wrap">
    {options.map((o) => (
      <Pill
        key={o.value}
        active={value === o.value}
        activeLayoutId={`project-form-${id}`}
        onClick={() => onChange(o.value)}
        fontSize="sm"
        px="3.5"
        py="1.5"
      >
        {o.label}
      </Pill>
    ))}
  </Flex>
);

// Creates a project, or edits `project` when given
const ProjectFormModal = ({
  project,
  vaultCode,
  onClose,
  refresh,
}: {
  project?: Project;
  // Admin's recruiter code, needed to store confidential projects
  vaultCode: string | null;
  onClose: () => void;
  refresh: () => void;
}) => {
  const editing = !!project;

  const [kind, setKind] = useState<"personal" | "pro">(project?.kind ?? "personal");
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState(project?.category ?? CATEGORIES[0].value);
  const [role, setRole] = useState(project?.role ?? "");
  const [company, setCompany] = useState(project?.company ?? "");
  const [confidential, setConfidential] = useState(project?.confidential ?? false);
  const [when, setWhen] = useState<When>(
    project?.ongoing ? "ongoing" : project?.end_date ? "period" : "date"
  );
  const [start, setStart] = useState(toMonth(project?.release_date) || moment().format("YYYY-MM"));
  const [end, setEnd] = useState(toMonth(project?.end_date));
  const [extLink, setExternalLink] = useState(project?.external_link ?? "");
  const [github, setGithub] = useState(project?.github ?? "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const { getTranslation } = useLangContext();

  const canCapture = /^https?:\/\//.test(extLink);

  const capture = async () => {
    setCapturing(true);
    try {
      setThumbnail(await captureWebsite(extLink));
    } catch (error: any) {
      toast.error(error.message);
    }
    setCapturing(false);
  };

  const submitProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      // The image is optional: without one, a new project with a website link
      // gets a screenshot of it, otherwise the card shows a generated cover
      let image = thumbnail;
      if (!image && !editing && canCapture) {
        image = await captureWebsite(extLink).catch(() => null);
      }

      let thumbnailRef = project?.thumbnail.ref ?? "";
      if (image) {
        thumbnailRef = `projects/${image.name}`;
        await uploadFile(image, thumbnailRef);
      }

      const endDate = when === "period" ? fromMonth(end) : "";
      const ongoing = when === "ongoing";

      const data: Project = {
        name,
        thumbnail: { ref: thumbnailRef },
        category,
        kind,
        // Kept empty for personal projects so an edit can clear them
        company: kind === "pro" ? company : "",
        role: kind === "pro" ? role : "",
        description,
        external_link: extLink,
        release_date: fromMonth(start),
        // Firestore rejects undefined: only store the period fields when used
        ...(endDate ? { end_date: endDate } : {}),
        ...(ongoing ? { ongoing } : {}),
        github,
      };

      // Only pro projects can be confidential
      const target = kind === "pro" && confidential && vaultCode ? vaultCode : undefined;
      const source = project?.confidential && vaultCode ? vaultCode : undefined;

      if (editing && target === source) {
        // Clearing the period on edit must remove the old values
        await updateProject({ ...data, id: project.id, end_date: endDate, ongoing }, target);
      } else {
        await addProject(data, target);
        // Visibility changed: the project moves to the other collection, image kept
        if (editing) await deleteProject(project, source, true);
      }

      toast.success(getTranslation("portfolio--add-success"));
      onClose();
      refresh();
    } catch (error: any) {
      toast.error(getTranslation("portfolio--add-error"));
    }
    setLoading(false);
  };

  const currentImage = thumbnail
    ? [thumbnail]
    : project && hasThumbnail(project)
    ? [project.thumbnail.url as string]
    : null;

  return (
    <Modal
      title={editing ? "Edit project" : "New project"}
      subtitle="Only the name and the description are required."
      submitText={editing ? "Save" : "Add project"}
      loading={loading}
      onClose={onClose}
      onSubmit={submitProject}
      size="lg"
    >
      {/* What */}
      <Choice
        id="kind"
        value={kind}
        onChange={setKind}
        options={[
          { value: "personal", label: "Personal" },
          { value: "pro", label: "Pro" },
        ]}
      />
      <FormField label="Name" required>
        <Input value={name} onChange={(e) => setName(e.currentTarget.value)} css={fieldStyles} />
      </FormField>
      {kind === "pro" && (
        <FormField label="Visibility">
          {vaultCode ? (
            <Choice
              id="visibility"
              value={confidential ? "confidential" : "public"}
              onChange={(v) => setConfidential(v === "confidential")}
              options={[
                { value: "public", label: "Public" },
                { value: "confidential", label: "Confidential (recruiters only)" },
              ]}
            />
          ) : (
            <Text color="muted" fontSize="sm">
              Set a recruiter code first to make projects confidential.
            </Text>
          )}
        </FormField>
      )}
      {kind === "pro" && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <FormField label="Role">
            <Input placeholder="Lead developer" value={role} onChange={(e) => setRole(e.currentTarget.value)} css={fieldStyles} />
          </FormField>
          <FormField label="Company (public)">
            <Input placeholder="Optional" value={company} onChange={(e) => setCompany(e.currentTarget.value)} css={fieldStyles} />
          </FormField>
        </SimpleGrid>
      )}
      <FormField label="Description" required>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={3}
          css={fieldStyles}
        />
      </FormField>
      <FormField label="Category">
        <Choice id="category" value={category} onChange={setCategory} options={CATEGORIES} />
      </FormField>

      {/* When */}
      <FormField label="When">
        <Stack gap="3" w="full">
          <Choice
            id="when"
            value={when}
            onChange={setWhen}
            options={[
              { value: "date", label: "Single date" },
              { value: "period", label: "Period" },
              { value: "ongoing", label: "Ongoing" },
            ]}
          />
          <SimpleGrid columns={when === "period" ? 2 : 1} gap="3" maxW={{ md: when === "period" ? "full" : "50%" }}>
            <Input
              type="month"
              aria-label={when === "date" ? "Date" : "Start"}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              css={fieldStyles}
            />
            {when === "period" && (
              <Input
                type="month"
                aria-label="End"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                required
                css={fieldStyles}
              />
            )}
          </SimpleGrid>
        </Stack>
      </FormField>

      {/* Links */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <FormField label="Website">
          <InputGroup startElement={<LuGlobe />}>
            <Input placeholder="https://" value={extLink} onChange={(e) => setExternalLink(e.currentTarget.value)} css={fieldStyles} />
          </InputGroup>
        </FormField>
        <FormField label="GitHub">
          <InputGroup startElement={<AiFillGithub />}>
            <Input placeholder="https://github.com/…" value={github} onChange={(e) => setGithub(e.currentTarget.value)} css={fieldStyles} />
          </InputGroup>
        </FormField>
      </SimpleGrid>

      {/* Image, last because it is optional */}
      <FormField label="Image">
        <Stack gap="3" w="full">
          <ImageDrop
            limit={1}
            height={{ base: "160px", md: "200px" }}
            images={currentImage}
            setImages={(images) => setThumbnail(images ? images[0] : null)}
          />
          <Flex gap="3" align="center" wrap="wrap">
            <Button
              variant="outline"
              h="9"
              px="4"
              fontSize="sm"
              disabled={!canCapture}
              loading={capturing}
              onClick={capture}
            >
              <LuCamera />
              Capture the website
            </Button>
            <Text color="muted" fontSize="xs">
              No image? The website is captured on save, or a cover is generated.
            </Text>
          </Flex>
        </Stack>
      </FormField>
    </Modal>
  );
};

export default ProjectFormModal;
