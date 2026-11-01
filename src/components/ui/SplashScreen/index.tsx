"use client";

import Image from "next/image";
import { Box, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

import { useBrand } from "@/contexts/BrandContext";
import { EASE_OUT } from "../Reveal";

// Full-screen intro shown while Firebase resolves the auth state.
// Mount it inside <AnimatePresence> so it can wipe away upwards.
export const SplashScreen = () => {
  const brand = useBrand();

  return (
  <Box asChild position="fixed" inset="0" zIndex="2000" bg="ink" display="grid" placeItems="center">
    <motion.div
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <Box position="absolute" inset="0" opacity="0.05" pointerEvents="none">
        <Image src="/assets/images/pattern.svg" alt="" fill style={{ objectFit: "cover" }} priority />
      </Box>

      <motion.div
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <VStack gap="6">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
          >
            <Image src={brand.logo} alt={brand.name} width={88} height={88} priority />
          </motion.div>

          <Box overflow="hidden">
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 }}
            >
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" textTransform="uppercase" letterSpacing="-0.02em">
                <Text as="span" color="lime">
                  Paul
                </Text>
                {!brand.discreet && " (Limeal)"}
              </Text>
            </motion.div>
          </Box>

          {/* Indeterminate progress line */}
          <Box position="relative" w="160px" h="2px" bg="line" borderRadius="full" overflow="hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 0,
                width: "50%",
                background: "var(--chakra-colors-lime)",
                borderRadius: 9999,
              }}
            />
          </Box>
        </VStack>
      </motion.div>
    </motion.div>
  </Box>
);
};

export default SplashScreen;
