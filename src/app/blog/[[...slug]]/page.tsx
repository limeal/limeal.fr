"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Error from "next/error";
import { Container } from "@chakra-ui/react";

import IProfile from "@/interfaces/profile";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { getProfileFromId } from "@/firebase/store/profile";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import BlogSection from "@/components/features/blog/BlogSection";
import ArticleView from "@/components/features/blog/ArticleView";
import ProfileBadge from "@/components/features/blog/ProfileBadge";
import ProfileModal from "@/components/features/blog/ProfileModal";

const Page = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isRecruiter } = useRecruiterAccess();

  // Profile of the signed-in user, tagged with whose it is so a user change
  // reads as "loading" without resetting state in an effect
  const [loaded, setLoaded] = useState<{ uid: string; profile: IProfile | null } | null>(null);
  const profileLoading = !user || loaded?.uid !== user.uid;
  const profile = profileLoading ? null : loaded?.profile ?? null;
  const setProfile = (next: IProfile | null) => user && setLoaded({ uid: user.uid, profile: next });

  // Optional catch-all: undefined on /blog, ["my-article"] on /blog/my-article
  const { slug: slugParts } = useParams<{ slug?: string[] }>();
  const slug = slugParts?.[0] ?? "";

  useEffect(() => {
    // Recruiter accounts only exist for the portfolio
    if (user == null || isRecruiter) router.push("/");
  }, [user, isRecruiter, router]);

  useEffect(() => {
    if (!user) return;
    getProfileFromId(user.uid)
      .catch(() => null)
      .then((next) => setLoaded({ uid: user.uid, profile: next }));
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
