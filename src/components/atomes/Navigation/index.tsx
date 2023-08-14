"use client";

import { useEffect, useState } from "react";
import { AiFillHome } from "react-icons/ai";
import { BiSolidDownArrow } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";

import Image from "next/image";

import "./style.scss";
import Tabs from "../Tabs";
import AuthModal from "../Modal/variants/AuthModal";

import { useAuthContext } from "@/contexts/AuthContext";
import { signOut } from "@/firebase/authentication";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLangContext } from "@/contexts/LangContext";

interface NavigationProps {
  tabs: Tab[];

  hideRight?: boolean;
}

const Navigation = ({ tabs, hideRight }: NavigationProps) => {
  const [width, setWidth] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);

  const { user } = useAuthContext();
  const { updateLang, lang, getTranslation } = useLangContext();
  const router = useRouter();

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
          <Tabs elements={tabs} onClick={() => setIsMenuOpen(false)} />
          <div>
            {user && (
              <Link
                href={"/blog"}
                style={{
                  backgroundColor: "#fbd52b",
                }}
              >
                Blog
              </Link>
            )}
            <button
              onClick={() => (user ? signOut() : setAuthOpen(true))}
              style={{
                backgroundColor: user ? "#963696" : "#FF007F",
              }}
            >
              {user ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      )}
      {isAuthOpen && <AuthModal setOpen={setAuthOpen} />}
      <div className="navbar__left">
        {width >= 1280 ? (
          <Link href="/#" className="navbar__toggle" id="mobile-menu">
            <AiFillHome />
          </Link>
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
      {width >= 1280 && (
        <div
          className="navbar__middle"
          style={{
            margin: hideRight ? 0 : "auto",
            display: hideRight ? "flex" : "initial",
            alignItems: hideRight ? "center" : "initial",
          }}
        >
          <Tabs elements={tabs} />
          {hideRight && (
            <button
              className="navbar_auth"
              onClick={() =>
                user
                  ? signOut().then(() => router.push("/"))
                  : setAuthOpen(true)
              }
              style={{
                backgroundColor: user ? "#963696" : "#FF007F",
              }}
            >
              {user ? "Logout" : "Login"}
            </button>
          )}
        </div>
      )}
      {!hideRight && (
        <div className="navbar__right">
          <div className="navbar__language">
            <select
              id="language"
              value={lang}
              onChange={(e) => updateLang(e.target.value)}
            >
              <option value="en">
                {width >= 768
                  ? getTranslation("lang--english")
                  : getTranslation("lang--english").substring(0, 2)}
              </option>
              <option value="fr">
                {width >= 768
                  ? getTranslation("lang--french")
                  : getTranslation("lang--french").substring(0, 2)}
              </option>
              <option value="es">
                {width >= 768
                  ? getTranslation("lang--spanish")
                  : getTranslation("lang--spanish").substring(0, 2)}
              </option>
              <option value="kr">
                {width >= 768
                  ? getTranslation("lang--korean")
                  : getTranslation("lang--korean").substring(0, 2)}
              </option>
            </select>
            <BiSolidDownArrow />
          </div>
          <Link href="#contact-me">
            {getTranslation("tabs--contact-me")}
            <Image
              src="/assets/images/icons/arrow_link.svg"
              alt="link-arrow"
              width={width < 728 ? 24 : 32}
              height={width < 728 ? 24 : 32}
            />
          </Link>
          {width >= 1280 && (
            <button
              className="navbar_auth"
              onClick={() => (user ? signOut() : setAuthOpen(true))}
              style={{
                backgroundColor: user ? "#963696" : "#FF007F",
              }}
            >
              {user ? "Logout" : "Login"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
