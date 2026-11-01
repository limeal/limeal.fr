"use client";

import { useState } from "react";
import moment from "moment";
import { Checkbox, Flex, Grid, Input, NativeSelect, Stack, Textarea } from "@chakra-ui/react";

import Article from "@/interfaces/article";
import { uploadFile } from "@/firebase/storage";
import { addArticle, updateArticle } from "@/firebase/store/article";
import { useLangContext } from "@/contexts/LangContext";
import { sendEmailNewArticle } from "@/utils/article";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import ImageDrop from "@/components/ui/ImageDrop";
import Pill from "@/components/ui/Pill";
import { toast } from "@/components/ui/Toaster";

// "Address, City, Country" → place object
const toPlace = (address: string) => {
  const parts = address.split(", ");
  return {
    country: parts[parts.length - 1],
    city: parts.length >= 2 ? parts[parts.length - 2] : "",
    address,
  };
};

const ArticleFormModal = ({
  mode,
  article,
  onClose,
  refresh,
}: {
  mode: "create" | "edit";
  article?: Article | null;
  onClose: () => void;
  refresh: () => void;
}) => {
  const { lang, langs } = useLangContext();

  // Per-language field of the edited article, as a Map lang → value
  const initial = (pick: (l: string) => string | undefined) =>
    new Map(
      article ? langs.filter((l) => article.translations[l]).map((l) => [l, pick(l) || ""]) : []
    );

  const [slug, setSlug] = useState(article?.slug ?? "");
  const [images, setImages] = useState<Array<File | string> | null>(
    article ? article.images.map((image) => image.url || "") : null
  );
  const [creationDate, setCreationDate] = useState(article?.created_at ?? moment().format("YYYY-MM-DD"));
  const [published, setPublished] = useState(article?.published ?? false);

  const [title, setTitle] = useState(() => initial((l) => article?.translations[l].title));
  const [lore, setLore] = useState(() => initial((l) => article?.translations[l].lore));
  const [content, setContent] = useState(() => initial((l) => article?.translations[l].content));
  const [geo, setGeo] = useState(() => initial((l) => article?.translations[l].place?.address));

  const [editLang, setEditLang] = useState(lang);
  const [defaultLang, setDefaultLang] = useState(article?.defaultLanguage ?? "");
  const [loading, setLoading] = useState(false);

  // Only the languages with a title, a lore and a content are saved
  const buildTranslations = () =>
    langs.reduce((acc, l) => {
      if (!title.get(l) || !lore.get(l) || !content.get(l)) return acc;

      return {
        ...acc,
        [l]: {
          title: title.get(l) || "",
          lore: lore.get(l) || "",
          content: content.get(l) || "",
          place: toPlace(geo.get(l) || ""),
        },
      };
    }, {});

  // Uploads the new files; already stored images (shown by URL) keep their ref
  const uploadImages = async () => {
    const paths: string[] = [];
    for (const image of images ?? []) {
      if (typeof image === "string") {
        const stored = article?.images.find((i) => i.url === image);
        if (stored) paths.push(stored.ref);
        continue;
      }
      await uploadFile(image, `articles/${image.name}`);
      paths.push(`articles/${image.name}`);
    }
    return paths;
  };

  const submitArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (!images) throw new Error("You must add at least one image!");
      const paths = await uploadImages();

      if (!defaultLang) {
        throw new Error("You must select a default language!");
      }

      await addArticle({
        translations: buildTranslations(),
        defaultLanguage: defaultLang,
        slug,
        images: paths.map((ref) => ({ ref })),
        created_at: creationDate,
        published,
      });

      if (published) {
        toast.promise(sendEmailNewArticle(title.get(defaultLang) || "", slug), {
          pending: "Sending email to subscribers...",
          success: "Email sent!",
          error: "Failed to send email!",
        });
      }

      toast.success("You successfully added a new article to the blog!");
      onClose();
      refresh();
    } catch (error: any) {
      toast.error("message" in error ? error.message : "Failed to add a new article!");
    }
    setLoading(false);
  };

  const editArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!article) return;

    setLoading(true);
    try {
      // Without a selection the stored refs are kept as-is
      const paths = images ? await uploadImages() : article.images.map((image) => image.ref);

      await updateArticle({
        id: article.id,
        translations: buildTranslations(),
        defaultLanguage: defaultLang,
        slug,
        images: paths.map((ref) => ({ ref })),
        created_at: creationDate,
        published,
      });

      toast.success("You successfully edit this article!");
      onClose();
      refresh();
    } catch (error: any) {
      toast.error("message" in error ? error.message : "Failed to edit article!");
    }
    setLoading(false);
  };

  const setFor =
    (setter: React.Dispatch<React.SetStateAction<Map<string, string>>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.currentTarget.value;
      setter((prev) => new Map([...prev, [editLang, value]]));
    };

  return (
    <Modal
      title={mode === "create" ? "Create an article" : "Edit an article"}
      subtitle={mode === "create" ? "with their properties" : "with their new properties"}
      submitText={mode === "create" ? "Create" : "Edit"}
      loading={loading}
      onClose={onClose}
      onSubmit={mode === "create" ? submitArticle : editArticle}
      size="xl"
    >
      <Grid templateColumns={{ base: "1fr", xl: "400px 1fr" }} gap="5">
        <ImageDrop images={images} setImages={setImages} height={{ base: "260px", xl: "100%" }} />
        <Stack gap="5">
          <FormField label="Date" required>
            <Input type="date" value={creationDate} onChange={(e) => setCreationDate(e.target.value)} css={fieldStyles} />
          </FormField>
          <FormField label="Slug" required>
            <Input value={slug} onChange={(e) => setSlug(e.currentTarget.value)} css={fieldStyles} />
          </FormField>
          <FormField label="Published">
            <NativeSelect.Root>
              <NativeSelect.Field
                value={published ? "true" : "false"}
                onChange={(e) => setPublished(e.currentTarget.value === "true")}
                css={fieldStyles}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </FormField>
        </Stack>
      </Grid>

      <Flex justify="space-between" align="center" wrap="wrap" gap="4">
        <Flex gap="2">
          {langs.map((name) => (
            <Pill
              key={name}
              active={editLang === name}
              textTransform="uppercase"
              onClick={() => setEditLang(editLang === name ? "" : name)}
            >
              {name}
            </Pill>
          ))}
        </Flex>
        <Checkbox.Root
          checked={defaultLang !== "" && defaultLang === editLang}
          onCheckedChange={() => setDefaultLang(editLang)}
          colorPalette="yellow"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Default Language ?</Checkbox.Label>
        </Checkbox.Root>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="5">
        <FormField label="Name" required>
          <Input value={title.get(editLang) || ""} onChange={setFor(setTitle)} css={fieldStyles} />
        </FormField>
        <FormField label="Geo (Address, City, Country)" required>
          <Input value={geo.get(editLang) || ""} onChange={setFor(setGeo)} css={fieldStyles} />
        </FormField>
      </Grid>
      <FormField label="Lore" required>
        <Input value={lore.get(editLang) || ""} onChange={setFor(setLore)} css={fieldStyles} />
      </FormField>
      <FormField label="Content" required>
        <Textarea
          value={content.get(editLang) || ""}
          onChange={setFor(setContent)}
          h={{ base: "100px", xl: "200px" }}
          css={fieldStyles}
        />
      </FormField>
    </Modal>
  );
};

export default ArticleFormModal;
