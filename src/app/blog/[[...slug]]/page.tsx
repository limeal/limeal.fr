"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

    return (
        <p style={{
            color: "white"
        }}>Bienvenue sur la page Caché ;) </p>
    )
}

export default Page;