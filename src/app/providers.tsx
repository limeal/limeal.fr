"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { MotionConfig } from "framer-motion";

import { system } from "@/theme";
import { LangContextProvider } from "@/contexts/LangContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { RecruiterAccessProvider } from "@/contexts/RecruiterAccessContext";
import Toaster from "@/components/ui/Toaster";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider value={system}>
      {/* Every motion component falls back to instant transitions when the OS asks for reduced motion */}
      <MotionConfig reducedMotion="user">
        <LangContextProvider>
          <AuthContextProvider>
            <RecruiterAccessProvider>{children}</RecruiterAccessProvider>
          </AuthContextProvider>
        </LangContextProvider>
        <Toaster />
      </MotionConfig>
    </ChakraProvider>
  );
};

export default Providers;
