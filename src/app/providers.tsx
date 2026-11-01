"use client";

import { useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";

import { system } from "@/theme";
import type { Brand } from "@/data/brand";
import { BrandProvider } from "@/contexts/BrandContext";
import { LangContextProvider } from "@/contexts/LangContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { RecruiterAccessProvider } from "@/contexts/RecruiterAccessContext";
import Toaster from "@/components/ui/Toaster";
import EmotionRegistry from "./EmotionRegistry";

const Providers = ({ brand, children }: { brand: Brand; children: React.ReactNode }) => {
  // One cache per browser tab (and per server request), never shared between users
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  );

  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </ChakraProvider>
    </EmotionRegistry>
  );
};

export default Providers;
