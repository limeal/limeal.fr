// What identifies a pro project (company, real name, links, screenshot):
// stored in the vault, only loaded with recruiter access
export interface ProjectDetails {
    company?: string;
    // Real project name; the public card shows the anonymous `name`
    name?: string;
    external_link?: string;
    github?: string;
    thumbnail?: {
        ref: string;
        url?: string;
    };
}

interface Project {
    id?: string;
    // For pro projects: an anonymous title, e.g. "Fintech scale-up"
    name: string;
    thumbnail: {
        ref: string;
        url?: string;
    };
    description: string;
    category: string;
    // Absent on older documents: treated as "personal"
    kind?: "personal" | "pro";
    role?: string;
    github?: string;
    external_link?: string;
    // Start date for projects spanning a period (YYYY-MM-DD)
    release_date: string;
    end_date?: string;
    // Still running: displayed as "<start> — Today"
    ongoing?: boolean;
    // Read-only, set when loaded with recruiter access
    details?: ProjectDetails;
    // Read-only: project still stored whole in the vault (previous model), moved on next save
    legacyVault?: boolean;
}

export default Project;
