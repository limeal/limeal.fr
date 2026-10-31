"use client";

import React, { useCallback, useEffect, useState } from "react";

import { ensureVaultMarker, getVaultCode } from "@/firebase/store/project";
import {
  AccessRequest,
  completeAccessLink,
  getAccessSettings,
  getMyRequest,
  isAccessLink,
  logAccessEvent,
  logTraffic,
  sendAccessLink,
} from "@/firebase/store/access";
import { signOut } from "@/firebase/authentication";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLangContext } from "@/contexts/LangContext";
import useIsAdmin from "@/hooks/useIsAdmin";
import { toast } from "@/components/ui/Toaster";

const VISIT_LOGGED_KEY = "visit-logged";
// First channel of the visit, kept so a later access request is attributed to it
const CHANNEL_KEY = "channel";
const SOURCE_PARAMS = ["ref", "utm_source"];

type RecruiterAccess = {
  // The signed-in visitor's access request, if they are a recruiter
  request: AccessRequest | null;
  // Recruiter accounts don't get the friends' blog
  isRecruiter: boolean;
  // Vault code, for the admin and approved recruiters: unlocks project details and the assistant
  vaultCode: string | null;
  adminCode: string | null;
  setAdminCode: (code: string) => void;
  // False until the session (and a possible e-mail link) has been checked
  ready: boolean;
  channel: string;
  // The visitor's channel never gets access: nothing about it is shown
  channelBlocked: boolean;
  requestAccess: (details: { email: string; name: string; company: string }) => Promise<void>;
  leave: () => void;
  logChat: (question: string) => void;
};

export const RecruiterAccessContext = React.createContext<RecruiterAccess>({
  request: null,
  isRecruiter: false,
  vaultCode: null,
  adminCode: null,
  setAdminCode: () => {},
  ready: false,
  channel: "",
  channelBlocked: false,
  requestAccess: async () => {},
  leave: () => {},
  logChat: () => {},
});

export const useRecruiterAccess = () => React.useContext(RecruiterAccessContext);

// Storage can be unavailable (private mode, blocked site data): never let it break the page
const safe = <T,>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

const urlChannel = (url: URL) =>
  (SOURCE_PARAMS.map((p) => url.searchParams.get(p)).find(Boolean) ?? "").toLowerCase();

// Known sites map to the same channel names as ?ref=, so a link pasted without
// ?ref= (e.g. on Discord) is still recognised
const REFERRER_CHANNELS: Record<string, string> = {
  "discord.com": "discord",
  "discordapp.com": "discord",
  "linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
  "github.com": "github",
  "x.com": "x",
  "t.co": "x",
  "twitter.com": "x",
  "malt.fr": "malt",
  "welcometothejungle.com": "wttj",
  "indeed.com": "indeed",
};

const referrerHost = () => {
  const host = safe(() => new URL(document.referrer).hostname.replace(/^www\./, ""), "");
  return host && host !== window.location.hostname ? host : "";
};

const referrerChannel = (host: string) =>
  Object.entries(REFERRER_CHANNELS).find(([domain]) => host === domain || host.endsWith(`.${domain}`))?.[1] ?? "";

const trafficSource = (url: URL) => {
  const host = referrerHost();
  return urlChannel(url) || referrerChannel(host) || host || "direct";
};

export const RecruiterAccessProvider = ({ children }: { children: React.ReactNode }) => {
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [recruiterCode, setRecruiterCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [channel, setChannel] = useState("");
  const [channelBlocked, setChannelBlocked] = useState(false);

  const { user } = useAuthContext();
  const isAdmin = useIsAdmin();
  const { getTranslation } = useLangContext();

  const requestAccess = useCallback(
    async (details: { email: string; name: string; company: string }) => {
      await sendAccessLink({ ...details, ref: channel });
    },
    [channel]
  );

  const leave = useCallback(() => {
    signOut();
  }, []);

  const logChat = useCallback(
    (question: string) => {
      if (request) logAccessEvent(request.uid, "chat", question);
    },
    [request]
  );

  // Traffic source, channel, and the return from an access e-mail
  useEffect(() => {
    const url = new URL(window.location.href);
    const firstVisitOfSession = !safe(() => sessionStorage.getItem(VISIT_LOGGED_KEY), null);
    safe(() => sessionStorage.setItem(VISIT_LOGGED_KEY, "1"), undefined);

    // The admin's own visits would only add noise
    if (firstVisitOfSession && !isAdmin) logTraffic(trafficSource(url));

    const fromUrl = urlChannel(url);
    const detected = fromUrl || referrerChannel(referrerHost());
    if (detected) safe(() => sessionStorage.setItem(CHANNEL_KEY, detected), undefined);
    const current = detected || safe(() => sessionStorage.getItem(CHANNEL_KEY), null) || "";
    setChannel(current);
    if (current) getAccessSettings().then(({ blocked }) => setChannelBlocked(blocked.includes(current)));

    if (!isAccessLink(window.location.href)) {
      setReady(true);
      return;
    }

    completeAccessLink(window.location.href, () => window.prompt(getTranslation("access--confirm-email")))
      .then((filed) => {
        if (!filed) return;
        setRequest(filed);
        toast.success(
          getTranslation(filed.status === "approved" ? "portfolio--access-granted" : "access--pending-title")
        );
      })
      .catch(() => toast.error(getTranslation("access--link-error")))
      .finally(() => {
        // Remove the one-time sign-in parameters, keep the channel
        const clean = new URL(window.location.origin + window.location.pathname);
        if (fromUrl) clean.searchParams.set("ref", fromUrl);
        clean.hash = "portfolio";
        window.history.replaceState(null, "", clean.toString());
        setReady(true);
        document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Signed-in visitor: are they a recruiter, and approved?
  useEffect(() => {
    if (!user || isAdmin) {
      setRequest(null);
      return;
    }
    getMyRequest(user).then(setRequest);
  }, [user, isAdmin]);

  // One "visit" per session in the recruiter's journal
  useEffect(() => {
    if (!request) return;
    const key = `${VISIT_LOGGED_KEY}-${request.uid}`;
    if (safe(() => sessionStorage.getItem(key), null)) return;
    safe(() => sessionStorage.setItem(key, "1"), undefined);
    logAccessEvent(request.uid, "visit");
  }, [request]);

  // The vault code: rules let the admin and approved recruiters read it
  useEffect(() => {
    if (isAdmin) {
      getVaultCode().then((code) => {
        setAdminCode(code);
        if (code) ensureVaultMarker(code).catch(() => undefined);
      });
      return;
    }
    setAdminCode(null);
    if (request?.status === "approved") getVaultCode().then(setRecruiterCode);
    else setRecruiterCode(null);
  }, [isAdmin, request]);

  return (
    <RecruiterAccessContext.Provider
      value={{
        request,
        isRecruiter: !!request,
        vaultCode: adminCode ?? recruiterCode,
        adminCode,
        setAdminCode,
        ready,
        channel,
        channelBlocked,
        requestAccess,
        leave,
        logChat,
      }}
    >
      {children}
    </RecruiterAccessContext.Provider>
  );
};
