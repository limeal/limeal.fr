"use client";

import React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { AnimatePresence } from "framer-motion";
import { auth } from "@/firebase/firebase";
import SplashScreen from "@/components/ui/SplashScreen";

// Keeps the intro on screen long enough to play, even when auth resolves instantly
const MIN_SPLASH_MS = 1200;

export const AuthContext = React.createContext({
  user: null as User | null,
});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [authResolved, setAuthResolved] = React.useState(false);
  const [minElapsed, setMinElapsed] = React.useState(false);
  const loading = !authResolved || !minElapsed;

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setAuthResolved(true);
    });
    const timer = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      <AnimatePresence>{loading && <SplashScreen key="splash" />}</AnimatePresence>
      {!loading && children}
    </AuthContext.Provider>
  );
};
