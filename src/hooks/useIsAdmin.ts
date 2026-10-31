"use client";

import { useAuthContext } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuthContext();
  return !!user && user.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID;
};

export default useIsAdmin;
