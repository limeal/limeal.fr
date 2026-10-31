"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, Container, Flex, HStack, Text } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useLangContext } from "@/contexts/LangContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { LuBookOpen } from "react-icons/lu";

import Button from "@/components/ui/Button";
import SocialLinks from "@/components/ui/SocialLinks";
import AuthModal from "@/components/features/auth/AuthModal";

const Footer = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuthContext();
  const { isRecruiter } = useRecruiterAccess();
  const { getTranslation } = useLangContext();

  return (
    <Box as="footer" borderTopWidth="1px" borderColor="line" py="10">
      {authOpen && <AuthModal setOpen={setAuthOpen} />}
      <Container maxW="7xl" px={{ base: 4, md: 8, xl: 12 }}>
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap="6">
          <HStack gap="3">
            <Image src="/assets/images/logo.png" alt="Limeal" width={28} height={28} />
            <Text color="muted" fontSize="sm">
              © {new Date().getFullYear()} · {getTranslation("credits--develop-by")} Paul (Limeal)
            </Text>
          </HStack>
          <HStack gap="6" wrap="wrap" justify="center">
            {user && !isRecruiter && (
              <Button href="/blog" variant="outline" h="9" px="4" fontSize="sm" icon={<LuBookOpen />}>
                Blog
              </Button>
            )}
            <SocialLinks size="sm" />
            {/* Discreet entry point: the public navbar no longer shows a login button */}
            {!user && (
              <Box
                as="button"
                color="whiteAlpha.400"
                fontSize="xs"
                cursor="pointer"
                _hover={{ color: "white" }}
                onClick={() => setAuthOpen(true)}
              >
                {getTranslation("login")}
              </Box>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
