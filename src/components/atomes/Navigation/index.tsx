"use client";

import { useEffect, useState } from "react";
import { AiFillHome } from "react-icons/ai";
import { BiSolidDownArrow } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";

import Image from "next/image";
import { useRouter } from "next/navigation";

import "./style.scss";
import Tabs from "../Tabs";
import AuthModal from "../AuthModal";

import getTranslation from "@/utils/lang";
import { useAuthContext } from "@/contexts/AuthContext";
import { signOut } from "@/firebase/authentication";

interface NavigationProps {
  lang: string;
  setLang: (language: string) => void;
}

const Navigation = ({ lang, setLang }: NavigationProps) => {
  const [width, setWidth] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);

  const router = useRouter();
  const { user } = useAuthContext();

  const updateDimension = () => {
    if (window.innerWidth >= 1280) setIsMenuOpen(false);
    setWidth(window.innerWidth);
  };

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
          <button
            onClick={() => (user ? signOut() : setAuthOpen(true))}
            style={{
              backgroundColor: user ? "#963696" : "#FF007F",
            }}
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      )}
      {isAuthOpen && <AuthModal setOpen={setAuthOpen} />}
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
          <Image
            src="/assets/images/logo.png"
            alt="logo"
            width={width < 728 ? 28 : 44}
            height={width < 728 ? 28 : 44}
          />
          <h1>{user ? "Paul." : "Limeal."}</h1>
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
          <Image
            src="/assets/images/icons/arrow_link.svg"
            alt="link-arrow"
            width={width < 728 ? 24 : 32}
            height={width < 728 ? 24 : 32}
          />
        </a>
        {width >= 1280 && (
          <button
            onClick={() => (user ? signOut() : setAuthOpen(true))}
            style={{
              backgroundColor: user ? "#963696" : "#FF007F",
            }}
          >
            {user ? "Logout" : "Login"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
