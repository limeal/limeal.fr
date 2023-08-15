"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

import Modal from "../..";
import { InputContainer } from "../../InputContainer";
import ImageDrop from "../../../ImageDrop";
import { uploadFile } from "@/firebase/storage";
import { addArticle } from "@/firebase/store/article";
import moment from "moment";

import "./style.scss";
import { useLangContext } from "@/contexts/LangContext";

const AddArticleModal = ({
  setOpen,
  refresh,
}: {
  setOpen: (open: boolean) => void;
  refresh: () => void;
}) => {
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<Array<File> | null>(null);
  const [creationDate, setCreationDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [published, setPublished] = useState(false);
  const [geo, setGeo] = useState<any>(null);

  const [title, setTitle] = useState<Map<string, string>>(new Map());
  const [lore, setLore] = useState<Map<string, string>>(new Map());
  const [content, setContent] = useState<Map<string, string>>(new Map());

  const [editLang, setEditLang] = useState("");
  const [defaultLang, setDefaultLang] = useState("");

  const { lang, langs } = useLangContext();

  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    setEditLang(lang);
  }, [lang]);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const submitArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (!images) throw new Error("You must add at least one image!");
      for (const image of images) {
        await uploadFile(image, `articles/${image.name}`);
      }

      if (!defaultLang) {
        throw new Error("You must select a default language!");
      }

      await addArticle({
        translations: langs.reduce((acc, lang) => {
          if (!title.get(lang) || !lore.get(lang) || !content.get(lang)) {
            return acc;
          }

          return {
            ...acc,
            [lang]: {
              title: title.get(lang) || "",
              lore: lore.get(lang) || "",
              content: content.get(lang) || "",
            },
          };
        }, {}),
        defaultLanguage: defaultLang,
        slug,
        images: images
          ? images.map((image) => ({
              ref: `articles/${image.name}`,
            }))
          : [],
        place: {
          country: geo.value.terms[geo.value.terms.length - 1].value,
          city:
            geo.value.terms.length >= 2
              ? geo.value.terms[geo.value.terms.length - 2].value
              : "",
          address: geo.value.description,
        },
        created_at: creationDate,
        published,
      });

      toast.success("You successfully added a new article to the blog!");
      setOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(
        "message" in error ? error.message : "Failed to add a new article!"
      );
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Create Article"
      lore="their properties"
      buttonText="Create"
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={submitArticle}
      overrideStyle={{
        form: {
          width: width < 1280 ? "100%" : "1000px",
        },
        body: {
          gap: "20px",
        },
      }}
      inputs={[
        <div key={0} className="first-row">
          <InputContainer>
            <ImageDrop
              width={width < 1280 ? width - 80 : 500}
              height={200}
              images={images}
              setImages={setImages}
            />
          </InputContainer>
          <div>
            <InputContainer label="Date">
              <input
                type="date"
                value={creationDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCreationDate(e.target.value)}
                required
              />
            </InputContainer>
            <InputContainer label="Slug">
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.currentTarget.value)}
                required
              />
            </InputContainer>
            <InputContainer label="Published">
              <select
                value={published ? "true" : "false"}
                onChange={(e) => setPublished(e.target.value === "true")}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </InputContainer>
          </div>
        </div>,
        <div
          key={1}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div className="languages-row">
            <ul className="languages">
              {langs.map((name, index) => (
                <li
                  key={index}
                  className={editLang === name ? "active" : ""}
                  onClick={() => setEditLang(editLang === name ? "" : name)}
                >
                  {name.replace("_", " ")}
                </li>
              ))}
            </ul>
            <InputContainer label="Default Language ?">
              <input
                type="checkbox"
                checked={defaultLang === editLang}
                onChange={(e) => setDefaultLang(editLang)}
              />
            </InputContainer>
          </div>
          <div className="third-row">
            <InputContainer label="Name" style={{ flex: 1 }}>
              <input
                type="text"
                name="title"
                value={title.get(editLang) || ""}
                onChange={(e) =>
                  setTitle(
                    new Map([...title, [editLang, e.currentTarget.value]])
                  )
                }
                required
              />
            </InputContainer>
            <InputContainer label="Geo" style={{ flex: 1 }}>
              <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}
                apiOptions={{ language: editLang }}
                selectProps={{
                  value: geo,
                  onChange: setGeo,
                }}
              />
            </InputContainer>
          </div>
          <InputContainer label="Lore">
            <input
              type="text"
              name="lore"
              value={lore.get(editLang) || ""}
              onChange={(e) =>
                setLore(new Map([...lore, [editLang, e.currentTarget.value]]))
              }
              required
            />
          </InputContainer>
          <InputContainer label="Content">
            <textarea
              name="content"
              value={content.get(editLang) || ""}
              onChange={(e) =>
                setContent(
                  new Map([...content, [editLang, e.currentTarget.value]])
                )
              }
              style={{ height: width < 1280 ? "100px" : "300px" }}
              required
            />
          </InputContainer>
        </div>,
      ]}
    />
  );
};

export default AddArticleModal;
