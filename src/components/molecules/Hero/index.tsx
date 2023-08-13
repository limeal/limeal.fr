"use client";

import Tabs from "@/components/atomes/Tabs";
import "./style.scss";
import getTranslation from "@/utils/lang";
import Image from "next/image";

import { useAuthContext } from "@/contexts/AuthContext";
import { BsBookHalf } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { defaultTabs } from "@/utils/constant";
import { useEffect, useRef, useState } from "react";

const Hero = ({ lang }: { lang?: string }) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const ref = useRef<HTMLUListElement>(null);

  const minSwipeDistance = 40;

  const onTouchStart = (e: any) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: any) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (!ref.current) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const size = parseInt(ref.current.style.right.replace(/[^0-9]/g, ""));

    if (isLeftSwipe) {
      // Move to left
      ref.current.style.right = size + distance > 1166 ? "1166px" : size + distance + "px";
    } else if (isRightSwipe) {
      ref.current.style.right = 
        size + distance < -198 ? "-198px" : size + distance + "px";
    }
  };

  return (
    <section className="hero" id="about-me">
      <div>
        <Image
          className="hero__pattern"
          src="/assets/images/pattern.svg"
          alt="hero"
          width={0}
          height={0}
        />
        <div className="hero__content">
          <div className="hero__content__left">
            <div className="hero__content__left__title">
              <h1>{user ? "Paul" : "Limeal"}</h1>
              <h2>{getTranslation(lang || "en", "hero--job")}</h2>
            </div>

            <div className="hero__content__left__reviews">
              <div>
                <ul>
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <li
                        key={index}
                        style={{
                          left: `${index * 30}px`,
                        }}
                      >
                        <Image
                          className="hero__content__left__reviews--image"
                          src={`/assets/images/testimonials/${index + 1}.png`}
                          alt={`fc-${index + 1}`}
                          width={0}
                          height={0}
                          sizes="100vw"
                        />
                      </li>
                    ))}
                </ul>
                <div>
                  <Image
                    className="hero__content__left__reviews--image"
                    src="/assets/images/icons/little_star_border.svg"
                    alt="quote"
                    width={0}
                    height={0}
                    sizes="100vw"
                  />
                  <div>
                    <span>200+</span>
                    <p>
                      {getTranslation(lang || "en", "hero--satisfied--title")}
                    </p>
                  </div>
                </div>
              </div>
              <p>{getTranslation(lang || "en", "hero--satisfied--content")}</p>
            </div>

            <Tabs
              lang={lang}
              elements={[
                ...defaultTabs,
                {
                  href: "#contact-me",
                  tid: "tabs--contact-me",
                  type: "link",
                },
              ]}
            />
          </div>
          <div className="hero__content__right">
            <div>
              <Image
                sizes="100vw"
                className="hero__content__right__man"
                src="/assets/images/businessmann.png"
                alt="hero-image"
                width={0}
                height={0}
              />
              <Image
                sizes="100vw"
                className="hero__content__right__head"
                src="/assets/images/logo.png"
                alt="head"
                width={0}
                height={0}
              />
              <div>
                <Image
                  sizes="100vw"
                  style={{ width: "100%", height: "100%" }}
                  src="/assets/images/icons/arrow_spiral.svg"
                  alt="quote"
                  width={0}
                  height={0}
                />
                <span>
                  {user ? (
                    <button onClick={() => router.push("/blog")}>
                      <BsBookHalf />
                    </button>
                  ) : (
                    getTranslation(lang || "en", "hero--image--quote")
                  )}
                </span>
              </div>
            </div>
            <p>{getTranslation(lang || "en", "hero--image--description")}</p>
          </div>
        </div>
      </div>
      <ul
        ref={ref}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          right: "598px",
          left: "initial",
        }}
      >
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <li key={index}>
              <Image
                sizes="100vw"
                src={`/assets/images/logos/${index + 1}.png`}
                alt={`fc-${index + 1}`}
                width={0}
                height={0}
              />
            </li>
          ))}
      </ul>
    </section>
  );
};

export default Hero;
