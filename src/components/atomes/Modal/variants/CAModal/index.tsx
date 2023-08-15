"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

import Modal from "../..";
import { InputContainer } from "../../InputContainer";
import ImageDrop from "../../../ImageDrop";
import { uploadFile } from "@/firebase/storage";
import { addArticle, updateArticle } from "@/firebase/store/article";
import moment from "moment";

import "./style.scss";
import { useLangContext } from "@/contexts/LangContext";
import Article from "@/interfaces/article";
import { getCurrentTimeInFormat } from "@/utils/time";
import { sendEmailNewArticle } from "@/utils/article";

const ArticleModal = ({
  mode,
  article,
  setOpen,
  refresh,
}: {
  mode: "create" | "edit";
  article?: Article | null;
  setOpen: (open: boolean) => void;
  refresh: () => void;
}) => {
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<Array<File | string> | null>(null);
  const [creationDate, setCreationDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [published, setPublished] = useState(false);

  const [title, setTitle] = useState<Map<string, string>>(new Map());
  const [lore, setLore] = useState<Map<string, string>>(new Map());
  const [content, setContent] = useState<Map<string, string>>(new Map());
  const [geo, setGeo] = useState<Map<string, any>>(new Map());

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
        if (typeof image === "string") continue;
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

              place: {
                country: geo.get(lang).split(", ")[
                  geo.get(lang).split(", ").length - 1
                ],
                city:
                  geo.get(lang).split(", ").length >= 2
                    ? geo.get(lang).split(", ")[
                        geo.get(lang).split(", ").length - 2
                      ]
                    : "",
                address: geo.get(lang),
              },
            },
          };
        }, {}),
        defaultLanguage: defaultLang,
        slug,
        images: images
          ? images
              .filter((i) => typeof i !== "string")
              .map((image) => {
                if (typeof image === "string") return { ref: image };

                return {
                  ref: `articles/${image.name}`,
                };
              })
          : [],
        created_at: creationDate,
        published,
      });

      if (published) {
        toast.promise(
          sendEmailNewArticle(title.get(defaultLang) || "", slug),
          {
            pending: "Sending email to subscribers...",
            success: "Email sent!",
            error: "Failed to send email!",
          }
        );
      }

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

  const editArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!article) return;

    setLoading(true);
    try {
      let imagePath = article?.images.map((image) => image.ref) || [];

      if (images) {
        imagePath = [];
        for (const image of images) {
          if (typeof image === "string") continue;
          await uploadFile(image, `articles/${image.name}`);
          imagePath.push(`articles/${image.name}`);
        }
      }

      console.log(imagePath);

      await updateArticle({
        id: article.id,
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
              place: {
                country: geo.get(lang).split(", ")[
                  geo.get(lang).split(", ").length - 1
                ],
                city:
                  geo.get(lang).split(", ").length >= 2
                    ? geo.get(lang).split(", ")[
                        geo.get(lang).split(", ").length - 2
                      ]
                    : "",
                address: geo.get(lang),
              },
            },
          };
        }, {}),
        defaultLanguage: defaultLang,
        slug,
        images: imagePath.map((path) => ({
          ref: `${path}`,
        })),
        created_at: creationDate,
        published,
      });

      toast.success("You successfully edit this article!");
      setOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(
        "message" in error ? error.message : "Failed to edit article!"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (article) {
      setSlug(article.slug);
      setCreationDate(getCurrentTimeInFormat(article.created_at));
      setPublished(article.published);
      setImages([...article.images.map((image) => image.url || "")]);

      langs.forEach((lang) => {
        if (article.translations[lang]) {
          setTitle((prev) => prev.set(lang, article.translations[lang].title));
          setLore((prev) => prev.set(lang, article.translations[lang].lore));
          setContent((prev) =>
            prev.set(lang, article.translations[lang].content)
          );
          setGeo((prev) =>
            prev.set(lang, article.translations[lang].place?.address)
          );
        }
      });

      setDefaultLang(article.defaultLanguage);
    }
  }, [article, langs]);

  return (
    <Modal
      title={mode === "create" ? "Create an article" : "Edit an article"}
      lore={mode === "create" ? "their properties" : "their new properties"}
      buttonText={mode === "create" ? "Create" : "Edit"}
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={mode === "create" ? submitArticle : editArticle}
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
              width={width < 1280 ? width - 80 : 400}
              height={width < 1280 ? 300 : 200}
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
            <InputContainer label="Name" style={width >= 768 ? { flex: 1 } : {}}>
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
            <InputContainer
              label="Geo (Address, City, Country)"
              style={width >= 768 ? { flex: 1 } : {}}
            >
              <input
                type="text"
                name="geo"
                value={geo.get(editLang) || ""}
                onChange={(e) =>
                  setGeo(new Map([...geo, [editLang, e.currentTarget.value]]))
                }
                required
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
              style={{ height: width < 1280 ? "100px" : "200px" }}
              required
            />
          </InputContainer>
        </div>,
      ]}
    />
  );
};

export default ArticleModal;
