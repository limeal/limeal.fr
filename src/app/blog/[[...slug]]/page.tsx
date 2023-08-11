"use client";

import { useEffect, useState } from "react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Error from "next/error";
import Navigation from "@/components/atomes/Navigation";

import './style.scss';

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
      setSlug(params.slug[1] || "");
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
            {slug ? <p>{slug}</p> : <p>lol</p>}
        </main>
        <footer>

        </footer>
    </>
  );
};

export default Page;
