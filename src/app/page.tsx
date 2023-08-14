import Hero from "@/components/molecules/Hero";
import Navigation from "@/components/atomes/Navigation";
import Skills from "@/components/molecules/Skills";
import Portfolio from "@/components/molecules/DataSection/Portfolio";
import ContactMe from "@/components/molecules/ContactMe";
import Credits from "@/components/atomes/Credits";
import { defaultTabs } from "@/utils/constant";

const Page = () => {

  return (
    <>
      <header>
        <Navigation tabs={defaultTabs} />
      </header>
      <main>
        <Hero />
        <Skills />
        <Portfolio />
        <ContactMe /> 
      </main>
      <footer>
        <Credits />
      </footer>
    </>
  );
}

export default Page;
