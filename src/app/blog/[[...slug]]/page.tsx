"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Error from 'next/error'

const Page = ({
    params,
    searchParams,
}: {
    params: Record<string, string | string[]>;
    searchParams: URLSearchParams;
}) => {
    const router = useRouter();
    const { user } = useAuthContext();

    useEffect(() => {
        if (user == null) router.push("/");
    }, [user]);

    if (!user) return <Error statusCode={401} title="Unauthorized. Redirecting..." />

    return (
        <p style={{
            color: "white"
        }}>Bienvenue sur la page Cachée ;) </p>
    )
}

export default Page;