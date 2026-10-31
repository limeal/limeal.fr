interface Project {
    id?: string;
    name: string;
    thumbnail: {
        ref: string;
        url?: string;
    };
    description: string;
    category: string;
    // Absent on older documents: treated as "personal"
    kind?: "personal" | "pro";
    // Pro only, both optional: shown when filled in
    company?: string;
    role?: string;
    // Read-only: set when the project comes from the recruiter-only vault
    confidential?: boolean;
    github?: string;
    external_link?: string;
    // Start date for projects spanning a period (YYYY-MM-DD)
    release_date: string;
    end_date?: string;
    // Still running: displayed as "<start> — Today"
    ongoing?: boolean;
}

export default Project;