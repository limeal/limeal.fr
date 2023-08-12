"use client";

import React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { Loading } from "@/components/molecules/Loading";
import { createProfile, getProfileFromId } from "@/firebase/store/profile";
import Profile from "@/interfaces/profile";

export const AuthContext = React.createContext({
  user: null as User | null,
  profile: null as Profile | null,
});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | any>(null); // TODO: [type
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Grab user profile or create one
        const profile = await getProfileFromId(user.uid);
        if (!profile) {
          const newProfile = await createProfile({
            id: user.uid,
            username: "noob",
            picture: {
              ref: "no-avatar.jpg",
            }
          }).then(() => getProfileFromId(user.uid)).then((profile) => setProfile(profile));
        } else {
          setProfile(profile);
        }


        setUser(user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};
