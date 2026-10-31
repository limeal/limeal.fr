import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Skills from "@/components/sections/Skills";
import Approach from "@/components/sections/Approach";
import Portfolio from "@/components/sections/Portfolio";
import Contact from "@/components/sections/Contact";
import RecruiterChat from "@/components/features/recruiter-chat/RecruiterChat";
import { homeLinks } from "@/data/navigation";

const Page = () => {
  return (
    <>
      <ScrollProgress />
      <Navigation links={homeLinks} />
      <main>
        <Hero />
        <Manifesto />
        <Skills />
        <Approach />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <RecruiterChat />
    </>
  );
};

export default Page;
