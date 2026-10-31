"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Error from "next/error";
import { Container } from "@chakra-ui/react";

import IProfile from "@/interfaces/profile";
import { useAuthContext } from "@/contexts/AuthContext";
import { getProfileFromId } from "@/firebase/store/profile";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import BlogSection from "@/components/features/blog/BlogSection";
import ArticleView from "@/components/features/blog/ArticleView";
import ProfileBadge from "@/components/features/blog/ProfileBadge";
import ProfileModal from "@/components/features/blog/ProfileModal";

const Page = ({
  params,
}: {
  params: Record<string, string | string[]>;
  searchParams: URLSearchParams;
}) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<IProfile | any>(null);

  const slug = params.slug ? params.slug[0] || "" : "";

  useEffect(() => {
    if (user == null) router.push("/");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    getProfileFromId(user.uid)
      .then(setProfile)
      .finally(() => setProfileLoading(false));
  }, [user]);

  if (!user) return <Error statusCode={401} title="Unauthorized. Redirecting..." />;

  if (!profileLoading && !profile)
    return <ProfileModal mode="create" setProfile={setProfile} onClose={() => router.push("/")} />;

  return (
    <>
      <Navigation hideContact />
      <main>
        {profile && (
          <Container maxW="7xl" px={{ base: 4, md: 8, xl: 12 }} pt="6">
            <ProfileBadge profile={profile} setProfile={setProfile} />
          </Container>
        )}
        {slug !== "" ? <ArticleView slug={slug} /> : <BlogSection />}
      </main>
      <Footer />
    </>
  );
};

export default Page;
