import Project from "@/interfaces/project";

const year = (date: string) => date.slice(0, 4);

// "2024", "2023 — 2025" or "2024 — Today"
export const projectPeriod = (project: Project, today: string) => {
    const start = year(project.release_date);
    if (project.ongoing) return `${start} — ${today}`;
    if (project.end_date && year(project.end_date) !== start) return `${start} — ${year(project.end_date)}`;
    return start;
};

// Most recent first: running projects, then by end date (or the single date)
export const byMostRecent = (a: Project, b: Project) => {
    const key = (p: Project) => (p.ongoing ? Date.now() : new Date(p.end_date || p.release_date).getTime());
    return key(b) - key(a);
};

// Projects saved without an image resolve to the storage fallback
export const hasThumbnail = (project: Project) =>
    !!project.thumbnail.url && !project.thumbnail.url.endsWith("/no-image.png");
