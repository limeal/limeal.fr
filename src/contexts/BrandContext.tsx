"use client";

import React from "react";

import { Brand, brandFor } from "@/data/brand";

// Resolved on the server from the request host (see app/layout.tsx), so the
// first HTML already carries the right identity
export const BrandContext = React.createContext<Brand>(brandFor(null));

export const useBrand = () => React.useContext(BrandContext);

export const BrandProvider = ({ brand, children }: { brand: Brand; children: React.ReactNode }) => (
  <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
);
