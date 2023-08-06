"use client";

import { useState } from "react";
import { AiFillGithub } from "react-icons/ai";
import { BsDiscord } from "react-icons/bs";

import "./style.scss";
import getTranslation from "@/utils/lang";

export default ({ lang }: { lang: string }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [type, setType] = useState("web");

  const onFormSubmit = async (e: any) => {
    e.preventDefault();

    console.log('Sending email...');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Type:', type);
    console.log('Document:', document);

    /* await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: email,
        name,
        service: type,
        document
      })
    }); */
  };

  return (
    <section className="contact-me" id="contact-me">
      <div className="left">
        <div>
          <h1>{getTranslation(lang, 'contact-me--title')}</h1>
          <p>
          {getTranslation(lang, 'contact-me--description')}
          </p>
        </div>
        <form onSubmit={onFormSubmit}>
          <div>
            <label>
              <span>01</span>{getTranslation(lang, 'contact-me--q1')}
            </label>
            <input type="text" placeholder="Type your full name" required value={name} onChange={(e) => setName(e.currentTarget.value)}/>
          </div>
          <div>
            <label>
              <span>02</span>{getTranslation(lang, 'contact-me--q2')}
            </label>
            <input type="email" placeholder="example@mail.com" required value={email} onChange={(e) => setEmail(e.currentTarget.value)}/>
          </div>
          <div>
            <label>
              <span>03</span>{getTranslation(lang, 'contact-me--q3')}
            </label>
            <select onChange={(e) => setType(e.target.value)} value={type}>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="software">Software Development</option>
              <option value="game">Game Development</option>
              <option value="minecraft">
                Minecraft Development (Plugins, Mods, etc...)
              </option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>
              <span>04</span>{getTranslation(lang, 'contact-me--q4')}
            </label>
            <input type="file" accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" required value={document?.name} onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}/>
          </div>
          <button type="submit">{getTranslation(lang, 'contact-me--button')}<img src="/assets/images/icons/arrow_link.svg" alt="link-arrow" /></button>
        </form>
      </div>
      <div className="right">
        <img src="/assets/images/intouch.png" alt="contact-me-image" />
        <ul>
          <li>
            <a href="https://github.com/limeal" target="_blank">
              <AiFillGithub />
            </a>
          </li>
          <li>
            <a href="https://discord.gg/8QXZQ5Q" target="_blank">
              <BsDiscord />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};
