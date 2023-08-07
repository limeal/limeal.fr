import { getProjects } from "@/firebase/firestore";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const category = request.nextUrl.searchParams.get("category") || "all";

    const projects = await getProjects(category);

    return NextResponse.json(projects);
}