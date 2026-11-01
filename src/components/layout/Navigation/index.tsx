"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { LuArrowUpRight, LuBookOpen, LuLogOut, LuMenu, LuX } from "react-icons/lu";

import { useAuthContext } from "@/contexts/AuthContext";
import { useLangContext } from "@/contexts/LangContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { useBrand } from "@/contexts/BrandContext";
import { signOut } from "@/firebase/authentication";
import type { NavLink } from "@/data/navigation";
import useActiveSection from "@/hooks/useActiveSection";
import Button from "@/components/ui/Button";
import NavLinks from "@/components/ui/NavLinks";
import { EASE_OUT } from "@/components/ui/Reveal";
import LanguageSelect from "./LanguageSelect";

type NavigationProps = {
  links?: NavLink[];
  hideContact?: boolean;
};

const Navigation = ({ links, hideContact }: NavigationProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user } = useAuthContext();
  const { isRecruiter } = useRecruiterAccess();
  const brand = useBrand();
  const { getTranslation } = useLangContext();
  const activeId = useActiveSection(links?.map((l) => l.href.replace("#", "")) ?? []);

  // Slide away while reading down, come back as soon as the user scrolls up
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 160 && !menuOpen);
    setScrolled(y > 10);
  });

  return (
    <>
      {/* Invisible strip along the top edge: pointing at it brings a hidden header back */}
      {hidden && (
        <Box position="fixed" top="0" left="0" right="0" h="24px" zIndex="sticky" onMouseEnter={() => setHovered(true)} />
      )}
      <Box asChild position="sticky" top="0" zIndex="sticky">
        <motion.header
          animate={{ y: hidden && !hovered ? "-100%" : "0%" }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Flex
            as="nav"
            h={{ base: 16, md: "72px" }}
            align="center"
            justify="space-between"
            gap="4"
            px={{ base: 4, md: 8, xl: 12 }}
            bg={scrolled || menuOpen ? "rgba(17, 16, 19, 0.72)" : "transparent"}
            backdropFilter={scrolled || menuOpen ? "saturate(180%) blur(20px)" : undefined}
            borderBottomWidth="1px"
            borderColor={scrolled ? "line" : "transparent"}
            transition="background 0.3s ease, border-color 0.3s ease"
          >
            <HStack gap="2">
              {links && (
                <IconButton
                  aria-label="Menu"
                  variant="plain"
                  color="white"
                  display={{ xl: "none" }}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <LuX /> : <LuMenu />}
                </IconButton>
              )}
              <HStack asChild gap="2">
                <NextLink href="/">
                  <Image src={brand.logo} alt={brand.name} width={32} height={32} />
                  <Text fontWeight="black" fontSize={{ base: "md", md: "xl" }} whiteSpace="nowrap">
                    Paul
                    {!brand.discreet && (
                      <Text as="span" color="muted" fontWeight="bold">
                        {" "}
                        (Limeal)
                      </Text>
                    )}
                  </Text>
                </NextLink>
              </HStack>
            </HStack>

            {links && (
              <NavLinks links={links} activeId={activeId} display={{ base: "none", xl: "flex" }} />
            )}

            <HStack gap={{ base: 1, md: 3 }}>
              <LanguageSelect />
              {user && (
                <>
                  {/* The blog is for friends' accounts, not recruiters */}
                  {!isRecruiter && (
                    <Button
                      href="/blog"
                      variant="ghost"
                      h="10"
                      px="4"
                      display={{ base: "none", md: "inline-flex" }}
                      icon={<LuBookOpen />}
                    >
                      Blog
                    </Button>
                  )}
                  <IconButton
                    aria-label={getTranslation("logout")}
                    title={getTranslation("logout")}
                    variant="plain"
                    color="muted"
                    _hover={{ color: "rose" }}
                    onClick={() => signOut()}
                  >
                    <LuLogOut />
                  </IconButton>
                </>
              )}
              {!hideContact && (
                <Button href="#contact-me" h={{ base: 9, md: 10 }} px={{ base: 4, md: 5 }} fontSize="sm" icon={<LuArrowUpRight />}>
                  {getTranslation("tabs--contact-me")}
                </Button>
              )}
            </HStack>
          </Flex>

          <AnimatePresence>
            {menuOpen && links && (
              <Box asChild bg="rgba(17, 16, 19, 0.92)" backdropFilter="blur(20px)" borderBottomWidth="1px" borderColor="line" overflow="hidden">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <Box px="6" py="8">
                    <NavLinks links={links} activeId={activeId} direction="column" onNavigate={() => setMenuOpen(false)} />
                    {user && !isRecruiter && (
                      <Button href="/blog" variant="outline" mt="8" icon={<LuBookOpen />}>
                        Blog
                      </Button>
                    )}
                  </Box>
                </motion.div>
              </Box>
            )}
          </AnimatePresence>
        </motion.header>
      </Box>
    </>
  );
};

export default Navigation;
