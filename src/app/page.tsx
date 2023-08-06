'use client';

import Hero from "@/components/molecules/Hero";
import Navigation from "@/components/atomes/Navigation";
import { useState } from "react";
import Skills from "@/components/molecules/Skills";
import Portfolio from "@/components/molecules/Portfolio";
import Testimonial from "@/components/molecules/Testimonial";
import ContactMe from "@/components/molecules/ContactMe";
import Credits from "@/components/atomes/Credits";

export default () => {

  const [lang, setLang] = useState('en');

  return (
    <>
      <header>
        <Navigation lang={lang} setLang={setLang} />
      </header>
      <main>
        <Hero lang={lang} />
        <Skills lang={lang} />
        <Portfolio lang={lang} />
        {/* <Testimonial lang={lang} /> */}
        <ContactMe lang={lang} /> 
      </main>
      <footer>
        <Credits />
      </footer>
    </>
  );
}
