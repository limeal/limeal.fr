"use client";

import React, { useCallback, useEffect, useState } from "react";

import { getConfidentialProjects, getVaultCode } from "@/firebase/store/project";
import useIsAdmin from "@/hooks/useIsAdmin";
import { useLangContext } from "@/contexts/LangContext";
import { toast } from "@/components/ui/Toaster";

const STORAGE_KEY = "recruiter-code";
const ACCESS_PARAM = "access";

type RecruiterAccess = {
  // Code typed by a recruiter (or opened from a shared link)
  recruiterCode: string | null;
  // The admin reads the current code from Firestore
  adminCode: string | null;
  setAdminCode: (code: string) => void;
  // Whichever is available: unlocks confidential projects and the assistant
  vaultCode: string | null;
  // False until the stored code has been read, to avoid a double fetch
  ready: boolean;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
};

export const RecruiterAccessContext = React.createContext<RecruiterAccess>({
  recruiterCode: null,
  adminCode: null,
  setAdminCode: () => {},
  vaultCode: null,
  ready: false,
  unlock: async () => false,
  lock: () => {},
});

export const useRecruiterAccess = () => React.useContext(RecruiterAccessContext);

const storage = {
  get: () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (code: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};

export const RecruiterAccessProvider = ({ children }: { children: React.ReactNode }) => {
  const [recruiterCode, setRecruiterCode] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isAdmin = useIsAdmin();
  const { getTranslation } = useLangContext();

  // A code is valid when its vault holds at least one project
  const unlock = useCallback(
    async (code: string) => {
      const confidential = code ? await getConfidentialProjects(code).catch(() => []) : [];
      if (confidential.length === 0) return false;

      storage.set(code);
      setRecruiterCode(code);
      toast.success(getTranslation("portfolio--access-granted"));
      return true;
    },
    [getTranslation]
  );

  const lock = useCallback(() => {
    storage.clear();
    setRecruiterCode(null);
  }, []);

  useEffect(() => {
    setRecruiterCode(storage.get());
    setReady(true);

    // Shared link (e.g. on LinkedIn): limeal.fr/?access=CODE
    const url = new URL(window.location.href);
    const fromLink = url.searchParams.get(ACCESS_PARAM);
    if (fromLink) {
      // Drop the code from the address bar so it isn't copied or leaked any further
      url.searchParams.delete(ACCESS_PARAM);
      window.history.replaceState(null, "", url.toString());

      unlock(fromLink).then((ok) => {
        if (ok) document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
        else toast.error(getTranslation("portfolio--access-invalid"));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAdmin) getVaultCode().then(setAdminCode);
    else setAdminCode(null);
  }, [isAdmin]);

  return (
    <RecruiterAccessContext.Provider
      value={{
        recruiterCode,
        adminCode,
        setAdminCode,
        vaultCode: adminCode ?? recruiterCode,
        ready,
        unlock,
        lock,
      }}
    >
      {children}
    </RecruiterAccessContext.Provider>
  );
};
