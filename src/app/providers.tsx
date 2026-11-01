"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { MotionConfig } from "framer-motion";

import { system } from "@/theme";
import type { Brand } from "@/data/brand";
import { BrandProvider } from "@/contexts/BrandContext";
import { LangContextProvider } from "@/contexts/LangContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { RecruiterAccessProvider } from "@/contexts/RecruiterAccessContext";
import Toaster from "@/components/ui/Toaster";

const Providers = ({ brand, children }: { brand: Brand; children: React.ReactNode }) => {
  return (
    <ChakraProvider value={system}>
      <BrandProvider brand={brand}>
        {/* Every motion component falls back to instant transitions when the OS asks for reduced motion */}
        <MotionConfig reducedMotion="user">
          <LangContextProvider>
            <AuthContextProvider>
              <RecruiterAccessProvider>{children}</RecruiterAccessProvider>
            </AuthContextProvider>
          </LangContextProvider>
          <Toaster />
        </MotionConfig>
      </BrandProvider>
    </ChakraProvider>
  );
};

export default Providers;
