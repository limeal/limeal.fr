// Facts the recruiter assistant answers from, beyond the site and the projects
interface AssistantProfile {
    availability: string;
    location: string;
    languages: string;
    lookingFor: string;
    salary: string;
    // Anything else, free text
    notes: string;
}

export const ASSISTANT_PROFILE_FIELDS = ["availability", "location", "languages", "lookingFor", "salary", "notes"] as const;

export const emptyAssistantProfile = (): AssistantProfile => ({
    availability: "",
    location: "",
    languages: "",
    lookingFor: "",
    salary: "",
    notes: "",
});

// Keeps only the known string fields (older documents only had `notes`)
export const toAssistantProfile = (data: Record<string, unknown> | undefined | null): AssistantProfile => {
    const profile = emptyAssistantProfile();
    for (const key of ASSISTANT_PROFILE_FIELDS) {
        const value = data?.[key];
        if (typeof value === "string") profile[key] = value;
    }
    return profile;
};

export default AssistantProfile;
