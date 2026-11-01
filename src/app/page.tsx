import { Box } from "@chakra-ui/react";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Skills from "@/components/sections/Skills";
import Approach from "@/components/sections/Approach";
import Portfolio from "@/components/sections/Portfolio";
import Articles from "@/components/sections/Articles";
import Contact from "@/components/sections/Contact";
import RecruiterChat from "@/components/features/recruiter-chat/RecruiterChat";
import RecruiterAccessBanner from "@/components/features/portfolio/RecruiterAccessBanner";
import { homeLinks } from "@/data/navigation";
import { getAllPostMetas } from "@/utils/posts";

const Page = async () => {
  const posts = await getAllPostMetas();
  // No section (nor link to it) before the first article
  const links = posts.length > 0 ? homeLinks : homeLinks.filter((l) => l.href !== "#articles");

  return (
    <>
      <ScrollProgress />
      <Navigation links={links} />
      <main>
        <Hero />
        <Manifesto />
        <Skills />
        <Approach />
        {/* Closely related sections: one padding between them instead of two */}
        <Box css={{ "& > section + section": { pt: 0 } }}>
          <Portfolio />
          {posts.length > 0 && <Articles posts={posts} />}
          <Contact />
        </Box>
      </main>
      <Footer />
      <RecruiterChat />
      <RecruiterAccessBanner />
    </>
  );
};

export default Page;
