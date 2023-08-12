'use client';

import Hero from "@/components/molecules/Hero";
import Navigation from "@/components/atomes/Navigation";
import { useState } from "react";
import Skills from "@/components/molecules/Skills";
import Portfolio from "@/components/molecules/DataSection/Portfolio";
import ContactMe from "@/components/molecules/ContactMe";
import Credits from "@/components/atomes/Credits";
import { defaultTabs } from "@/utils/constant";

const Page = () => {

  const [lang, setLang] = useState('en');

  return (
    <>
      <header>
        <Navigation tabs={defaultTabs} lang={lang} setLang={setLang} />
      </header>
      <main>
        <Hero lang={lang} />
        <Skills lang={lang} />
        <Portfolio lang={lang} />
        <ContactMe lang={lang} /> 
      </main>
      <footer>
        <Credits />
      </footer>
    </>
  );
}

export default Page;
