"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Error from "next/error";
import { Container } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { useProfile } from "@/hooks/queries/blog";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import BlogSection from "@/components/features/blog/BlogSection";
import ArticleView from "@/components/features/blog/ArticleView";
import ProfileBadge from "@/components/features/blog/ProfileBadge";
import ProfileModal from "@/components/features/blog/ProfileModal";

const Page = () => {
  const router = useRouter();
  const { user, resolved } = useAuthContext();
  const { isRecruiter } = useRecruiterAccess();

  const { data: profile, isPending: profileLoading } = useProfile(user?.uid);

  // Optional catch-all: undefined on /blog, ["my-article"] on /blog/my-article
  const { slug: slugParts } = useParams<{ slug?: string[] }>();
  const slug = slugParts?.[0] ?? "";

  useEffect(() => {
    // Recruiter accounts only exist for the portfolio
    if (resolved && (user == null || isRecruiter)) router.push("/");
  }, [resolved, user, isRecruiter, router]);

  // The splash screen covers the page until the auth state is known
  if (!resolved) return null;

  if (!user) return <Error statusCode={401} title="Unauthorized. Redirecting..." />;

  if (!profileLoading && !profile)
    return <ProfileModal mode="create" onClose={() => router.push("/")} />;

  return (
    <>
      <Navigation hideContact />
      <main>
        {profile && (
          <Container maxW="7xl" px={{ base: 4, md: 8, xl: 12 }} pt="6">
            <ProfileBadge profile={profile} />
          </Container>
        )}
        {slug !== "" ? <ArticleView slug={slug} /> : <BlogSection />}
      </main>
      <Footer />
    </>
  );
};

export default Page;
