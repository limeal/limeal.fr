"use client";

import { useEffect, useState } from "react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Error from "next/error";
import Navigation from "@/components/atomes/Navigation";

import './style.scss';
import Blog from "@/components/molecules/DataSection/Blog";
import Article from "@/components/atomes/Article";

const Page = ({
  params,
  searchParams,
}: {
  params: Record<string, string | string[]>;
  searchParams: URLSearchParams;
}) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [slug, setSlug] = useState<string>(""); // == Article slug

  useEffect(() => {
    if (user == null) router.push("/");
  }, [user]);

  useEffect(() => {
    if (params.slug) {
      setSlug(params.slug[0] || "");
    }
  }, [params]);

  if (!user)
    return <Error statusCode={401} title="Unauthorized. Redirecting..." />;

  return (
    <>
        <header>
            <Navigation hideRight={true} lang="fr" tabs={[
                {onClick: () => router.push("/profile"), tid: "blog-tabs--profile", type: "button"}
            ]} />
        </header>
        <main>
            {slug !== "" ? <Article slug={slug} /> : <Blog lang="fr"/>}
        </main>
        <footer>

        </footer>
    </>
  );
};

export default Page;
