"use client";

import { useEffect, useState } from "react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Error from "next/error";
import Navigation from "@/components/atomes/Navigation";

import "./style.scss";
import Blog from "@/components/molecules/DataSection/Blog";
import Article from "@/components/atomes/Article";
import Credits from "@/components/atomes/Credits";
import ProfileModal from "@/components/atomes/Modal/variants/ProfileModal";
import Profile from "@/interfaces/profile";
import CPFModal from "@/components/atomes/Modal/variants/CPFModal";
import { getProfileFromId } from "@/firebase/store/profile";
import { Loading } from "@/components/molecules/Loading";

const Page = ({
  params,
  searchParams,
}: {
  params: Record<string, string | string[]>;
  searchParams: URLSearchParams;
}) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [profileLoading, setProfileLoading] = useState<boolean>(true); // == Loading profile [boolean
  const [profile, setProfile] = useState<Profile | any>(null); // == User profile [object
  const [openProfile, setOpenProfile] = useState<boolean>(false);

  const [slug, setSlug] = useState<string>(""); // == Article slug

  useEffect(() => {
    if (user == null) router.push("/");
  }, [user, router]);

  useEffect(() => {
    if (params.slug) {
      setSlug(params.slug[0] || "");
    }
  }, [params]);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    getProfileFromId(user?.uid)
      .then((profile) => {
        setProfile(profile);
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

  if (!user)
    return <Error statusCode={401} title="Unauthorized. Redirecting..." />;

  if (!profileLoading && !profile)
    return <CPFModal setProfile={setProfile} setOpen={() => router.push("/")} />;

  return (
    <>
      <header>
        {openProfile && (
          <ProfileModal profile={profile} setOpen={setOpenProfile} />
        )}
        <Navigation
          hideRight={true}
          lang="fr"
          tabs={[
            {
              onClick: () => setOpenProfile(true),
              tid: "blog-tabs--profile",
              type: "button",
            },
          ]}
        />
      </header>
      <main>{slug !== "" ? <Article slug={slug} /> : <Blog lang="fr" />}</main>
      <footer>
        <Credits />
      </footer>
    </>
  );
};

export default Page;
