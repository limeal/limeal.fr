"use client";

import { useEffect, useState } from "react";
import { AiFillGithub, AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsDiscord } from "react-icons/bs";

import "./style.scss";
import getTranslation from "@/utils/lang";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

const ContactMe = ({ lang }: { lang: string }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("web");

  const [loading, setLoading] = useState(false);

  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const onFormSubmit = (e: any) => {
    e.preventDefault();

    if (!document) return;
    if (loading) return;

    setLoading(true);
    fetch("/api/send-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        name,
        service: type,
        content,
      }),
    }).then((res) => {
      if (res.status === 200) {
        toast.success(getTranslation(lang, "contact-me--success"));
      } else {
        toast.error(getTranslation(lang, "contact-me--error"));
      }
      setLoading(false);
    }).catch(() => {
      toast.error(getTranslation(lang, "contact-me--error"));
      setLoading(false);
    });
  };

  return (
    <section className="contact-me" id="contact-me">
      <div className="left">
        <div>
          <h1>{getTranslation(lang, "contact-me--title")}</h1>
          <p>{getTranslation(lang, "contact-me--description")}</p>
        </div>
        <form onSubmit={onFormSubmit}>
          <div>
            <label>
              <span>01</span>
              {getTranslation(lang, "contact-me--q1")}
            </label>
            <input
              type="text"
              disabled={loading}
              placeholder="Type your full name"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>
          <div>
            <label>
              <span>02</span>
              {getTranslation(lang, "contact-me--q2")}
            </label>
            <input
              type="email"
              disabled={loading}
              placeholder="example@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </div>
          <div>
            <label>
              <span>03</span>
              {getTranslation(lang, "contact-me--q3")}
            </label>
            <select
              onChange={(e) => setType(e.target.value)}
              value={type}
              disabled={loading}
            >
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Software Development">Software Development</option>
              <option value="Game Development">Game Development</option>
              <option value="Minecraft Addons">
                Minecraft Development (Plugins, Mods, etc...)
              </option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label>
              <span>04</span>
              {getTranslation(lang, "contact-me--q4")}
            </label>
            <textarea
              disabled={loading}
              placeholder="I want..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="loading" />
            ) : (
              <>
                {getTranslation(lang, "contact-me--button")}
                <Image
                  src="/assets/images/icons/arrow_link.svg"
                  alt="link-arrow"
                  width={width < 1280 ? 20 : 24}
                  height={width < 1280 ? 20 : 24}
                />
              </>
            )}
          </button>
        </form>
      </div>
      <div className="right">
        {width >= 1280 && (
          <Image
            src="/assets/images/intouch.png"
            alt="contact-me-image"
            width={196}
            height={200}
            style={{
              display: "block",
              marginLeft: "40px",
            }}
          />
        )}
        <ul>
          <li>
            <Link href="https://github.com/limeal" target="_blank" title="Github">
              <AiFillGithub />
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                navigator.clipboard.writeText("limeal");
                toast.info(getTranslation(lang, "contact-me--discord-copied"));
              }}
              title="Discord"
            >
              <BsDiscord />
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default ContactMe;
