import Tabs from "@/components/atomes/Tabs";
import "./style.scss";
import getTranslation from "@/utils/lang";

export default ({ lang }: { lang?: string }) => {
  return (
    <section className="hero" id="about-me">
      <div>
        <img
          className="hero__pattern"
          src="/assets/images/pattern.svg"
          alt="hero"
        />
        <div className="hero__content">
          <div className="hero__content__left">
            <div className="hero__content__left__title">
              <h1>Limeal</h1>
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
                        <img
                          src={`/assets/images/testimonials/${index + 1}.png`}
                          alt={`fc-${index + 1}`}
                        />
                      </li>
                    ))}
                </ul>
                <div>
                  <img
                    src="/assets/images/icons/little_star_border.svg"
                    alt="quote"
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
              additionals={[
                {
                  id: "contact-me",
                  tid: "tabs--contact-me",
                },
              ]}
            />
          </div>
          <div className="hero__content__right">
            <div>
              <img src="/assets/images/businessmann.png" alt="hero-image" />
              <img
                className="hero__content__right__head"
                src="/assets/images/logo.png"
                alt="head"
              />
              <div>
                <img src="/assets/images/icons/arrow_spiral.svg" alt="quote" />
                <span>
                  {getTranslation(lang || "en", "hero--image--quote")}
                </span>
              </div>
            </div>
            <p>{getTranslation(lang || "en", "hero--image--description")}</p>
          </div>
        </div>
      </div>
      <ul>
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <li
              key={index}
            >
              <img
                src={`/assets/images/logos/${index + 1}.png`}
                alt={`fc-${index + 1}`}
              />
            </li>
          ))}
      </ul>
    </section>
  );
};
