"use client";

import { useEffect, useState } from "react";
import { AiFillHome } from "react-icons/ai";
import { BiSolidDownArrow } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";

import "./style.scss";
import Tabs from "../Tabs";
import getTranslation from "@/utils/lang";

interface NavigationProps {
  lang: string;
  setLang: (language: string) => void;
}

export default ({ lang, setLang }: NavigationProps) => {
  const [width, setWidth] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const updateDimension = () => {
    if (window.innerWidth >= 1280) setIsMenuOpen(false);
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  return (
    <nav className="navbar">
      {isMenuOpen && (
        <div className="navbar__mobile">
          <Tabs lang={lang} onClick={() => setIsMenuOpen(false)} />
        </div>
      )}
      <div className="navbar__left">
        {width >= 1280 ? (
          <a href="#" className="navbar__toggle" id="mobile-menu">
            <AiFillHome />
          </a>
        ) : (
          <button
            className="navbar__toggle"
            id="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <GiHamburgerMenu />
          </button>
        )}

        <div className="navbar__logo">
          <img src="/assets/images/logo.png" alt="logo" />
          <h1>Limeal.</h1>
        </div>
      </div>
      <div className="navbar__middle">
        <Tabs lang={lang} />
      </div>
      <div className="navbar__right">
        <div className="navbar__language">
          <select id="language" onChange={(e) => setLang(e.target.value)}>
            <option value="en">
              {width >= 768
                ? getTranslation(lang, "lang--english")
                : getTranslation(lang, "lang--english").substring(0, 2)}
            </option>
            <option value="fr">
              {width >= 768
                ? getTranslation(lang, "lang--french")
                : getTranslation(lang, "lang--french").substring(0, 2)}
            </option>
            <option value="es">
              {width >= 768
                ? getTranslation(lang, "lang--spanish")
                : getTranslation(lang, "lang--spanish").substring(0, 2)}
            </option>
            <option value="kr">
              {width >= 768
                ? getTranslation(lang, "lang--korean")
                : getTranslation(lang, "lang--korean").substring(0, 2)}
            </option>
          </select>
          <BiSolidDownArrow />
        </div>
        <a href="#contact-me">
          {getTranslation(lang, "tabs--contact-me")}
          <img src="/assets/images/icons/arrow_link.svg" alt="link-arrow" />
        </a>
      </div>
    </nav>
  );
};
