"use client";

import { useState } from "react";
import moment from "moment";
import { Box, Flex, Input, InputGroup, SimpleGrid, Stack, Text, Textarea } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { LuCamera, LuGlobe, LuLock } from "react-icons/lu";

import Project, { ProjectDetails } from "@/interfaces/project";
import { uploadFile } from "@/firebase/storage";
import { saveProject } from "@/firebase/store/project";
import { useLangContext } from "@/contexts/LangContext";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import ImageDrop from "@/components/ui/ImageDrop";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { toast } from "@/components/ui/Toaster";
import { captureWebsite } from "@/utils/screenshot";

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

const isPlaceholder = (url?: string) => !url || url.endsWith("/no-image.png");

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

const SectionTitle = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <Flex align="center" gap="2" pt="2" color="muted" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.15em">
    {icon}
    {children}
  </Flex>
);

// Creates a project, or edits `project` when given. For pro projects the public
// card stays anonymous; company, real name, links and image go to the vault.
const ProjectFormModal = ({
  project,
  vaultCode,
  onClose,
  refresh,
}: {
  project?: Project;
  // Admin's vault code, where the private details are stored
  vaultCode: string | null;
  onClose: () => void;
  refresh: () => void;
}) => {
  const editing = !!project;
  const details = project?.details;

  const [kind, setKind] = useState<"personal" | "pro">(project?.kind ?? "personal");
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState(project?.category ?? CATEGORIES[0].value);
  const [role, setRole] = useState(project?.role ?? "");
  const [company, setCompany] = useState(details?.company ?? "");
  const [realName, setRealName] = useState(details?.name ?? "");
  const [when, setWhen] = useState<When>(
    project?.ongoing ? "ongoing" : project?.end_date ? "period" : "date"
  );
  const [start, setStart] = useState(toMonth(project?.release_date) || moment().format("YYYY-MM"));
  const [end, setEnd] = useState(toMonth(project?.end_date));
  const [extLink, setExternalLink] = useState(details?.external_link || project?.external_link || "");
  const [github, setGithub] = useState(details?.github || project?.github || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const { getTranslation } = useLangContext();

  const isPro = kind === "pro";
  // Pro links and images are only stored once the vault exists
  const canStorePrivate = !isPro || !!vaultCode;
  const canCapture = /^https?:\/\//.test(extLink);

  // The image currently attached: the private one wins for pro projects
  const storedImage = isPro && details?.thumbnail?.ref ? details.thumbnail : project?.thumbnail;

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
      if (!image && !editing && canStorePrivate && canCapture) {
        image = await captureWebsite(extLink).catch(() => null);
      }

      let imageRef = storedImage?.ref ?? "";
      if (image) {
        imageRef = `projects/${image.name}`;
        await uploadFile(image, imageRef);
      }

      const endDate = when === "period" ? fromMonth(end) : "";
      const ongoing = when === "ongoing";
      // Pro: nothing identifying on the public card
      const privateFields = isPro && vaultCode;

      const publicCard: Project = {
        id: project?.id,
        legacyVault: project?.legacyVault,
        name,
        description,
        category,
        kind,
        role: isPro ? role : "",
        release_date: fromMonth(start),
        // Kept empty rather than removed, so an edit clears the old values
        end_date: endDate,
        ongoing,
        external_link: privateFields ? "" : extLink,
        github: privateFields ? "" : github,
        thumbnail: { ref: privateFields ? "" : imageRef },
      };

      const privateDetails: ProjectDetails | null = privateFields
        ? { company, name: realName, external_link: extLink, github, thumbnail: { ref: imageRef } }
        : null;

      await saveProject(publicCard, privateDetails, vaultCode);

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
    : storedImage && !isPlaceholder(storedImage.url)
    ? [storedImage.url as string]
    : null;

  return (
    <Modal
      title={editing ? "Edit project" : "New project"}
      subtitle="Only the title and the description are required."
      submitText={editing ? "Save" : "Add project"}
      loading={loading}
      onClose={onClose}
      onSubmit={submitProject}
      size="lg"
    >
      <Choice
        id="kind"
        value={kind}
        onChange={setKind}
        options={[
          { value: "personal", label: "Personal" },
          { value: "pro", label: "Pro" },
        ]}
      />

      {isPro && <SectionTitle>Visible to everyone</SectionTitle>}
      <SimpleGrid columns={{ base: 1, md: isPro ? 2 : 1 }} gap="4">
        <FormField label={isPro ? "Anonymous title" : "Name"} required>
          <Input
            placeholder={isPro ? "Fintech scale-up" : undefined}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            css={fieldStyles}
          />
        </FormField>
        {isPro && (
          <FormField label="Role">
            <Input placeholder="Lead developer" value={role} onChange={(e) => setRole(e.currentTarget.value)} css={fieldStyles} />
          </FormField>
        )}
      </SimpleGrid>
      <FormField label="Description" required>
        <Textarea
          value={description}
          placeholder={isPro ? "What you built and your impact, without naming the company" : undefined}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={3}
          css={fieldStyles}
        />
      </FormField>
      <FormField label="Category">
        <Choice id="category" value={category} onChange={setCategory} options={CATEGORIES} />
      </FormField>
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

      {isPro && <SectionTitle icon={<LuLock />}>Recruiters only</SectionTitle>}
      {!canStorePrivate ? (
        <Box p="4" borderRadius="12px" bg="surface.raised" color="muted" fontSize="sm">
          Open « Access & tracking » once to create the private space, then come back to add the company,
          links and image.
        </Box>
      ) : (
        <>
          {isPro && (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <FormField label="Company">
                <Input placeholder="Optional" value={company} onChange={(e) => setCompany(e.currentTarget.value)} css={fieldStyles} />
              </FormField>
              <FormField label="Real project name">
                <Input placeholder="Optional" value={realName} onChange={(e) => setRealName(e.currentTarget.value)} css={fieldStyles} />
              </FormField>
            </SimpleGrid>
          )}
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
          <FormField label="Image">
            <Stack gap="3" w="full">
              <ImageDrop
                limit={1}
                height={{ base: "160px", md: "200px" }}
                images={currentImage}
                setImages={(images) => setThumbnail(images ? images[0] : null)}
              />
              <Flex gap="3" align="center" wrap="wrap">
                <Button variant="outline" h="9" px="4" fontSize="sm" disabled={!canCapture} loading={capturing} onClick={capture}>
                  <LuCamera />
                  Capture the website
                </Button>
                <Text color="muted" fontSize="xs">
                  {isPro
                    ? "Without image, the public card shows a cover with the anonymous title."
                    : "No image? The website is captured on save, or a cover is generated."}
                </Text>
              </Flex>
            </Stack>
          </FormField>
        </>
      )}
    </Modal>
  );
};

export default ProjectFormModal;
